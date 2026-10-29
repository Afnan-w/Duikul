import { ImageResponse } from "next/og";
import { SITE_SLUG } from "@/config/site";
import { sectionFor } from "@/config/sections";
import { getClusterDetail } from "@/lib/data/clusters";
import { SQUARE_SIZE, StoryShareCard } from "@/lib/og/cards";
import { loadOgFont, OG_FONT } from "@/lib/og/font";
import { isUuid } from "@/lib/utils/uuid";

/**
 * 1080 × 1080 card for messaging apps and Instagram. Returned as an
 * attachment so the share menu can offer a direct download.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
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
      square
    />,
    {
      ...SQUARE_SIZE,
      fonts: [{ ...OG_FONT, data: fontData }],
      headers: {
        "Content-Disposition": `attachment; filename="${SITE_SLUG}-${cluster.id}.png"`,
        "Cache-Control": "public, max-age=300, s-maxage=300, immutable",
      },
    },
  );
}
