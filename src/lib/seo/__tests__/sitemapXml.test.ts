import { describe, expect, it } from "vitest";
import { SITE_NAME } from "@/config/site";
import {
  NEWS_SITEMAP_MAX,
  SITEMAP_CHILDREN,
  escapeXml,
  renderNewsSitemap,
  renderSitemapIndex,
  renderUrlSet,
  sitemapChildUrl,
} from "../sitemapXml";

describe("escapeXml", () => {
  it("escapes the five XML special characters", () => {
    expect(escapeXml(`Tom & "Jerry" <b>'x'</b>`)).toBe(
      "Tom &amp; &quot;Jerry&quot; &lt;b&gt;&apos;x&apos;&lt;/b&gt;",
    );
  });

  it("leaves ordinary text untouched", () => {
    expect(escapeXml("দুইকুল story/abc-123")).toBe("দুইকুল story/abc-123");
  });
});

describe("sitemapChildUrl", () => {
  it("maps every child id under /sitemap", () => {
    expect(SITEMAP_CHILDREN).toEqual([
      "static",
      "stories",
      "daily",
      "sources",
    ]);
    expect(sitemapChildUrl("stories")).toBe("/sitemap/stories.xml");
  });
});

describe("renderSitemapIndex", () => {
  it("wraps children in a sitemapindex document", () => {
    const xml = renderSitemapIndex([
      { loc: "https://duikul.vercel.app/sitemap/static.xml" },
      {
        loc: "https://duikul.vercel.app/sitemap/stories.xml",
        lastModified: new Date("2026-10-30T10:00:00Z"),
      },
    ]);

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain(
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    );
    expect(xml.match(/<sitemap>/g)).toHaveLength(2);
    expect(xml).toContain(
      "<loc>https://duikul.vercel.app/sitemap/static.xml</loc>",
    );
    expect(xml).toContain(
      "<lastmod>2026-10-30T10:00:00.000Z</lastmod>",
    );
    expect(xml).toContain("</sitemapindex>");
  });

  it("omits lastmod when no date is given", () => {
    const xml = renderSitemapIndex([
      { loc: "https://duikul.vercel.app/sitemap/daily.xml" },
    ]);
    expect(xml).not.toContain("<lastmod>");
  });

  it("escapes ampersands in locations", () => {
    const xml = renderSitemapIndex([
      { loc: "https://duikul.vercel.app/sitemap/x.xml?a=1&b=2" },
    ]);
    expect(xml).toContain("&amp;b=2");
    expect(xml).not.toContain("?a=1&b=2");
  });
});

describe("renderNewsSitemap", () => {
  const entry = {
    url: "https://duikul.vercel.app/story/abc-123",
    title: "সংবাদ শিরোনাম",
    publicationDate: new Date("2026-10-30T08:00:00+06:00"),
    language: "bn" as const,
    modified: new Date("2026-10-30T09:00:00+06:00"),
  };

  it("emits the news namespace, publication, and title", () => {
    const xml = renderNewsSitemap([entry]);

    expect(xml).toContain(
      'xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"',
    );
    expect(xml).toContain(`<news:name>${SITE_NAME}</news:name>`);
    expect(xml).toContain("<news:language>bn</news:language>");
    expect(xml).toContain(
      "<news:publication_date>2026-10-30T02:00:00.000Z</news:publication_date>",
    );
    expect(xml).toContain("<news:title>সংবাদ শিরোনাম</news:title>");
    expect(xml).toContain(
      "<lastmod>2026-10-30T03:00:00.000Z</lastmod>",
    );
  });

  it("caps the feed at 1 000 URLs", () => {
    const many = Array.from({ length: NEWS_SITEMAP_MAX + 5 }, (_, i) => ({
      ...entry,
      url: `https://duikul.vercel.app/story/${i}`,
    }));

    const xml = renderNewsSitemap(many);
    expect(xml.match(/<url>/g)).toHaveLength(NEWS_SITEMAP_MAX);
  });

  it("truncates headlines to 100 characters", () => {
    const xml = renderNewsSitemap([{ ...entry, title: "x".repeat(300) }]);
    const title = xml.match(/<news:title>([^<]*)<\/news:title>/)?.[1] ?? "";
    expect(Array.from(title).length).toBeLessThanOrEqual(100);
    expect(title.endsWith("…")).toBe(true);
  });

  it("escapes headline text so the XML stays well-formed", () => {
    const xml = renderNewsSitemap([
      { ...entry, title: "Rate < 5 & rising" },
    ]);
    expect(xml).toContain("Rate &lt; 5 &amp; rising");
  });

  it("renders a closing urlset even for an empty feed", () => {
    const xml = renderNewsSitemap([]);
    expect(xml).toContain("</urlset>");
    expect(xml).not.toContain("<url>");
  });
});

describe("renderUrlSet", () => {
  it("emits loc, lastmod, changefreq, and priority", () => {
    const xml = renderUrlSet([
      {
        url: "https://duikul.vercel.app/deshi",
        lastModified: new Date("2026-10-30T10:00:00Z"),
        changeFrequency: "hourly",
        priority: 0.9,
      },
    ]);

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    );
    expect(xml).toContain("<loc>https://duikul.vercel.app/deshi</loc>");
    expect(xml).toContain("<lastmod>2026-10-30T10:00:00.000Z</lastmod>");
    expect(xml).toContain("<changefreq>hourly</changefreq>");
    expect(xml).toContain("<priority>0.9</priority>");
    expect(xml).toContain("</urlset>");
  });

  it("always renders priority with one decimal", () => {
    const xml = renderUrlSet([{ url: "https://duikul.vercel.app", priority: 1 }]);
    expect(xml).toContain("<priority>1.0</priority>");
  });

  it("omits optional tags that were not provided", () => {
    const xml = renderUrlSet([{ url: "https://duikul.vercel.app/contact" }]);
    expect(xml).not.toContain("<lastmod>");
    expect(xml).not.toContain("<changefreq>");
    expect(xml).not.toContain("<priority>");
  });

  it("escapes ampersands in URLs", () => {
    const xml = renderUrlSet([
      { url: "https://duikul.vercel.app/search?q=a&b=c" },
    ]);
    expect(xml).toContain("?q=a&amp;b=c");
  });
});
