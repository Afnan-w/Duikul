"use client";

/*
  Generic listing page used by /deshi, /bideshi and /category/[name].
  Stories are downloaded by the SERVER in each page file and passed
  in as a prop - this component only displays them.

  SEO: the section title renders as the page's single <h1>
  (headingAs="h1"), each story headline is a real <h3>, and the
  optional intro + related-links give crawlers keyword-rich,
  keyword-linked context.
*/

import Link from "next/link";
import { useLanguage } from "@/components/language";
import {
  LatestStoryRow,
  SectionHeading,
  type StoryLike,
} from "@/components/story";
import { ui } from "@/lib/site";

export function ListingPage({
  heading,
  headingAs = "h2",
  intro,
  relatedLinks,
  stories,
}: {
  heading: { bn: string; en: string };
  /** Listings are index pages, so their title is normally the H1. */
  headingAs?: "h1" | "h2";
  intro?: { bn: string; en: string };
  relatedLinks?: { href: string; bn: string; en: string }[];
  stories: StoryLike[];
}) {
  const { lang } = useLanguage();

  // Ranked order: more sources + more trusted + more recent first.
  const sorted = [...stories].sort(
    (a, b) =>
      (b.score ?? 0) - (a.score ?? 0) ||
      Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-8 pb-8 sm:px-6">
      <nav
        aria-label={lang === "bn" ? "ব্রেডক্রাম্ব" : "Breadcrumb"}
        className="text-sm text-muted"
      >
        <Link href="/" className="transition-colors hover:text-accent">
          {lang === "bn" ? "হোম" : "Home"}
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span className="text-fg/70">{heading[lang]}</span>
      </nav>

      {intro && (
        <p className="article-body mt-4 max-w-3xl text-fg/80">{intro[lang]}</p>
      )}

      <p className="mt-5 mb-6 rounded-lg border border-accent/25 bg-accent-soft px-4 py-3 text-sm text-accent">
        {lang === "bn"
          ? "প্রতি ১০ মিনিটে নিজে নিজে আপডেট · যে সংবাদ বেশি সূত্রে প্রতিবেদন করা হয়েছে ও সাম্প্রতিক, সেটি আগে"
          : "Updates every 10 minutes · Stories reported by more outlets, and more recently, rank first"}
      </p>

      <SectionHeading title={heading[lang]} lang={lang} as={headingAs} />

      {sorted.length === 0 ? (
        <p className="article-body py-12 text-muted">
          {lang === "bn"
            ? "এখন কোনো সংবাদ পাওয়া যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।"
            : "No stories found right now. Please try again in a few minutes."}
        </p>
      ) : (
        <ol className="divide-y divide-line">
          {sorted.map((story) => (
            <LatestStoryRow key={story.slug} story={story} lang={lang} />
          ))}
        </ol>
      )}

      {sorted.length > 0 && (
        <p className="mt-6 text-sm text-muted">
          {lang === "bn"
            ? `${sorted.length}টি সংবাদ দেখানো হচ্ছে`
            : `Showing ${sorted.length} stories`}
        </p>
      )}

      {relatedLinks && relatedLinks.length > 0 && (
        <nav
          aria-label={lang === "bn" ? "আরও দেখুন" : "Keep exploring"}
          className="mt-8 flex flex-wrap items-center gap-2 text-sm"
        >
          <span className="font-semibold tracking-widest text-muted uppercase">
            {lang === "bn" ? "আরও দেখুন" : "Keep exploring"}
          </span>
          {relatedLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex min-h-9 items-center rounded-full border border-line bg-card px-4 text-fg/80 transition-colors hover:border-accent hover:text-accent"
            >
              {link[lang]}
            </Link>
          ))}
        </nav>
      )}

      {/* The verified-suffix line, keyword-rich and honest. */}
      <p className="mt-8 rounded-lg border border-line bg-soft px-4 py-3 text-sm text-muted">
        {lang === "bn"
          ? "দুইকূল (Duikul) বিশ্বস্ত সংবাদমাধ্যম থেকে সংগৃহীত দেশি ও বিদেশি সংবাদ, এক জায়গায়। সব সংবাদ তার মূল সূত্রেই যুক্ত।"
          : "Duikul gathers Bangladesh and world news from trusted outlets, in one place. Every headline links back to its original source."}
      </p>
    </main>
  );
}
