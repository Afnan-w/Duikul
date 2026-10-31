import { SITE_URL } from "@/config/site";
import { listIndexableClusters } from "@/lib/data/clusters";
import { truncate } from "@/lib/seo/metadata";
import {
  NEWS_SITEMAP_MAX,
  NEWS_SITEMAP_WINDOW_MS,
  renderNewsSitemap,
  xmlResponse,
  type NewsSitemapEntry,
} from "@/lib/seo/sitemapXml";

/**
 * Google News sitemap: indexable stories published in the last 48 hours, at
 * most 1 000 URLs, refreshed every five minutes. Stories that fail the
 * thin-content guard never reach `listIndexableClusters`, so a `noindex` URL
 * cannot slip into the news feed.
 */
export const revalidate = 300;

export async function GET(): Promise<Response> {
  const cutoff = Date.now() - NEWS_SITEMAP_WINDOW_MS;
  const clusters = await listIndexableClusters(NEWS_SITEMAP_MAX);

  const entries: NewsSitemapEntry[] = clusters
    .filter(
      (cluster) => cluster.firstPublishedAt.getTime() >= cutoff,
    )
    .map((cluster) => ({
      url: `${SITE_URL}/story/${cluster.id}`,
      title: truncate(cluster.title, 100),
      publicationDate: cluster.firstPublishedAt,
      modified: cluster.lastPublishedAt,
      language: cluster.language,
    }));

  return xmlResponse(renderNewsSitemap(entries));
}
