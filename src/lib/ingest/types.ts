import type { FeedLanguage, NewsCategory } from "@/config/sources";

/** A feed item reduced to the few fields we use. Text may still contain HTML. */
export type FeedItemCandidate = {
  title: string;
  link: string;
  publishedAt: string;
  summary: string;
  content: string;
  imageUrl: string;
  guid: string;
  /** Zero-based position in the feed, used as a weak popularity signal. */
  position: number;
};

/** Clean, deduplicated article ready for the database or in-memory clustering. */
export type NormalizedArticle = {
  sourceId: string;
  title: string;
  summary: string;
  url: string;
  urlHash: string;
  imageUrl: string | null;
  publishedAt: Date;
  category: NewsCategory;
  language: FeedLanguage;
  feedPosition: number;
  trustWeight: number;
};

export type RejectionReason =
  | "missing-title"
  | "short-title"
  | "missing-url"
  | "invalid-date"
  | "future-date"
  | "outside-window"
  | "blocked-title"
  | "duplicate";

export type RejectionCounts = Partial<Record<RejectionReason, number>>;

export type NormalizeOutcome =
  | { article: NormalizedArticle; reason?: undefined }
  | { article?: undefined; reason: RejectionReason };

export function incrementRejection(
  counts: RejectionCounts,
  reason: RejectionReason,
): void {
  counts[reason] = (counts[reason] ?? 0) + 1;
}
