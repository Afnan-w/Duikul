/*
  GOOGLE NEWS SITEMAP  (Stage F)  served at /news-sitemap.xml
  -----------------------------------------------------------
  A special extra sitemap that Google News understands. It carries
  the news-specific fields (`news:publication`, `news:publication_date`)
  and only covers the LAST TWO DAYS - that is Google's official rule
  for news sitemaps, no more than 1,000 items.
*/

import { getAllStories } from "@/lib/news";
import { siteConfig } from "@/lib/site";
import { categoryLabel } from "@/lib/seo";

export const revalidate = 600; // same 10-minute rhythm as the feeds

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
const MAX_ITEMS = 1000; // Google's own cap for a news sitemap

export async function GET(): Promise<Response> {
  const stories = (await getAllStories())
    .filter(
      (story) =>
        Date.now() - Date.parse(story.publishedAt) < TWO_DAYS_MS
    )
    .slice(0, MAX_ITEMS);

  const items = stories
    .map(
      (story) => `  <url>
    <loc>${encodeURI(`${siteConfig.url}/news/${story.slug}`)}</loc>
    <news:news>
      <news:publication>
        <news:name>Duikul</news:name>
        <news:language>bn</news:language>
      </news:publication>
      <news:publication_date>${story.publishedAt}</news:publication_date>
      <news:title>${escapeXml(story.bn.title)}</news:title>
      <news:keywords>${escapeXml(newsKeywords(story))}</news:keywords>
    </news:news>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // The margins are tiny; keep the cached copy out of CDN puzzles.
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}

/** XML cannot contain raw <, > or & - swap them for the safe form. */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Comma-separated keywords Google may use to cluster the item. */
function newsKeywords(
  story: Awaited<ReturnType<typeof getAllStories>>[number]
): string {
  const section = story.section === "deshi" ? "দেশি সংবাদ" : "বিদেশি সংবাদ";
  return `${categoryLabel(story.category, "bn")}, ${section}, দুইকূল`;
}
