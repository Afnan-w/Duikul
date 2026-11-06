/*
  STORY DISPLAY COMPONENTS
  ------------------------
  Used by the home page and (later) every listing page.
  Presentational only - no data fetching here.
*/

import Link from "next/link";
import Image from "next/image";
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
}: {
  title: string;
  href?: string;
  lang: Lang;
}) {
  const heading = (
    <span className="flex items-center gap-3">
      <span aria-hidden="true" className="h-4 w-1 bg-accent-strong" />
      <span className="serif text-xl font-bold tracking-tight text-fg sm:text-2xl">
        {title}
      </span>
    </span>
  );

  return (
    <div className="mb-4 flex items-baseline justify-between border-b border-line pb-3">
      {href ? (
        <Link href={href} className="transition-colors hover:text-accent">
          {heading}
        </Link>
      ) : (
        heading
      )}
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

/* The big story at the top of the home page. */
export function TopStoryCard({ story, lang }: { story: StoryLike; lang: Lang }) {
  const text = story[lang];

  return (
    <article className="border-b border-line pb-8">
      {story.imageUrl && (
        <figure className="mb-6">
          <Image
            src={story.imageUrl}
            alt={text.title}
            referrerPolicy="no-referrer"
            className="aspect-16/9 w-full rounded-xl border border-line bg-soft object-cover lg:aspect-2/1"
            priority
            width={800}
            height={400}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={90}
          />
          {story.imageCredit && (
            <figcaption className="mt-2 text-xs text-muted">
              {lang === "bn" ? "ছবি" : "Photo"}: {story.imageCredit}
            </figcaption>
          )}
        </figure>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="flex flex-wrap items-center gap-3 text-xs font-semibold tracking-widest text-accent uppercase">
            <span>{ui.topStory[lang]}</span>
            <span aria-hidden="true" className="h-3 w-px bg-line" />
            <span className="text-muted">{categoryOf(story.category, lang)}</span>
          </p>

          <h1 className="serif mt-3 text-3xl leading-[1.15] font-bold tracking-tight text-fg sm:text-4xl lg:text-5xl">
            <Link href={`/news/${story.slug}`} className="transition-colors hover:text-accent">
              {text.title}
            </Link>
          </h1>

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

/* Numbered row used in the "Top 5" lists. */
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
          <span className="serif block text-lg leading-snug font-semibold text-fg transition-colors group-hover:text-accent">
            {text.title}
          </span>
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

/* Simple row used in the "Latest" list. */
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
        <span className="serif min-w-0 flex-1 text-lg leading-snug font-semibold text-fg transition-colors group-hover:text-accent">
          {text.title}
        </span>
        <span className="text-xs text-muted">
          {categoryOf(story.category, lang)}
        </span>
      </Link>
    </li>
  );
}
