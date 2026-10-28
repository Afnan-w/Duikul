import type { FeedLanguage, NewsCategory } from "@/config/sources";
import { INGEST_CONFIG } from "@/config/ingest";
import type { NormalizedArticle } from "./types";
import { choosePrimaryArticle } from "./score";
import { compareTitles, meetsSameEvent } from "./similarity";
import { setIntersectionSize, tokenSet } from "./text";

export type ClusterSeed = {
  id: string;
  title: string;
  /** Up to a handful of existing article headlines, for richer matching. */
  titleVariants?: readonly string[];
  category: NewsCategory;
  language: FeedLanguage;
  firstPublishedAt: Date;
  lastPublishedAt: Date;
};

export type WorkingCluster = {
  id: string | null;
  title: string;
  titleVariants: string[];
  category: NewsCategory;
  language: FeedLanguage;
  articles: NormalizedArticle[];
  firstPublishedAt: Date;
  lastPublishedAt: Date;
};

export type ClusterOptions = {
  now?: Date;
  windowHours?: number;
  seedMaxAgeHours?: number;
};

const MAX_VARIANTS = 8;

function uniqueNonEmpty(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = trimmed.normalize("NFKC").toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
    if (result.length >= MAX_VARIANTS) break;
  }
  return result;
}

function withinWindow(
  cluster: WorkingCluster,
  article: NormalizedArticle,
  windowHours: number,
): boolean {
  const articleTime = article.publishedAt.getTime();
  const first = cluster.firstPublishedAt.getTime();
  const last = cluster.lastPublishedAt.getTime();
  const hours = windowHours * 3_600_000;

  if (articleTime < first) return first - articleTime <= hours;
  if (articleTime > last) return articleTime - last <= hours;
  return true;
}

type BestMatch = {
  cluster: WorkingCluster;
  combined: number;
  jaccard: number;
};

function overlapsInTime(
  a: WorkingCluster,
  b: WorkingCluster,
  windowHours: number,
): boolean {
  const hours = windowHours * 3_600_000;
  return (
    a.firstPublishedAt.getTime() - b.lastPublishedAt.getTime() <= hours &&
    b.firstPublishedAt.getTime() - a.lastPublishedAt.getTime() <= hours
  );
}

function clusterTokenSet(cluster: WorkingCluster): Set<string> {
  const tokens = new Set<string>();
  for (const title of cluster.titleVariants) {
    for (const token of tokenSet(title)) tokens.add(token);
  }
  return tokens;
}

/**
 * Greedy assignment can leave two clusters for one fast-moving event when
 * later reports use a different angle. This pass merges clusters whose recent
 * headlines satisfy the same transparent same-event test.
 *
 * Existing clusters are never merged into each other: their public ids must
 * stay stable. A new cluster may join an existing one, but two established
 * clusters need an editor, not a heuristic, to merge.
 */
export function mergeSimilarClusters(
  clusters: readonly WorkingCluster[],
  options: { windowHours?: number } = {},
): WorkingCluster[] {
  const windowHours = options.windowHours ?? INGEST_CONFIG.clusterWindowHours;
  const active = clusters.filter((cluster) => cluster.articles.length > 0);
  if (active.length < 2) return [...clusters];

  const tokens = active.map(clusterTokenSet);
  const parent = active.map((_, index) => index);
  const hasExistingId = active.map((cluster) => Boolean(cluster.id));

  const find = (index: number): number => {
    let root = index;
    while (parent[root] !== root) root = parent[root];
    while (parent[index] !== root) {
      const next = parent[index];
      parent[index] = root;
      index = next;
    }
    return root;
  };

  const union = (a: number, b: number): void => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA === rootB) return;
    // Never merge two established clusters through a new bridge.
    if (hasExistingId[rootA] && hasExistingId[rootB]) return;
    parent[rootB] = rootA;
    hasExistingId[rootA] = hasExistingId[rootA] || hasExistingId[rootB];
  };

  for (let i = 0; i < active.length; i += 1) {
    for (let j = i + 1; j < active.length; j += 1) {
      if (
        active[i].category !== active[j].category ||
        active[i].language !== active[j].language
      ) {
        continue;
      }
      if (!overlapsInTime(active[i], active[j], windowHours)) continue;
      if (setIntersectionSize(tokens[i], tokens[j]) < 2) continue;

      let matches = false;
      for (const titleA of active[i].titleVariants) {
        for (const titleB of active[j].titleVariants) {
          if (meetsSameEvent(compareTitles(titleA, titleB))) {
            matches = true;
            break;
          }
        }
        if (matches) break;
      }
      if (matches) union(i, j);
    }
  }

  const groups = new Map<number, number[]>();
  for (let index = 0; index < active.length; index += 1) {
    const root = find(index);
    const group = groups.get(root) ?? [];
    group.push(index);
    groups.set(root, group);
  }

  const merged: WorkingCluster[] = [];
  for (const group of groups.values()) {
    if (group.length === 1) {
      merged.push(active[group[0]]);
      continue;
    }

    const members = group.map((index) => active[index]);
    const survivor =
      members.find((cluster) => cluster.id) ??
      [...members].sort(
        (a, b) => a.firstPublishedAt.getTime() - b.firstPublishedAt.getTime(),
      )[0];

    const articles = members.flatMap((cluster) => cluster.articles);
    merged.push({
      id: survivor.id,
      title: survivor.title,
      titleVariants: uniqueNonEmpty(
        members.flatMap((cluster) => cluster.titleVariants),
      ),
      category: survivor.category,
      language: survivor.language,
      articles,
      firstPublishedAt: new Date(
        Math.min(...members.map((cluster) => cluster.firstPublishedAt.getTime())),
      ),
      lastPublishedAt: new Date(
        Math.max(...members.map((cluster) => cluster.lastPublishedAt.getTime())),
      ),
    });
  }

  const untouchedSeeds = clusters.filter(
    (cluster) => cluster.articles.length === 0,
  );
  return [...merged, ...untouchedSeeds];
}

/**
 * Greedy, deterministic single-pass clustering.
 *
 * Articles are processed oldest first so the first report of an event anchors
 * the cluster. Each headline is compared with the cluster's representative
 * title and its recent variants. Only same-category, same-language clusters
 * can match: automatic translation is out of scope, and pretending otherwise
 * would create false agreement.
 */
export function clusterArticles(
  articles: readonly NormalizedArticle[],
  seeds: readonly ClusterSeed[] = [],
  options: ClusterOptions = {},
): WorkingCluster[] {
  const now = options.now ?? new Date();
  const windowHours = options.windowHours ?? INGEST_CONFIG.clusterWindowHours;
  const seedMaxAgeHours =
    options.seedMaxAgeHours ?? INGEST_CONFIG.clusterSeedHours;
  const seedCutoff = now.getTime() - seedMaxAgeHours * 3_600_000;

  const clusters: WorkingCluster[] = [];
  for (const seed of seeds) {
    if (seed.lastPublishedAt.getTime() < seedCutoff) continue;
    const variants = uniqueNonEmpty([seed.title, ...(seed.titleVariants ?? [])]);
    clusters.push({
      id: seed.id,
      title: seed.title,
      titleVariants: variants,
      category: seed.category,
      language: seed.language,
      articles: [],
      firstPublishedAt: seed.firstPublishedAt,
      lastPublishedAt: seed.lastPublishedAt,
    });
  }

  const ordered = [...articles].sort((a, b) => {
    const time = a.publishedAt.getTime() - b.publishedAt.getTime();
    if (time !== 0) return time;
    const source = a.sourceId.localeCompare(b.sourceId);
    if (source !== 0) return source;
    return a.urlHash.localeCompare(b.urlHash);
  });

  for (const article of ordered) {
    let best: BestMatch | null = null;

    for (const cluster of clusters) {
      if (
        cluster.category !== article.category ||
        cluster.language !== article.language
      ) {
        continue;
      }
      if (!withinWindow(cluster, article, windowHours)) continue;

      for (const variant of cluster.titleVariants) {
        const similarity = compareTitles(variant, article.title);
        if (!meetsSameEvent(similarity)) continue;

        if (
          !best ||
          similarity.combined > best.combined ||
          (similarity.combined === best.combined &&
            similarity.jaccard > best.jaccard)
        ) {
          best = {
            cluster,
            combined: similarity.combined,
            jaccard: similarity.jaccard,
          };
        }
      }
    }

    if (best) {
      best.cluster.articles.push(article);
      best.cluster.lastPublishedAt = new Date(
        Math.max(
          best.cluster.lastPublishedAt.getTime(),
          article.publishedAt.getTime(),
        ),
      );
      best.cluster.firstPublishedAt = new Date(
        Math.min(
          best.cluster.firstPublishedAt.getTime(),
          article.publishedAt.getTime(),
        ),
      );
      best.cluster.titleVariants = uniqueNonEmpty([
        ...best.cluster.titleVariants,
        article.title,
      ]);
      continue;
    }

    clusters.push({
      id: null,
      title: article.title,
      titleVariants: [article.title],
      category: article.category,
      language: article.language,
      articles: [article],
      firstPublishedAt: article.publishedAt,
      lastPublishedAt: article.publishedAt,
    });
  }

  // Greedy assignment can leave one fast-moving event split across clusters
  // when later reports use a different angle. Merge those before choosing the
  // representative headline.
  const merged = mergeSimilarClusters(clusters, { windowHours });

  for (const cluster of merged) {
    if (cluster.articles.length === 0) continue;
    const primary = choosePrimaryArticle(cluster.articles);
    if (!primary) continue;
    cluster.title = primary.title;
    cluster.titleVariants = uniqueNonEmpty([
      primary.title,
      ...cluster.articles.map((article) => article.title),
    ]);
  }

  return merged;
}

/** Convenience for callers that only care about clusters with new articles. */
export function touchedClusters(
  clusters: readonly WorkingCluster[],
): WorkingCluster[] {
  return clusters.filter((cluster) => cluster.articles.length > 0);
}
