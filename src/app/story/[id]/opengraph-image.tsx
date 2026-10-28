import { ImageResponse } from "next/og";
import { sectionFor } from "@/config/sections";
import { getClusterDetail } from "@/lib/data/clusters";
import { OG_SIZE, StoryShareCard } from "@/lib/og/cards";
import { loadOgFont, OG_FONT } from "@/lib/og/font";
import { isUuid } from "@/lib/utils/uuid";

export const alt = "KhoborDaily story card";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 300;

type ImageProps = {
  params: Promise<{ id: string }>;
};

export default async function Image({ params }: ImageProps) {
  const { id } = await params;
  if (!isUuid(id)) return new Response("Not found", { status: 404 });

  const detail = await getClusterDetail(id);
  if (!detail) return new Response("Not found", { status: 404 });

  const { cluster } = detail;
  const section = sectionFor(cluster.category);
  const fontData = await loadOgFont();

  return new ImageResponse(
    <StoryShareCard
      title={cluster.title}
      sectionBn={section.labelBn}
      sectionEn={section.labelEn}
      sourceCount={cluster.distinctSourceCount}
      language={cluster.language}
    />,
    {
      ...size,
      fonts: [{ ...OG_FONT, data: fontData }],
    },
  );
}
