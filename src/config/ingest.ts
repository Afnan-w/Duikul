/**
 * Every tunable number in the fishing + clustering pipeline lives here so the
 * editorial rules are readable in one place and the `/about` page can explain
 * them honestly.
 */
export const INGEST_CONFIG = {
  /** Only stories published inside this window enter the live edition. */
  windowHours: 48,
  /** Articles older than this are removed from the database on every run. */
  retentionDays: 14,

  /** Network contract. */
  timeoutMs: 8_000,
  retries: 2,
  retryBackoffMs: [450, 1_200] as const,
  maxItemsPerFeed: 120,

  /** Text contract. */
  maxTitleChars: 300,
  minTitleChars: 8,
  maxSummaryChars: 280,
  /** Dates this far in the future are treated as broken clocks. */
  futureToleranceMinutes: 30,

  /** Clustering contract — transparent heuristics, not a model. */
  clusterWindowHours: 36,
  /** Existing clusters further back than this are not considered for matching. */
  clusterSeedHours: 72,
  /** Combined score below this is treated as a different event. */
  clusterThreshold: 0.38,
  /** A second, looser pass for long headlines that share four+ content words. */
  clusterLooseThreshold: 0.3,
  clusterLooseSharedTokens: 4,
  /** Fewer shared significant tokens than this can never be the same event. */
  clusterMinSharedTokens: 2,
  /** Very strong token overlap can cluster even when the trigram score dips. */
  clusterStrongJaccard: 0.6,

  /** Confirmation badge contract. */
  confirmedMinSources: 3,
  confirmedHighTrustSources: 2,
  confirmedHighTrustSum: 9,
  /** Single-source stories below this trust weight are not shown at all. */
  visibleSingleSourceTrust: 4,
} as const;

export type IngestConfig = typeof INGEST_CONFIG;
