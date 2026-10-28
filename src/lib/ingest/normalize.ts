import type { NewsSource } from "@/config/sources";
import { INGEST_CONFIG } from "@/config/ingest";
import { checkBlocklist } from "./blocklist";
import {
  createSummary,
  normalizeWhitespace,
  plainText,
  truncateTitle,
} from "./text";
import type {
  FeedItemCandidate,
  NormalizedArticle,
  NormalizeOutcome,
  RejectionCounts,
} from "./types";
import { incrementRejection } from "./types";
import { canonicalizeUrl, hashCanonicalUrl } from "./url";

const BOILERPLATE_SUFFIX =
  /\s*(?:read\s+(?:more|the\s+full\s+(?:story|article))|continue\s+reading|full\s+story|আরও\s+পড়ুন|বিস্তারিত\s+পড়ুন|সম্পূর্ণ\s+(?:খবর|প্রতিবেদন)\s+পড়ুন)\s*[»›→….\-–—:]*\s*$/iu;

export function parseFeedDate(value: string): Date | null {
  const raw = value?.trim();
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getUTCFullYear();
  if (year < 2000 || year > 2100) return null;
  return date;
}

export function normalizeImageUrl(
  raw: string,
  articleUrl: string,
): string | null {
  const value = raw?.trim();
  if (!value || /^(data|javascript|blob):/i.test(value)) return null;

  let url: URL;
  try {
    url = new URL(value, articleUrl);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  url.hash = "";
  const result = url.toString();
  if (result.length > 2_048) return null;
  return result;
}

function cleanSummary(raw: unknown, title: string): string {
  let text = plainText(raw);
  if (!text) return "";

  text = text.replace(BOILERPLATE_SUFFIX, "").trim();

  // Some feeds repeat the headline inside <description>. Do not show it twice.
  const normalizedTitle = normalizeWhitespace(title).toLowerCase();
  if (normalizedTitle && text.toLowerCase().startsWith(normalizedTitle)) {
    text = text.slice(title.length).replace(/^[\s:—–-]+/u, "");
  }

  if (text.toLowerCase() === normalizedTitle) return "";
  if (Array.from(text).length < 12) return "";

  return createSummary(text, INGEST_CONFIG.maxSummaryChars);
}

/**
 * Turn one raw feed item into a database-ready article, or say exactly why it
 * was rejected. Every rule is applied here so dry runs and live runs agree.
 */
export function normalizeFeedItem(
  source: NewsSource,
  item: FeedItemCandidate,
  now: Date,
): NormalizeOutcome {
  const title = truncateTitle(item.title, INGEST_CONFIG.maxTitleChars);
  if (!title) return { reason: "missing-title" };
  if (Array.from(title).length < INGEST_CONFIG.minTitleChars) {
    return { reason: "short-title" };
  }

  const url = canonicalizeUrl(item.link, source.siteUrl);
  if (!url) return { reason: "missing-url" };
  const urlHash = hashCanonicalUrl(url);

  const publishedAt = parseFeedDate(item.publishedAt);
  if (!publishedAt) return { reason: "invalid-date" };

  const futureLimit = new Date(
    now.getTime() + INGEST_CONFIG.futureToleranceMinutes * 60_000,
  );
  if (publishedAt.getTime() > futureLimit.getTime()) {
    return { reason: "future-date" };
  }

  const cutoff = now.getTime() - INGEST_CONFIG.windowHours * 3_600_000;
  if (publishedAt.getTime() < cutoff) {
    return { reason: "outside-window" };
  }

  const verdict = checkBlocklist(title);
  if (verdict.blocked) return { reason: "blocked-title" };

  const summary = cleanSummary(item.summary || item.content, title);
  const imageUrl = normalizeImageUrl(item.imageUrl, url);

  return {
    article: {
      sourceId: source.id,
      title,
      summary,
      url,
      urlHash,
      imageUrl,
      publishedAt,
      category: source.category,
      language: source.language,
      feedPosition: item.position,
      trustWeight: source.trustWeight,
    },
  };
}

export type NormalizeFeedResult = {
  articles: NormalizedArticle[];
  rejected: RejectionCounts;
};

export function normalizeFeedItems(
  source: NewsSource,
  items: FeedItemCandidate[],
  now: Date,
): NormalizeFeedResult {
  const articles: NormalizedArticle[] = [];
  const rejected: RejectionCounts = {};

  for (const item of items) {
    const outcome = normalizeFeedItem(source, item, now);
    if (outcome.article) {
      articles.push(outcome.article);
    } else {
      incrementRejection(rejected, outcome.reason);
    }
  }

  return { articles, rejected };
}

export type DedupeResult = {
  articles: NormalizedArticle[];
  duplicates: number;
};

/** Global URL-hash dedupe. First occurrence wins; feeds are deterministic. */
export function dedupeArticles(articles: NormalizedArticle[]): DedupeResult {
  const seen = new Set<string>();
  const unique: NormalizedArticle[] = [];
  let duplicates = 0;

  for (const article of articles) {
    if (seen.has(article.urlHash)) {
      duplicates += 1;
      continue;
    }
    seen.add(article.urlHash);
    unique.push(article);
  }

  return { articles: unique, duplicates };
}
