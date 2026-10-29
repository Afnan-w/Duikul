import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";

/**
 * Search results are intentionally excluded: they are marked noindex and
 * should not compete with story pages. API routes are never crawlable.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/search", "/offline"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
