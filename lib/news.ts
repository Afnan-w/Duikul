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

  // Image: enclosure -> media:content -> media:thumbnail -> first <img>.
  const imageUrl =
    (item.enclosure?.url?.match(/\.(jpg|jpeg|png|webp)/i)
      ? item.enclosure.url
      : undefined) ??
    item.mediaContent?.find((m) => m.$?.url)?.$?.url ??
    item.mediaThumbnail?.$?.url ??
    firstImage(body);

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
    imageCredit: source.name,
    sourceId: source.id,
    trust: source.trust,
  };
}

function firstImage(html: string): string | undefined {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : undefined;
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
  return rankStories(groupStories(unique));
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
