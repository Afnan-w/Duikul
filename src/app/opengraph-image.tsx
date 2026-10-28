import { ImageResponse } from "next/og";
import { BrandShareCard, OG_SIZE } from "@/lib/og/cards";
import { loadOgFont, OG_FONT } from "@/lib/og/font";

export const alt =
  "খবর ডেইলি — দেশ ও বিশ্বের জরুরি খবর, এক জায়গায়। KhoborDaily";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const fontData = await loadOgFont();

  return new ImageResponse(<BrandShareCard />, {
    ...size,
    fonts: [{ ...OG_FONT, data: fontData }],
  });
}
