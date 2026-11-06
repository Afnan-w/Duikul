/*
  ============================================================
  FEED CHECKER  (a tool for you, not part of the website)
  ============================================================
  Run it with:   node scripts/check-feeds.mjs
  It downloads every candidate RSS address, tells you which ones
  work, how many stories they have, and shows one example headline.
  Use it any time you add or change a source in sources.ts.
*/

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

/* Each outlet may have several possible addresses - we test them all. */
const CANDIDATES = {
  "Prothom Alo": [
    "https://www.prothomalo.com/feed",
    "https://www.prothomalo.com/rss",
  ],
  "The Daily Star": [
    "https://www.thedailystar.net/rss/thedailystar.xml",
    "https://www.thedailystar.net/feed",
    "https://www.thedailystar.net/arc/outboundfeeds/rss/",
  ],
  "bdnews24": [
    "https://bdnews24.com/feed",
    "https://www.bdnews24.com/feed",
    "https://bdnews24.com/articles",
  ],
  "Dhaka Tribune": ["https://www.dhakatribune.com/feed"],
  "The Business Standard": [
    "https://tbsnews.net/rss",
    "https://tbsnews.net/feed",
  ],
  "New Age": [
    "https://www.newagebd.net/feed",
    "https://www.newagebd.net/rss",
  ],
  "Financial Express BD": [
    "https://thefinancialexpress.com.bd/rss",
    "https://thefinancialexpress.com.bd/feed",
    "https://thefinancialexpress.com.bd/rss/all.xml",
  ],
  Jugantor: [
    "https://www.jugantor.com/feed",
    "https://www.jugantor.com/rss",
  ],
  "Kaler Kantho": [
    "https://www.kalerkantho.com/feed",
    "https://www.kalerkantho.com/rss",
  ],
  "BBC News": ["https://feeds.bbci.co.uk/news/rss.xml"],
  "Al Jazeera": [
    "https://www.aljazeera.com/xml/rss/all.xml",
    "https://www.aljazeera.com/feed/all.xml",
  ],
  "The Guardian": [
    "https://www.theguardian.com/world/rss",
    "https://www.theguardian.com/rss/editorial/uk/rss.xml",
  ],
  NPR: ["https://feeds.npr.org/1001/rss.xml"],
  DW: [
    "https://rss.dw.com/rdf/rss-en",
    "https://rss.dw.com/xml/rss-en",
  ],
  "France 24": [
    "https://www.france24.com/en/rss",
    "https://www.france24.com/en/rss/latest",
  ],
  /* Optional extras */
  "Google News - Bangladesh": [
    "https://news.google.com/rss/search?q=Bangladesh&hl=en-US&gl=US&ceid=US:en",
  ],
};

function countItems(xml) {
  return (xml.match(/<item[\s>]/g) || []).length;
}

function firstTitle(xml) {
  const m = xml.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
  if (!m) return "(no title)";
  return m[1].replace(/\s+/g, " ").trim().slice(0, 90);
}

function looksLikeRss(xml) {
  return (
    xml.includes("<rss") ||
    xml.includes("<feed") ||
    xml.includes("<rdf:RDF") ||
    xml.includes("<channel")
  );
}

async function testOne(url) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(20000),
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
    });
    if (!res.ok) return { ok: false, why: `HTTP ${res.status}` };
    const xml = await res.text();
    if (!looksLikeRss(xml)) return { ok: false, why: "not a feed (HTML?)" };
    const items = countItems(xml);
    return { ok: true, items, title: firstTitle(xml) };
  } catch (error) {
    return { ok: false, why: String(error && error.message ? error.message : error).slice(0, 60) };
  }
}

const results = [];

for (const [name, urls] of Object.entries(CANDIDATES)) {
  const row = { name, working: [], failed: [] };
  for (const url of urls) {
    const r = await testOne(url);
    if (r.ok) row.working.push({ url, ...r });
    else row.failed.push({ url, why: r.why });
  }
  results.push(row);
}

/* ---------- Print a readable report ---------- */
let line = "";
const out = [];
out.push("");
out.push("===========================================================");
out.push(" FEED CHECK REPORT");
out.push("===========================================================");

for (const row of results) {
  out.push("");
  out.push(`### ${row.name}`);
  if (row.working.length > 0) {
    const best = row.working.sort((a, b) => b.items - a.items)[0];
    out.push(`  ✔ WORKING : ${best.url}`);
    out.push(`             ${best.items} stories | first: ${best.title}`);
    for (const extra of row.working.filter((w) => w.url !== best.url)) {
      out.push(`  ✔ also ok : ${extra.url} (${extra.items} stories)`);
    }
  } else {
    out.push("  ✘ NONE WORKED");
  }
  for (const f of row.failed) out.push(`  ✘ failed  : ${f.url} -> ${f.why}`);
}

out.push("");
out.push("===========================================================");
out.push(" SUMMARY");
out.push("===========================================================");
const good = results.filter((r) => r.working.length > 0).length;
out.push(`  Working outlets : ${good} / ${results.length}`);
out.push(`  Broken outlets  : ${results.length - good}`);
out.push("");

const report = out.join("\n");
console.log(report);

/* Also save it so it is easy to copy. */
const reportPath = join(root, "feed-report.txt");
await writeFileSafe(reportPath, report + "\n");
console.log(`Report saved to: ${reportPath}`);

async function writeFileSafe(path, contents) {
  const { writeFile } = await import("node:fs/promises");
  await writeFile(path, contents, "utf8");
}

/* Silence unused import warning if any */
void readFile;
