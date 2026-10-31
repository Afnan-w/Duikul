import { getSitemapEntries } from "@/lib/seo/sitemapEntries";
import { renderUrlSet, xmlResponse } from "@/lib/seo/sitemapXml";

/** Child sitemap: daily briefings with five or more clustered stories. */
export const revalidate = 3_600;

export async function GET(): Promise<Response> {
  const entries = await getSitemapEntries("daily");
  return xmlResponse(renderUrlSet(entries ?? []));
}
