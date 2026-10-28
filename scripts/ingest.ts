/**
 * Fishing run.
 *
 *   npm run ingest       # fetch feeds → Supabase → recompute scores → clean
 *   npm run ingest:dry   # fetch + cluster in memory, no database, no env
 */
import { runIngest } from "../src/lib/ingest/run";
import type { PreviewCluster } from "../src/lib/ingest/run";

const dryRun = process.argv.includes("--dry");

function pad(value: string, width: number): string {
  return value.length >= width ? value : value.padEnd(width);
}

function printPreview(clusters: PreviewCluster[]): void {
  for (const category of ["deshi", "bideshi"] as const) {
    const visible = clusters
      .filter((cluster) => cluster.category === category && cluster.isVisible)
      .slice(0, 8);

    console.log(
      `\n${category === "deshi" ? "দেশি খবর (deshi)" : "বিদেশি খবর (bideshi)"} — top ${visible.length}`,
    );
    if (visible.length === 0) {
      console.log("  (no visible clusters)");
      continue;
    }

    for (const cluster of visible) {
      const badge = cluster.isConfirmed
        ? `CONFIRMED ${cluster.distinctSourceCount}`
        : `${cluster.distinctSourceCount} source${cluster.distinctSourceCount === 1 ? "" : "s"}`;
      console.log(
        `  [${badge}] [${cluster.language}] ${cluster.title.slice(0, 96)}`,
      );
      console.log(
        `      ${cluster.sourceNames.join(" · ")} | ${cluster.ageHours}h old | score ${cluster.popularScore.toFixed(3)}`,
      );
    }
  }
}

async function main(): Promise<void> {
  const summary = await runIngest({
    dryRun,
    log: (message) => console.log(message),
  });

  console.log("\nSource health");
  console.log(
    `${pad("SOURCE", 24)} ${pad("STATUS", 7)} ${pad("ITEMS", 6)} ${pad("USED", 6)} ${pad("MS", 7)} NOTE`,
  );
  console.log("-".repeat(84));
  for (const source of summary.sources) {
    console.log(
      `${pad(source.id, 24)} ${pad(source.ok ? "OK" : "FAIL", 7)} ${pad(
        String(source.items),
        6,
      )} ${pad(String(source.accepted), 6)} ${pad(
        String(source.durationMs),
        7,
      )} ${source.error ?? ""}`,
    );
  }

  console.log("\nRun summary");
  console.log(`  fetched items:      ${summary.fetchedItems}`);
  console.log(`  accepted articles:  ${summary.acceptedArticles}`);
  console.log(`  duplicates:         ${summary.duplicates}`);
  console.log(`  existing in DB:     ${summary.existingArticles}`);
  console.log(`  articles inserted:  ${summary.articlesInserted}`);
  console.log(
    `  clusters:           ${summary.clustersCreated} created, ${summary.clustersUpdated} refreshed`,
  );
  console.log(
    `  cleaned:            ${summary.cleanedArticles} old articles, ${summary.cleanedClusters} old/empty clusters`,
  );
  console.log(`  duration:           ${summary.durationMs}ms`);

  const rejectedEntries = Object.entries(summary.rejected);
  if (rejectedEntries.length) {
    console.log(
      `  rejected:           ${rejectedEntries
        .map(([reason, count]) => `${reason}=${count}`)
        .join(", ")}`,
    );
  }

  if (dryRun) {
    printPreview(summary.preview);
    console.log(
      "\nDry run only — nothing was written. Set the Supabase env vars and run `npm run ingest` to persist.\n",
    );
  } else {
    console.log("");
  }
}

main().catch((error: unknown) => {
  console.error("\nIngest failed:");
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
