import { getSitemapEntries } from "@/lib/seo/sitemapEntries";
import { renderUrlSet, xmlResponse } from "@/lib/seo/sitemapXml";

/** Child sitemap: indexable story pages inside the retention window. */
export const revalidate = 3_600;

export async function GET(): Promise<Response> {
  const entries = await getSitemapEntries("stories");
  return xmlResponse(renderUrlSet(entries ?? []));
}
