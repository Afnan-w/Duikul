/*
  ROBOTS.TXT  (Stage F)
  ---------------------
  Tells search engines two things: "index everything" and "here is
  where the sitemaps are". Served automatically at /robots.txt.
*/

import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Internal search results are noise for search engines -
        // the stories themselves get all the attention.
        // /offline.html is a purely client-side fallback page for
        // the service worker; there is nothing for a bot to index.
        disallow: ["/search", "/offline.html"],
      },
    ],
    sitemap: [
      `${siteConfig.url}/sitemap.xml`,
      `${siteConfig.url}/news-sitemap.xml`,
    ],
    host: siteConfig.url,
  };
}
