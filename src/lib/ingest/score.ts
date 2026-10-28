import { INGEST_CONFIG } from "@/config/ingest";

export type ScorableArticle = {
  sourceId: string;
  trustWeight: number;
  feedPosition: number;
  publishedAt: Date;
};

export type ClusterMetrics = {
  distinctSourceCount: number;
  trustWeightSum: number;
  verifiedScore: number;
  isConfirmed: boolean;
  popularScore: number;
  isVisible: boolean;
  minFeedPosition: number;
  ageHours: number;
  firstPublishedAt: Date;
  lastPublishedAt: Date;
};

/**
 * Confidence is "how many independent, reputable outlets ran this", not a
 * truth score. Trust is counted once per source, no matter how many articles
 * that source published about the same event.
 */
export function computeClusterMetrics(
  articles: readonly ScorableArticle[],
  now: Date,
): ClusterMetrics {
  const trustBySource = new Map<string, number>();
  let minFeedPosition = Number.POSITIVE_INFINITY;
  let first = Number.POSITIVE_INFINITY;
  let last = Number.NEGATIVE_INFINITY;

  for (const article of articles) {
    const current = trustBySource.get(article.sourceId) ?? 0;
    trustBySource.set(
      article.sourceId,
      Math.max(current, clampTrust(article.trustWeight)),
    );
    minFeedPosition = Math.min(minFeedPosition, article.feedPosition);
    first = Math.min(first, article.publishedAt.getTime());
    last = Math.max(last, article.publishedAt.getTime());
  }

  const distinctSourceCount = trustBySource.size;
  const trustWeightSum = [...trustBySource.values()].reduce(
    (sum, weight) => sum + weight,
    0,
  );
  const verifiedScore = distinctSourceCount + trustWeightSum;

  const isConfirmed =
    distinctSourceCount >= INGEST_CONFIG.confirmedMinSources ||
    (distinctSourceCount >= INGEST_CONFIG.confirmedHighTrustSources &&
      trustWeightSum >= INGEST_CONFIG.confirmedHighTrustSum);

  const isVisible =
    distinctSourceCount >= 2 ||
    trustWeightSum >= INGEST_CONFIG.visibleSingleSourceTrust;

  const firstPublishedAt = new Date(
    Number.isFinite(first) ? first : now.getTime(),
  );
  const lastPublishedAt = new Date(
    Number.isFinite(last) ? last : firstPublishedAt.getTime(),
  );
  const ageHours = Math.max(
    0,
    (now.getTime() - firstPublishedAt.getTime()) / 3_600_000,
  );

  const positionBoost =
    1 +
    0.5 *
      Math.max(
        0,
        1 - Math.min(minFeedPosition === Infinity ? 20 : minFeedPosition, 30) / 30,
      );
  const sourceBoost = distinctSourceCount * 1.0 + trustWeightSum * 0.3;
  const freshness = 1 / Math.pow(ageHours + 2, 1.5);
  const confirmationMultiplier = isConfirmed
    ? 1.4
    : distinctSourceCount >= 2
      ? 1.1
      : trustWeightSum >= INGEST_CONFIG.visibleSingleSourceTrust
        ? 1
        : 0.35;

  const popularScore =
    Math.round(
      (sourceBoost + positionBoost) * freshness * confirmationMultiplier * 1e6,
    ) / 1e6;

  return {
    distinctSourceCount,
    trustWeightSum,
    verifiedScore,
    isConfirmed,
    popularScore,
    isVisible,
    minFeedPosition: minFeedPosition === Infinity ? 0 : minFeedPosition,
    ageHours,
    firstPublishedAt,
    lastPublishedAt,
  };
}

function clampTrust(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(5, Math.max(1, Math.round(value)));
}

/**
 * The face of a cluster: the most trusted outlet, then the earliest report.
 * This keeps attribution stable even when a lower-trust outlet publishes a
 * catchier headline later.
 */
export function choosePrimaryArticle<T extends ScorableArticle>(
  articles: readonly T[],
): T | null {
  if (articles.length === 0) return null;

  return [...articles].sort((a, b) => {
    if (b.trustWeight !== a.trustWeight) return b.trustWeight - a.trustWeight;
    const time = a.publishedAt.getTime() - b.publishedAt.getTime();
    if (time !== 0) return time;
    return a.sourceId.localeCompare(b.sourceId);
  })[0];
}
