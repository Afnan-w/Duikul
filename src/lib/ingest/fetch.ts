import Parser from "rss-parser";
import { XMLParser } from "fast-xml-parser";
import type { NewsSource } from "@/config/sources";
import { INGEST_CONFIG } from "@/config/ingest";
import {
  decodeHtmlEntities,
  extractText,
  extractUrlValue,
  normalizeWhitespace,
} from "./text";
import type { FeedItemCandidate } from "./types";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://khobordaily.vercel.app"
).replace(/\/$/, "");

export const USER_AGENT = `KhoborDailyBot/1.0 (+${SITE_URL})`;
export const FEED_ACCEPT =
  "application/rss+xml, application/atom+xml, application/xml, text/xml, */*";

type RssCustomItem = {
  mediaContent?: unknown;
  mediaThumbnail?: unknown;
  mediaGroup?: unknown;
  contentEncoded?: unknown;
  dcDate?: unknown;
  itunesImage?: unknown;
};

const rssParser = new Parser<Record<string, unknown>, RssCustomItem>({
  headers: {
    "User-Agent": USER_AGENT,
    Accept: FEED_ACCEPT,
  },
  timeout: INGEST_CONFIG.timeoutMs,
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
      ["media:group", "mediaGroup"],
      ["content:encoded", "contentEncoded"],
      ["dc:date", "dcDate"],
      ["itunes:image", "itunesImage"],
    ],
  },
});

export type FeedImageSources = {
  mediaContent?: unknown;
  mediaThumbnail?: unknown;
  mediaGroup?: unknown;
  enclosure?: unknown;
  itunesImage?: unknown;
  html?: string;
};

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  return value == null ? [] : [value];
}

function looksLikeImageUrl(value: string): boolean {
  const candidate = value.trim();
  if (!candidate || /^(data|javascript|blob):/i.test(candidate)) return false;
  if (/^(https?:)?\/\//i.test(candidate) || candidate.startsWith("/")) {
    return true;
  }
  return /\.(?:jpe?g|png|webp|gif|avif|svg)(?:[?#]|$)/i.test(candidate);
}

function objectUrl(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  for (const key of [
    "@_url",
    "url",
    "@_href",
    "href",
    "@_src",
    "src",
    "#text",
    "_",
  ]) {
    const candidate = record[key];
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
    if (candidate && typeof candidate === "object") {
      const nested = objectUrl(candidate);
      if (nested) return nested;
    }
  }
  return "";
}

function mediaUrl(value: unknown, depth = 0): string {
  if (depth > 5) return "";
  if (Array.isArray(value)) {
    for (const item of value) {
      const url = mediaUrl(item, depth + 1);
      if (url) return url;
    }
    return "";
  }
  if (typeof value === "string") {
    return looksLikeImageUrl(value) ? value.trim() : "";
  }
  if (!value || typeof value !== "object") return "";

  const record = value as Record<string, unknown>;
  const medium = String(record["@_medium"] ?? record.medium ?? "").toLowerCase();
  const type = String(record["@_type"] ?? record.type ?? "").toLowerCase();
  if (medium === "video" || medium === "audio") return "";
  if (type.startsWith("video/") || type.startsWith("audio/")) return "";

  const direct = objectUrl(value);
  if (direct) {
    if (type && !type.startsWith("image/")) return "";
    if (looksLikeImageUrl(direct)) return direct;
  }

  for (const key of [
    "media:content",
    "media:thumbnail",
    "mediaGroup",
    "content",
    "thumbnail",
    "$",
    "@attributes",
  ]) {
    if (key in record) {
      const nested = mediaUrl(record[key], depth + 1);
      if (nested) return nested;
    }
  }

  return "";
}

function enclosureUrl(value: unknown): string {
  if (!value) return "";
  if (Array.isArray(value)) {
    for (const item of value) {
      const url = enclosureUrl(item);
      if (url) return url;
    }
    return "";
  }
  if (typeof value === "string") {
    return looksLikeImageUrl(value) ? value.trim() : "";
  }
  if (typeof value !== "object") return "";

  const record = value as Record<string, unknown>;
  const type = String(record.type ?? record["@_type"] ?? "").toLowerCase();
  if (type && !type.startsWith("image/")) return "";
  const url = objectUrl(value);
  return url && looksLikeImageUrl(url) ? url : "";
}

function htmlImage(html: string | undefined): string {
  if (!html) return "";
  const tags = html.match(/<img\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const srcMatch = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    if (!srcMatch) continue;
    const src = decodeHtmlEntities(srcMatch[1]).trim();
    if (!looksLikeImageUrl(src)) continue;

    const width = Number(tag.match(/\bwidth\s*=\s*["']?(\d+)/i)?.[1] ?? "0");
    const height = Number(tag.match(/\bheight\s*=\s*["']?(\d+)/i)?.[1] ?? "0");
    if ((width > 0 && width < 80) || (height > 0 && height < 60)) continue;

    return src;
  }
  return "";
}

/**
 * Feed images only: media:content / media:thumbnail / enclosure / itunes:image
 * / an <img> that the publisher placed inside the feed description. We never
 * fetch the article page to discover an image.
 */
export function findFeedImage(sources: FeedImageSources): string {
  return (
    mediaUrl(sources.mediaContent) ||
    mediaUrl(sources.mediaThumbnail) ||
    mediaUrl(sources.mediaGroup) ||
    enclosureUrl(sources.enclosure) ||
    mediaUrl(sources.itunesImage) ||
    htmlImage(sources.html) ||
    ""
  );
}

function pickLink(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (!value) return "";

  const links = asArray(value);
  const objects = links
    .filter((link): link is Record<string, unknown> => Boolean(link) && typeof link === "object")
    .map((link) => ({
      href: objectUrl(link),
      rel: String(link["@_rel"] ?? link.rel ?? "").toLowerCase(),
    }))
    .filter((link) => link.href);

  const alternate = objects.find((link) => !link.rel || link.rel === "alternate");
  if (alternate) return alternate.href;
  if (objects[0]) return objects[0].href;

  return extractUrlValue(value);
}

async function parseWithRssParser(xml: string): Promise<FeedItemCandidate[]> {
  const feed = await rssParser.parseString(xml);
  return (feed.items ?? []).map((item, position) => ({
    title: normalizeWhitespace(extractText(item.title)),
    link: extractUrlValue(item.link) || extractUrlValue(item.guid),
    publishedAt:
      extractText(item.isoDate) ||
      extractText(item.pubDate) ||
      extractText(item.dcDate),
    summary: extractText(item.content) || extractText(item.summary),
    content:
      extractText(item.contentEncoded) ||
      extractText(item.content) ||
      extractText(item.summary),
    imageUrl: findFeedImage({
      mediaContent: item.mediaContent,
      mediaThumbnail: item.mediaThumbnail,
      mediaGroup: item.mediaGroup,
      enclosure: item.enclosure,
      itunesImage: item.itunesImage,
      html:
        extractText(item.contentEncoded) ||
        extractText(item.content) ||
        extractText(item.summary),
    }),
    guid: extractText(item.guid),
    position,
  }));
}

function firstChannel(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== "object") return null;
  const root = data as Record<string, unknown>;
  const rss = root.rss;
  if (rss && typeof rss === "object") {
    const channel = (rss as Record<string, unknown>).channel;
    const value = Array.isArray(channel) ? channel[0] : channel;
    return value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : null;
  }
  const rdf = root["rdf:RDF"];
  if (rdf && typeof rdf === "object") {
    return rdf as Record<string, unknown>;
  }
  return null;
}

function atomEntries(data: unknown): unknown[] {
  if (!data || typeof data !== "object") return [];
  const feed = (data as Record<string, unknown>).feed;
  if (!feed || typeof feed !== "object") return [];
  return asArray((feed as Record<string, unknown>).entry);
}

/**
 * Fallback parser used when rss-parser rejects a feed (malformed entities,
 * unusual namespaces, mixed RSS/Atom). Its output must match the primary
 * parser closely enough that normalisation cannot tell the difference.
 */
export function parseWithFastXml(xml: string): FeedItemCandidate[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    trimValues: true,
    processEntities: true,
    parseTagValue: false,
    parseAttributeValue: false,
  });

  const data = parser.parse(xml);
  const channel = firstChannel(data);
  const entries = atomEntries(data);

  const rawItems = channel
    ? asArray(channel.item)
    : entries.length > 0
      ? entries
      : [];

  return rawItems
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item, position) => {
      const html =
        extractText(item["content:encoded"]) ||
        extractText(item.content) ||
        extractText(item.description) ||
        extractText(item.summary);

      return {
        title: normalizeWhitespace(extractText(item.title)),
        link:
          pickLink(item.link) ||
          extractUrlValue(item.guid) ||
          extractUrlValue(item.id),
        publishedAt:
          extractText(item.pubDate) ||
          extractText(item["dc:date"]) ||
          extractText(item.published) ||
          extractText(item.updated) ||
          extractText(item.date),
        summary:
          extractText(item.description) ||
          extractText(item.summary) ||
          extractText(item.content),
        content:
          extractText(item["content:encoded"]) ||
          extractText(item.content) ||
          extractText(item.description),
        imageUrl: findFeedImage({
          mediaContent: item["media:content"],
          mediaThumbnail: item["media:thumbnail"],
          mediaGroup: item["media:group"],
          enclosure: item.enclosure,
          itunesImage: item["itunes:image"],
          html,
        }),
        guid: extractText(item.guid) || extractText(item.id),
        position,
      };
    });
}

function looksLikeFeed(xml: string): boolean {
  return /<\s*(?:rss|feed|rdf:RDF)\b/i.test(xml.slice(0, 8_000));
}

/**
 * Parse a feed document with rss-parser first, fast-xml-parser second. Both
 * parsers can legally return zero items; only a document that is not a feed
 * at all is an error.
 */
export async function parseFeedDocument(xml: string): Promise<FeedItemCandidate[]> {
  if (!looksLikeFeed(xml)) {
    throw new Error("Response is not an RSS or Atom feed");
  }

  try {
    const items = await parseWithRssParser(xml);
    if (items.length > 0) return items;
  } catch {
    // Fall through to the tolerant parser.
  }

  const items = parseWithFastXml(xml);
  return items;
}

export type FeedFetchResult = {
  source: NewsSource;
  ok: boolean;
  items: FeedItemCandidate[];
  status: number | null;
  durationMs: number;
  attempts: number;
  error?: string;
};

function errorMessage(error: unknown, timeoutMs: number): string {
  if (!(error instanceof Error)) return "Unknown feed error";
  if (error.name === "TimeoutError" || error.name === "AbortError") {
    return `Timed out after ${timeoutMs}ms`;
  }
  return error.message.slice(0, 240);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

class HttpFeedError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`HTTP ${status}`);
    this.name = "HttpFeedError";
    this.status = status;
  }
}

/**
 * Fetch one whitelisted feed with an 8s timeout and up to two retries.
 * 4xx responses are not retried; timeouts, network errors, 429 and 5xx are.
 */
export async function fetchFeed(
  source: NewsSource,
  options: { timeoutMs?: number; retries?: number; maxItems?: number } = {},
): Promise<FeedFetchResult> {
  const timeoutMs = options.timeoutMs ?? INGEST_CONFIG.timeoutMs;
  const retries = options.retries ?? INGEST_CONFIG.retries;
  const maxItems = options.maxItems ?? INGEST_CONFIG.maxItemsPerFeed;
  const started = Date.now();
  let lastError: unknown = null;
  let lastStatus: number | null = null;
  let attempts = 0;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    attempts = attempt + 1;
    try {
      const response = await fetch(source.rssUrl, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: FEED_ACCEPT,
        },
        redirect: "follow",
        cache: "no-store",
        signal: AbortSignal.timeout(timeoutMs),
      });

      lastStatus = response.status;
      if (!response.ok) throw new HttpFeedError(response.status);

      const body = await response.text();
      const items = await parseFeedDocument(body);

      return {
        source,
        ok: true,
        items: items.slice(0, maxItems),
        status: response.status,
        durationMs: Date.now() - started,
        attempts,
      };
    } catch (error) {
      lastError = error;

      const status = error instanceof HttpFeedError ? error.status : null;
      const retryable = status === null || status === 429 || status >= 500;
      if (!retryable || attempt === retries) break;

      const backoff =
        INGEST_CONFIG.retryBackoffMs[
          Math.min(attempt, INGEST_CONFIG.retryBackoffMs.length - 1)
        ] ?? 1_200;
      await wait(backoff + attempt * 120);
    }
  }

  return {
    source,
    ok: false,
    items: [],
    status: lastStatus,
    durationMs: Date.now() - started,
    attempts,
    error: errorMessage(lastError, timeoutMs),
  };
}
