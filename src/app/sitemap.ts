import type { MetadataRoute } from "next";
import { listIndexableClusters } from "@/lib/data/clusters";
import { SITE_URL } from "@/config/site";

/**
 * The sitemap advertises only pages that are safe to index. Story URLs are
 * included when they pass the same thin-content guard as their metadata:
 * at least two independent sources, or an editor note.
 */
export const revalidate = 3_600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const clusters = await listIndexableClusters(500);
  const newest = clusters[0]?.lastPublishedAt ?? new Date();

  const sectionDate = (category: "deshi" | "bideshi") =>
    clusters.find((cluster) => cluster.category === category)?.lastPublishedAt ??
    newest;

  return [
    {
      url: SITE_URL,
      lastModified: newest,
      changeFrequency: "hourly",
      priority: 1,
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
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date("2026-10-29T00:00:00+06:00"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/methodology`,
      lastModified: new Date("2026-10-30T00:00:00+06:00"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/editorial-policy`,
      lastModified: new Date("2026-10-30T00:00:00+06:00"),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/corrections`,
      lastModified: new Date("2026-10-30T00:00:00+06:00"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/removal-request`,
      lastModified: new Date("2026-10-30T00:00:00+06:00"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date("2026-10-30T00:00:00+06:00"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date("2026-10-30T00:00:00+06:00"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date("2026-10-29T00:00:00+06:00"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...clusters.map((cluster) => ({
      url: `${SITE_URL}/story/${cluster.id}`,
      lastModified: cluster.lastPublishedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
