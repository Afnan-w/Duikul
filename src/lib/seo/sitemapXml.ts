import { SITE_NAME } from "@/config/site";
import { truncate } from "./metadata";

/**
 * Pure XML builders for the sitemap family.
 *
 * Next's `sitemap.ts` convention can only emit `<urlset>` documents, so the
 * sitemap *index* (`/sitemap.xml`) and the Google News sitemap
 * (`/news-sitemap.xml`) are hand-rendered here as route handlers. Keeping the
 * strings in pure functions makes escaping and the size caps unit-testable.
 */

/** XML text escaping for URLs, titles, and any other text node/attribute. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * The child sitemaps advertised by the index at `/sitemap.xml`. Shared with
 * `src/app/sitemap.ts` so the index and the children can never drift apart.
 */
export const SITEMAP_CHILDREN = [
  "static",
  "stories",
  "daily",
  "sources",
] as const;

export type SitemapChildId = (typeof SITEMAP_CHILDREN)[number];

export function sitemapChildUrl(id: SitemapChildId): string {
  return `/sitemap/${id}.xml`;
}

export type SitemapIndexEntry = {
  loc: string;
  lastModified?: Date;
};

/** `<sitemapindex>` document listing the child sitemaps. */
export function renderSitemapIndex(
  entries: readonly SitemapIndexEntry[],
): string {
  const body = entries
    .map((entry) => {
      const lastmod = entry.lastModified
        ? `\n    <lastmod>${entry.lastModified.toISOString()}</lastmod>`
        : "";
      return `  <sitemap>\n    <loc>${escapeXml(entry.loc)}</loc>${lastmod}\n  </sitemap>`;
    })
    .join("\n");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${body}\n` +
    `</sitemapindex>\n`
  );
}

export type UrlSetChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export type UrlSetEntry = {
  url: string;
  lastModified?: Date;
  changeFrequency?: UrlSetChangeFrequency;
  priority?: number;
};

/** `<urlset>` document for one child sitemap (Next's own sitemap format). */
export function renderUrlSet(entries: readonly UrlSetEntry[]): string {
  const body = entries
    .map((entry) => {
      const parts = [`    <loc>${escapeXml(entry.url)}</loc>`];
      if (entry.lastModified) {
        parts.push(`    <lastmod>${entry.lastModified.toISOString()}</lastmod>`);
      }
      if (entry.changeFrequency) {
        parts.push(`    <changefreq>${entry.changeFrequency}</changefreq>`);
      }
      if (entry.priority !== undefined) {
        parts.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
      }
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${body}\n` +
    `</urlset>\n`
  );
}

/** Uniform response headers for every hand-built sitemap document. */
export function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}

/** Google News sitemaps may list at most 1 000 URLs. */
export const NEWS_SITEMAP_MAX = 1_000;

/** Stories must be published within this window to appear in the news feed. */
export const NEWS_SITEMAP_WINDOW_MS = 48 * 3_600_000;

export type NewsSitemapEntry = {
  url: string;
  /** Headline, capped at 100 characters per Google News guidance. */
  title: string;
  publicationDate: Date;
  language: "bn" | "en";
  modified?: Date;
};

/** `<urlset>` document with `<news:news>` annotations for Google News. */
export function renderNewsSitemap(
  entries: readonly NewsSitemapEntry[],
): string {
  const capped = entries.slice(0, NEWS_SITEMAP_MAX);
  const body = capped
    .map((entry) => {
      const lastmod = entry.modified
        ? `\n    <lastmod>${entry.modified.toISOString()}</lastmod>`
        : "";
      return `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(SITE_NAME)}</news:name>
        <news:language>${entry.language}</news:language>
      </news:publication>
      <news:publication_date>${entry.publicationDate.toISOString()}</news:publication_date>
      <news:title>${escapeXml(truncate(entry.title, 100))}</news:title>
    </news:news>${lastmod}
  </url>`;
    })
    .join("\n");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ` +
    `xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n` +
    `${body}\n` +
    `</urlset>\n`
  );
}
