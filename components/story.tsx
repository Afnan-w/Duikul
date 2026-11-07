/*
  STORY DISPLAY COMPONENTS
  ------------------------
  Used by the home page, listing pages and story pages.
  Presentational only - no data fetching here.

  Heading policy (SEO): SectionHeading renders <h2> by default
  (section titles under the page's single <h1>; pass as="h1" on
  pages that have no other H1). Story rows use <h3> so every
  headline stays a real, linkable heading for crawlers.
*/

import Link from "next/link";
import { formatDateTime } from "@/lib/format";
import { categories, ui } from "@/lib/site";

/** The shape every story has. */
export type StoryLike = {
  slug: string;
  section: "deshi" | "bideshi";
  category: string;
  bn: { title: string; excerpt: string };
  en: { title: string; excerpt: string };
  outlets: { name: string; url: string }[];
  publishedAt: string;
  /** Ranking points attached on the server (higher = more important). */
  score?: number;
  imageUrl?: string;
  imageCredit?: string;
  /** Width of imageUrl in pixels, if known (decides hero vs card layout). */
  imageWidth?: number;
  /** Height of imageUrl in pixels, if known. */
  imageHeight?: number;
};

type Lang = "bn" | "en";

/** Category label, e.g. "খেলাধুলা" / "Sports" (also used by story pages). */
export function categoryOf(slug: string, lang: Lang) {
  const match = categories.find((item) => item.slug === slug);
  if (!match) return lang === "bn" ? "সংবাদ" : "News";
  return match[lang];
}

/* Section label, e.g. "দেশি" / "Deshi" with a small green rule. */
export function SectionHeading({
  title,
  href,
  lang,
  as = "h2",
}: {
  title: string;
  href?: string;
  lang: Lang;
  /** "h1" only on pages with no other H1 (listing / category pages). */
  as?: "h1" | "h2";
}) {
  const heading = (
    <span className="flex items-center gap-3">
      <span aria-hidden="true" className="h-4 w-1 bg-accent-strong" />
      <span className="serif text-xl font-bold tracking-tight text-fg sm:text-2xl">
        {title}
      </span>
    </span>
  );

  const headingTag = as === "h1" ? "h1" : "h2";
  const Heading = headingTag;

  return (
    <div className="mb-4 flex items-baseline justify-between border-b border-line pb-3">
      <Heading>
        {href ? (
          <Link href={href} className="transition-colors hover:text-accent">
            {heading}
          </Link>
        ) : (
          heading
        )}
      </Heading>
      {href && (
        <Link
          href={href}
          className="text-sm text-muted transition-colors hover:text-accent"
        >
          {lang === "bn" ? "সব দেখুন" : "See all"}
        </Link>
      )}
    </div>
  );
}

/*
  The verification badge: "Reported by 4 outlets" with the outlet
  names and links. This is our trust signal - we never write
  "100% verified". With only ONE source we simply name it instead
  (claiming "1 outlet reported it" would sound odd).
*/
export function sourceLabel(
  outlets: { name: string; url: string }[],
  lang: Lang
): string {
  if (outlets.length > 1) {
    return ui.reportedBy[lang].replace("{n}", String(outlets.length));
  }
  return outlets.length === 1
    ? lang === "bn"
      ? `সূত্র: ${outlets[0].name}`
      : `Source: ${outlets[0].name}`
    : lang === "bn"
      ? "সূত্র নেই"
      : "No source";
}

export function OutletBadge({
  outlets,
  lang,
  showNames = false,
}: {
  outlets: { name: string; url: string }[];
  lang: Lang;
  showNames?: boolean;
}) {
  const label = sourceLabel(outlets, lang);

  if (!showNames) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
        {label}
      </span>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-card p-4">
      <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-accent uppercase">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
        {label}
      </p>
      <ul className="mt-3 space-y-2">
        {outlets.map((outlet) => (
          <li key={outlet.url + outlet.name}>
            <a
              href={outlet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-9 items-center justify-between gap-3 text-[15px] text-fg/85 transition-colors hover:text-accent"
            >
              <span>{outlet.name}</span>
              <span aria-hidden="true" className="text-muted">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* The big story at the top of the home page.
 *  - Image >= 800px wide: full-width hero above the headline.
 *  - Image < 800px wide: small image card beside the headline.
 *  - No image: elegant branded fallback (green gradient) beside the headline.
 *  A sharp small image always beats a stretched blurry one.
 *  SEO: the headline here is an <h2> - the home page's single <h1>
 *  (brand + keywords) is the masthead rendered by HomeView above.
 *  fetchPriority=high keeps the hero photo the LCP winner. */
export function TopStoryCard({ story, lang }: { story: StoryLike; lang: Lang }) {
  const text = story[lang];
  const hasLargeImage = story.imageUrl && story.imageWidth && story.imageWidth >= 800;

  return (
    <article className="border-b border-line pb-8">
      {hasLargeImage ? (
        // Full-width hero image for large, sharp photos.
        <figure className="mb-6">
          <img
            src={story.imageUrl}
            alt={text.title}
            referrerPolicy="no-referrer"
            className="aspect-16/9 w-full rounded-xl border border-line bg-soft object-cover lg:aspect-2/1"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          {story.imageCredit && (
            <figcaption className="mt-2 text-xs text-muted">
              {lang === "bn" ? "ছবি" : "Photo"}: {story.imageCredit}
            </figcaption>
          )}
        </figure>
      ) : null}

      {/* Content column (always present). */}
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          {story.imageUrl && !hasLargeImage ? (
            // Small image card beside the headline (sharp, not stretched).
            <figure className="mb-4 w-full max-w-xs aspect-[4/3] rounded-xl border border-line bg-card overflow-hidden mx-auto">
              <img
                src={story.imageUrl}
                alt={text.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
                width={story.imageWidth}
                height={story.imageHeight}
                decoding="async"
              />
              {story.imageCredit && (
                <figcaption className="mt-1 text-xs text-muted text-center">
                  {lang === "bn" ? "ছবি" : "Photo"}: {story.imageCredit}
                </figcaption>
              )}
            </figure>
          ) : !story.imageUrl ? (
            // Branded fallback when no image is available at all.
            <div className="mb-4 w-full max-w-xs aspect-[4/3] rounded-xl bg-gradient-to-br from-[#0B6B4F] to-[#128063] flex items-center justify-center p-4 mx-auto">
              <span className="serif text-center text-lg font-bold text-white sm:text-xl">
                {lang === "bn"
                  ? "দুইকূল — দেশি ও বিদেশি সংবাদ"
                  : "Duikul — Deshi & Bideshi news"}
              </span>
            </div>
          ) : null}

          <p className="flex flex-wrap items-center gap-3 text-xs font-semibold tracking-widest text-accent uppercase">
            <span>{ui.topStory[lang]}</span>
            <span aria-hidden="true" className="h-3 w-px bg-line" />
            <span className="text-muted">{categoryOf(story.category, lang)}</span>
          </p>

          {/* h2: the page's single h1 is the masthead above this card. */}
          <h2 className="serif mt-3 text-3xl leading-[1.15] font-bold tracking-tight text-fg sm:text-4xl lg:text-5xl">
            <Link href={`/news/${story.slug}`} className="transition-colors hover:text-accent">
              {text.title}
            </Link>
          </h2>

          <p className="article-body mt-4 max-w-2xl text-fg/80">{text.excerpt}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <OutletBadge outlets={story.outlets} lang={lang} />
            <time
              dateTime={story.publishedAt}
              className="text-sm text-muted"
            >
              {formatDateTime(story.publishedAt, lang)}
            </time>
          </div>
        </div>

        {/* Which outlets are reporting it - the verification panel. */}
        <aside aria-label="Sources">
          <OutletBadge outlets={story.outlets} lang={lang} showNames />
        </aside>
      </div>
    </article>
  );
}

/* Numbered row used in the "Top 5" lists. The headline is a real
   <h3> heading - linkable, crawlable, under its section's <h2>. */
export function NumberedStoryRow({
  story,
  index,
  lang,
}: {
  story: StoryLike;
  index: number;
  lang: Lang;
}) {
  const text = story[lang];

  return (
    <li className="border-b border-line last:border-b-0">
      <Link
        href={`/news/${story.slug}`}
        className="group flex min-h-11 gap-4 py-4"
      >
        <span
          aria-hidden="true"
          className="serif w-6 shrink-0 text-2xl leading-none font-bold text-line transition-colors group-hover:text-accent"
        >
          {index + 1}
        </span>
        <span className="min-w-0">
          <h3 className="serif block text-lg leading-snug font-semibold text-fg transition-colors group-hover:text-accent">
            {text.title}
          </h3>
          <span className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="font-semibold text-accent">
              {categoryOf(story.category, lang)}
            </span>
            <span aria-hidden="true">·</span>
            <span>{sourceLabel(story.outlets, lang)}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={story.publishedAt}>
              {formatDateTime(story.publishedAt, lang)}
            </time>
          </span>
        </span>
      </Link>
    </li>
  );
}

/* Simple row used in the "Latest" list. The headline is a real
   <h3> heading - linkable, crawlable, under its section's <h2>. */
export function LatestStoryRow({
  story,
  lang,
}: {
  story: StoryLike;
  lang: Lang;
}) {
  const text = story[lang];
  const sectionLabel =
    story.section === "deshi" ? ui.deshi[lang] : ui.bideshi[lang];

  return (
    <li className="border-b border-line last:border-b-0">
      <Link href={`/news/${story.slug}`} className="group flex min-h-11 flex-wrap items-baseline gap-x-3 gap-y-1 py-4">
        <time dateTime={story.publishedAt} className="w-24 shrink-0 text-sm text-muted">
          {formatDateTime(story.publishedAt, lang)}
        </time>
        <span className="w-16 shrink-0 text-xs font-semibold tracking-wider text-accent uppercase">
          {sectionLabel}
        </span>
        <h3 className="serif min-w-0 flex-1 text-lg leading-snug font-semibold text-fg transition-colors group-hover:text-accent">
          {text.title}
        </h3>
        <span className="text-xs text-muted">
          {categoryOf(story.category, lang)}
        </span>
      </Link>
    </li>
  );
}
