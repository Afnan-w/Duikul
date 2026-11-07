/*
  BRANDED OPEN GRAPH CARD   served at /api/og?t=...&k=...
  ------------------------------------------------------------
  Draws the share image every static page uses (and the fallback
  for stories without a photo): the brand green, the দুইকূল
  wordmark, the page title and the site address.

  Bangla needs its own font file, so the Noto Sans Bengali TTFs
  (SIL OFL licence, see assets/fonts/OFL.txt) are committed to the
  repo and read once per server boot. Loading them from disk means
  the card never depends on Google's CDN at render time - the
  dynamic subset the CSS API serves, by contrast, is only ~20 KB
  and has no Latin glyphs.

  Should the files ever fail to read, the card degrades to an
  English-only design and relies on next/og's built-in font - at
  least the crawlers keep getting a real image instead of a 500.
*/

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";
import { truncate } from "@/lib/seo";

export const runtime = "nodejs";

const WIDTH = 1200;
const HEIGHT = 630;

type OgFont = {
  name: string;
  data: Buffer;
  weight: 400 | 700;
  style: "normal";
};

let fontsPromise: Promise<OgFont[]> | null = null;

/** Read both weights once per server boot (module-level cache). */
function loadFonts(): Promise<OgFont[]> {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      readFile(join(process.cwd(), "assets", "fonts", "NotoSansBengali-Regular.ttf")),
      readFile(join(process.cwd(), "assets", "fonts", "NotoSansBengali-Bold.ttf")),
    ]).then(
      ([regular, bold]): OgFont[] => [
        { name: "Noto Sans Bengali", data: regular, weight: 400, style: "normal" },
        { name: "Noto Sans Bengali", data: bold, weight: 700, style: "normal" },
      ]
    );
  }
  return fontsPromise;
}

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const title = truncate(params.get("t") ?? siteConfig.descriptionBn, 120);
  const kicker = (params.get("k") ?? "দুইকূল").slice(0, 42);

  /* A failed read is NOT cached in fontsPromise - the next request
     retries, so a temporary FS hiccup cannot brick the route. */
  const fonts = await loadFonts().catch(() => [] as OgFont[]);
  const hasBengali = fonts.length === 2;

  /* Title size: longer text gets smaller type so it never overflows. */
  const fontSize = title.length > 100 ? 52 : title.length > 56 ? 64 : 76;

  const brandText = hasBengali ? "দুইকূল" : "Duikul";
  const address = siteConfig.url.replace(/^https?:\/\//, "");

  const image = new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          justifyContent: "space-between",
          padding: "56px 64px",
          background:
            "linear-gradient(135deg, #0B6B4F 0%, #128063 60%, #0E7358 100%)",
          fontFamily: hasBengali ? "Noto Sans Bengali" : "sans-serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              width: 20,
              height: 20,
              borderRadius: 999,
              background: "#FAF8F5",
            }}
          />
          <div
            style={{
              color: "#FAF8F5",
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            {brandText}
          </div>
          <div
            style={{
              display: "flex",
              marginLeft: 12,
              border: "1px solid rgba(250,248,245,0.45)",
              borderRadius: 999,
              padding: "8px 22px",
              color: "#EAF4EF",
              fontSize: 26,
            }}
          >
            {kicker}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            color: "#FFFFFF",
            fontSize,
            fontWeight: 700,
            lineHeight: 1.32,
            maxWidth: 1060,
          }}
        >
          {title}
        </div>

        {/* Footer row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            color: "#D9EBE3",
            fontSize: 26,
          }}
        >
          <div style={{ display: "flex", fontSize: 24 }}>
            {hasBengali
              ? "Duikul · দেশি ও বিদেশি সংবাদ"
              : "Duikul · Deshi & Bideshi news"}
          </div>
          <div style={{ display: "flex", fontSize: 24 }}>{address}</div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      /* Omitting `fonts` (rather than passing []) lets next/og fall
         back to its bundled font in the degraded case. */
      ...(fonts.length > 0 ? { fonts } : {}),
    }
  );

  try {
    image.headers.set(
      "Cache-Control",
      "public, max-age=3600, s-maxage=86400"
    );
  } catch {
    // Headers already sent / immutable — harmless, keep going.
  }
  return image;
}
