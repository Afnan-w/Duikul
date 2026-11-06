/*
  Tests for lib/rank.ts (grouping + scoring).
  Run with:  node scripts/test-group.mjs
  Imports the real TypeScript module (Node 24 strips the types).
*/

import {
  groupStories,
  rankStories,
  scoreStory,
  tokensOf,
} from "../lib/rank.ts";

let id = 0;
function story(overrides) {
  id += 1;
  const title = overrides.title ?? `Story ${id}`;
  return {
    slug: `slug-${id}`,
    section: overrides.section ?? "bideshi",
    category: overrides.category ?? "general",
    bn: { title, excerpt: "excerpt" },
    en: { title, excerpt: "excerpt" },
    outlets: overrides.outlets ?? [{ name: `Outlet ${id}`, url: `https://x.test/${id}` }],
    publishedAt:
      overrides.publishedAt ?? new Date(Date.now() - id * 60_000).toISOString(),
    imageUrl: overrides.imageUrl,
    imageCredit: overrides.imageCredit,
    sourceId: `src-${id}`,
    trust: overrides.trust ?? 2,
  };
}

const results = [];
function check(label, condition, detail = "") {
  results.push({ label, ok: !!condition, detail });
}

/* ---------- tokens ---------- */

check(
  "tokens: English plural normalised (elections == election)",
  tokensOf("US midterm elections day").has("election") &&
    tokensOf("Polls open on election night").has("election")
);
check(
  "tokens: stopwords removed",
  !tokensOf("the deal of the century").has("the") &&
    tokensOf("the deal of the century").has("deal")
);
check(
  "tokens: apostrophes split words (Trump's -> trump)",
  tokensOf("Trump's final appeal").has("trump")
);

/* ---------- grouping ---------- */

// 1. Same event, two outlets, different wording -> one story, two sources.
const g1 = groupStories([
  story({
    title: "US midterm elections: Voting gets underway",
    outlets: [{ name: "BBC", url: "https://bbc.test/1" }],
  }),
  story({
    title: "Polls open in closely contested US midterm elections 2026",
    outlets: [{ name: "Guardian", url: "https://guardian.test/1" }],
  }),
]);
check("group: 2 outlets reporting one event merge", g1.length === 1, `got ${g1.length}`);
check(
  "group: both outlet links kept",
  g1[0]?.outlets.length === 2,
  `outlets=${g1[0]?.outlets.length}`
);

// 2. Clearly different events stay apart.
const g2 = groupStories([
  story({
    title: "UK and EU agree draft deal to scrap Brexit red tape",
    outlets: [{ name: "BBC", url: "https://bbc.test/2" }],
  }),
  story({
    title: "Zelenskyy arrives in Berlin for talks with Merz on air defense",
    outlets: [{ name: "Guardian", url: "https://guardian.test/2" }],
  }),
]);
check("group: different events stay separate", g2.length === 2, `got ${g2.length}`);

// 3. Same headline in different sections never merges.
const g3 = groupStories([
  story({
    title: "Asian Cup postponed due to Middle East conflict",
    section: "deshi",
    outlets: [{ name: "Prothom Alo", url: "https://pa.test/3" }],
  }),
  story({
    title: "Asian Cup postponed due to Middle East conflict",
    section: "bideshi",
    outlets: [{ name: "BBC", url: "https://bbc.test/3" }],
  }),
]);
check("group: deshi and bideshi never merge", g3.length === 2, `got ${g3.length}`);

// 4. Same headline, but 20 hours apart -> not the same news cycle.
const g4 = groupStories([
  story({
    title: "Dengue deaths rise sharply across the country",
    publishedAt: new Date(Date.now() - 1 * 3600_000).toISOString(),
    outlets: [{ name: "Daily Star", url: "https://ds.test/4a" }],
  }),
  story({
    title: "Dengue deaths rise sharply across the country",
    publishedAt: new Date(Date.now() - 20 * 3600_000).toISOString(),
    outlets: [{ name: "TBS", url: "https://tbs.test/4b" }],
  }),
]);
check("group: stories 20h apart do not merge", g4.length === 2, `got ${g4.length}`);

// 5. Three outlets -> one story, 3 sources, majority category wins.
const g5 = groupStories([
  story({
    title: "Nahida to lead B'desh in Women's Emerging Nations Trophy",
    category: "sports",
    outlets: [{ name: "Daily Star", url: "https://ds.test/5" }],
  }),
  story({
    title: "Nahida Akter named captain for Women's Emerging Nations Trophy",
    category: "sports",
    outlets: [{ name: "TBS", url: "https://tbs.test/5" }],
  }),
  story({
    title: "Nahida to lead B'desh in Emerging Nations Trophy",
    category: "general",
    outlets: [{ name: "Observer", url: "https://obs.test/5" }],
  }),
]);
check("group: 3 outlets merge into 1 story", g5.length === 1, `got ${g5.length}`);
check(
  "group: badge would say 3 outlets",
  g5[0]?.outlets.length === 3,
  `outlets=${g5[0]?.outlets.length}`
);
check(
  "group: majority category wins (sports 2:1)",
  g5[0]?.category === "sports",
  `category=${g5[0]?.category}`
);

// 6. The same outlet publishing twice counts once.
const g6 = groupStories([
  story({
    title: "Bank Asia organises eye check-up programme for employees",
    outlets: [{ name: "Daily Star", url: "https://ds.test/6a" }],
  }),
  story({
    title: "Bank Asia holds eye check-up programme for staff",
    outlets: [{ name: "Daily Star", url: "https://ds.test/6b" }],
  }),
]);
check(
  "group: same outlet listed only once",
  g6.length === 1 && g6[0]?.outlets.length === 1,
  `groups=${g6.length} outlets=${g6[0]?.outlets.length}`
);

// 7. Vague one-word headlines are left alone.
const g7 = groupStories([
  story({ title: "Breaking", outlets: [{ name: "A", url: "https://a.test/7" }] }),
  story({ title: "Breaking news update", outlets: [{ name: "B", url: "https://b.test/7" }] }),
]);
check("group: vague short headlines stay separate", g7.length === 2, `got ${g7.length}`);

/* ---------- scoring ---------- */

const now = Date.now();
const one = story({
  title: "Single source story",
  outlets: [{ name: "A", url: "https://a.test/s1" }],
  trust: 2,
  publishedAt: new Date(now - 3600_000).toISOString(),
});
const three = {
  ...one,
  outlets: [
    { name: "A", url: "https://a.test/s1" },
    { name: "B", url: "https://b.test/s1" },
    { name: "C", url: "https://c.test/s1" },
  ],
};
const older = { ...one, publishedAt: new Date(now - 23 * 3600_000).toISOString() };
const trusted = { ...one, trust: 3 };

check(
  "score: more outlets = higher",
  scoreStory(three, now) > scoreStory(one, now),
  `${scoreStory(three, now)} vs ${scoreStory(one, now)}`
);
check(
  "score: newer = higher",
  scoreStory(one, now) > scoreStory(older, now),
  `${scoreStory(one, now)} vs ${scoreStory(older, now)}`
);
check(
  "score: more trusted = higher",
  scoreStory(trusted, now) > scoreStory(one, now),
  `${scoreStory(trusted, now)} vs ${scoreStory(one, now)}`
);
check("score: stays within the documented range", scoreStory(three, now) <= 145);
const veryOldMulti = {
  ...three,
  publishedAt: new Date(now - 72 * 3600_000).toISOString(),
};
check(
  "score: 3-day-old headline sinks so fresh news can outrank it",
  scoreStory(veryOldMulti, now) < scoreStory(one, now),
  `${scoreStory(veryOldMulti, now)} vs ${scoreStory(one, now)}`
);

const ranked = rankStories([older, three, one]);
check(
  "rank: multi-outlet fresh story comes first",
  ranked[0].outlets.length === 3,
  `first has ${ranked[0].outlets.length} outlets`
);

/* ---------- report ---------- */

let failed = 0;
for (const r of results) {
  if (!r.ok) failed++;
  console.log(`${r.ok ? "OK  " : "FAIL"} | ${r.label}${r.ok ? "" : `  (${r.detail})`}`);
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
