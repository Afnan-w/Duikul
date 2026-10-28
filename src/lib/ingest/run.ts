import { randomUUID } from "node:crypto";
import type { FeedLanguage, NewsCategory } from "@/config/sources";
import { SOURCES, getSource } from "@/config/sources";
import { INGEST_CONFIG } from "@/config/ingest";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  clusterArticles,
  touchedClusters,
  type ClusterSeed,
  type WorkingCluster,
} from "./cluster";
import { fetchFeed, type FeedFetchResult } from "./fetch";
import { dedupeArticles, normalizeFeedItems } from "./normalize";
import {
  choosePrimaryArticle,
  computeClusterMetrics,
  type ClusterMetrics,
  type ScorableArticle,
} from "./score";
import type {
  NormalizedArticle,
  RejectionCounts,
} from "./types";

type DbClusterRow = {
  id: string;
  title: string;
  summary: string | null;
  category: NewsCategory;
  language: FeedLanguage;
  image_url: string | null;
  primary_source_id: string;
  primary_article_url: string;
  distinct_source_count: number;
  trust_weight_sum: number;
  verified_score: number;
  popular_score: number;
  first_published_at: string;
  last_published_at: string;
};

type DbArticleRow = {
  id: string;
  cluster_id: string | null;
  source_id: string;
  title: string;
  summary: string | null;
  url: string;
  image_url: string | null;
  published_at: string;
  category: NewsCategory;
  language: FeedLanguage;
  feed_position: number;
};

export type SourceIngestStat = {
  id: string;
  category: NewsCategory;
  ok: boolean;
  items: number;
  accepted: number;
  rejected: RejectionCounts;
  durationMs: number;
  attempts: number;
  error?: string;
};

export type PreviewCluster = {
  category: NewsCategory;
  language: FeedLanguage;
  title: string;
  summary: string;
  imageUrl: string | null;
  sourceNames: string[];
  distinctSourceCount: number;
  trustWeightSum: number;
  isConfirmed: boolean;
  isVisible: boolean;
  popularScore: number;
  ageHours: number;
};

export type IngestSummary = {
  dryRun: boolean;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  sources: SourceIngestStat[];
  fetchedItems: number;
  acceptedArticles: number;
  duplicates: number;
  rejected: RejectionCounts;
  existingArticles: number;
  articlesInserted: number;
  clustersCreated: number;
  clustersUpdated: number;
  cleanedArticles: number;
  cleanedClusters: number;
  preview: PreviewCluster[];
};

export type IngestOptions = {
  dryRun?: boolean;
  now?: Date;
  /** Called for human-readable progress. Silenced by default. */
  log?: (message: string) => void;
};

function mergeCounts(target: RejectionCounts, source: RejectionCounts): void {
  for (const [reason, count] of Object.entries(source) as [
    keyof RejectionCounts,
    number,
  ][]) {
    target[reason] = (target[reason] ?? 0) + count;
  }
}

function chunk<T>(values: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

function previewForCluster(cluster: WorkingCluster, now: Date): PreviewCluster | null {
  const primary = choosePrimaryArticle(cluster.articles);
  if (!primary) return null;

  const metrics = computeClusterMetrics(cluster.articles, now);
  const sourceNames = [
    ...new Set(
      cluster.articles.map(
        (article) => getSource(article.sourceId)?.name ?? article.sourceId,
      ),
    ),
  ];

  return {
    category: cluster.category,
    language: cluster.language,
    title: primary.title,
    summary: primary.summary,
    imageUrl: primary.imageUrl,
    sourceNames,
    distinctSourceCount: metrics.distinctSourceCount,
    trustWeightSum: metrics.trustWeightSum,
    isConfirmed: metrics.isConfirmed,
    isVisible: metrics.isVisible,
    popularScore: metrics.popularScore,
    ageHours: Math.round(metrics.ageHours * 10) / 10,
  };
}

function sortPreview(a: PreviewCluster, b: PreviewCluster): number {
  if (a.category !== b.category) return a.category.localeCompare(b.category);
  if (a.isConfirmed !== b.isConfirmed) return a.isConfirmed ? -1 : 1;
  return b.popularScore - a.popularScore;
}

/**
 * The whole fishing run: fetch, normalise, dedupe, cluster, persist, clean.
 *
 * Dry mode never touches the database and never needs Supabase credentials.
 * Live mode is idempotent: duplicate URLs are skipped, cluster ids are stable,
 * and scores are recomputed from the database after every insert.
 */
export async function runIngest(
  options: IngestOptions = {},
): Promise<IngestSummary> {
  const dryRun = options.dryRun ?? false;
  const now = options.now ?? new Date();
  const log = options.log ?? (() => {});
  const started = Date.now();

  log(`Fetching ${SOURCES.length} whitelisted feeds…`);
  const feedResults: FeedFetchResult[] = await Promise.all(
    SOURCES.map((source) => fetchFeed(source)),
  );

  const allArticles: NormalizedArticle[] = [];
  const rejected: RejectionCounts = {};
  const sourceStats: SourceIngestStat[] = [];

  for (const result of feedResults) {
    if (!result.ok) {
      log(
        `  ✗ ${result.source.id}: ${result.error ?? "unknown error"} (${result.durationMs}ms, ${result.attempts} attempt(s))`,
      );
      sourceStats.push({
        id: result.source.id,
        category: result.source.category,
        ok: false,
        items: 0,
        accepted: 0,
        rejected: {},
        durationMs: result.durationMs,
        attempts: result.attempts,
        error: result.error,
      });
      continue;
    }

    const normalized = normalizeFeedItems(result.source, result.items, now);
    allArticles.push(...normalized.articles);
    mergeCounts(rejected, normalized.rejected);

    sourceStats.push({
      id: result.source.id,
      category: result.source.category,
      ok: true,
      items: result.items.length,
      accepted: normalized.articles.length,
      rejected: normalized.rejected,
      durationMs: result.durationMs,
      attempts: result.attempts,
    });

    log(
      `  ✓ ${result.source.id}: ${normalized.articles.length}/${result.items.length} usable (${result.durationMs}ms)`,
    );
  }

  const deduped = dedupeArticles(allArticles);

  if (dryRun) {
    const clusters = touchedClusters(
      clusterArticles(deduped.articles, [], { now }),
    );
    const preview = clusters
      .map((cluster) => previewForCluster(cluster, now))
      .filter((cluster): cluster is PreviewCluster => Boolean(cluster))
      .sort(sortPreview);

    return {
      dryRun: true,
      startedAt: new Date(started).toISOString(),
      finishedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      sources: sourceStats,
      fetchedItems: feedResults.reduce(
        (sum, result) => sum + result.items.length,
        0,
      ),
      acceptedArticles: deduped.articles.length,
      duplicates: deduped.duplicates,
      rejected,
      existingArticles: 0,
      articlesInserted: 0,
      clustersCreated: clusters.length,
      clustersUpdated: 0,
      cleanedArticles: 0,
      cleanedClusters: 0,
      preview,
    };
  }

  const supabase = getSupabaseAdmin();

  log("Upserting source registry…");
  const sourceRows = SOURCES.map((source) => ({
    id: source.id,
    name: source.name,
    name_bn: source.nameBn,
    category: source.category,
    rss_url: source.rssUrl,
    site_url: source.siteUrl,
    trust_weight: source.trustWeight,
    language: source.language,
    active: true,
    last_fetched_at: new Date(now).toISOString(),
  }));
  const { error: sourceError } = await supabase
    .from("sources")
    .upsert(sourceRows, { onConflict: "id" });
  if (sourceError) throw new Error(`Could not upsert sources: ${sourceError.message}`);

  log("Checking which URLs we already have…");
  const existingHashes = new Set<string>();
  for (const batch of chunk(
    deduped.articles.map((article) => article.urlHash),
    100,
  )) {
    if (batch.length === 0) continue;
    const { data, error } = await supabase
      .from("articles")
      .select("url_hash")
      .in("url_hash", batch);
    if (error) throw new Error(`Could not read existing articles: ${error.message}`);
    for (const row of (data ?? []) as { url_hash: string }[]) {
      existingHashes.add(row.url_hash);
    }
  }

  const newArticles = deduped.articles.filter(
    (article) => !existingHashes.has(article.urlHash),
  );
  log(
    `${newArticles.length} new article(s); ${existingHashes.size} already known.`,
  );

  log("Loading recent clusters for stable matching…");
  const seedCutoff = new Date(
    now.getTime() - INGEST_CONFIG.clusterSeedHours * 3_600_000,
  );
  const { data: seedRows, error: seedError } = await supabase
    .from("clusters")
    .select(
      "id,title,category,language,first_published_at,last_published_at",
    )
    .gte("last_published_at", seedCutoff.toISOString());
  if (seedError) throw new Error(`Could not read clusters: ${seedError.message}`);

  const seedClusters = (seedRows ?? []) as Pick<
    DbClusterRow,
    "id" | "title" | "category" | "language" | "first_published_at" | "last_published_at"
  >[];

  const variantByCluster = new Map<string, string[]>();
  for (const batch of chunk(
    seedClusters.map((cluster) => cluster.id),
    100,
  )) {
    if (batch.length === 0) continue;
    const { data, error } = await supabase
      .from("articles")
      .select("cluster_id,title")
      .in("cluster_id", batch)
      .gte("published_at", seedCutoff.toISOString());
    if (error) throw new Error(`Could not read cluster titles: ${error.message}`);
    for (const row of (data ?? []) as { cluster_id: string | null; title: string }[]) {
      if (!row.cluster_id) continue;
      const list = variantByCluster.get(row.cluster_id) ?? [];
      list.push(row.title);
      variantByCluster.set(row.cluster_id, list);
    }
  }

  const seeds: ClusterSeed[] = seedClusters.map((cluster) => ({
    id: cluster.id,
    title: cluster.title,
    titleVariants: variantByCluster.get(cluster.id) ?? [],
    category: cluster.category,
    language: cluster.language,
    firstPublishedAt: new Date(cluster.first_published_at),
    lastPublishedAt: new Date(cluster.last_published_at),
  }));

  const working = touchedClusters(clusterArticles(newArticles, seeds, { now }));

  const newClusterRows: DbClusterRow[] = [];
  const seededIds = new Set(seeds.map((seed) => seed.id));
  const createdIds = new Set<string>();

  for (const cluster of working) {
    const clusterId = cluster.id ?? randomUUID();
    cluster.id = clusterId;

    if (seededIds.has(clusterId) || createdIds.has(clusterId)) continue;

    const metrics = computeClusterMetrics(cluster.articles, now);
    const primary = choosePrimaryArticle(cluster.articles);
    if (!primary) continue;

    createdIds.add(clusterId);
    newClusterRows.push({
      id: clusterId,
      title: primary.title,
      summary: primary.summary || null,
      category: cluster.category,
      language: cluster.language,
      image_url: primary.imageUrl,
      primary_source_id: primary.sourceId,
      primary_article_url: primary.url,
      distinct_source_count: metrics.distinctSourceCount,
      trust_weight_sum: metrics.trustWeightSum,
      verified_score: metrics.verifiedScore,
      popular_score: metrics.popularScore,
      first_published_at: metrics.firstPublishedAt.toISOString(),
      last_published_at: metrics.lastPublishedAt.toISOString(),
    });
  }

  log(`Creating ${newClusterRows.length} new cluster(s)…`);
  for (const batch of chunk(newClusterRows, 50)) {
    if (batch.length === 0) continue;
    const { error } = await supabase.from("clusters").insert(batch);
    if (error) throw new Error(`Could not insert clusters: ${error.message}`);
  }

  const articleRows = working.flatMap((cluster) =>
    cluster.articles.map((article) => ({
      cluster_id: cluster.id,
      source_id: article.sourceId,
      title: article.title,
      summary: article.summary || null,
      url: article.url,
      url_hash: article.urlHash,
      image_url: article.imageUrl,
      published_at: article.publishedAt.toISOString(),
      category: article.category,
      language: article.language,
      feed_position: article.feedPosition,
    })),
  );

  log(`Inserting ${articleRows.length} article(s)…`);
  let articlesInserted = 0;
  for (const batch of chunk(articleRows, 100)) {
    if (batch.length === 0) continue;
    const { data, error } = await supabase
      .from("articles")
      .upsert(batch, { onConflict: "url_hash", ignoreDuplicates: true })
      .select("id");
    if (error) throw new Error(`Could not insert articles: ${error.message}`);
    articlesInserted += (data ?? []).length;
  }

  log("Recomputing cluster scores from the database…");
  const windowCutoff = new Date(
    now.getTime() - INGEST_CONFIG.windowHours * 3_600_000,
  );
  const { data: liveClusterRows, error: liveError } = await supabase
    .from("clusters")
    .select(
      "id,title,summary,category,language,image_url,primary_source_id,primary_article_url,distinct_source_count,trust_weight_sum,verified_score,popular_score,first_published_at,last_published_at",
    )
    .gte("last_published_at", windowCutoff.toISOString())
    .limit(1_000);
  if (liveError) throw new Error(`Could not read live clusters: ${liveError.message}`);

  const liveClusters = (liveClusterRows ?? []) as DbClusterRow[];
  const articlesByCluster = new Map<string, DbArticleRow[]>();
  for (const batch of chunk(
    liveClusters.map((cluster) => cluster.id),
    100,
  )) {
    if (batch.length === 0) continue;
    const { data, error } = await supabase
      .from("articles")
      .select(
        "id,cluster_id,source_id,title,summary,url,image_url,published_at,category,language,feed_position",
      )
      .in("cluster_id", batch);
    if (error) throw new Error(`Could not read cluster articles: ${error.message}`);
    for (const row of (data ?? []) as DbArticleRow[]) {
      if (!row.cluster_id) continue;
      const list = articlesByCluster.get(row.cluster_id) ?? [];
      list.push(row);
      articlesByCluster.set(row.cluster_id, list);
    }
  }

  const updateRows: DbClusterRow[] = [];
  for (const cluster of liveClusters) {
    const rows = articlesByCluster.get(cluster.id) ?? [];
    if (rows.length === 0) continue;

    const scorable: ScorableArticle[] = rows.map((row) => ({
      sourceId: row.source_id,
      trustWeight: getSource(row.source_id)?.trustWeight ?? 1,
      feedPosition: row.feed_position,
      publishedAt: new Date(row.published_at),
    }));
    const metrics: ClusterMetrics = computeClusterMetrics(scorable, now);

    const primaryRow = choosePrimaryArticle(
      rows.map((row) => ({
        row,
        sourceId: row.source_id,
        trustWeight: getSource(row.source_id)?.trustWeight ?? 1,
        feedPosition: row.feed_position,
        publishedAt: new Date(row.published_at),
      })),
    );
    if (!primaryRow) continue;

    updateRows.push({
      ...cluster,
      title: primaryRow.row.title,
      summary: primaryRow.row.summary,
      image_url: primaryRow.row.image_url,
      primary_source_id: primaryRow.row.source_id,
      primary_article_url: primaryRow.row.url,
      distinct_source_count: metrics.distinctSourceCount,
      trust_weight_sum: metrics.trustWeightSum,
      verified_score: metrics.verifiedScore,
      popular_score: metrics.popularScore,
      first_published_at: metrics.firstPublishedAt.toISOString(),
      last_published_at: metrics.lastPublishedAt.toISOString(),
    });
  }

  for (const batch of chunk(updateRows, 50)) {
    if (batch.length === 0) continue;
    const { error } = await supabase
      .from("clusters")
      .upsert(batch, { onConflict: "id" });
    if (error) throw new Error(`Could not update clusters: ${error.message}`);
  }

  // A cluster whose articles all lost the URL race is empty. Remove it now
  // rather than letting an empty story linger in the edition.
  const orphanIds = liveClusters
    .filter((cluster) => (articlesByCluster.get(cluster.id)?.length ?? 0) === 0)
    .map((cluster) => cluster.id);
  let removedOrphans = 0;
  for (const batch of chunk(orphanIds, 100)) {
    if (batch.length === 0) continue;
    const { data, error } = await supabase
      .from("clusters")
      .delete()
      .in("id", batch)
      .select("id");
    if (error) throw new Error(`Could not remove empty clusters: ${error.message}`);
    removedOrphans += (data ?? []).length;
  }

  log("Removing articles older than 14 days…");
  const retentionCutoff = new Date(
    now.getTime() - INGEST_CONFIG.retentionDays * 24 * 3_600_000,
  );
  const { data: deletedArticles, error: cleanupArticlesError } = await supabase
    .from("articles")
    .delete()
    .lt("published_at", retentionCutoff.toISOString())
    .select("id");
  if (cleanupArticlesError) {
    throw new Error(`Could not clean old articles: ${cleanupArticlesError.message}`);
  }

  const { data: deletedClusters, error: cleanupClustersError } = await supabase
    .from("clusters")
    .delete()
    .lt("last_published_at", retentionCutoff.toISOString())
    .select("id");
  if (cleanupClustersError) {
    throw new Error(`Could not clean old clusters: ${cleanupClustersError.message}`);
  }

  const summary: IngestSummary = {
    dryRun: false,
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    sources: sourceStats,
    fetchedItems: feedResults.reduce(
      (sum, result) => sum + result.items.length,
      0,
    ),
    acceptedArticles: deduped.articles.length,
    duplicates: deduped.duplicates,
    rejected,
    existingArticles: existingHashes.size,
    articlesInserted,
    clustersCreated: newClusterRows.length,
    clustersUpdated: updateRows.length,
    cleanedArticles: (deletedArticles ?? []).length,
    cleanedClusters: (deletedClusters ?? []).length + removedOrphans,
    preview: [],
  };

  log(
    `Done in ${summary.durationMs}ms: ${articlesInserted} inserted, ${summary.clustersCreated} new clusters, ${summary.clustersUpdated} refreshed.`,
  );

  return summary;
}
