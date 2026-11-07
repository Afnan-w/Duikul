/*
  SITEMAP.XML  (Stage F)
  ----------------------
  The full map of the site for search engines: the static pages, the
  two section pages, the six category pages and every current story.

  Regenerated with the same 10-minute rhythm as the feeds. Stories
  older than ~7 days rotate out of the feed caches anyway, so no
  need to cap the list manually.
*/

import type { MetadataRoute } from "next";
import { getAllStories } from "@/lib/news";
import { siteConfig } from "@/lib/site";

export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const stories = await getAllStories();

  /* Static pages re-render with the stories, so they are "fresh" too. */
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/deshi`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/bideshi`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/editorial-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/corrections`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryPages: MetadataRoute.Sitemap = [
    "politics",
    "business",
    "sports",
    "technology",
    "entertainment",
    "health",
  ].map((slug) => ({
    url: `${base}/category/${slug}`,
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: 0.7,
  }));

  /* Stories: newest first, Bangla slugs percent-encoded (the sitemap
     spec requires escaped URLs). Article URLs never change, but the
     photo — when the feed supplied one — is listed as <image:image>
     so the story surfaces in image search as well. */
  const storyPages: MetadataRoute.Sitemap = stories
    .slice(0, 1000)
    .map((story) => {
      const image = encodeImage(story.imageUrl);
      return {
        // xmlEscape: Next.js writes <loc> and <image:loc> into the XML
        // verbatim, and feed URLs often carry & in a query string.
        url: xmlEscape(encodeURI(`${base}/news/${story.slug}`)),
        lastModified: new Date(story.publishedAt),
        changeFrequency: "daily" as const,
        priority: 0.6,
        ...(image ? { images: [xmlEscape(image)] } : {}),
      };
    });

  return [...staticPages, ...categoryPages, ...storyPages];
}

/**
 * Sitemap <image:loc> wants an absolute, fully escaped URL.
 * Feeds sometimes hand out site-relative paths (Daily Star, TBS) —
 * those cannot be dereferenced by a crawler, so we skip them.
 */
function encodeImage(url?: string): string | undefined {
  if (!url) return undefined;
  const absolute = url.startsWith("//") ? `https:${url}` : url;
  if (!absolute.startsWith("http")) return undefined;
  return encodeURI(absolute);
}

/** Escape the five XML entities (the & in photo URLs is the usual one). */
function xmlEscape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
