/*
  ============================================================
  NEWS FETCHER  (server-side only)
  ============================================================
  Downloads every feed listed in sources.ts, turns each item
  into a Story, removes duplicates and sorts newest-first.

  The magic line is:  fetch(url, { next: { revalidate: 600 } })
  It tells Vercel to CACH each download for 10 minutes, so the
  site loads fast and we never download feeds more often than
  that. No database, no cron job - Vercel does it all.
*/

import { activeSources, type Source } from "@/sources";
import {
  guessCategory,
  makeExcerpt,
  parser,
  repairXml,
  shortHash,
  slugify,
  type FeedItem,
  type Story,
} from "@/lib/rss";
import { groupStories, rankStories } from "@/lib/rank";

/** How long Vercel keeps a downloaded feed before fetching it again. */
export const REVALIDATE_SECONDS = 600; // 10 minutes

/* A feed that fails should never break the whole site - we skip it. */
async function fetchFeed(source: Source): Promise<Story[]> {
  try {
    const res = await fetch(source.url, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(15000), // give up after 15s
      headers: {
        // Some feeds only answer to real browsers:
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
    });
    if (!res.ok) {
      console.warn(`[news] ${source.id}: HTTP ${res.status}`);
      return [];
    }

    const xml = await res.text();
    // Repair feeds that contain raw HTML the strict parser rejects.
    const feed = (await parser.parseString(repairXml(xml))) as {
      items?: FeedItem[];
    };
    const items = feed.items ?? [];

    return items
      .map((item) => toStory(item, source))
      .filter((story): story is Story => story !== null)
      .slice(0, 40); // 40 newest per outlet is plenty
  } catch (error) {
    // One broken feed must not stop the others.
    console.warn(
      `[news] ${source.id} failed:`,
      error instanceof Error ? error.message : error
    );
    return [];
  }
}

/** Convert one RSS item into our Story shape. Returns null if unusable. */
function toStory(item: FeedItem, source: Source): Story | null {
  const title = (item.title ?? "").trim();
  const link = (item.link ?? "").trim();
  if (!title || !link) return null;

  const publishedAt = item.isoDate ?? item.pubDate ?? new Date().toISOString();

  // Body text: prefer the full content, fall back to the snippet.
  const body =
    item.contentEncoded ?? item.content ?? item.contentSnippet ?? "";
  const excerpt = makeExcerpt(body) || makeExcerpt(title);

  // Image: pick the largest available (enclosure > media:content > media:thumbnail > first image).
  const bestImage = pickBestImage(item);
  const imageUrl = bestImage ? upgradeImageUrl(bestImage.url) : undefined;
  const imageWidth = bestImage?.width;
  const imageHeight = bestImage?.height;

  const slug = `${slugify(title) || "story"}-${shortHash(link)}`;

  /*
    Language: feeds come in Bangla OR English - we show each story in
    the language it was written in, for BOTH toggles. Free automatic
    translation would need a paid API, so we never fake it.
  */
  const storyText = { title, excerpt };

  return {
    slug,
    section: source.section,
    category: guessCategory(title, item.categories),
    bn: storyText,
    en: storyText,
    outlets: [{ name: source.name, url: link }],
    publishedAt,
    imageUrl,
    imageWidth,
    imageHeight,
    imageCredit: source.name,
    sourceId: source.id,
    trust: source.trust,
  };
}

function firstImage(html: string): string | undefined {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : undefined;
}

/** Pick the largest image available from an RSS item.
 *  Checks enclosure, media:content, media:thumbnail, and the first  in body.
 *  Returns the candidate with the widest known width, or the first candidate if none have dimensions.
 */
function pickBestImage(item: FeedItem): { url: string; width?: number; height?: number } | null {
  const candidates: { url: string; width?: number; height?: number }[] = [];

  // enclosure
  if (item.enclosure?.url && /\.(jpg|jpeg|png|webp)/i.test(item.enclosure.url)) {
    candidates.push({
      url: item.enclosure.url,
      width: item.enclosure.width,
      height: item.enclosure.height,
    });
  }

  // media:content
  if (item.mediaContent?.[0]?.$?.url) {
    candidates.push({
      url: item.mediaContent[0].$.url,
      width: item.mediaContent[0].$.width
        ? Number(item.mediaContent[0].$.width)
        : undefined,
      height: item.mediaContent[0].$.height
        ? Number(item.mediaContent[0].$.height)
        : undefined,
    });
  }

  // media:thumbnail
  if (item.mediaThumbnail?.$?.url) {
    candidates.push({
      url: item.mediaThumbnail.$.url,
      width: item.mediaThumbnail.$.width
        ? Number(item.mediaThumbnail.$.width)
        : undefined,
      height: item.mediaThumbnail.$.height
        ? Number(item.mediaThumbnail.$.height)
        : undefined,
    });
  }

  // first  in body
  const first = firstImage(
    item.contentEncoded ?? item.content ?? item.contentSnippet ?? ""
  );
  if (first) candidates.push({ url: first });

  if (candidates.length === 0) return null;

  const withDims = candidates.filter((c) => c.width);
  if (withDims.length > 0) {
    withDims.sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
    return withDims[0];
  }
  return candidates[0];
}

/** Upgrade known thumbnail URLs to larger versions (free, no paid APIs). */
function upgradeImageUrl(url: string): string {
  // BBC: /240/ or /standard/240/ -> /976/
  if (url.includes("bbc.co.uk") || url.includes("bbci.co.uk")) {
    return url
      .replace(/\/240\//g, "/976/")
      .replace(/\/standard\/240\//g, "/standard/976/");
  }

  // The Guardian: request 1200px wide, good quality
  if (url.includes("theguardian.com")) {
    try {
      const u = new URL(url);
      u.searchParams.set("width", "1200");
      u.searchParams.set("quality", "85");
      u.searchParams.set("auto", "format");
      return u.toString();
    } catch {
      return url;
    }
  }

  // Generic: strip common small-image suffixes
  return url
    .replace(/-(\d+)x(\d+)(?=\.[a-zA-Z]+$)/, "")
    .replace(/_thumb(?=\.[a-zA-Z]+$)/i, "")
    .replace(/[?&]w=\d+/gi, "");
}

/** Fetch a page's og:image meta tag (server-side, hero only).
 *  Cached 10 minutes, 5-second timeout, never crashes on failure.
 */
async function fetchOgImage(articleUrl: string): Promise<string | null> {
  try {
    const res = await fetch(articleUrl, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(5000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
    );
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------
  In-memory cache (per server instance).
  Next's data cache refuses responses over 2MB (Samakal's feed is
  2.1MB), so without this every dynamic page render would re-download
  it - wasting the free plan's bandwidth. One warm instance now
  downloads all feeds at most once every 10 minutes.
------------------------------------------------------------------- */
let cachedStories: { at: number; stories: Story[] } | null = null;
let inFlight: Promise<Story[]> | null = null;

/**
 * Download ALL enabled feeds at once (in parallel), then merge,
 * drop duplicates (same link or same headline) and sort newest-first.
 * Every page of the site calls this one function.
 */
export async function getAllStories(): Promise<Story[]> {
  if (cachedStories && Date.now() - cachedStories.at < REVALIDATE_SECONDS * 1000) {
    return cachedStories.stories;
  }
  // Several pages may ask at the same time - share one download.
  if (inFlight) return inFlight;

  inFlight = loadAllStories()
    .then((stories) => {
      cachedStories = { at: Date.now(), stories };
      return stories;
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

async function loadAllStories(): Promise<Story[]> {
  const lists = await Promise.all(activeSources.map(fetchFeed));
  const stories = lists.flat();

  const seenLinks = new Set<string>();
  const seenTitles = new Set<string>();
  const unique: Story[] = [];

  for (const story of stories) {
    const link = story.outlets[0]?.url ?? "";
    const titleKey = story.bn.title.toLowerCase().replace(/\s+/g, " ").trim();

    if (seenLinks.has(link) || seenTitles.has(titleKey)) continue;
    seenLinks.add(link);
    seenTitles.add(titleKey);
    unique.push(story);
  }

  unique.sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
  );

  // Stage C: merge the same event reported by several outlets into
  // one story, then order everything by ranking score (highest first).
  const ranked = rankStories(groupStories(unique));

  // Hero image upgrade: fetch og:image from the article page for ONLY the
  // top story (1 extra request, cached 10 min, never crashes).
  if (ranked[0]) {
    const og = await fetchOgImage(ranked[0].outlets[0]?.url ?? "");
    if (og) {
      ranked[0].imageUrl = upgradeImageUrl(og);
      ranked[0].imageWidth = undefined; // og:image dimensions unknown
      ranked[0].imageHeight = undefined;
    }
  }

  return ranked;
}

/** Convenience selectors used by the pages. */
export async function getStories(options: {
  section?: "deshi" | "bideshi";
  category?: string;
  limit?: number;
}): Promise<Story[]> {
  let stories = await getAllStories();
  if (options.section) {
    stories = stories.filter((s) => s.section === options.section);
  }
  if (options.category) {
    stories = stories.filter((s) => s.category === options.category);
  }
  if (options.limit) stories = stories.slice(0, options.limit);
  return stories;
}
