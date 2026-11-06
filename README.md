# Duikul (দুইকুল)

**Duikul** is a free news website that collects top Bangladesh **দেশি (Deshi)**
and world **বিদেশি (Bideshi)** news from trusted outlets, groups the headlines
that report the same event together, and always sends the reader back to the
original source. It never copies a full article.

> বিশ্বস্ত সংবাদমাধ্যম থেকে সংগ্রহ করা দেশি ও বিদেশি সংবাদ, এক জায়গায়।
> প্রতিটি সংবাদ পড়ার জন্য করে মূল সূত্রের সাইটে নিয়ে যায়।

Everything on this site runs on **free services only** — no database, no paid
APIs, no cron jobs, no credit card anywhere.

---

## ✨ What it does

- **Two sections:** দেশি (Bangladesh) এবং বিদেশি (world), each with top stories
- **15 live outlets** feeding every 10 minutes (see the list below)
- **Same-story grouping:** when several outlets report the same event you get
  ONE story with the badge **"Reported by N outlets"** and a list of every
  source with links — we never claim anything is "100% verified"
- **Ranking:** more outlets reporting + higher trust + more recent = shown
  higher. The score is never displayed; it only orders the lists
- **Categories:** রাজনীতি, বাণিজ্য, খেলাধুলা, প্রযুক্তি, বিনোদন, স্বাস্থ্য
  (guessed by keyword lists, Bangla + English)
- **Search** across all headlines
- **কম্পিউটার-friendly reading:** warm off-white design, serif headline font,
  dark mode (auto + manual), text size A− / A+ , mobile-first layouts
- **Six trust/legal pages:** About, Editorial Policy, Corrections, Privacy,
  Terms, Contact — plus a custom 404

## 📰 The 15 sources (all free RSS)

| দেশি / Bangladesh | বিদেশি / World |
|---|---|
| Prothom Alo | BBC News |
| The Daily Star | Al Jazeera |
| Dhaka Tribune | The Guardian |
| The Business Standard | NPR |
| Samakal | DW |
| Bangla Tribune | France 24 |
| Channel i | |
| The Daily Observer | |
| The Dhaka Times | |

Every piece of news belongs to its outlet; Duikul shows the headline, a short
excerpt (2–3 sentences), a credited photo, and a link to the full story.

## 🛠 How it works (plain words)

```
sources.ts          the ONLY file you edit to add/remove an outlet
   │
lib/news.ts         downloads every feed in parallel, caches it
   │                for 10 minutes with  next: { revalidate: 600 }
   │                (Vercel does the caching — no database anywhere)
lib/rss.ts          turns the messy feed text into clean stories,
   │                guesses the category, repairs broken feeds
lib/rank.ts         groups the same event together ("Reported by 3
   │                outlets") and scores every story
app/…               pages server-render the result, refreshing
                    automatically every 10 minutes (ISR)
```

Pages are built with **Next.js 16 (App Router) + TypeScript + Tailwind CSS**.

## 📂 The files, in plain words

| Where | What it is |
|---|---|
| `sources.ts` | The source list — add, remove or turn off an outlet here |
| `lib/site.ts` | Site name, menu, categories, small translations |
| `lib/news.ts` | Feed downloading + caching |
| `lib/rss.ts` | Feed parsing, excerpt maker, category guessing |
| `lib/rank.ts` | Story grouping + scoring |
| `lib/format.ts` | Dhaka-timezone date/time display |
| `app/` | One folder per page |
| `components/` | Header, footer, story cards, language toggle |
| `app/globals.css` | All colors — change hex numbers to restyle |
| `scripts/check-feeds.mjs` | Tests every feed in `sources.ts` |
| `scripts/test-category.mjs` | 20 category-guesser tests |
| `scripts/test-group.mjs` | 19 grouping/scoring tests |

## 🚀 Run it on your computer

```bash
npm install     # first time only
npm run dev     # then open http://localhost:3000
```

Other commands:

| Task | Command |
|---|---|
| Production build | `npm run build` |
| Test all feeds | `node scripts/check-feeds.mjs` |
| Test category guesser | `node scripts/test-category.mjs` |
| Test grouping & ranking | `node scripts/test-group.mjs` |

> ⚠️ Node.js tip used during development: some Node.js versions
> (e.g. 24.19.0) have a bug that breaks `next build`. Use Node **22, 24.22+ or 26+** from [nodejs.org](https://nodejs.org) and it works fine.

## 🎨 The colors

| What | Value |
|---|---|
| Background | `#FAF8F5` warm off-white |
| Text | `#1A1A1A` near-black |
| Accent | `#0B6B4F` deep green |
| Dark mode | `#121212` background, `#E8E6E3` text |
| Fonts | Source Serif 4 + Noto Serif Bengali (headlines), Inter + Hind Siliguri (UI) |

## 📍 Build status

| Stage | What | Status |
|---|---|---|
| A | Design, dark mode, text size, header/footer, all pages wired up | ✅ |
| B | 15 real RSS feeds + 10-minute caching (no database needed) | ✅ |
| C | Same-story grouping + ranking + "Reported by N outlets" | ✅ |
| D | Individual story pages at permanent URLs | next |
| E | Share buttons + share images | |
| F | SEO, sitemaps, JSON-LD, analytics | |
| G | Vercel deployment | 🔜 next — repo connected, awaiting import |

## 📜 Fair use note

Duikul is a news *aggregator*. It displays headlines, brief excerpts and
credited photos, and always links the reader to the outlet that did
the reporting. All article content, trademarks and photos belong to their
original publishers.

---

*Dedicated to reading the news calmly — দুইকুল.*
