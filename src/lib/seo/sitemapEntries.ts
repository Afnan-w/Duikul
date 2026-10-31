import { SOURCES } from "@/config/sources";
import { SITE_URL } from "@/config/site";
import { listIndexableClusters } from "@/lib/data/clusters";
import { listIndexableDailyDates } from "@/lib/data/daily";
import {
  type SitemapChildId,
  type UrlSetEntry,
} from "./sitemapXml";

/**
 * URL lists behind each child sitemap (`/sitemap/[id].xml`).
 *
 * Only pages that pass the thin-content guard are ever advertised, so a
 * `noindex` URL can never appear here — that sitemap/robots conflict would be
 * a manual action in Search Console.
 */

/** Google caps a sitemap at 50 000 URLs; stories stay well under that. */
const STORY_LIMIT = 1_000;

/** The newest clusters drive `lastmod` for pages that mirror the edition. */
const NEWEST_LIMIT = 50;

const TRUST_UPDATED_AT = "2026-10-30T00:00:00+06:00";
const PRIVACY_UPDATED_AT = "2026-10-29T00:00:00+06:00";

type TrustPage = {
  path: string;
  updated: string;
  freq: UrlSetEntry["changeFrequency"];
  priority: number;
};

/** Bangla trust/policy routes; each has an English twin under `/en`. */
const TRUST_PAGES: readonly TrustPage[] = [
  { path: "/about", updated: TRUST_UPDATED_AT, freq: "monthly", priority: 0.4 },
  {
    path: "/methodology",
    updated: TRUST_UPDATED_AT,
    freq: "monthly",
    priority: 0.5,
  },
  {
    path: "/editorial-policy",
    updated: TRUST_UPDATED_AT,
    freq: "yearly",
    priority: 0.4,
  },
  {
    path: "/corrections",
    updated: TRUST_UPDATED_AT,
    freq: "monthly",
    priority: 0.4,
  },
  {
    path: "/removal-request",
    updated: TRUST_UPDATED_AT,
    freq: "yearly",
    priority: 0.3,
  },
  {
    path: "/contact",
    updated: TRUST_UPDATED_AT,
    freq: "yearly",
    priority: 0.3,
  },
  { path: "/terms", updated: TRUST_UPDATED_AT, freq: "yearly", priority: 0.3 },
  {
    path: "/privacy",
    updated: PRIVACY_UPDATED_AT,
    freq: "yearly",
    priority: 0.3,
  },
];

/** Home, sections, and trust pages in both languages. */
async function staticEntries(): Promise<UrlSetEntry[]> {
  const recent = await listIndexableClusters(NEWEST_LIMIT);
  const newest = recent[0]?.lastPublishedAt ?? new Date();

  const sectionDate = (category: "deshi" | "bideshi") =>
    recent.find((cluster) => cluster.category === category)?.lastPublishedAt ??
    newest;

  const trustEntries = (prefix: "" | "/en"): UrlSetEntry[] =>
    TRUST_PAGES.map((page) => ({
      url: `${SITE_URL}${prefix}${page.path}`,
      lastModified: new Date(page.updated),
      changeFrequency: page.freq,
      priority: page.priority,
    }));

  return [
    {
      url: SITE_URL,
      lastModified: newest,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/en`,
      lastModified: newest,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/deshi`,
      lastModified: sectionDate("deshi"),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/bideshi`,
      lastModified: sectionDate("bideshi"),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    ...trustEntries(""),
    ...trustEntries("/en"),
  ];
}

/** Indexable story pages inside the retention window. */
async function storyEntries(): Promise<UrlSetEntry[]> {
  const clusters = await listIndexableClusters(STORY_LIMIT);
  return clusters.map((cluster) => ({
    url: `${SITE_URL}/story/${cluster.id}`,
    lastModified: cluster.lastPublishedAt,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));
}

/** Daily briefings with five or more clustered stories. */
async function dailyEntries(): Promise<UrlSetEntry[]> {
  const days = await listIndexableDailyDates();
  return days.map((day) => ({
    url: `${SITE_URL}/daily/${day.date}`,
    lastModified: day.lastModified,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));
}

/** Every configured publisher profile. */
function sourceEntries(): UrlSetEntry[] {
  return SOURCES.map((source) => ({
    url: `${SITE_URL}/source/${source.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));
}

/**
 * Resolve a child id to its URL list. Returns `null` for unknown ids so a
 * stray request can 404 instead of shipping an empty, indexable-looking file.
 */
export async function getSitemapEntries(
  id: SitemapChildId,
): Promise<UrlSetEntry[] | null> {
  switch (id) {
    case "static":
      return staticEntries();
    case "stories":
      return storyEntries();
    case "daily":
      return dailyEntries();
    case "sources":
      return sourceEntries();
    default:
      return null;
  }
}
