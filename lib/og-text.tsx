/*
  ============================================================
  BANGLA TEXT FOR THE OPEN GRAPH CARD  (HarfBuzz + SVG paths)
  ============================================================
  The card is drawn by next/og, whose layout engine (Satori) maps
  one codepoint to one glyph and performs NO complex-script shaping.
  For Bangla that is fatal: the i/e matras must be reordered to the
  left of their consonant, conjuncts must be joined, and vowel signs
  must be split into their components. Rendering Bangla directly
  produced broken words such as "দগেশী" instead of "দেশি" in every
  Instagram / Messenger / WhatsApp link preview.

  The fix that keeps the branded card (instead of degrading it to
  English-only):
    1. HarfBuzz (harfbuzzjs, the same shaper browsers use) turns a
       line of text into positioned glyph IDs - correct order,
       correct conjuncts, correct matras.
    2. Each glyph becomes a vector <path>, and the line is drawn as
       an inline <svg> inside the ImageResponse JSX. Satori treats
       the SVG as artwork, so we never rely on its text engine for
       Bangla.

  Hind Siliguri (SIL OFL) was picked because the site itself uses it
  as the Bangla UI font - the card matches the site - and it carries
  Latin glyphs too, so mixed strings ("Duikul · দেশি") are shaped
  in one pass.
*/

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactElement } from "react";
import * as hb from "harfbuzzjs";

type Weight = 400 | 700;

type Shaper = {
  font: hb.Font;
  /** Font design units per em (usually 1000). */
  upem: number;
};

let shapersPromise: Promise<Record<Weight, Shaper>> | null = null;

/** Read both weights from disk once per server boot. */
export function loadShaperFonts(): Promise<Record<Weight, Shaper>> {
  if (!shapersPromise) {
    shapersPromise = Promise.all([
      readFile(join(process.cwd(), "assets", "fonts", "HindSiliguri-Regular.ttf")),
      readFile(join(process.cwd(), "assets", "fonts", "HindSiliguri-Bold.ttf")),
    ]).then(([regular, bold]) => {
      const make = (data: Buffer): Shaper => {
        /* Copy into a plain Uint8Array so HarfBuzz gets exactly the
           font bytes (not Node's pooled, offset-sharing buffer). */
        const face = new hb.Face(new hb.Blob(new Uint8Array(data)));
        return { font: new hb.Font(face), upem: face.upem || 1000 };
      };
      return { 400: make(regular), 700: make(bold) };
    });
  }
  return shapersPromise;
}

type ShapedGlyph = { d: string; x: number; y: number };

/**
 * Shape one line of text (no wrapping) and return the glyph outlines
 * placed left-to-right. Spaces come back as empty paths but still
 * advance the cursor, exactly like a browser.
 */
function shapeLine(
  shaper: Shaper,
  text: string,
  fontSize: number
): { glyphs: ShapedGlyph[]; width: number } {
  const scale = fontSize / shaper.upem;
  const buffer = new hb.Buffer();
  buffer.addText(text);
  buffer.guessSegmentProperties();
  hb.shape(shaper.font, buffer);

  const infos = buffer.getGlyphInfos();
  const positions = buffer.getGlyphPositions();

  const glyphs: ShapedGlyph[] = [];
  let cursor = 0;
  for (let i = 0; i < infos.length; i++) {
    const glyph = shaper.font.glyphToPath(infos[i].codepoint);
    const pos = positions[i];
    if (glyph) {
      glyphs.push({
        d: glyph,
        x: cursor + pos.xOffset * scale,
        y: -pos.yOffset * scale,
      });
    }
    cursor += pos.xAdvance * scale;
  }
  return { glyphs, width: cursor };
}

const widthCache = new Map<string, number>();

/** Width in px of a single line at a given size/weight. */
function measure(shaper: Shaper, text: string, fontSize: number): number {
  const key = `${fontSize}|${text}`;
  const hit = widthCache.get(key);
  if (hit !== undefined) return hit;
  const width = shapeLine(shaper, text, fontSize).width;
  if (widthCache.size > 500) widthCache.clear();
  widthCache.set(key, width);
  return width;
}

/**
 * Greedy word wrap. Bangla words are space-separated just like
 * English, so splitting on spaces is correct for both scripts.
 */
function wrapLines(
  shaper: Shaper,
  text: string,
  fontSize: number,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (!current || measure(shaper, candidate, fontSize) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export type FittedText = {
  lines: string[];
  fontSize: number;
  lineHeight: number;
  width: number;
};

/**
 * Fit a title into at most `maxLines` lines inside `maxWidth` px,
 * stepping the font size down between the caller's tiers when the
 * text is unusually long. Mirrors the old size heuristic's spirit.
 */
export function fitText(
  shaper: Shaper,
  text: string,
  opts: {
    maxWidth: number;
    maxLines?: number;
    sizes?: number[];
    /** Space between lines as a multiple of the font size. */
    lineHeight?: number;
  }
): FittedText {
  const maxLines = opts.maxLines ?? 3;
  const sizes = opts.sizes ?? [76, 64, 52];
  const lineHeight = opts.lineHeight ?? 1.32;

  let lines: string[] = [text];
  let fontSize = sizes[sizes.length - 1];

  for (const size of sizes) {
    fontSize = size;
    lines = wrapLines(shaper, text, size, opts.maxWidth);
    if (lines.length <= maxLines) break;
  }

  /* Still too tall: keep the smallest size, cut to maxLines and
     finish the last line with an ellipsis at a word edge. */
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    let last = lines[maxLines - 1];
    while (last && measure(shaper, `${last}…`, fontSize) > opts.maxWidth) {
      last = last.replace(/\s+\S*$/, "").trim();
    }
    lines[maxLines - 1] = `${last}…`;
  }

  return {
    lines,
    fontSize,
    lineHeight: Math.round(fontSize * lineHeight),
    width: Math.max(...lines.map((line) => measure(shaper, line, fontSize)), 0),
  };
}

/**
 * One shaped line as an inline SVG.
 *
 * `lineBox` is the height of the line box in px (the SVG viewBox).
 * The baseline sits 0.26em above the bottom, leaving room for Bangla
 * descenders (ু / ূ) while the top keeps more than 1em for the tall
 * matras and ascenders. Stacking lines at their natural `lineBox`
 * height therefore reproduces normal line spacing.
 */
export function ShapedLine({
  shaper,
  text,
  fontSize,
  color,
  weight = 400,
  lineBox,
}: {
  shaper: Shaper;
  text: string;
  fontSize: number;
  color: string;
  weight?: Weight;
  lineBox?: number;
}): ReactElement {
  const scale = fontSize / shaper.upem;
  const { glyphs, width } = shapeLine(shaper, text, fontSize);
  const height = lineBox ?? Math.round(fontSize * 1.35);
  const baseline = height - fontSize * 0.26;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={Math.ceil(width)}
      height={height}
      viewBox={`0 0 ${Math.ceil(width)} ${height}`}
      style={{ display: "flex" }}
      data-weight={weight}
    >
      {glyphs.map((glyph, index) => (
        <path
          key={index}
          d={glyph.d}
          fill={color}
          transform={`translate(${glyph.x.toFixed(2)} ${(baseline + glyph.y).toFixed(2)}) scale(${scale.toFixed(6)} ${(-scale).toFixed(6)})`}
        />
      ))}
    </svg>
  );
}

/** Shaper access for callers that pass it back to fitText/ShapedLine. */
export type { Shaper, Weight };
