/*
  BRANDED OPEN GRAPH CARD   served at /api/og?t=...&k=...
  ------------------------------------------------------------
  Draws the share image every static page uses (and the fallback
  for stories without a photo): the brand green, the দুইকূল
  wordmark, the page title and the site address.

  All Bangla text is pre-shaped with HarfBuzz and drawn as vector
  paths (see lib/og-text.tsx). Satori - the engine behind
  ImageResponse - cannot reorder Bangla matras or join conjuncts,
  which used to make every Instagram / Messenger / WhatsApp link
  preview show broken words like "দগেশী". The TTFs are committed to
  the repo (SIL OFL, see assets/fonts/OFL.txt) and read once per
  server boot, so the card never depends on Google's CDN.

  Should the files ever fail to read, the card degrades to an
  English-only design and relies on next/og's built-in font - at
  least the crawlers keep getting a real image instead of a 500.
*/

import { ImageResponse } from "next/og";
import { isBangla, truncate } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import {
  fitText,
  loadShaperFonts,
  ShapedLine,
  type Shaper,
} from "@/lib/og-text";

export const runtime = "nodejs";

const WIDTH = 1200;
const HEIGHT = 630;

type Shapers = Record<400 | 700, Shaper>;

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const title = truncate(params.get("t") ?? siteConfig.descriptionBn, 120);
  const kicker = (params.get("k") ?? "দুইকূল").slice(0, 42);

  /* A failed read is NOT cached - the next request retries, so a
     temporary FS hiccup cannot brick the route. */
  const shapers: Shapers | null = await loadShaperFonts().catch(() => null);
  const hasBengali = shapers !== null;

  /* Brand row text */
  const brandText = hasBengali ? "দুইকূল" : "Duikul";
  const address = siteConfig.url.replace(/^https?:\/\//, "");

  /* Title: Bangla is drawn from shaped paths, so we wrap it
     ourselves at the card's inner width and let the SVG lines do
     the rest. Long titles step down through 76 -> 64 -> 52 px. */
  const fitted =
    hasBengali && isBangla(title)
      ? fitText(shapers![700], title, {
          maxWidth: 1060,
          maxLines: 3,
          sizes: [76, 64, 52],
          lineHeight: 1.32,
        })
      : null;

  const plainTitleSize = title.length > 100 ? 52 : title.length > 56 ? 64 : 76;

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
          fontFamily: "sans-serif",
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
          {hasBengali ? (
            <ShapedLine
              shaper={shapers![700]}
              text={brandText}
              fontSize={48}
              weight={700}
              color="#FAF8F5"
              lineBox={62}
            />
          ) : (
            <div style={{ color: "#FAF8F5", fontSize: 48, fontWeight: 700 }}>
              {brandText}
            </div>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: 12,
              border: "1px solid rgba(250,248,245,0.45)",
              borderRadius: 999,
              padding: "6px 22px",
              color: "#EAF4EF",
              fontSize: 26,
            }}
          >
            {hasBengali && isBangla(kicker) ? (
              <ShapedLine
                shaper={shapers![400]}
                text={kicker}
                fontSize={26}
                color="#EAF4EF"
                lineBox={36}
              />
            ) : (
              kicker
            )}
          </div>
        </div>

        {/* Title */}
        {fitted ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 1060,
            }}
          >
            {fitted.lines.map((line, index) => (
              <ShapedLine
                key={index}
                shaper={shapers![700]}
                text={line}
                fontSize={fitted.fontSize}
                weight={700}
                color="#FFFFFF"
                lineBox={fitted.lineHeight}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              color: "#FFFFFF",
              fontSize: plainTitleSize,
              fontWeight: 700,
              lineHeight: 1.32,
              maxWidth: 1060,
            }}
          >
            {title}
          </div>
        )}

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
          {hasBengali ? (
            <ShapedLine
              shaper={shapers![400]}
              text="Duikul · দেশি ও বিদেশি সংবাদ"
              fontSize={24}
              color="#D9EBE3"
              lineBox={32}
            />
          ) : (
            <div style={{ display: "flex", fontSize: 24 }}>
              Duikul · Deshi &amp; Bideshi news
            </div>
          )}
          <div style={{ display: "flex", fontSize: 24 }}>{address}</div>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT }
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
