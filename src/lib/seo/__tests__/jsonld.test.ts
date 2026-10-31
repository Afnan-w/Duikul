import { describe, expect, it } from "vitest";
import { getSource } from "@/config/sources";
import type { StoryCluster, StorySource } from "@/lib/data/clusters";
import type { DailyBriefing } from "@/lib/data/daily";
import {
  CONTACT_EMAIL,
  SITE_NAME,
  SITE_NAME_BN,
  SITE_URL,
  SOCIAL_PROFILES,
} from "@/config/site";
import {
  breadcrumbJsonLd,
  dailyBriefingJsonLd,
  organizationJsonLd,
  serializeJsonLd,
  storyJsonLd,
  webPageJsonLd,
  websiteJsonLd,
  type JsonLd,
} from "../jsonld";

const CANONICAL = `${SITE_URL}/story/abc-123`;

function makeCluster(overrides: Partial<StoryCluster> = {}): StoryCluster {
  return {
    id: "abc-123",
    title: "একটি সংবাদ শিরোনাম",
    summary: "একটি সংক্ষিপ্ত সারসংক্ষেপ।",
    category: "deshi",
    language: "bn",
    imageUrl: "https://cdn.example.com/photo.jpg",
    primarySourceId: "prothom-alo",
    primarySourceName: "প্রথম আলো",
    primaryArticleUrl: "https://www.prothomalo.com/example",
    distinctSourceCount: 3,
    trustWeightSum: 12,
    verifiedScore: 1,
    popularScore: 1,
    editorNote: null,
    firstPublishedAt: new Date("2026-10-30T08:00:00+06:00"),
    lastPublishedAt: new Date("2026-10-30T10:00:00+06:00"),
    isConfirmed: true,
    isIndexable: true,
    ...overrides,
  };
}

function makeSource(overrides: Partial<StorySource> = {}): StorySource {
  return {
    id: "art-1",
    title: "প্রথম আলোর শিরোনাম",
    summary: "প্রথম আলোর সংক্ষিপ্ত সারসংক্ষেপ।",
    url: "https://www.prothomalo.com/example",
    imageUrl: null,
    publishedAt: new Date("2026-10-30T08:05:00+06:00"),
    sourceId: "prothom-alo",
    sourceName: "Prothom Alo",
    sourceNameBn: "প্রথম আলো",
    ...overrides,
  };
}

function makeBriefing(overrides: Partial<DailyBriefing> = {}): DailyBriefing {
  return {
    date: "2026-10-30",
    clusters: [makeCluster()],
    confirmed: [makeCluster()],
    confirmedBySection: { deshi: [makeCluster()], bideshi: [] },
    sourceActivity: [],
    differences: [],
    editorNote: null,
    outletCount: 4,
    articleCount: 9,
    isIndexable: true,
    ...overrides,
  };
}

function nodeOfType(data: JsonLd, type: string): Record<string, unknown> | undefined {
  const candidates: unknown[] = Array.isArray(data)
    ? (data as unknown[])
    : [data];
  return candidates.find(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      (item as Record<string, unknown>)["@type"] === type,
  ) as Record<string, unknown> | undefined;
}

describe("organizationJsonLd", () => {
  it("identifies the site with both brand names and the logo", () => {
    const org = organizationJsonLd();

    expect(org["@context"]).toBe("https://schema.org");
    expect(org["@type"]).toBe("Organization");
    expect(org["@id"]).toBe(`${SITE_URL}/#organization`);
    expect(org.name).toBe(SITE_NAME);
    expect(org.alternateName).toBe(SITE_NAME_BN);
    expect(org.contactPoint).toMatchObject([{ email: CONTACT_EMAIL }]);
    expect(org.logo).toMatchObject({ url: `${SITE_URL}/icons/icon-512.png` });
  });

  it("only lists sameAs when real profiles exist", () => {
    const org = organizationJsonLd();
    if (SOCIAL_PROFILES.length > 0) {
      expect(org.sameAs).toEqual([...SOCIAL_PROFILES]);
    } else {
      expect(org.sameAs).toBeUndefined();
    }
  });
});

describe("websiteJsonLd", () => {
  it("offers a sitelinks search action with the placeholder intact", () => {
    const site = websiteJsonLd();

    expect(site["@type"]).toBe("WebSite");
    const action = site.potentialAction as { target: { urlTemplate: string } };
    expect(action.target.urlTemplate).toContain("{search_term_string}");
    expect(site.url).toBe(SITE_URL);
  });
});

describe("breadcrumbJsonLd", () => {
  it("numbers items from 1 and absolutises paths", () => {
    const crumb = breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Bangladesh", path: "/deshi" },
      { name: "Story", path: `${SITE_URL}/story/abc-123` },
    ]);

    const items = crumb.itemListElement as Array<{
      position: number;
      name: string;
      item: string;
    }>;
    expect(items).toHaveLength(3);
    expect(items.map((entry) => entry.position)).toEqual([1, 2, 3]);
    expect(items[1].item).toBe(`${SITE_URL}/deshi`);
    expect(items[2].item).toBe(CANONICAL);
  });
});

describe("webPageJsonLd", () => {
  it("builds an absolute self-canonical page node", () => {
    const page = webPageJsonLd({
      path: "/methodology",
      name: "Methodology",
      description: "How it works.",
      dateModified: new Date("2026-10-30T00:00:00+06:00"),
    });

    expect(page["@type"]).toBe("WebPage");
    expect(page.url).toBe(`${SITE_URL}/methodology`);
    expect(page.dateModified).toBe(
      new Date("2026-10-30T00:00:00+06:00").toISOString(),
    );
  });
});

describe("storyJsonLd", () => {
  it("emits a WebPage, never a top-level NewsArticle for aggregated stories", () => {
    const data = storyJsonLd({
      cluster: makeCluster(),
      sources: [makeSource(), makeSource({ id: "art-2" })],
      canonical: CANONICAL,
      sectionLabel: "Bangladesh",
    });

    expect(data["@type"]).toBe("WebPage");
    expect(data["@id"]).toBe(CANONICAL);
    expect(data.datePublished).toBe(
      new Date("2026-10-30T08:00:00+06:00").toISOString(),
    );
    expect(data.dateModified).toBe(
      new Date("2026-10-30T10:00:00+06:00").toISOString(),
    );
    expect(data.publisher).toBeUndefined();
  });

  it("lists each coverage entry with its real publisher", () => {
    const data = storyJsonLd({
      cluster: makeCluster(),
      sources: [
        makeSource(),
        makeSource({
          id: "art-2",
          title: "The Daily Star headline",
          url: "https://www.thedailystar.com/example",
          sourceId: "the-daily-star",
          sourceName: "The Daily Star",
          sourceNameBn: "দ্য ডেলি স্টার",
        }),
      ],
      canonical: CANONICAL,
      sectionLabel: "Bangladesh",
    });

    const list = data.mainEntity as {
      "@type": string;
      numberOfItems: number;
      itemListElement: Array<{
        position: number;
        item: Record<string, unknown>;
      }>;
    };
    expect(list["@type"]).toBe("ItemList");
    expect(list.numberOfItems).toBe(2);
    expect(list.itemListElement[0].position).toBe(1);

    const first = list.itemListElement[0].item;
    expect(first["@type"]).toBe("NewsArticle");
    expect(first.publisher).toMatchObject({ name: "প্রথম আলো" });

    const second = list.itemListElement[1].item;
    // Cluster language is Bangla, so the Bangla outlet name is used; the
    // canonical domain comes from the source registry, not the fixture.
    expect(second.publisher).toMatchObject({
      name: "দ্য ডেলি স্টার",
      url: getSource("the-daily-star")?.siteUrl,
    });
    expect(second.url).toBe("https://www.thedailystar.com/example");
  });

  it("caps publisher excerpts at the 280-character limit", () => {
    const data = storyJsonLd({
      cluster: makeCluster(),
      sources: [makeSource({ summary: "x".repeat(900) })],
      canonical: CANONICAL,
      sectionLabel: "Bangladesh",
    });

    const list = data.mainEntity as {
      itemListElement: Array<{ item: { description?: string } }>;
    };
    const description = list.itemListElement[0].item.description ?? "";
    // 280 characters of publisher text plus the ellipsis, never more.
    expect(Array.from(description).length).toBeLessThanOrEqual(281);
    expect(Array.from(description.replace(/…$/, "")).length).toBeLessThanOrEqual(
      280,
    );
  });

  it("omits empty descriptions and images instead of emitting blanks", () => {
    const data = storyJsonLd({
      cluster: makeCluster({ summary: "", imageUrl: null }),
      sources: [makeSource({ summary: "" })],
      canonical: CANONICAL,
      sectionLabel: "Bangladesh",
    });

    expect(data.description).toBeUndefined();
    expect(data.primaryImageOfPage).toBeUndefined();
    const list = data.mainEntity as {
      itemListElement: Array<{ item: { description?: string } }>;
    };
    expect(list.itemListElement[0].item.description).toBeUndefined();
  });
});

describe("dailyBriefingJsonLd", () => {
  it("returns no article for an automatically compiled briefing", () => {
    expect(dailyBriefingJsonLd({
      briefing: makeBriefing(),
      headline: "দৈনিক ব্রিফিং",
      canonical: `${SITE_URL}/daily/2026-10-30`,
    })).toBeNull();
  });

  it("claims an original NewsArticle only when an editor note exists", () => {
    const briefing = makeBriefing({
      editorNote: "আজকের সংকলনে সম্পাদকের নোট।",
      clusters: [
        makeCluster({ lastPublishedAt: new Date("2026-10-30T18:30:00+06:00") }),
      ],
    });

    const data = dailyBriefingJsonLd({
      briefing,
      headline: "দৈনিক ব্রিফিং — ৩০ অক্টোবর ২০২৬",
      description: "আজকের সংক্ষিপ্ত ব্রিফিং।",
      canonical: `${SITE_URL}/daily/2026-10-30`,
    });

    expect(data).not.toBeNull();
    expect(data?.["@type"]).toBe("NewsArticle");
    expect(data?.headline).toBe("দৈনিক ব্রিফিং — ৩০ অক্টোবর ২০২৬");
    expect(data?.datePublished).toBe(
      new Date("2026-10-30T00:00:00+06:00").toISOString(),
    );
    expect(data?.dateModified).toBe(
      new Date("2026-10-30T18:30:00+06:00").toISOString(),
    );
    // Credited to this site, not to a syndicating publisher.
    expect(data?.author).toMatchObject({ "@id": `${SITE_URL}/#organization` });
    expect(data?.publisher).toMatchObject({ name: SITE_NAME });
  });
});

describe("serializeJsonLd", () => {
  it("escapes angle brackets so text cannot break out of the script tag", () => {
    const data = webPageJsonLd({
      path: "/x",
      name: "A < B > C",
      description: "</script><b>bold</b>",
    });

    const html = serializeJsonLd(data);
    expect(html).not.toContain("<");
    expect(html).toContain("\\u003c");
    expect(JSON.parse(html)).toMatchObject({ name: "A < B > C" });
  });

  it("round-trips an array of nodes", () => {
    const nodes = [organizationJsonLd(), websiteJsonLd()];
    expect(JSON.parse(serializeJsonLd(nodes))).toHaveLength(2);
  });

  it("keeps the schema.org context on every node", () => {
    const parsed = JSON.parse(
      serializeJsonLd([breadcrumbJsonLd([{ name: "Home", path: "/" }])]),
    ) as JsonLd[];
    expect(nodeOfType(parsed[0], "BreadcrumbList")?.["@context"]).toBe(
      "https://schema.org",
    );
  });
});
