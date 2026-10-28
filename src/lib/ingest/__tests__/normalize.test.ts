import { describe, expect, it } from "vitest";
import { getSource } from "@/config/sources";
import {
  dedupeArticles,
  normalizeFeedItem,
  normalizeFeedItems,
  normalizeImageUrl,
  parseFeedDate,
} from "../normalize";
import type { FeedItemCandidate } from "../types";

const NOW = new Date("2026-10-28T12:00:00.000Z");
const source = getSource("prothom-alo");
if (!source) throw new Error("Missing prothom-alo source");

function candidate(
  overrides: Partial<FeedItemCandidate> = {},
): FeedItemCandidate {
  return {
    title: "<b>বাংলাদেশে নতুন সিদ্ধান্ত</b>",
    link: "https://www.prothomalo.com/bangladesh/story?utm_source=rss#top",
    publishedAt: new Date(NOW.getTime() - 2 * 3_600_000).toISOString(),
    summary: "<p>সরকার নতুন একটি গুরুত্বপূর্ণ সিদ্ধান্ত নিয়েছে বলে জানানো হয়েছে।</p>",
    content: "",
    imageUrl: "/photo.jpg",
    guid: "story-1",
    position: 3,
    ...overrides,
  };
}

describe("parseFeedDate", () => {
  it("accepts RFC 822 and ISO dates", () => {
    expect(parseFeedDate("Wed, 28 Oct 2026 10:00:00 +0600")?.toISOString()).toBe(
      "2026-10-28T04:00:00.000Z",
    );
    expect(parseFeedDate("2026-10-28T04:00:00Z")?.toISOString()).toBe(
      "2026-10-28T04:00:00.000Z",
    );
  });

  it("rejects empty, invalid and implausible dates", () => {
    expect(parseFeedDate("")).toBeNull();
    expect(parseFeedDate("not a date")).toBeNull();
    expect(parseFeedDate("1970-01-01T00:00:00Z")).toBeNull();
  });
});

describe("normalizeImageUrl", () => {
  it("resolves relative images and rejects dangerous schemes", () => {
    expect(
      normalizeImageUrl("/images/a.jpg", "https://example.com/story"),
    ).toBe("https://example.com/images/a.jpg");
    expect(
      normalizeImageUrl("data:image/png;base64,abc", "https://example.com"),
    ).toBeNull();
    expect(
      normalizeImageUrl("javascript:alert(1)", "https://example.com"),
    ).toBeNull();
  });
});

describe("normalizeFeedItem", () => {
  it("cleans, canonicalises and enriches a valid item", () => {
    const outcome = normalizeFeedItem(source, candidate(), NOW);
    expect(outcome.article).toBeDefined();
    if (!outcome.article) return;

    expect(outcome.article.title).toBe("বাংলাদেশে নতুন সিদ্ধান্ত");
    expect(outcome.article.url).toBe(
      "https://www.prothomalo.com/bangladesh/story",
    );
    expect(outcome.article.imageUrl).toBe(
      "https://www.prothomalo.com/photo.jpg",
    );
    expect(outcome.article.summary).not.toContain("<");
    expect(outcome.article.summary.length).toBeGreaterThan(10);
    expect(outcome.article.category).toBe("deshi");
    expect(outcome.article.language).toBe("bn");
    expect(outcome.article.trustWeight).toBe(5);
    expect(outcome.article.feedPosition).toBe(3);
    expect(outcome.article.urlHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("rejects items outside the 48-hour window", () => {
    const old = candidate({
      publishedAt: new Date(NOW.getTime() - 49 * 3_600_000).toISOString(),
    });
    expect(normalizeFeedItem(source, old, NOW)).toEqual({
      reason: "outside-window",
    });
  });

  it("rejects missing, invalid and far-future dates", () => {
    expect(
      normalizeFeedItem(source, candidate({ publishedAt: "" }), NOW),
    ).toEqual({ reason: "invalid-date" });
    expect(
      normalizeFeedItem(
        source,
        candidate({ publishedAt: "yesterday" }),
        NOW,
      ),
    ).toEqual({ reason: "invalid-date" });
    expect(
      normalizeFeedItem(
        source,
        candidate({
          publishedAt: new Date(NOW.getTime() + 2 * 3_600_000).toISOString(),
        }),
        NOW,
      ),
    ).toEqual({ reason: "future-date" });
  });

  it("rejects malformed, short and blocked headlines", () => {
    expect(
      normalizeFeedItem(source, candidate({ title: "<b></b>" }), NOW),
    ).toEqual({ reason: "missing-title" });
    expect(
      normalizeFeedItem(source, candidate({ title: "খবর" }), NOW),
    ).toEqual({ reason: "short-title" });
    expect(
      normalizeFeedItem(
        source,
        candidate({
          title: "You won't believe what happened next in Dhaka",
        }),
        NOW,
      ),
    ).toEqual({ reason: "blocked-title" });
  });

  it("rejects unsafe or missing links", () => {
    expect(
      normalizeFeedItem(
        source,
        candidate({ link: "javascript:alert(1)" }),
        NOW,
      ),
    ).toEqual({ reason: "missing-url" });
    expect(
      normalizeFeedItem(source, candidate({ link: "" }), NOW),
    ).toEqual({ reason: "missing-url" });
  });

  it("caps the summary at 280 characters", () => {
    const outcome = normalizeFeedItem(
      source,
      candidate({ summary: `<p>${"গুরুত্বপূর্ণ খবর ".repeat(80)}</p>` }),
      NOW,
    );
    expect(outcome.article?.summary.length).toBeLessThanOrEqual(280);
  });

  it("removes boilerplate calls to read more", () => {
    const outcome = normalizeFeedItem(
      source,
      candidate({
        summary: "<p>সংক্ষিপ্ত সারমর্ম এখানে দেওয়া হলো। আরও পড়ুন</p>",
      }),
      NOW,
    );
    expect(outcome.article?.summary).not.toMatch(/আরও পড়ুন/);
  });
});

describe("feed-level normalisation", () => {
  it("counts every rejection reason", () => {
    const result = normalizeFeedItems(
      source,
      [
        candidate(),
        candidate({ link: "https://www.prothomalo.com/old", publishedAt: new Date(NOW.getTime() - 100 * 3_600_000).toISOString() }),
        candidate({ link: "javascript:void(0)" }),
      ],
      NOW,
    );

    expect(result.articles).toHaveLength(1);
    expect(result.rejected["outside-window"]).toBe(1);
    expect(result.rejected["missing-url"]).toBe(1);
  });

  it("deduplicates by canonical URL hash", () => {
    const first = normalizeFeedItem(source, candidate(), NOW).article;
    const second = normalizeFeedItem(
      source,
      candidate({
        link: "https://www.prothomalo.com/bangladesh/story/?fbclid=abc",
        title: "বাংলাদেশে নতুন সিদ্ধান্ত নিয়ে প্রতিবেদন",
      }),
      NOW,
    ).article;

    if (!first || !second) throw new Error("Expected two normalised articles");

    const result = dedupeArticles([first, second]);
    expect(result.articles).toHaveLength(1);
    expect(result.duplicates).toBe(1);
  });
});
