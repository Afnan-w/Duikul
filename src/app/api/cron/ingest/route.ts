import { isAuthorizedCronRequest } from "@/lib/cron/auth";
import { runIngest } from "@/lib/ingest/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const NO_STORE = { "Cache-Control": "no-store" };

/**
 * Protected ingest trigger.
 *
 * Callers:
 *  - Vercel Cron (daily fallback), which sends `Authorization: Bearer $CRON_SECRET`
 *    automatically when the environment variable is set.
 *  - The GitHub Action in `.github/workflows/ingest.yml` (every 30 minutes).
 *
 * The route is a GET so both schedulers can call it with a simple request.
 * It never runs without a configured secret.
 */
export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return Response.json(
      { ok: false, error: "CRON_SECRET is not configured." },
      { status: 500, headers: NO_STORE },
    );
  }

  if (!isAuthorizedCronRequest(request.headers.get("authorization"), secret)) {
    return Response.json(
      { ok: false, error: "Unauthorized." },
      {
        status: 401,
        headers: { ...NO_STORE, "WWW-Authenticate": "Bearer" },
      },
    );
  }

  const started = Date.now();
  try {
    const summary = await runIngest({
      log: (message) => console.log(`[cron] ${message}`),
    });

    const failedSources = summary.sources
      .filter((source) => !source.ok)
      .map((source) => ({ id: source.id, error: source.error ?? "unknown error" }));

    console.log(
      `[cron] finished in ${Date.now() - started}ms: ` +
        `${summary.articlesInserted} inserted, ${summary.clustersCreated} new clusters, ` +
        `${failedSources.length} failed source(s).`,
    );

    return Response.json(
      {
        ok: true,
        durationMs: Date.now() - started,
        fetchedItems: summary.fetchedItems,
        acceptedArticles: summary.acceptedArticles,
        articlesInserted: summary.articlesInserted,
        clustersCreated: summary.clustersCreated,
        clustersUpdated: summary.clustersUpdated,
        cleanedArticles: summary.cleanedArticles,
        cleanedClusters: summary.cleanedClusters,
        failedSources,
      },
      { headers: NO_STORE },
    );
  } catch (error) {
    console.error("[cron] ingest failed", error);
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Ingest failed.",
      },
      { status: 500, headers: NO_STORE },
    );
  }
}
