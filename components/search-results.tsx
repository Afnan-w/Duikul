"use client";

/*
  Search results view.
  The stories arrive from the server (app/search/page.tsx);
  this component filters them by the typed query in whichever
  language the visitor is viewing.
*/

import { useLanguage } from "@/components/language";
import {
  LatestStoryRow,
  SectionHeading,
  type StoryLike,
} from "@/components/story";

export function SearchResults({
  query,
  stories,
}: {
  query: string;
  stories: StoryLike[];
}) {
  const { lang } = useLanguage();
  const needle = query.trim().toLowerCase();

  const matches: StoryLike[] = needle
    ? stories.filter((story) => {
        const haystack = [
          story.bn.title,
          story.bn.excerpt,
          story.en.title,
          story.en.excerpt,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(needle);
      })
    : [];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-8 pb-8 sm:px-6">
      <SectionHeading
        title={
          needle
            ? lang === "bn"
              ? `“${query}” এর ফলাফল`
              : `Results for “${query}”`
            : lang === "bn"
              ? "সংবাদ খুঁজুন"
              : "Search news"
        }
        lang={lang}
      />

      {!needle ? (
        <p className="article-body py-12 text-muted">
          {lang === "bn"
            ? "উপরের সার্চ বাক্সে কোনো শব্দ লিখে খুঁজুন।"
            : "Type a word in the search box above to find stories."}
        </p>
      ) : matches.length === 0 ? (
        <p className="article-body py-12 text-muted">
          {lang === "bn"
            ? "কিছু পাওয়া যায়নি। অন্য শব্দ দিয়ে চেষ্টা করুন।"
            : "Nothing found. Try another word."}
        </p>
      ) : (
        <>
          <ol className="divide-y divide-line">
            {matches.slice(0, 50).map((story) => (
              <LatestStoryRow key={story.slug} story={story} lang={lang} />
            ))}
          </ol>
          <p className="mt-6 text-sm text-muted">
            {lang === "bn"
              ? `${matches.length}টি ফলাফল`
              : `${matches.length} results`}
          </p>
        </>
      )}
    </main>
  );
}
