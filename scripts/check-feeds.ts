/**
 * Feed health check — run with `npm run check:feeds`.
 *
 * Fetches every whitelisted feed, reports HTTP status, latency and item counts,
 * and flags DEAD / EMPTY / STALE sources. Dead or empty feeds make the command
 * exit non-zero so they are removed from `src/config/sources.ts`.
 */
import Parser from "rss-parser";
import { SOURCES, type NewsSource } from "../src/config/sources";

const USER_AGENT =
  "DuikulBot/1.0 (+https://duikul.vercel.app)";
const TIMEOUT_MS = 12_000;
const RECENT_HOURS = 48;

type Verdict = "LIVE" | "STALE" | "EMPTY" | "DEAD";

type FeedResult = {
  source: NewsSource;
  status: string;
  latencyMs: number;
  items: number;
  recent: number;
  latest: string;
  verdict: Verdict;
  error?: string;
};

const parser = new Parser({
  timeout: TIMEOUT_MS,
  headers: {
    "User-Agent": USER_AGENT,
    Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
  },
});

function pad(value: string, width: number): string {
  return value.length >= width ? value : value.padEnd(width);
}

function dateLabel(date: Date | undefined): string {
  if (!date || Number.isNaN(date.getTime())) return "—";
  return date.toISOString().slice(0, 16).replace("T", " ");
}

function parseDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

async function check(source: NewsSource): Promise<FeedResult> {
  const started = Date.now();

  try {
    const response = await fetch(source.rssUrl, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    const body = await response.text();
    const latencyMs = Date.now() - started;

    if (!response.ok) {
      return {
        source,
        status: String(response.status),
        latencyMs,
        items: 0,
        recent: 0,
        latest: "—",
        verdict: "DEAD",
        error: `HTTP ${response.status}`,
      };
    }

    let feed;
    try {
      feed = await parser.parseString(body);
    } catch {
      return {
        source,
        status: `${response.status} (not XML)`,
        latencyMs,
        items: 0,
        recent: 0,
        latest: "—",
        verdict: "DEAD",
        error: "Response was not a parseable RSS/Atom feed",
      };
    }

    const items = feed.items?.length ?? 0;
    const dates = (feed.items ?? [])
      .map((item) => parseDate(item.isoDate ?? item.pubDate))
      .filter((date): date is Date => Boolean(date));
    const newest = dates.sort((a, b) => b.getTime() - a.getTime())[0];
    const cutoff = Date.now() - RECENT_HOURS * 60 * 60 * 1000;
    const recent = dates.filter((date) => date.getTime() >= cutoff).length;

    let verdict: Verdict = "LIVE";
    if (items === 0) verdict = "EMPTY";
    else if (dates.length > 0 && newest && newest.getTime() < cutoff - 5 * 24 * 60 * 60 * 1000) {
      verdict = "STALE";
    }

    return {
      source,
      status: String(response.status),
      latencyMs,
      items,
      recent,
      latest: dateLabel(newest),
      verdict,
    };
  } catch (error) {
    return {
      source,
      status: "ERR",
      latencyMs: Date.now() - started,
      items: 0,
      recent: 0,
      latest: "—",
      verdict: "DEAD",
      error:
        error instanceof Error
          ? `${error.name}: ${error.message}`.slice(0, 100)
          : "Unknown error",
    };
  }
}

async function main() {
  const ids = new Set<string>();
  const urls = new Set<string>();
  for (const source of SOURCES) {
    if (ids.has(source.id)) throw new Error(`Duplicate source id: ${source.id}`);
    if (urls.has(source.rssUrl)) {
      throw new Error(`Duplicate feed URL: ${source.rssUrl}`);
    }
    ids.add(source.id);
    urls.add(source.rssUrl);
  }

  console.log(`\nDuikul feed check — ${SOURCES.length} sources`);
  console.log(`User-Agent: ${USER_AGENT}\n`);

  const results = await Promise.all(SOURCES.map(check));
  results.sort((a, b) =>
    a.source.category === b.source.category
      ? a.source.id.localeCompare(b.source.id)
      : a.source.category.localeCompare(b.source.category),
  );

  console.log(
    `${pad("CATEGORY", 9)} ${pad("SOURCE", 22)} ${pad("STATUS", 5)} ${pad(
      "ITEMS",
      5,
    )} ${pad("48H", 4)} ${pad("LATENCY", 8)} ${pad("LATEST (UTC)", 16)} VERDICT`,
  );
  console.log("-".repeat(104));

  for (const result of results) {
    const status = result.status.padEnd(5);
    const verdict = result.error ? `${result.verdict} — ${result.error}` : result.verdict;
    console.log(
      `${pad(result.source.category, 9)} ${pad(result.source.id, 22)} ${status} ${pad(
        String(result.items),
        5,
      )} ${pad(String(result.recent), 4)} ${pad(
        `${result.latencyMs}ms`,
        8,
      )} ${pad(result.latest, 16)} ${verdict}`,
    );
  }

  const failures = results.filter(
    (result) => result.verdict === "DEAD" || result.verdict === "EMPTY",
  );
  const stale = results.filter((result) => result.verdict === "STALE");
  const slow = results.filter((result) => result.latencyMs > 6_000);

  console.log("\nSummary");
  for (const category of ["deshi", "bideshi"] as const) {
    const group = results.filter((result) => result.source.category === category);
    const live = group.filter((result) => result.verdict !== "DEAD" && result.verdict !== "EMPTY");
    console.log(
      `  ${category}: ${live.length}/${group.length} usable, avg ${
        Math.round(group.reduce((sum, result) => sum + result.latencyMs, 0) / group.length)
      }ms`,
    );
  }
  if (stale.length) {
    console.log(`  stale (no items in ${RECENT_HOURS}h, kept): ${stale.map((r) => r.source.id).join(", ")}`);
  }
  if (slow.length) {
    console.log(`  slow (>6s): ${slow.map((r) => r.source.id).join(", ")}`);
  }

  if (failures.length) {
    console.error(
      `\n✗ ${failures.length} feed(s) dead or empty: ${failures
        .map((result) => result.source.id)
        .join(", ")}`,
    );
    console.error("  Remove them from src/config/sources.ts.");
    process.exit(1);
  }

  console.log("\n✓ All feeds returned items.\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
