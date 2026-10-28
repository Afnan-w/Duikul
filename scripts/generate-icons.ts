/**
 * Generates every raster brand asset from vector sources.
 *
 *   npm run icons
 *
 * Outputs (committed):
 *   public/favicon.ico
 *   public/favicon.svg
 *   public/icons/icon-192.png
 *   public/icons/icon-512.png
 *   public/icons/maskable-512.png
 *   public/icons/apple-touch-icon.png
 *   public/og-default.png
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");

const PAPER = "#FAF8F5";
const INK = "#1F1D1A";
const MUTED = "#6B665E";
const RULE = "#E4DFD6";
const ACCENT = "#0F5B45";
const ACCENT_SOFT = "#E4EFE9";
const SIGNAL = "#B5483A";

const SITE_LABEL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "").replace(
    /\/$/,
    "",
  ) || "khobordaily.vercel.app";

/** Full-bleed app icon. `inset` leaves the safe padding maskable icons need. */
function appIconSvg(size: number, inset = 0): string {
  const pad = Math.round(size * inset);
  const inner = size - pad * 2;
  const scale = inner / 64;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${ACCENT}"/>
  <g transform="translate(${pad} ${pad}) scale(${scale})">
    <path d="M19.5 17v30M19.5 34.5 36 17M24.5 30.5 43 47" fill="none" stroke="${PAPER}" stroke-width="5" stroke-linecap="square"/>
    <circle cx="44" cy="17" r="4.5" fill="${PAPER}"/>
  </g>
</svg>`;
}

function faviconSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="15" fill="${ACCENT}"/>
  <path d="M19.5 17v30M19.5 34.5 36 17M24.5 30.5 43 47" fill="none" stroke="${PAPER}" stroke-width="5" stroke-linecap="square"/>
  <circle cx="44" cy="17" r="4.5" fill="${PAPER}"/>
</svg>`;
}

function ogDefaultSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${PAPER}"/>

  <!-- gentle original geometry, bottom right -->
  <g fill="none" stroke="${ACCENT}" stroke-width="1.5" opacity="0.55">
    <circle cx="1006" cy="382" r="164"/>
    <circle cx="1006" cy="382" r="112"/>
    <path d="M842 382h328M1006 218v328"/>
  </g>
  <circle cx="1006" cy="382" r="58" fill="${ACCENT_SOFT}"/>
  <circle cx="1127" cy="472" r="11" fill="${SIGNAL}"/>

  <!-- nameplate -->
  <g transform="translate(72 62)">
    <rect width="46" height="46" rx="12" fill="${ACCENT}"/>
    <g transform="translate(7 7) scale(0.5)">
      <path d="M19.5 17v30M19.5 34.5 36 17M24.5 30.5 43 47" fill="none" stroke="${PAPER}" stroke-width="5" stroke-linecap="square"/>
      <circle cx="44" cy="17" r="4.5" fill="${PAPER}"/>
    </g>
    <text x="58" y="31" font-family="Georgia, 'Times New Roman', serif" font-size="27" font-weight="700" letter-spacing="-0.6" fill="${INK}">Khobor<tspan font-style="italic" font-weight="400" fill="${ACCENT}">Daily</tspan></text>
  </g>
  <text x="72" y="137" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="600" letter-spacing="2.6" fill="${MUTED}">BANGLADESH · THE WORLD · IN ONE PLACE</text>

  <line x1="72" y1="166" x2="1128" y2="166" stroke="${RULE}" stroke-width="1"/>
  <line x1="72" y1="171" x2="1128" y2="171" stroke="${RULE}" stroke-width="1"/>

  <text x="70" y="300" font-family="Georgia, 'Times New Roman', serif" font-size="83" font-weight="700" letter-spacing="-2.5" fill="${INK}">The news that matters,</text>
  <text x="70" y="386" font-family="Georgia, 'Times New Roman', serif" font-size="83" font-style="italic" letter-spacing="-2" fill="${ACCENT}">in one place.</text>

  <text x="72" y="466" font-family="'Nirmala UI', 'Noto Serif Bengali', sans-serif" font-size="31" fill="${MUTED}">দেশ ও বিশ্বের জরুরি খবর, এক জায়গায়</text>

  <line x1="72" y1="530" x2="1128" y2="530" stroke="${RULE}" stroke-width="1"/>
  <text x="72" y="565" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="600" letter-spacing="2.2" fill="${ACCENT}">দেশি খবর</text>
  <text x="188" y="565" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="600" letter-spacing="2.2" fill="${MUTED}">·</text>
  <text x="208" y="565" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="600" letter-spacing="2.2" fill="${ACCENT}">বিদেশি খবর</text>
  <text x="1128" y="565" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="600" letter-spacing="1.8" fill="${MUTED}">${SITE_LABEL.toUpperCase()}</text>
</svg>`;
}

/** ICO container with PNG payloads — no extra dependency required. */
function buildIco(images: { size: number; png: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const entries = Buffer.alloc(images.length * 16);
  let offset = 6 + images.length * 16;

  images.forEach((image, index) => {
    const base = index * 16;
    entries.writeUInt8(image.size >= 256 ? 0 : image.size, base);
    entries.writeUInt8(image.size >= 256 ? 0 : image.size, base + 1);
    entries.writeUInt8(0, base + 2);
    entries.writeUInt8(0, base + 3);
    entries.writeUInt16LE(1, base + 4);
    entries.writeUInt16LE(32, base + 6);
    entries.writeUInt32LE(image.png.length, base + 8);
    entries.writeUInt32LE(offset, base + 12);
    offset += image.png.length;
  });

  return Buffer.concat([header, entries, ...images.map((image) => image.png)]);
}

async function renderPng(svg: string, size?: number): Promise<Buffer> {
  const pipeline = sharp(Buffer.from(svg));
  if (size) pipeline.resize(size, size);
  return pipeline.png().toBuffer();
}

async function main() {
  await mkdir(path.join(PUBLIC, "icons"), { recursive: true });

  const [icon192, icon512, maskable512, apple180] = await Promise.all([
    renderPng(appIconSvg(512), 192),
    renderPng(appIconSvg(512), 512),
    renderPng(appIconSvg(512, 0.17), 512),
    renderPng(appIconSvg(512), 180),
  ]);

  const favSizes = [16, 32, 48];
  const favPngs = await Promise.all(
    favSizes.map(async (size) => ({
      size,
      png: await renderPng(faviconSvg(), size),
    })),
  );

  const og = await renderPng(ogDefaultSvg());

  await Promise.all([
    writeFile(path.join(PUBLIC, "favicon.ico"), buildIco(favPngs)),
    writeFile(path.join(PUBLIC, "favicon.svg"), `${faviconSvg()}\n`),
    writeFile(path.join(PUBLIC, "icons", "icon-192.png"), icon192),
    writeFile(path.join(PUBLIC, "icons", "icon-512.png"), icon512),
    writeFile(path.join(PUBLIC, "icons", "maskable-512.png"), maskable512),
    writeFile(path.join(PUBLIC, "icons", "apple-touch-icon.png"), apple180),
    writeFile(path.join(PUBLIC, "og-default.png"), og),
  ]);

  console.log("Generated brand assets:");
  for (const file of [
    "public/favicon.ico",
    "public/favicon.svg",
    "public/icons/icon-192.png",
    "public/icons/icon-512.png",
    "public/icons/maskable-512.png",
    "public/icons/apple-touch-icon.png",
    "public/og-default.png",
  ]) {
    console.log(`  ✓ ${file}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
