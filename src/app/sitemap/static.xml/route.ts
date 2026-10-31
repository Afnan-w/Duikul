import { getSitemapEntries } from "@/lib/seo/sitemapEntries";
import { renderUrlSet, xmlResponse } from "@/lib/seo/sitemapXml";

/** Child sitemap: home, sections, and trust/policy pages (bn + en). */
export const revalidate = 3_600;

export async function GET(): Promise<Response> {
  const entries = await getSitemapEntries("static");
  return xmlResponse(renderUrlSet(entries ?? []));
}
