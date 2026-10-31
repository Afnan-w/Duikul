import { getSitemapEntries } from "@/lib/seo/sitemapEntries";
import { renderUrlSet, xmlResponse } from "@/lib/seo/sitemapXml";

/** Child sitemap: publisher profiles. */
export const revalidate = 3_600;

export async function GET(): Promise<Response> {
  const entries = await getSitemapEntries("sources");
  return xmlResponse(renderUrlSet(entries ?? []));
}
