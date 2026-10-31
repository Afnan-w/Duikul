import { cache } from "react";
import { INGEST_CONFIG } from "@/config/ingest";
import { getSource, type NewsCategory } from "@/config/sources";
import { compareTitles } from "@/lib/ingest/similarity";
import {
  CLUSTER_COLUMNS,
  mapClusterRow,
  type StoryCluster,
} from "@/lib/data/clusters";
import { getSupabasePublic } from "@/lib/supabase/public";
import {
  dhakaDateKey,
  dhakaDateRange,
  isValidDateKey,
  parseDhakaDateKey,
  shiftDateKey,
} from "@/lib/utils/date";

type ArticleRow = {
  cluster_id: string | null;
  source_id: string;
  title: string;
  url: string;
  published_at: string;
};

export type DailySourceActivity = {
  sourceId: string;
  name: string;
  nameBn: string;
  storyCount: number;
};

export type DailyHeadlineVariant = {
  sourceId: string;
  name: string;
  nameBn: string;
  title: string;
  url: string;
  publishedAt: Date;
};

export type DailyDifference = {
  cluster: StoryCluster;
  variants: DailyHeadlineVariant[];
  kind: "numbers" | "headlines";
};

export type DailyBriefing = {
  date: string;
  clusters: StoryCluster[];
  confirmed: StoryCluster[];
  confirmedBySection: Record<NewsCategory, StoryCluster[]>;
  sourceActivity: DailySourceActivity[];
  differences: DailyDifference[];
  editorNote: string | null;
  /** Distinct publishers represented among the day's clustered articles. */
  outletCount: number;
  /** Total publisher links behind the day's clusters. */
  articleCount: number;
  /** Daily pages are indexable only when they summarise five or more stories. */
  isIndexable: boolean;
};

const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";

function asciiDigits(value: string): string {
  return value.replace(/[০-৯]/g, (digit) =>
    String(BANGLA_DIGITS.indexOf(digit)),
  );
}

/** Numeric tokens in a headline, with Bangla digits normalised to ASCII. */
export function extractNumbers(text: string): string[] {
  const normalized = asciiDigits(text).replace(/,/g, "");
  const matches = normalized.match(/\d+(?:\.\d+)?/g) ?? [];
  return Array.from(new Set(matches));
}

export function numbersDiffer(titles: string[]): boolean {
  if (titles.length < 2) return false;
  const signatures = titles.map((title) =>
    extractNumbers(title).sort().join("|"),
  );
  return new Set(signatures).size > 1;
}

/**
 * A transparent, deliberately simple flag for the daily briefing: two
 * reports disagree when their numbers differ, or when their headline wording
 * has very little overlap. It is a prompt to read both, not a verdict.
 */
export function headlinesDiffer(titles: string[]): boolean {
  if (titles.length < 2) return false;
  if (numbersDiffer(titles)) return true;

  for (let first = 0; first < titles.length; first += 1) {
    for (let second = first + 1; second < titles.length; second += 1) {
      if (
        compareTitles(titles[first], titles[second]).combined < 0.22
      ) {
        return true;
      }
    }
  }

  return false;
}

function sortByPopularity(clusters: StoryCluster[]): StoryCluster[] {
  return [...clusters].sort((a, b) => {
    if (a.isConfirmed !== b.isConfirmed) return a.isConfirmed ? -1 : 1;
    if (b.popularScore !== a.popularScore) {
      return b.popularScore - a.popularScore;
    }
    return b.lastPublishedAt.getTime() - a.lastPublishedAt.getTime();
  });
}

function buildDifferences(
  clusters: StoryCluster[],
  articles: ArticleRow[],
): DailyDifference[] {
  const byCluster = new Map<string, ArticleRow[]>();

  for (const article of articles) {
    if (!article.cluster_id) continue;
    const list = byCluster.get(article.cluster_id) ?? [];
    list.push(article);
    byCluster.set(article.cluster_id, list);
  }

  const differences: DailyDifference[] = [];

  for (const cluster of clusters) {
    if (cluster.distinctSourceCount < 2) continue;

    const rows = byCluster.get(cluster.id) ?? [];
    const firstPerSource = new Map<string, ArticleRow>();
    for (const row of rows) {
      if (!firstPerSource.has(row.source_id)) {
        firstPerSource.set(row.source_id, row);
      }
    }

    if (firstPerSource.size < 2) continue;

    const variants = Array.from(firstPerSource.values())
      .map((row): DailyHeadlineVariant => {
        const source = getSource(row.source_id);
        return {
          sourceId: row.source_id,
          name: source?.name ?? row.source_id,
          nameBn: source?.nameBn ?? source?.name ?? row.source_id,
          title: row.title,
          url: row.url,
          publishedAt: new Date(row.published_at),
        };
      })
      .sort((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime());

    if (!headlinesDiffer(variants.map((variant) => variant.title))) continue;

    differences.push({
      cluster,
      variants,
      kind: numbersDiffer(variants.map((variant) => variant.title))
        ? "numbers"
        : "headlines",
    });
  }

  return differences
    .sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "numbers" ? -1 : 1;
      return b.cluster.popularScore - a.cluster.popularScore;
    })
    .slice(0, 5);
}

function buildActivity(articles: ArticleRow[]): DailySourceActivity[] {
  const clustersBySource = new Map<string, Set<string>>();

  for (const article of articles) {
    if (!article.cluster_id) continue;
    const clusters = clustersBySource.get(article.source_id) ?? new Set();
    clusters.add(article.cluster_id);
    clustersBySource.set(article.source_id, clusters);
  }

  return Array.from(clustersBySource.entries())
    .map(([sourceId, clusters]): DailySourceActivity => {
      const source = getSource(sourceId);
      return {
        sourceId,
        name: source?.name ?? sourceId,
        nameBn: source?.nameBn ?? source?.name ?? sourceId,
        storyCount: clusters.size,
      };
    })
    .sort((a, b) => b.storyCount - a.storyCount || a.name.localeCompare(b.name))
    .slice(0, 6);
}

/**
 * Everything rendered on `/daily/[yyyy-mm-dd]`. The day is a Dhaka calendar
 * day and stories are attributed to the day they were first published.
 */
export const getDailyBriefing = cache(
  async (date: string): Promise<DailyBriefing | null> => {
    if (!isValidDateKey(date)) return null;

    const empty: DailyBriefing = {
      date,
      clusters: [],
      confirmed: [],
      confirmedBySection: { deshi: [], bideshi: [] },
      sourceActivity: [],
      differences: [],
      editorNote: null,
      outletCount: 0,
      articleCount: 0,
      isIndexable: false,
    };

    const range = dhakaDateRange(date);
    if (!range) return empty;

    const supabase = getSupabasePublic();
    if (!supabase) return empty;

    const [{ data: clusterRows, error: clusterError }, { data: noteRow }] =
      await Promise.all([
        supabase
          .from("clusters")
          .select(CLUSTER_COLUMNS)
          .gte("first_published_at", range.start.toISOString())
          .lt("first_published_at", range.end.toISOString())
          .or(
            `distinct_source_count.gte.2,trust_weight_sum.gte.${INGEST_CONFIG.visibleSingleSourceTrust}`,
          )
          .order("popular_score", { ascending: false })
          .limit(100),
        supabase
          .from("daily_notes")
          .select("editor_note")
          .eq("briefing_date", date)
          .maybeSingle(),
      ]);

    if (clusterError) {
      console.error(
        "[data] could not build daily briefing:",
        clusterError.message,
      );
    }

    const clusters = sortByPopularity(
      ((clusterRows ?? []) as unknown as Parameters<typeof mapClusterRow>[0][]).map(
        mapClusterRow,
      ),
    );

    const editorNote =
      typeof noteRow?.editor_note === "string" &&
      noteRow.editor_note.trim().length > 0
        ? noteRow.editor_note.trim()
        : null;

    const { data: articleRows, error: articleError } =
      clusters.length > 0
        ? await supabase
            .from("articles")
            .select("cluster_id,source_id,title,url,published_at")
            .in(
              "cluster_id",
              clusters.map((cluster) => cluster.id),
            )
            .order("published_at", { ascending: true })
            .limit(500)
        : { data: [], error: null };

    if (articleError) {
      console.error(
        "[data] could not read daily articles:",
        articleError.message,
      );
    }

    const articles = (articleRows ?? []) as ArticleRow[];
    const confirmed = clusters.filter((cluster) => cluster.isConfirmed);
    const outletCount = new Set(articles.map((article) => article.source_id))
      .size;

    return {
      date,
      clusters,
      confirmed,
      confirmedBySection: {
        deshi: confirmed.filter((cluster) => cluster.category === "deshi"),
        bideshi: confirmed.filter((cluster) => cluster.category === "bideshi"),
      },
      sourceActivity: buildActivity(articles),
      differences: buildDifferences(clusters, articles),
      editorNote,
      outletCount,
      articleCount: articles.length,
      isIndexable: clusters.length >= 5,
    };
  },
);

export type DailySitemapEntry = {
  date: string;
  lastModified: Date;
};

/** The briefing page for a day is indexable once it summarises this many stories. */
const DAILY_MIN_STORIES = 5;

/**
 * Group day-level cluster rows into indexable briefing dates.
 *
 * Pure and unit-tested so the sitemap agrees with `getDailyBriefing`: a day is
 * listed only when at least `minStories` clusters *started* on that Dhaka day
 * and pass the visibility rule (the caller applies that filter), and never for
 * future-dated rows, which the daily page rejects with a 404.
 */
export function groupBriefingDays(
  rows: ReadonlyArray<{ firstPublishedAt: Date; lastPublishedAt: Date }>,
  options: { minStories?: number; today?: string } = {},
): DailySitemapEntry[] {
  const minStories = options.minStories ?? DAILY_MIN_STORIES;
  const today = options.today ?? dhakaDateKey();

  const days = new Map<string, { count: number; lastModified: Date }>();
  for (const row of rows) {
    const date = dhakaDateKey(row.firstPublishedAt);
    if (date > today) continue;

    const existing = days.get(date);
    if (existing) {
      existing.count += 1;
      if (row.lastPublishedAt > existing.lastModified) {
        existing.lastModified = row.lastPublishedAt;
      }
    } else {
      days.set(date, { count: 1, lastModified: row.lastPublishedAt });
    }
  }

  return Array.from(days.entries())
    .filter(([, day]) => day.count >= minStories)
    .map(([date, day]) => ({ date, lastModified: day.lastModified }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * Dates in the retention window whose `/daily/[date]` page is indexable.
 * One query; the grouping itself lives in the pure `groupBriefingDays`.
 */
export const listIndexableDailyDates = cache(
  async (
    maxDays = INGEST_CONFIG.retentionDays,
  ): Promise<DailySitemapEntry[]> => {
    const supabase = getSupabasePublic();
    if (!supabase) return [];

    // Match the daily page's own retention rule: the oldest allowed day key is
    // `today - maxDays`, and briefings start at Dhaka midnight.
    const oldestKey = shiftDateKey(dhakaDateKey(), -maxDays);
    const oldest = parseDhakaDateKey(oldestKey);
    if (!oldest) return [];

    const { data, error } = await supabase
      .from("clusters")
      .select("first_published_at,last_published_at")
      .gte("first_published_at", oldest.toISOString())
      .lte("first_published_at", new Date().toISOString())
      .or(
        `distinct_source_count.gte.2,trust_weight_sum.gte.${INGEST_CONFIG.visibleSingleSourceTrust}`,
      )
      .order("first_published_at", { ascending: true })
      .limit(1_000);

    if (error) {
      console.error("[data] could not list daily briefing dates:", error.message);
      return [];
    }

    const rows = (
      (data ?? []) as Array<{
        first_published_at: string;
        last_published_at: string;
      }>
    ).map((row) => ({
      firstPublishedAt: new Date(row.first_published_at),
      lastPublishedAt: new Date(row.last_published_at),
    }));

    return groupBriefingDays(rows, { today: dhakaDateKey() });
  },
);
