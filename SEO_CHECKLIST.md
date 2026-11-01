# Duikul SEO checklist

The code handles most of on-page SEO automatically. This file covers what the
code cannot do for you: the one-time verification steps, the recurring habits,
and the honest limits of a small aggregator's search presence.

## 1. Automated checks (run on every release)

```bash
npm run build && npm run start   # terminal 1: serve the production build
npm run seo:check                # terminal 2: crawl and audit
npm run seo:check -- --url https://duikul.vercel.app   # audit the live site
```

The crawler verifies, on every reachable page:

- unique `<title>` (≤60 chars ideal) and meta description (≤155 ideal)
- absolute canonical on the production origin, matching the page URL
- exactly one `<h1>`, `<html lang="…">`, `max-image-preview` directive
- every `<img>` has `alt`, `width`, and `height`
- every internal link resolves (no 404s in the link graph)
- JSON-LD blocks all parse
- no `nofollow` anywhere (policy: links are honest, not sculpted), every
  `target="_blank"` carries `noopener`
- `/robots.txt` allows all, blocks `/api/`, `/search`, and lists both sitemaps
- no `noindex` page appears in any sitemap; `/news-sitemap.xml` ≤1000 URLs

It exits non-zero on any FAIL. Warnings are copy suggestions, not blockers.

`npm run lighthouse` (Lighthouse CI) gates performance, accessibility, and SEO
scores. First run needs a build; thresholds are committed in `lighthouserc.json`.

## 2. One-time setup after the domain is live

- [ ] Set `NEXT_PUBLIC_SITE_URL` to the real domain (no trailing slash) in
      Vercel and redeploy. Every canonical, sitemap URL, and social card
      follows this value.
- [ ] Google Search Console: add the property, verify by the HTML tag method,
      copy the token into `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, redeploy,
      then confirm the `<meta name="google-site-verification">` tag renders.
- [ ] Bing Webmaster Tools: same flow with
      `NEXT_PUBLIC_BING_SITE_VERIFICATION`.
- [ ] Submit `https://YOUR_DOMAIN/sitemap.xml` in Search Console. The index
      points at four child sitemaps; no need to submit them separately.
- [ ] Submit the site in Bing Webmaster Tools (it also feeds DuckDuckGo).
- [ ] Request indexing for `/`, `/deshi`, `/bideshi`, `/about` to seed the
      crawl. Do not request indexing for story pages one by one.
- [ ] Run the Rich Results Test on `/`, one story page, and one daily
      briefing. Expect `WebSite` + `Organization` on the home page,
      `WebPage` + source `ItemList` on stories, `BreadcrumbList` everywhere
      with a trail. `NewsArticle` appears only on briefings with an editor
      note — that is deliberate, not a bug.
- [ ] Check social cards with the Facebook Sharing Debugger and X card
      validator for `/` and a story. Both use the large image summary.
- [ ] Verify the 14-day retirement: a story older than 14 days returns a real
      404, never a soft-404 page. Test one in Search Console's URL
      Inspection.

## 3. Supabase migration (required for daily briefings)

Run `supabase/20261029_add_daily_notes.sql` in the Supabase SQL Editor
before the first ingest after this release. Without it, daily briefings still
render but can never become indexable originals (an editor note is what makes
a briefing original editorial).

## 4. HSTS preload — a decision, not a default

The site sends `Strict-Transport-Security: max-age=63072000; includeSubDomains`
but deliberately **not** `preload`. Preloading is effectively irreversible:
after submission, browsers refuse plain-HTTP connections to the domain and all
subdomains for years. Only add `preload` when:

- you control every subdomain and they all serve HTTPS, and
- you are certain the domain will never need plain HTTP again.

If you decide to preload later: add `; preload` to the header in
`next.config.ts`, redeploy, then submit at <https://hstspreload.org>.

## 5. Optional: IndexNow

Not implemented, on purpose. IndexNow lets you ping Bing, Yandex, and others
the moment a URL changes. For a site that already rebuilds every 5 minutes
via ISR, the gain is small and the key-management is extra moving parts.

If you want it: create a static key file in `public/`, then POST changed URLs
to `https://api.indexnow.org/indexnow` with the key in the body. Add it to the
ingest script's tail, not to the request path.

## 6. Ongoing habits

- [ ] Weekly: `npm run check:feeds`. Remove dead feeds rather than working
      around them — a feed that blocks bots will also block the ingest.
- [ ] Weekly: `npm run seo:check -- --url https://YOUR_DOMAIN` against
      production. New template changes are the usual cause of regressions.
- [ ] Monthly: Search Console → Coverage. Investigate any "Crawled –
      currently not indexed" spike; it usually means the ingest ran empty.
- [ ] Monthly: Search Console → Manual actions (should always be clean) and
      Security issues.
- [ ] After any UI or layout change: `npm run lighthouse`. Performance
      regressions (especially LCP from a new above-the-fold image) are
      cheapest to fix the week they land.
- [ ] When adding a new page type: give it a unique title/description
      (`createPageMetadata`), a canonical, a breadcrumb via the shared
      `Breadcrumbs` component, and a decision about sitemap membership. Thin
      pages must be `noindex` and absent from sitemaps.
- [ ] When adding a publisher: update `src/config/sources.ts`, run
      `npm run check:feeds`, and the `/source/[id]` profile page generates
      itself. The About page and sitemap follow automatically.

## 7. Honest expectations

Duikul is a white-hat aggregator, not an original newsroom. What that means
for search:

- **What will work.** Publisher profiles (`/source/*`) are genuinely unique
  pages — few competitors build them — and answer real queries like
  "Prothom Alo RSS" or "Bangla newspaper list". Trust pages and the
  methodology page compete for "how does this site work" queries that build
  E-E-A-T. Daily briefings with editor notes are the only indexable original
  content; as you write more of them, they carry the site's ranking growth.
- **What takes time.** A new domain typically needs 3–6 months before story
  pages rank for anything competitive. Headline-ranking against the
  publishers themselves is not a fight to pick: they have decades of
  authority. The audience that finds Duikul searches for *clusters* —
  "what happened today in Bangladesh" — not for individual events.
- **What will not happen, and why.** Single-source stories stay `noindex`.
  Thin pages stay out of sitemaps. Nothing is rewritten to manufacture
  "original" text. Fake authorship, cloaked links, or paid backlinks would
  work briefly and then end the site. The constraint is deliberate: the cost
  of a penalty on a small site is the whole site.
- **Bangla search is under-served.** Competition for Bangla-language news
  queries is far lower than for English ones, and most competitors have weak
  technical SEO. That is the opening: correct `lang`/hreflang, fast pages,
  and structured data already put Duikul ahead of most Bangla publishers on
  technique. Consistency — showing up every 30 minutes for months — is what
  closes the gap.
