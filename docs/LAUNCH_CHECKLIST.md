# Duikul launch checklist

Work top to bottom. Do not launch while a blocker is open. Record the owner and
date beside each item as it is completed.

## 1. Decisions and blockers

- [ ] Name the person or organisation that operates the site. Set
      `NEXT_PUBLIC_PUBLISHER_NAME` and `NEXT_PUBLIC_PUBLISHER_NAME_BN`; never
      ship `[PLACEHOLDER]`.
- [ ] Confirm `hello@duikul.com` in `src/config/site.ts` is real, monitored,
      and able to receive corrections, privacy requests, and unsubscribe mail.
      Change it if it is not.
- [ ] Confirm the production domain and set `NEXT_PUBLIC_SITE_URL` to it with no
      trailing slash (`https://duikul.com`, not `https://.../`).
- [ ] Decide whether the newsletter is a **waitlist** or a **live list**.
      The app stores signups but does not send mail. If it stays a waitlist,
      change the success message that promises the next edition and keep the
      privacy wording that says delivery is not live.
- [ ] Have the editor who owns the source list review every whitelisted feed,
      its trust weight, and the aggregation/privacy approach.
- [ ] Confirm that republishing headlines, short snippets, and feed images is
      acceptable for each publisher, or remove the feed/image source. This is a
      legal/editorial decision, not a code default.

## 2. Repository and local build

- [ ] `npm ci` from a clean checkout.
- [ ] `npm run typecheck`.
- [ ] `npm run lint`.
- [ ] `npm test`.
- [ ] `npm run build`.
- [ ] `npm run check:feeds` — all 19 feeds return items. Remove any feed that
      fails; do not proxy around a block.
- [ ] `npm run ingest:dry` — inspect source health and both section previews.
- [ ] Check `git status` is clean after the release commit.

## 3. Supabase

- [ ] Create the production project in the intended region.
- [ ] Run `supabase/schema.sql` in the SQL Editor. Confirm the tables, indexes,
      `search_clusters`, `v_indexable_clusters`, the rate-limit function, and all
      RLS policies exist.
- [ ] For an existing project, apply
      `supabase/20261028_add_editor_note.sql` before the current ingest.
- [ ] Confirm `anon` can read `sources`, `clusters`, and `articles`, but cannot
      read `subscribers` or `signup_rate_limits`.
- [ ] Confirm `consume_signup_attempt` is executable by `service_role` only.
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
      `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`; run `npm run ingest` once and
      confirm rows in `clusters`, `articles`, and `sources`.
- [ ] Verify no service-role key appears in any `NEXT_PUBLIC_*` variable, client
      bundle, or committed file.
- [ ] Decide the backup/PITR policy and who can access the project. Test a
      restore before launch if the plan supports it.
- [ ] Keep the 14-day retention job working; confirm old rows are removed on a
      later ingest run.

## 4. Vercel and scheduling

- [ ] Import the repository into Vercel. Framework preset: Next.js. Root
      directory: repository root. Node 20.9 or newer.
- [ ] Add every production environment variable from `README.md`, including
      `CRON_SECRET` and `NEWSLETTER_IP_SALT`.
- [ ] Add the same public variables for Preview if preview deployments should
      render live data. Never point Preview at production secrets unnecessarily.
- [ ] Attach the production domain and confirm HTTPS.
- [ ] Redeploy after changing any `NEXT_PUBLIC_*` value; they are baked at build
      time.
- [ ] Confirm `vercel.json` registers the daily `/api/cron/ingest` fallback.
- [ ] In GitHub, add the Actions secret `CRON_SECRET` (same value as Vercel) and
      the Actions variable `SITE_URL` (the production origin).
- [ ] Run the **Ingest news feeds** workflow manually. Confirm it succeeds and
      that the edition updates.
- [ ] Confirm the workflow fails visibly when the secret is wrong; then restore
      the correct secret.
- [ ] Trigger `/api/cron/ingest` without a token and confirm `401`; with no
      configured secret and confirm `500`.

## 5. Newsletter

The app does not send email. Complete this section only if signup is exposed.

- [ ] Choose a delivery provider and connect it outside this app, or keep the
      form as a waitlist with honest copy.
- [ ] Add the provider's name and role to `/privacy`.
- [ ] Implement double opt-in or another consent record if required by the
      provider or applicable law.
- [ ] Add a working unsubscribe path and a suppression list. Every email must
      include a working unsubscribe link.
- [ ] Set up SPF, DKIM, and DMARC for the sending domain. Test Gmail, Outlook,
      and a mobile client.
- [ ] Add the provider's physical mailing address if required.
- [ ] Ensure the welcome template in `src/lib/newsletter/email.ts` matches the
      provider's variables and test the plain-text alternative.
- [ ] Test `POST /api/newsletter` with valid, duplicate, invalid, honeypot, and
      rate-limited requests. Duplicate and honeypot return success by design.
- [ ] Verify the sixth request from one IP in an hour returns `429` with
      `Retry-After`.
- [ ] Confirm `/newsletter/preview` returns `404` in production.
- [ ] Define who can export, correct, and delete subscriber records, and how
      those requests are logged.

## 6. SEO and social

- [ ] Confirm canonical URLs use the production domain on `/`, `/deshi`,
      `/bideshi`, `/story/*`, `/about`, and `/privacy`.
- [ ] Confirm `/search` is `noindex, follow` and blocked in `robots.txt`.
- [ ] Confirm `/sitemap.xml` lists only indexable stories (two or more sources,
      or an editor note) and returns the production domain.
- [ ] Submit the sitemap to Google Search Console and Bing Webmaster Tools.
- [ ] Add verification tokens if used, redeploy, and confirm the meta tags.
- [ ] Validate a story's JSON-LD (`NewsArticle` / `Organization`) with the Rich
      Results Test.
- [ ] Test the homepage and a story in the Facebook Sharing Debugger, LinkedIn
      Post Inspector, and X card validator.
- [ ] Confirm OG/Twitter images render in Bangla with the bundled font, and that
      `/story/[id]/square` returns a 1080 square image.
- [ ] Confirm 404 and error pages return the right status and useful navigation.

## 7. PWA and offline

- [ ] `/manifest.webmanifest` returns 200 with name, icons, start URL, scope,
      theme colour, and both section shortcuts.
- [ ] Service worker registers only in production and reaches `activated`.
- [ ] Visit `/`, a story, and `/about`; go offline; confirm the cached pages and
      `/offline` fallback render with Bangla typography.
- [ ] Confirm publisher images are not cached by the service worker and do not
      break the offline page.
- [ ] Test install on Android Chrome and iOS Safari; confirm the install banner,
      dismissal, and 30-day preference.
- [ ] If `public/sw.js` changes, bump `VERSION` so old caches are replaced.
- [ ] Clear site data and confirm a fresh install still works.

## 8. Accessibility, responsive layout, and performance

- [ ] Test `/`, `/deshi`, `/bideshi`, a story, `/search`, `/about`, `/privacy`,
      `/offline`, and 404 at 360 px, 768 px, and 1280 px. No horizontal scroll.
- [ ] One `h1` per page; heading order is sensible.
- [ ] Keyboard-only pass: skip link, header, language/theme controls, cards,
      share menu (arrows/Home/End/Escape), search, newsletter, footer.
- [ ] Visible focus on every interactive element; no focus traps.
- [ ] Tap targets at least 44 × 44 px, except inline text links.
- [ ] Screen-reader pass in Bangla and English: language attributes, form
      labels, status messages, image alt text, and icon-only buttons.
- [ ] Check contrast in light and dark themes, including muted text and badges.
- [ ] Check `prefers-reduced-motion`; no essential motion.
- [ ] Run Lighthouse mobile on `/` and a story. Investigate any regression in
      performance, accessibility, best practices, or SEO.
- [ ] Confirm images use `loading="lazy"`, `decoding="async"`, width, height,
      and `referrerPolicy="no-referrer"`.
- [ ] Confirm no publisher image is proxied or optimized by Vercel.

## 9. Editorial and content QA

- [ ] Both sections contain current stories; no story is in the wrong section.
- [ ] Headlines and snippets match the publisher; no invented or rewritten copy.
- [ ] Confirmation badges match source counts and trust weights; a single-source
      story is not labelled confirmed.
- [ ] Story pages list every source and link directly to the publisher.
- [ ] No full article body is stored or displayed.
- [ ] Editor notes are accurate, attributed, and visible.
- [ ] Search returns results in both languages and keeps the section filter.
- [ ] No broken publisher images, dead links, or placeholder text.
- [ ] Bangla and English UI copy both read naturally; dates and digits are
      correct in each language.
- [ ] Privacy policy and About page match actual behaviour, including local
      storage, caching, newsletter data, and the confirmation method.

## 10. Monitoring and operations

- [ ] Add an uptime check for `/` and a synthetic check for a story page.
- [ ] Watch the GitHub Action for the first 24 hours; confirm 30-minute runs.
- [ ] Review the ingest JSON for failed sources; remove or replace dead feeds.
- [ ] Set a weekly reminder for `npm run check:feeds`.
- [ ] Review Vercel function logs for ingest and newsletter errors.
- [ ] Review Supabase usage, database size, and rate-limit table growth.
- [ ] Document how to rotate `CRON_SECRET`, `NEWSLETTER_IP_SALT`, the Supabase
      keys, and the GitHub secret.
- [ ] Document rollback: promote the previous Vercel deployment and, if needed,
      restore the database backup.
- [ ] Subscribe the operator to Search Console alerts and Vercel failure
      notifications.

## 11. Launch day

- [ ] Deploy the release commit to production.
- [ ] Point DNS at Vercel and confirm the canonical domain redirects correctly.
- [ ] Run one ingest and verify both sections, a story, search, sitemap, robots,
      manifest, service worker, and newsletter form.
- [ ] Submit the sitemap and request indexing for the homepage.
- [ ] Publish the launch note and monitor the first hour of errors.
- [ ] Confirm the newsletter copy matches the waitlist/live decision.

## 12. First week

- [ ] Check Search Console coverage and crawl errors daily.
- [ ] Review failed feeds and ingest duration.
- [ ] Check the top story pages for broken images and publisher links.
- [ ] Review newsletter signups for abuse; confirm the limiter and honeypot work.
- [ ] Review accessibility feedback and fix regressions.
- [ ] Decide whether the 48-hour window, confirmation thresholds, and source
      weights still produce a useful edition.
