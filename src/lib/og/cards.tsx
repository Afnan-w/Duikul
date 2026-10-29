import {
  SITE_NAME,
  SITE_NAME_BN,
  SITE_TAGLINE_BN,
  SITE_TAGLINE_EN,
  SITE_URL,
} from "@/config/site";
import { toBanglaDigits } from "@/lib/utils/date";

export const OG_SIZE = { width: 1200, height: 630 };
export const SQUARE_SIZE = { width: 1080, height: 1080 };

export const OG_COLORS = {
  paper: "#faf8f5",
  ink: "#1f1d1a",
  muted: "#6b665e",
  rule: "#e4dfd6",
  accent: "#0f5b45",
  signal: "#b5483a",
} as const;

export const OG_FONT_FAMILY = '"Noto Serif Bengali"';

const DISPLAY_URL = SITE_URL.replace(/^https?:\/\//, "");

type StoryShareCardProps = {
  title: string;
  sectionBn: string;
  sectionEn: string;
  sourceCount: number;
  language: "bn" | "en";
  square?: boolean;
};

function headlineSize(title: string, square: boolean): number {
  const length = Array.from(title).length;
  if (square) {
    if (length > 110) return 46;
    if (length > 80) return 54;
    if (length > 55) return 62;
    return 72;
  }
  if (length > 110) return 40;
  if (length > 80) return 48;
  if (length > 58) return 56;
  return 64;
}

/**
 * Shared social card. Satori supports a deliberately small CSS subset, so
 * this uses explicit flexbox, solid colours, and one font family only.
 */
export function StoryShareCard({
  title,
  sectionBn,
  sectionEn,
  sourceCount,
  language,
  square = false,
}: StoryShareCardProps) {
  const font = headlineSize(title, square);
  const sources =
    language === "bn"
      ? `${toBanglaDigits(sourceCount)}টি স্বাধীন সূত্র`
      : `${sourceCount} independent ${sourceCount === 1 ? "source" : "sources"}`;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: OG_COLORS.paper,
        color: OG_COLORS.ink,
        fontFamily: OG_FONT_FAMILY,
        padding: square ? "72px 76px" : "52px 64px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: square ? 30 : 22,
          borderBottom: `1px solid ${OG_COLORS.rule}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: square ? 58 : 46,
              height: square ? 58 : 46,
              borderRadius: 13,
              backgroundColor: OG_COLORS.accent,
              color: OG_COLORS.paper,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: square ? 34 : 27,
              lineHeight: 1,
            }}
          >
            D
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: 14,
            }}
          >
            <div style={{ fontSize: square ? 24 : 21, lineHeight: 1.25 }}>
              {SITE_NAME_BN}
            </div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.2em",
                color: OG_COLORS.muted,
                marginTop: 3,
              }}
            >
              {SITE_NAME.toUpperCase()}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: `1px solid ${OG_COLORS.accent}`,
            borderRadius: 999,
            padding: square ? "10px 18px" : "7px 14px",
            fontSize: square ? 15 : 13,
            color: OG_COLORS.accent,
          }}
        >
          {sectionBn} · {sectionEn}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          paddingTop: square ? 44 : 28,
          paddingBottom: square ? 44 : 28,
        }}
      >
        <div
          style={{
            width: square ? 72 : 54,
            height: 5,
            backgroundColor: OG_COLORS.signal,
            marginBottom: square ? 32 : 24,
          }}
        />
        <div
          style={{
            fontSize: font,
            lineHeight: 1.34,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            maxWidth: square ? 920 : 1_060,
          }}
        >
          {title}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: `1px solid ${OG_COLORS.rule}`,
          paddingTop: square ? 24 : 18,
          fontSize: square ? 15 : 13,
          color: OG_COLORS.muted,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              backgroundColor: OG_COLORS.accent,
              marginRight: 9,
            }}
          />
          {sources}
        </div>
        <div>{square ? `${DISPLAY_URL} · সংস্করণ` : DISPLAY_URL}</div>
      </div>
    </div>
  );
}

/** Root brand card used when there is no story-specific image. */
export function BrandShareCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: OG_COLORS.paper,
        color: OG_COLORS.ink,
        fontFamily: OG_FONT_FAMILY,
        padding: "56px 68px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 22,
          borderBottom: `1px solid ${OG_COLORS.rule}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 13,
              backgroundColor: OG_COLORS.accent,
              color: OG_COLORS.paper,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 29,
              lineHeight: 1,
            }}
          >
            D
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: 14,
            }}
          >
            <div style={{ fontSize: 22, lineHeight: 1.25 }}>{SITE_NAME_BN}</div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.2em",
                color: OG_COLORS.muted,
                marginTop: 3,
              }}
            >
              {SITE_NAME.toUpperCase()}
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 13,
            color: OG_COLORS.accent,
            border: `1px solid ${OG_COLORS.accent}`,
            borderRadius: 999,
            padding: "7px 14px",
          }}
        >
          দেশি · বিদেশি
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 5,
            backgroundColor: OG_COLORS.signal,
            marginBottom: 28,
          }}
        />
        <div
          style={{
            fontSize: 64,
            lineHeight: 1.35,
            maxWidth: 980,
          }}
        >
          {SITE_TAGLINE_BN}
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 21,
            color: OG_COLORS.muted,
          }}
        >
          {SITE_TAGLINE_EN}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: `1px solid ${OG_COLORS.rule}`,
          paddingTop: 18,
          fontSize: 13,
          color: OG_COLORS.muted,
        }}
      >
        <div>{DISPLAY_URL}</div>
        <div>প্রতি ৩০ মিনিটে হালনাগাদ</div>
      </div>
    </div>
  );
}
