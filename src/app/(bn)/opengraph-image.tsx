import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_NAME_BN } from "@/config/site";
import { BrandShareCard, OG_SIZE } from "@/lib/og/cards";
import { loadOgFont, OG_FONT } from "@/lib/og/font";

export const alt = `${SITE_NAME_BN} — দেশ ও বিশ্বের জরুরি খবর, এক জায়গায়। ${SITE_NAME}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const fontData = await loadOgFont();

  return new ImageResponse(<BrandShareCard />, {
    ...size,
    fonts: [{ ...OG_FONT, data: fontData }],
  });
}
