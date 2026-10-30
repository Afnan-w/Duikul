import { cache } from "react";
import type { FeedLanguage, NewsCategory } from "@/config/sources";
import { getSource } from "@/config/sources";
import { INGEST_CONFIG } from "@/config/ingest";
import { getSupabasePublic } from "@/lib/supabase/public";

export const CLUSTER_COLUMNS = [
  "id",
  "title",
  "summary",
  "category",
  "language",
  "image_url",
  "primary_source_id",
  "primary_article_url",
  "distinct_source_count",
  "trust_weight_sum",
  "verified_score",
  "popular_score",
  "editor_note",
  "first_published_at",
  "last_published_at",
].join(",");

type ClusterRow = {
  id: string;
  title: string;
  summary: string | null;
  category: NewsCategory;
  language: FeedLanguage;
  image_url: string | null;
  primary_source_id: string | null;
  primary_article_url: string;
  distinct_source_count: number;
  trust_weight_sum: number;
  verified_score: number;
  popular_score: number;
  editor_note: string | null;
  first_published_at: string;
  last_published_at: string;
};

type ArticleRow = {
  id: string;
  title: string;
  summary: string | null;
  url: string;
  image_url: string | null;
  published_at: string;
  source_id: string;
};

export type StoryCluster = {
  id: string;
  title: string;
  summary: string;
  category: NewsCategory;
  language: FeedLanguage;
  imageUrl: string | null;
  primarySourceId: string | null;
  primarySourceName: string;
  primaryArticleUrl: string;
  distinctSourceCount: number;
  trustWeightSum: number;
  verifiedScore: number;
  popularScore: number;
  editorNote: string | null;
  firstPublishedAt: Date;
  lastPublishedAt: Date;
  isConfirmed: boolean;
  isIndexable: boolean;
};

export type StorySource = {
  id: string;
  title: string;
  summary: string;
  url: string;
  imageUrl: string | null;
  publishedAt: Date;
  sourceId: string;
  sourceName: string;
  sourceNameBn: string;
};

export type StoryDetail = {
  cluster: StoryCluster;
  sources: StorySource[];
};

function sourceName(sourceId: string | null, language: FeedLanguage): string {
  if (!sourceId) return language === "bn" ? "অজানা সূত্র" : "Unknown source";
  const source = getSource(sourceId);
  if (!source) return sourceId;
  return language === "bn" ? source.nameBn : source.name;
}

/**
 * Mirrors `computeClusterMetrics` in the ingest pipeline. Kept as a tiny pure
 * function (and unit-tested) so the badge can never disagree with the stored
 * source counts.
 */
export function isConfirmedCluster(cluster: {
  distinctSourceCount: number;
  trustWeightSum: number;
}): boolean {
  return (
    cluster.distinctSourceCount >= INGEST_CONFIG.confirmedMinSources ||
    (cluster.distinctSourceCount >= INGEST_CONFIG.confirmedHighTrustSources &&
      cluster.trustWeightSum >= INGEST_CONFIG.confirmedHighTrustSum)
  );
}

function isIndexableCluster(row: {
  distinct_source_count: number;
  editor_note: string | null;
}): boolean {
  return (
    row.distinct_source_count >= 2 ||
    Boolean(row.editor_note && row.editor_note.trim())
  );
}

/**
 * A story page is served only inside the retention window. After that the URL
 * must return a real 404, never an empty soft-404 shell.
 */
export function isWithinRetention(
  lastPublishedAt: Date,
  now = new Date(),
): boolean {
  const age = now.getTime() - lastPublishedAt.getTime();
  return Number.isFinite(age) && age <= INGEST_CONFIG.retentionDays * 86_400_000;
}

function retentionCutoff(): string {
  return new Date(
    Date.now() - INGEST_CONFIG.retentionDays * 86_400_000,
  ).toISOString();
}

export function mapClusterRow(row: ClusterRow): StoryCluster {
  const cluster: StoryCluster = {
    id: row.id,
    title: row.title,
    summary: row.summary ?? "",
    category: row.category,
    language: row.language,
    imageUrl: row.image_url,
    primarySourceId: row.primary_source_id,
    primarySourceName: sourceName(row.primary_source_id, row.language),
    primaryArticleUrl: row.primary_article_url,
    distinctSourceCount: row.distinct_source_count,
    trustWeightSum: row.trust_weight_sum,
    verifiedScore: row.verified_score,
    popularScore: row.popular_score,
    editorNote: row.editor_note,
    firstPublishedAt: new Date(row.first_published_at),
    lastPublishedAt: new Date(row.last_published_at),
    isConfirmed: false,
    isIndexable: isIndexableCluster(row),
  };
  cluster.isConfirmed = isConfirmedCluster(cluster);
  return cluster;
}

function mapArticleRow(row: ArticleRow): StorySource {
  const source = getSource(row.source_id);
  return {
    id: row.id,
    title: row.title,
    summary: row.summary ?? "",
    url: row.url,
    imageUrl: row.image_url,
    publishedAt: new Date(row.published_at),
    sourceId: row.source_id,
    sourceName: source?.name ?? row.source_id,
    sourceNameBn: source?.nameBn ?? source?.name ?? row.source_id,
  };
}

function editionCutoff(): string {
  return new Date(
    Date.now() - INGEST_CONFIG.windowHours * 3_600_000,
  ).toISOString();
}

/**
 * Clusters in the live edition, newest first. Mirrors the ingest visibility
 * rule: at least two independent sources, or one source trusted enough to
 * stand alone.
 */
export const listClusters = cache(
  async (options: {
    category?: NewsCategory;
    limit?: number;
  } = {}): Promise<StoryCluster[]> => {
    const supabase = getSupabasePublic();
    if (!supabase) return [];

    let query = supabase
      .from("clusters")
      .select(CLUSTER_COLUMNS)
      .gte("last_published_at", editionCutoff())
      .or(
        `distinct_source_count.gte.2,trust_weight_sum.gte.${INGEST_CONFIG.visibleSingleSourceTrust}`,
      )
      .order("last_published_at", { ascending: false })
      .limit(Math.min(options.limit ?? 30, 60));

    if (options.category) query = query.eq("category", options.category);

    const { data, error } = await query;
    if (error) {
      console.error("[data] could not list clusters:", error.message);
      return [];
    }

    return ((data ?? []) as unknown as ClusterRow[]).map(mapClusterRow);
  },
);

/** A single story with every publisher link we hold for it. */
export const getClusterDetail = cache(
  async (id: string): Promise<StoryDetail | null> => {
    const supabase = getSupabasePublic();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("clusters")
      .select(CLUSTER_COLUMNS)
      .eq("id", id)
      .gte("last_published_at", retentionCutoff())
      .maybeSingle();

    if (error) {
      console.error("[data] could not read cluster:", error.message);
      return null;
    }
    if (!data) return null;

    const cluster = mapClusterRow(data as unknown as ClusterRow);
    if (!isWithinRetention(cluster.lastPublishedAt)) return null;

    const { data: articleRows, error: articleError } = await supabase
      .from("articles")
      .select(
        "id,title,summary,url,image_url,published_at,source_id",
      )
      .eq("cluster_id", id)
      .order("published_at", { ascending: true })
      .limit(50);

    if (articleError) {
      console.error("[data] could not read cluster articles:", articleError.message);
    }

    return {
      cluster,
      sources: ((articleRows ?? []) as unknown as ArticleRow[]).map(mapArticleRow),
    };
  },
);

/** A short related list for the end of a story page. */
export const listRelatedClusters = cache(
  async (
    category: NewsCategory,
    excludeId: string,
    limit = 3,
  ): Promise<StoryCluster[]> => {
    const supabase = getSupabasePublic();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("clusters")
      .select(CLUSTER_COLUMNS)
      .eq("category", category)
      .neq("id", excludeId)
      .gte("last_published_at", editionCutoff())
      .or(
        `distinct_source_count.gte.2,trust_weight_sum.gte.${INGEST_CONFIG.visibleSingleSourceTrust}`,
      )
      .order("popular_score", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[data] could not list related clusters:", error.message);
      return [];
    }

    return ((data ?? []) as unknown as ClusterRow[]).map(mapClusterRow);
  },
);

/**
 * Indexable stories for the sitemap: clusters inside the retention window that
 * pass the thin-content guard. Sitemaps should only advertise pages that are
 * safe to index; single-source wires without an editor note are excluded.
 */
export const listIndexableClusters = cache(
  async (limit = 500): Promise<StoryCluster[]> => {
    const supabase = getSupabasePublic();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("clusters")
      .select(CLUSTER_COLUMNS)
      .gte(
        "last_published_at",
        new Date(
          Date.now() - INGEST_CONFIG.retentionDays * 86_400_000,
        ).toISOString(),
      )
      .or("distinct_source_count.gte.2,editor_note.not.is.null")
      .order("last_published_at", { ascending: false })
      .limit(Math.min(limit, 1_000));

    if (error) {
      console.error("[data] could not list sitemap clusters:", error.message);
      return [];
    }

    return ((data ?? []) as unknown as ClusterRow[])
      .map(mapClusterRow)
      .filter((cluster) => cluster.isIndexable);
  },
);

/** Clusters that include at least one article from this publisher. */
export const listClustersBySource = cache(
  async (sourceId: string, limit = 12): Promise<StoryCluster[]> => {
    const supabase = getSupabasePublic();
    if (!supabase) return [];

    const { data: articleRows, error: articleError } = await supabase
      .from("articles")
      .select("cluster_id")
      .eq("source_id", sourceId)
      .not("cluster_id", "is", null)
      .order("published_at", { ascending: false })
      .limit(200);

    if (articleError) {
      console.error(
        "[data] could not list source articles:",
        articleError.message,
      );
      return [];
    }

    const ids = Array.from(
      new Set(
        ((articleRows ?? []) as Array<{ cluster_id: string | null }>)
          .map((row) => row.cluster_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ).slice(0, 100);

    if (ids.length === 0) return [];

    const { data, error } = await supabase
      .from("clusters")
      .select(CLUSTER_COLUMNS)
      .in("id", ids)
      .gte(
        "last_published_at",
        new Date(
          Date.now() - INGEST_CONFIG.retentionDays * 86_400_000,
        ).toISOString(),
      )
      .or(
        `distinct_source_count.gte.2,trust_weight_sum.gte.${INGEST_CONFIG.visibleSingleSourceTrust}`,
      )
      .order("last_published_at", { ascending: false })
      .limit(Math.min(limit, 30));

    if (error) {
      console.error("[data] could not read source clusters:", error.message);
      return [];
    }

    return ((data ?? []) as unknown as ClusterRow[]).map(mapClusterRow);
  },
);

/** Trigram-backed bilingual search over cluster headlines and summaries. */
export const searchClusters = cache(
  async (
    query: string,
    options: { category?: NewsCategory; limit?: number } = {},
  ): Promise<StoryCluster[]> => {
    const trimmed = query.trim();
    if (Array.from(trimmed).length < 2) return [];

    const supabase = getSupabasePublic();
    if (!supabase) return [];

    const { data, error } = await supabase.rpc("search_clusters", {
      p_query: trimmed,
      p_category: options.category ?? null,
      p_limit: Math.min(options.limit ?? 30, 50),
    });

    if (error) {
      console.error("[data] search failed:", error.message);
      return [];
    }

    return ((data ?? []) as unknown as ClusterRow[]).map(mapClusterRow);
  },
);
