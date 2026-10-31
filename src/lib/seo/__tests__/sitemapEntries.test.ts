import { describe, expect, it } from "vitest";
import { SITE_URL } from "@/config/site";
import { getSitemapEntries } from "../sitemapEntries";
import { SITEMAP_CHILDREN } from "../sitemapXml";

describe("getSitemapEntries", () => {
  it("answers for every child id the sitemap index advertises", async () => {
    for (const id of SITEMAP_CHILDREN) {
      const entries = await getSitemapEntries(id);
      expect(entries, `child ${id} must resolve`).not.toBeNull();
      for (const entry of entries ?? []) {
        expect(entry.url.startsWith(SITE_URL), entry.url).toBe(true);
      }
    }
  });

  it("lists every trust page in both languages without a database", async () => {
    const entries = await getSitemapEntries("static");
    // 4 shell pages (home, /en, deshi, bideshi) + 8 trust pages × 2 languages.
    expect(entries).toHaveLength(20);
    expect(entries?.some((entry) => entry.url === `${SITE_URL}/en/about`)).toBe(
      true,
    );
  });

  it("lists every configured publisher profile without a database", async () => {
    const entries = await getSitemapEntries("sources");
    expect(entries && entries.length >= 19).toBe(true);
    expect(
      entries?.some((entry) => entry.url === `${SITE_URL}/source/prothom-alo`),
    ).toBe(true);
  });
});
