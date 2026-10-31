import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";

/**
 * Search engines may crawl everything except API routes, internal tooling
 * paths, and search results (which are noindex and should not compete with
 * story pages). Both sitemaps are advertised here: the index for the whole
 * site and the 48-hour news feed for Google News.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dev/", "/search", "/offline"],
      },
    ],
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/news-sitemap.xml`],
    host: SITE_URL,
  };
}
