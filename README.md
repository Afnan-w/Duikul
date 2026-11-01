# Duikul

A bilingual, Bengali-first news digest for Bangladesh. Duikul reads a
fixed whitelist of publisher RSS feeds, groups reports about the same event,
marks stories confirmed by independent sources, and sends readers to the
original reporting. It has exactly two editorial sections: **দেশি খবর**
(Bangladesh) and **বিদেশি খবর** (World).

The app is built for the free tier: Next.js on Vercel Hobby, Supabase Postgres,
and a GitHub Action for the 30-minute ingest schedule.

## What is in the box

- Bengali-default UI with an English toggle. Both languages are rendered once
  and switched with `html[data-lang]`; there is no locale route or client
  dictionary download.
- Editorial reading experience with a warm-paper palette, deep green accent,
  hairline rules, and a muted red signal colour.
- A 19-source RSS whitelist (11 Bangladesh, 8 world) with transparent trust
  weights.
- Fetching with an 8-second timeout, two retries, and an honest bot user agent.
- Deterministic headline clustering and source-based confirmation scoring.
- ISR pages (`revalidate = 300`), protected ingest route, daily Vercel cron
  fallback, and a GitHub Action every 30 minutes.
- Search, story pages, methodology, privacy, offline page, 404/error pages.
- SEO metadata, sitemap, robots, and branded Open Graph/Twitter images rendered
  with `next/og`.
- Installable PWA with a service worker, offline fallback, and install prompt.
- Newsletter signup with a honeypot and hashed-IP rate limiting. The app stores
  consent; it does **not** deliver email yet.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript, strict |
| UI | React 19, Tailwind CSS 4, lucide-react |
| Database | Supabase Postgres via `@supabase/supabase-js` |
| Feed parsing | `rss-parser`, with `fast-xml-parser` fallback |
| Tests | Vitest |
| Icons / OG assets | `sharp` (dev only), `next/og` |
| Hosting | Vercel Hobby |
| Scheduling | GitHub Actions every 30 minutes; Vercel cron daily fallback |

## Requirements

- Node.js 20.9 or newer (Next.js 16 requirement)
- npm
- A Supabase project for live data, ingest, and newsletter signup
- A Vercel project and a GitHub repository for deployment and scheduling

## Quick start

```bash
npm install
cp .env.example .env.local        # macOS / Linux
# Copy-Item .env.example .env.local   # Windows PowerShell
npm run dev
```

Open <http://localhost:3000>. The development server uses Turbopack. If its
cache is ever corrupted after an interrupted run, delete `.next/dev` and start
again.

### Running without Supabase

The public pages are fail-soft. With no Supabase credentials they render a calm
empty edition instead of breaking the build, which is useful for design work.
The ingest and newsletter endpoints require credentials:

- `/api/cron/ingest` returns `500` when `CRON_SECRET` is missing.
- `/api/newsletter` returns `503 not_configured` when Supabase is missing.

## Environment

Copy `.env.example` to `.env.local`. Never commit real values.

| Variable | Required | Exposure | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Public | Canonical URLs, sitemap, social cards, bot user agent. Defaults to `https://duikul.vercel.app`. No trailing slash. |
| `NEXT_PUBLIC_PUBLISHER_NAME` | Before launch | Public | Legal publisher name shown on `/about`. |
| `NEXT_PUBLIC_PUBLISHER_NAME_BN` | Before launch | Public | Bangla publisher name. |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Optional | Public | Search Console verification meta tag. |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION` | Optional | Public | Bing Webmaster verification meta tag. |
| `NEXT_PUBLIC_SUPABASE_URL` | Live data | Public | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Live data | Public | Read-only key; row-level security applies. |
| `SUPABASE_SERVICE_ROLE_KEY` | Ingest + newsletter | **Server only** | Bypasses RLS for ingest and signup writes. Never expose it. |
| `NEWSLETTER_IP_SALT` | Recommended | **Server only** | HMAC salt for hashing signup IPs. Falls back to the service-role key. Generate with `openssl rand -hex 32`. |
| `CRON_SECRET` | Ingest | **Server only** | Bearer token for `/api/cron/ingest`. Use the same value in Vercel and GitHub. |

`NEXT_PUBLIC_*` values are embedded at build time. Changing one in Vercel
requires a new deployment.

## Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql).
   It creates the source registry, clusters, articles, subscribers, the
   rate-limit table/function, the search function, the indexable view, indexes,
   triggers, and row-level security.
3. Copy the project URL, anon key, and service-role key into `.env.local` (and
   into Vercel for deployments).
4. If you already had the older prototype schema, use a fresh project or apply
   [`supabase/20261028_add_editor_note.sql`](supabase/20261028_add_editor_note.sql)
   before running the current ingest.

The public read path uses the anon key and RLS. The service-role key is imported
only by server code under `src/lib/supabase/admin.ts`.

## Filling the edition

```bash
npm run check:feeds   # fetch every whitelisted feed and flag dead/empty ones
npm run ingest:dry    # fetch + cluster in memory; no database or credentials
npm run ingest        # fetch, cluster, persist, score, and clean up
```

The dry run prints source health, accepted/rejected counts, and the top stories
per section. Use it before changing the whitelist or clustering rules.

### Ingest contract

- 19 whitelisted RSS feeds only. There is no discovery and no HTML scraping.
- 8-second timeout, two retries with backoff, `DuikulBot/1.0 (+site URL)`.
- Headlines, snippets, timestamps, and feed-provided image URLs only. No full
  article bodies are stored.
- 48-hour edition window; article and cluster cleanup after 14 days.
- URLs are deduplicated by a normalized hash. Cluster IDs are stable.
- Confirmation is counted per publisher, never per article. A story is
  confirmed with at least 3 independent sources, or 2 sources whose trust
  weights sum to at least 9.
- Single-source stories are visible only when the source has trust weight 4 or
  5. An editor note can make a story page indexable even with one source.
- Thresholds live in [`src/config/ingest.ts`](src/config/ingest.ts) and are
  explained on `/about`.

### Changing the whitelist

Edit [`src/config/sources.ts`](src/config/sources.ts), then run
`npm run check:feeds`. Do not add a feed that the checker cannot fetch. If a
publisher retires or blocks its feed, remove it rather than proxying around the
block. The About page and the ingest registry are generated from this single
file.

## Scheduled runs

The protected endpoint is `GET /api/cron/ingest`.

- `Authorization: Bearer $CRON_SECRET` is required.
- The route fails closed with `500` when the secret is not configured.
- `maxDuration` is 60 seconds.
- `.github/workflows/ingest.yml` is the primary scheduler and runs every 30
  minutes. Set the repository secret `CRON_SECRET` and, optionally, the
  repository variable `SITE_URL`.
- `vercel.json` adds a daily cron as a fallback. Vercel automatically sends the
  bearer token when `CRON_SECRET` exists in the project environment. On the
  Hobby plan this is once-daily coverage only.

Manual trigger:

```bash
curl --fail-with-body \
  -H "Authorization: Bearer $CRON_SECRET" \
  "https://YOUR_DOMAIN/api/cron/ingest"
```

The JSON response includes per-source health and insert/update counts. The
GitHub Action fails visibly when the route rejects the request.

## Deploying to Vercel

1. Push the repository to GitHub.
2. Import it in Vercel. The repository root is the project root; the framework
   preset is Next.js.
3. Add every production environment variable from the table above. Use the real
   domain for `NEXT_PUBLIC_SITE_URL`, not a preview URL.
4. Deploy, then attach the production domain.
5. In GitHub, add the `CRON_SECRET` Actions secret and set the `SITE_URL` Actions
   variable if the default domain in the workflow is not correct.
6. Trigger one ingest run and confirm that `/deshi` and `/bideshi` render the
   new edition.
7. Submit `/sitemap.xml` to Search Console and Bing after the domain is live.

The Vercel cron entry is committed in `vercel.json`. If the plan changes, keep
the GitHub Action as the 30-minute scheduler and leave the daily fallback in
place.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Lead story, both sections, publisher strip, newsletter form |
| `/deshi`, `/bideshi` | Section editions, each linking its publishers' profiles |
| `/story/[id]` | Story detail, source list, share menu, editor note |
| `/daily/[date]` | Automatic daily briefing; indexable only with 5+ stories |
| `/source/[id]` | Publisher profile: trust weight, limits, recent stories |
| `/search` | Bilingual search; `noindex` by design |
| `/en`, `/en/*` | English home and the eight trust pages in English |
| `/about`, `/methodology`, `/editorial-policy`, `/corrections`, `/removal-request`, `/contact`, `/privacy`, `/terms` | Trust and policy pages, in both languages |
| `/offline` | Service-worker fallback |
| `/api/cron/ingest` | Protected ingest trigger |
| `/api/newsletter` | Newsletter signup (stores only) |
| `/newsletter/preview` | Development-only welcome-email preview; `404` in production |
| `/manifest.webmanifest` | PWA manifest |
| `/sitemap.xml`, `/sitemap/{static,stories,daily,sources}.xml`, `/news-sitemap.xml`, `/robots.txt` | Crawler files |
| OG/Twitter routes | Branded cards for the site and story pages |

News URLs (sections, stories, briefings, publisher profiles) are shared
between languages and never carry an `/en` prefix; only the trust pages and
home have English twins.

## Newsletter

The form posts JSON to `/api/newsletter`:

```json
{ "email": "reader@example.com", "locale": "bn", "source": "homepage", "website": "" }
```

- The hidden `website` field is a honeypot. Filled submissions return success
  without touching the database.
- The client IP is HMAC-hashed and passed to the Postgres fixed-window limiter:
  5 attempts per hour. No raw IP is stored.
- A duplicate address returns `200` so the endpoint is not an email-enumeration
  oracle.
- The app only stores the address, locale, source, and timestamp. **No email is
  sent.**
- The welcome template is bilingual, table-based, inline-styled, and has a
  plain-text alternative. Preview it locally at
  `/newsletter/preview?locale=bn` or `?locale=en`. It returns `404` in
  production.

Before launch, either connect a delivery provider outside this app or keep the
form as a waitlist and remove the “look out for the next edition” promise.
Update `/privacy` with the provider's name, and implement unsubscribe and
deletion handling. See the launch checklist.

## Quality checks

Run these before every release:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run start              # terminal 1: serve the production build
npm run seo:check          # terminal 2: crawl and audit the site's SEO
```

`npm run seo:check` audits titles, descriptions, canonicals, H1s, image
alt/dimensions, internal links, robots.txt, sitemaps, and JSON-LD against a
running server (default `http://localhost:3000`; pass `-- --url` for a live
site). It exits non-zero on any hard failure. See
[`SEO_CHECKLIST.md`](SEO_CHECKLIST.md) for the full audit scope, the
one-time search-console setup, and the honest limits of a small aggregator in
search.

`npm run check:feeds` is a network check and should be run on a schedule (or
before editing the whitelist), not on every build. A dead or empty feed exits
non-zero by design.

`npm run lighthouse` runs Lighthouse CI against the built site and enforces
performance, accessibility, and SEO thresholds from `lighthouserc.json`.

The test suite covers feed normalization, clustering, scoring, API auth, search
helpers, PWA helpers, newsletter validation/rate-limit helpers, and the email
template. Tests do not call the live feeds or Supabase.

## Project layout

```text
src/app/              routes, metadata, API handlers, sitemap, robots, manifest
src/components/       brand, story, site chrome, search, PWA, newsletter, UI
src/config/           source whitelist, section copy, ingest thresholds
src/lib/ingest/       fetch, normalize, dedupe, cluster, score, persist
src/lib/data/         fail-soft public read layer
src/lib/newsletter/   validation, IP hashing, welcome-email renderer
src/lib/supabase/     public (anon) and server-only admin clients
src/lib/pwa/          install-prompt preference helpers
src/lib/og/           social-card rendering helpers
scripts/              ingest, dry run, feed checker, icon generator
supabase/             schema and editor-note migration
public/               generated icons and service worker
docs/                 launch checklist
```

## Editorial and data rules

- Duikul is an aggregator. Reporting belongs to the publishers; every card
  and story row links to the original.
- Only headlines, short snippets, timestamps, and feed-provided images are
  stored. Full article bodies are never stored.
- Publisher images load directly from publisher servers with
  `loading="lazy"`, `decoding="async"`, explicit dimensions, and no referrer.
  They are not copied or re-hosted.
- The confirmation badge means independent outlets reported the same event. It
  is not a certificate of truth, and `/about` says so.
- Stories are indexable only with at least two independent sources or a human
  editor note. Search pages are `noindex`.
- No advertising, analytics, tracking scripts, or cookies. Language, theme, and
  install-prompt choices live in `localStorage`; the service worker caches
  recently viewed pages for offline use.
- Newsletter data is used only for the newsletter. See `/privacy`.

## Before launch

Use [`docs/LAUNCH_CHECKLIST.md`](docs/LAUNCH_CHECKLIST.md). At minimum:

- Replace the publisher placeholders and confirm the contact email and domain.
- Create the Supabase project, run the schema, and test the ingest end to end.
- Set `CRON_SECRET` in both Vercel and GitHub, then confirm the 30-minute run.
- Decide whether the newsletter is a waitlist or a live list. The app does not
  send mail yet.
- Review the feed whitelist and trust weights with the person who owns
  editorial standards.
- Complete the privacy/legal review for aggregation, images, logs, and email.

## Fonts and assets

UI fonts are loaded with `next/font`. Social cards use a bundled subset of Noto
Serif Bengali Bold; its SIL Open Font License is at
[`src/assets/fonts/OFL-NotoSerifBengali.txt`](src/assets/fonts/OFL-NotoSerifBengali.txt).
Publisher photography remains the property of the publishers.
