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

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/deshi`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/bideshi`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/about`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/editorial-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/corrections`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
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
    changeFrequency: "hourly" as const,
    priority: 0.7,
  }));

  /* Stories: newest first, Bangla slugs percent-encoded (the sitemap
     spec requires escaped URLs). Article URLs never change. */
  const storyPages: MetadataRoute.Sitemap = stories.slice(0, 1000).map((story) => ({
    url: encodeURI(`${base}/news/${story.slug}`),
    lastModified: new Date(story.publishedAt),
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...storyPages];
}
