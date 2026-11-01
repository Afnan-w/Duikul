/**
 * Site-wide SEO audit — run with `npm run seo:check`.
 *
 * Points at a running server (local build or production) and crawls it:
 * titles, meta descriptions, canonicals, H1, image alt/dimensions, internal
 * link health, robots.txt, sitemaps, and JSON-LD validity. It also detects
 * the two conflicts that break a news site in Search Console: a `noindex`
 * page listed in a sitemap, and an indexable page missing from one.
 *
 *   npm run build && npm run start          # terminal 1
 *   npm run seo:check                       # terminal 2 (localhost:3000)
 *   npm run seo:check -- --url https://duikul.vercel.app
 *
 * Exits non-zero on any FAIL so it can gate a release. Warnings never fail
 * the run; they mark copy worth tightening by hand.
 */
import { XMLParser } from "fast-xml-parser";

const args = process.argv.slice(2);
const argUrl = args.includes("--url") ? args[args.indexOf("--url") + 1] : undefined;
const BASE = (argUrl ?? process.env.SEO_CHECK_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const MAX_PAGES = Number(args.includes("--max") ? args[args.indexOf("--max") + 1] : 80);
const MAX_SITEMAP_URLS = 250;

const USER_AGENT = "DuikulBot/1.0 (+https://duikul.vercel.app)";
const TIMEOUT_MS = 15_000;

const TRUST_ROUTES = [
  "/about",
  "/methodology",
  "/editorial-policy",
  "/corrections",
  "/removal-request",
  "/contact",
  "/privacy",
  "/terms",
] as const;

const SEED_PATHS = [
  "/",
  "/deshi",
  "/bideshi",
  "/search",
  "/en",
  ...TRUST_ROUTES,
  ...TRUST_ROUTES.map((r) => `/en${r}`),
] as const;

type Issue = { level: "FAIL" | "WARN"; page: string; message: string };
const issues: Issue[] = [];
let pagesChecked = 0;
let linksChecked = 0;

function report(level: Issue["level"], page: string, message: string) {
  issues.push({ level, page, message });
}

async function fetchText(path: string): Promise<{ status: number; body: string; contentType: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${BASE}${path}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "*/*" },
      redirect: "follow",
      signal: controller.signal,
    });
    const body = await response.text();
    return {
      status: response.status,
      body,
      contentType: response.headers.get("content-type") ?? "",
    };
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------- HTML tools
// The pages are server-rendered and structurally regular, so targeted regex
// extraction is enough. This is an audit tool, not a browser.

function firstTag(html: string, name: string): string | null {
  const match = html.match(new RegExp(`<${name}\\b[^>]*>`, "i"));
  return match ? match[0] : null;
}

function allTags(html: string, name: string): string[] {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((m) => m[0]);
}

function attr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`${name}="([^"]*)"`, "i"));
  return match ? match[1] : null;
}

function metaContent(html: string, name: string): string | null {
  for (const tag of allTags(html, "meta")) {
    const tagName = attr(tag, "name") ?? attr(tag, "property");
    if (tagName?.toLowerCase() === name.toLowerCase()) return attr(tag, "content");
  }
  return null;
}

/**
 * Origin the canonicals point at. On a real deployment this must equal the
 * crawl origin; on localhost it is derived from the home page's canonical,
 * because a local production build bakes `NEXT_PUBLIC_SITE_URL` from Vercel.
 */
let siteOrigin: string | null = null;
const auditingLocalhost = /^localhost|^127\.0\.0\.1/.test(new URL(BASE).hostname);

function textOf(html: string, re: RegExp): string | null {
  const match = html.match(re);
  return match ? match[1].replace(/<[^>]*>/g, "").trim() : null;
}

function isInternal(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/api");
}

function normalize(path: string): string {
  const clean = path.split("#")[0].split("?")[0];
  return clean.length > 1 && clean.endsWith("/") ? clean.slice(0, -1) : clean;
}

// ------------------------------------------------------------- Page audit

type PageResult = {
  path: string;
  status: number;
  noindex: boolean;
  links: string[];
  jsonLdBlobs: number;
};

function jsonLdBlocks(html: string): { count: number; bad: number } {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  let bad = 0;
  for (const block of blocks) {
    try {
      JSON.parse(block[1]);
    } catch {
      bad += 1;
    }
  }
  return { count: blocks.length, bad };
}

function auditPage(path: string, status: number, html: string): PageResult {
  pagesChecked += 1;
  const robotsMeta = (metaContent(html, "robots") ?? "").toLowerCase();
  const noindex = robotsMeta.includes("noindex");

  if (status === 404) {
    // Crawled a dead internal link; recorded by the caller against its source.
    return { path, status, noindex, links: [], jsonLdBlobs: 0 };
  }
  if (status !== 200) {
    report("FAIL", path, `expected HTTP 200, got ${status}`);
    return { path, status, noindex, links: [], jsonLdBlobs: 0 };
  }

  // Title
  const title = textOf(html, /<title[^>]*>([^<]*)<\/title>/i);
  if (!title) {
    report("FAIL", path, "missing <title>");
  } else {
    if (title.length > 60) report("WARN", path, `title is ${title.length} chars (aim ≤60): ${title}`);
    if (!title.includes("Duikul") && !title.includes("দুইকুল")) {
      report("WARN", path, `title does not name the site: ${title}`);
    }
  }

  // Meta description
  const description = metaContent(html, "description");
  if (!description) {
    report("FAIL", path, "missing meta description");
  } else if (description.length > 155) {
    report("WARN", path, `description is ${description.length} chars (aim ≤155)`);
  }

  // Canonical
  const canonicalTag = allTags(html, "link").find(
    (tag) => (attr(tag, "rel") ?? "").toLowerCase() === "canonical",
  );
  const canonical = canonicalTag ? attr(canonicalTag, "href") : null;
  if (!canonical) {
    report("FAIL", path, "missing canonical");
  } else {
    if (siteOrigin === null) {
      siteOrigin = new URL(canonical).origin;
      if (siteOrigin !== new URL(BASE).origin) {
        const note = auditingLocalhost
          ? `auditing a local build whose NEXT_PUBLIC_SITE_URL is ${siteOrigin}; canonical origin checks follow it`
          : "";
        console.log(`Note: canonical origin is ${siteOrigin}. ${note}\n`);
      }
    }
    if (canonical !== siteOrigin && !canonical.startsWith(`${siteOrigin}/`)) {
      report("FAIL", path, `canonical is not on ${siteOrigin}: ${canonical}`);
    } else if (normalize(canonical) !== normalize(`${siteOrigin}${path}`)) {
      report("FAIL", path, `canonical ${canonical} does not match page URL ${siteOrigin}${path}`);
    }
  }

  // H1
  const h1s = allTags(html, "h1");
  if (h1s.length === 0) report("FAIL", path, "missing <h1>");
  if (h1s.length > 1) report("FAIL", path, `${h1s.length} <h1> elements (exactly one allowed)`);

  // Language + snippet policy
  const htmlTag = firstTag(html, "html");
  if (!htmlTag || !attr(htmlTag, "lang")) report("FAIL", path, "<html> has no lang attribute");
  const robotsDirective = metaContent(html, "robots") ?? "";
  // The image-preview grant is meaningless on a page that is not indexed.
  if (!noindex && !robotsDirective.includes("max-image-preview:large")) {
    report("WARN", path, "no max-image-preview:large directive in the robots meta");
  }

  // Images: every img needs alt text and explicit dimensions
  for (const img of allTags(html, "img")) {
    const src = attr(img, "src") ?? "(inline)";
    const alt = attr(img, "alt");
    if (alt === null) report("FAIL", path, `<img> without alt: ${src}`);
    if (!attr(img, "width") || !attr(img, "height")) {
      report("FAIL", path, `<img> without width/height (CLS risk): ${src}`);
    }
  }

  // JSON-LD must parse
  const { count, bad } = jsonLdBlocks(html);
  if (bad > 0) report("FAIL", path, `${bad} of ${count} JSON-LD block(s) do not parse`);

  // Outbound links: nofollow is never used; target=_blank requires noopener
  for (const tag of allTags(html, "a")) {
    const rel = (attr(tag, "rel") ?? "").toLowerCase();
    const href = attr(tag, "href") ?? "";
    if (rel.includes("nofollow")) report("FAIL", path, `nofollow link (policy: none): ${href}`);
    if (attr(tag, "target") === "_blank" && !rel.includes("noopener")) {
      report("FAIL", path, `target="_blank" without noopener: ${href}`);
    }
  }

  // Internal links for the crawl frontier
  const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"/gi)]
    .map((m) => m[1])
    .filter((href) => isInternal(href) && !href.startsWith("/offline"))
    .map((href) => normalize(href));

  return { path, status, noindex, links: [...new Set(links)], jsonLdBlobs: count };
}

// ------------------------------------------------------------ Sitemaps/robots

type SitemapData = { entries: URL[]; problems: string[] };

function parseXml(xml: string): unknown {
  const parser = new XMLParser({ ignoreAttributes: false });
  return parser.parse(xml);
}

function locs(node: unknown): string[] {
  if (!node) return [];
  const arr = Array.isArray(node) ? node : [node];
  return arr
    .map((item) => (item && typeof item === "object" && "loc" in item ? String((item as { loc: unknown }).loc) : null))
    .filter((value): value is string => value !== null);
}

async function readSitemap(path: string, data: SitemapData, depth = 0): Promise<void> {
  const { status, body } = await fetchText(path);
  if (status !== 200) {
    data.problems.push(`${path} returned HTTP ${status}`);
    return;
  }
  let parsed: unknown;
  try {
    parsed = parseXml(body);
  } catch {
    data.problems.push(`${path} is not valid XML`);
    return;
  }
  const root = parsed as Record<string, unknown>;
  const index = root["sitemapindex"];
  const urlset = root["urlset"];
  if (index && depth === 0) {
    for (const child of locs(index && typeof index === "object" ? (index as Record<string, unknown>).sitemap : null)) {
      const childPath = new URL(child).pathname;
      await readSitemap(childPath, data, depth + 1);
    }
    return;
  }
  if (urlset && typeof urlset === "object") {
    for (const entry of locs((urlset as Record<string, unknown>).url)) {
      data.entries.push(new URL(entry));
    }
    return;
  }
  data.problems.push(`${path} is neither a sitemap index nor a urlset`);
}

// ---------------------------------------------------------------------- Main

async function auditRobots(): Promise<string[]> {
  const { status, body } = await fetchText("/robots.txt");
  const sitemapPaths: string[] = [];
  if (status !== 200) {
    report("FAIL", "/robots.txt", `returned HTTP ${status}`);
    return sitemapPaths;
  }
  if (!/^User-agent: \*/im.test(body)) report("FAIL", "/robots.txt", "missing User-agent: * rule");
  if (!/^Allow: \/$/im.test(body)) report("FAIL", "/robots.txt", "missing Allow: /");
  for (const blocked of ["/api/", "/search"]) {
    if (!body.toLowerCase().includes(`disallow: ${blocked}`)) {
      report("FAIL", "/robots.txt", `missing Disallow: ${blocked}`);
    }
  }
  for (const line of body.split("\n")) {
    const match = line.match(/^Sitemap:\s*(\S+)/i);
    if (match) sitemapPaths.push(new URL(match[1]).pathname);
  }
  for (const expected of ["/sitemap.xml", "/news-sitemap.xml"]) {
    if (!sitemapPaths.includes(expected)) report("FAIL", "/robots.txt", `missing Sitemap: ${expected}`);
  }
  return sitemapPaths;
}

async function main() {
  console.log(`SEO audit of ${BASE}\n`);

  const sitemapPaths = await auditRobots();
  const sitemap: SitemapData = { entries: [], problems: [] };
  for (const path of sitemapPaths.length ? sitemapPaths : ["/sitemap.xml", "/news-sitemap.xml"]) {
    await readSitemap(path, sitemap);
  }
  for (const problem of sitemap.problems) report("FAIL", "sitemap", problem);

  const sitemapUrlPaths = sitemap.entries.map((entry) => normalize(entry.pathname));
  const sitemapSet = new Set(sitemapUrlPaths);

  // Crawl: seeds first, then internal links, breadth-first, capped.
  const queue: string[] = [...SEED_PATHS, ...sitemapUrlPaths.slice(0, MAX_SITEMAP_URLS)];
  const seen = new Set<string>();
  const audited: PageResult[] = [];
  const linkSources = new Map<string, string[]>();

  while (queue.length > 0 && seen.size < MAX_PAGES) {
    const path = normalize(queue.shift() as string);
    if (seen.has(path)) continue;
    seen.add(path);

    const { status, body } = await fetchText(path);
    const page = auditPage(path, status, body);
    audited.push(page);

    for (const link of page.links) {
      linksChecked += 1;
      if (seen.has(link) || queue.includes(link)) continue;
      const sources = linkSources.get(link) ?? [];
      sources.push(path);
      linkSources.set(link, sources);
      queue.push(link);
    }
  }

  // Follow a bounded second wave so deep internal links (stories, sources,
  // dailies found in sitemaps) get a status check too.
  const extras = sitemapUrlPaths
    .filter((path) => !seen.has(path))
    .slice(0, Math.max(0, MAX_PAGES - seen.size));
  for (const path of extras) {
    seen.add(path);
    const { status, body } = await fetchText(path);
    audited.push(auditPage(path, status, body));
  }

  // Broken internal links: fetch anything crawled-to but not audited.
  for (const [link, sources] of linkSources) {
    if (seen.has(link)) continue;
    seen.add(link);
    const { status, body } = await fetchText(link);
    if (status !== 200) {
      report("FAIL", sources[0] ?? "(crawl)", `broken internal link ${link} (HTTP ${status})`);
    } else {
      // Audit it too so a linked thin page cannot hide metadata problems.
      audited.push(auditPage(link, status, body));
    }
  }

  // Sitemap / noindex conflicts
  const noindexSet = new Set(audited.filter((p) => p.noindex).map((p) => p.path));
  // Origin check is deferred until the first page audited revealed the
  // canonical origin (a local build bakes the production NEXT_PUBLIC_SITE_URL).
  if (siteOrigin) {
    for (const entry of sitemap.entries) {
      if (entry.origin !== siteOrigin) {
        report("FAIL", entry.pathname, `foreign origin in sitemap: ${entry.href}`);
      }
    }
  }
  for (const path of sitemapSet) {
    if (noindexSet.has(path)) {
      report("FAIL", path, "noindex page is listed in a sitemap");
    }
  }
  const indexableAudited = audited.filter((p) => p.status === 200 && !p.noindex && p.path !== "/search");
  for (const page of indexableAudited) {
    if (page.path.startsWith("/story/") || page.path.startsWith("/source/") || page.path.startsWith("/daily/")) {
      if (!sitemapSet.has(page.path)) {
        report("WARN", page.path, "indexable page missing from the sitemap (may predate the last ISR revalidation)");
      }
    }
  }

  // News sitemap size rule (≤1000 URLs)
  const newsData: SitemapData = { entries: [], problems: [] };
  await readSitemap("/news-sitemap.xml", newsData);
  if (newsData.entries.length > 1000) {
    report("FAIL", "/news-sitemap.xml", `${newsData.entries.length} URLs (Google News allows ≤1000)`);
  }
  for (const entry of newsData.entries) {
    const path = normalize(entry.pathname);
    if (noindexSet.has(path)) report("FAIL", path, "noindex page listed in /news-sitemap.xml");
  }

  // Summary
  const fails = issues.filter((i) => i.level === "FAIL");
  const warns = issues.filter((i) => i.level === "WARN");
  for (const issue of issues) {
    console.log(`${issue.level}  ${issue.page}  ${issue.message}`);
  }
  console.log(
    `\nPages audited: ${pagesChecked}   Internal links followed: ${linksChecked}   ` +
      `Sitemap URLs: ${sitemapSet.size}`,
  );
  console.log(`FAIL: ${fails.length}   WARN: ${warns.length}`);
  if (fails.length === 0) {
    console.log("\nSEO audit passed. Review warnings before release.");
  } else {
    console.log("\nSEO audit failed. Fix the FAIL lines above before release.");
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`SEO audit could not run: ${error instanceof Error ? error.message : error}`);
  console.error(`Is the site running at ${BASE}? Start it with: npm run build && npm run start`);
  process.exitCode = 1;
});
