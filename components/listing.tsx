"use client";

/*
  Generic listing page used by /deshi, /bideshi and /category/[name].
  Stories are downloaded by the SERVER in each page file and passed
  in as a prop - this component only displays them.
*/

import { useLanguage } from "@/components/language";
import {
  LatestStoryRow,
  SectionHeading,
  type StoryLike,
} from "@/components/story";
import { ui } from "@/lib/site";

export function ListingPage({
  heading,
  stories,
}: {
  heading: { bn: string; en: string };
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
      <p className="mb-6 rounded-lg border border-accent/25 bg-accent-soft px-4 py-3 text-sm text-accent">
        {lang === "bn"
          ? "প্রতি ১০ মিনিটে নিজে নিজে আপডেট · যে সংবাদ বেশি সূত্রে প্রতিবেদন করা হয়েছে ও সাম্প্রতিক, সেটি আগে"
          : "Updates every 10 minutes · Stories reported by more outlets, and more recently, rank first"}
      </p>

      <SectionHeading title={heading[lang]} lang={lang} />

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
    </main>
  );
}
