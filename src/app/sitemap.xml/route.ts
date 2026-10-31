import { SITE_URL } from "@/config/site";
import {
  SITEMAP_CHILDREN,
  renderSitemapIndex,
  sitemapChildUrl,
  xmlResponse,
} from "@/lib/seo/sitemapXml";

/**
 * `/sitemap.xml` is a sitemap *index*: Next's `sitemap.ts` convention can only
 * produce `<urlset>` documents and reserves this path, so the index and every
 * child are explicit route handlers under `src/app/sitemap/` and
 * `src/app/sitemap.xml/`.
 *
 * Children are regenerated hourly (see `src/lib/seo/sitemapEntries.ts`), so a
 * constant index body is enough; there is no `lastmod` to keep fresh.
 */
export const revalidate = 3_600;

export async function GET(): Promise<Response> {
  const xml = renderSitemapIndex(
    SITEMAP_CHILDREN.map((id) => ({ loc: `${SITE_URL}${sitemapChildUrl(id)}` })),
  );

  return xmlResponse(xml);
}
