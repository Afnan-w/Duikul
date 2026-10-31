import type { MetadataRoute } from "next";
import { listIndexableClusters } from "@/lib/data/clusters";
import { SITE_URL } from "@/config/site";

/**
 * The sitemap advertises only pages that are safe to index. Story URLs are
 * included when they pass the same thin-content guard as their metadata:
 * at least two independent sources, or an editor note.
 *
 * Trust/policy pages exist in both languages; each Bangla page has a real
 * English twin under /en, so both are listed (hreflang links them together).
 */
export const revalidate = 3_600;

const TRUST_UPDATED_AT = "2026-10-30T00:00:00+06:00";
const PRIVACY_UPDATED_AT = "2026-10-29T00:00:00+06:00";

/** Bangla trust/policy routes that have an `/en` twin. */
const TRUST_PAGES: readonly { path: string; updated: string; freq: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/about", updated: TRUST_UPDATED_AT, freq: "monthly", priority: 0.4 },
  { path: "/methodology", updated: TRUST_UPDATED_AT, freq: "monthly", priority: 0.5 },
  { path: "/editorial-policy", updated: TRUST_UPDATED_AT, freq: "yearly", priority: 0.4 },
  { path: "/corrections", updated: TRUST_UPDATED_AT, freq: "monthly", priority: 0.4 },
  { path: "/removal-request", updated: TRUST_UPDATED_AT, freq: "yearly", priority: 0.3 },
  { path: "/contact", updated: TRUST_UPDATED_AT, freq: "yearly", priority: 0.3 },
  { path: "/terms", updated: TRUST_UPDATED_AT, freq: "yearly", priority: 0.3 },
  { path: "/privacy", updated: PRIVACY_UPDATED_AT, freq: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const clusters = await listIndexableClusters(500);
  const newest = clusters[0]?.lastPublishedAt ?? new Date();

  const sectionDate = (category: "deshi" | "bideshi") =>
    clusters.find((cluster) => cluster.category === category)?.lastPublishedAt ??
    newest;

  const trustEntries = (prefix: "" | "/en"): MetadataRoute.Sitemap =>
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
    ...clusters.map((cluster) => ({
      url: `${SITE_URL}/story/${cluster.id}`,
      lastModified: cluster.lastPublishedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
