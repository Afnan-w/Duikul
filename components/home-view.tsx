"use client";

/*
  HOME PAGE VIEW (client component - the language toggle lives here).
  The news itself is downloaded by the SERVER in app/page.tsx and
  handed to this component as a prop, so the page stays fast.
*/

import { useLanguage } from "@/components/language";
import {
  LatestStoryRow,
  NumberedStoryRow,
  SectionHeading,
  TopStoryCard,
  type StoryLike,
} from "@/components/story";
import { ui } from "@/lib/site";

export function HomeView({ stories }: { stories: StoryLike[] }) {
  const { lang } = useLanguage();

  // Ranked order (coverage + trust + freshness) picks the Top Story
  // and the two "Top 5" lists; the Latest list is strictly by time.
  const ranked = [...stories].sort(
    (a, b) =>
      (b.score ?? 0) - (a.score ?? 0) ||
      Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
  );
  const byDate = [...stories].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
  );

  const topStory = ranked[0];
  const deshi = ranked.filter((s) => s.section === "deshi").slice(0, 5);
  const bideshi = ranked.filter((s) => s.section === "bideshi").slice(0, 5);
  const latest = byDate.slice(0, 20);

  if (!topStory) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 pt-8 pb-8 sm:px-6">
        <p className="article-body rounded-lg border border-accent/25 bg-accent-soft px-4 py-6 text-center text-accent">
          {lang === "bn"
            ? "সংবাদ আনা হচ্ছে... কিছুক্ষণ পর পাতাটি রিফ্রেশ করুন।"
            : "Fetching the news... please refresh this page in a moment."}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-8 pb-4 sm:px-6">
      {/* 1. Top story */}
      <TopStoryCard story={topStory} lang={lang} />

      {/* 2. Top 5 Deshi + Top 5 Bideshi */}
      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-12">
        <section aria-labelledby="deshi-heading">
          <div id="deshi-heading">
            <SectionHeading
              title={`${ui.deshi[lang]} — ${lang === "bn" ? "শীর্ষ ৫" : "Top 5"}`}
              href="/deshi"
              lang={lang}
            />
          </div>
          <ol className="divide-y divide-line">
            {deshi.map((story, index) => (
              <NumberedStoryRow
                key={story.slug}
                story={story}
                index={index}
                lang={lang}
              />
            ))}
          </ol>
        </section>

        <section aria-labelledby="bideshi-heading">
          <div id="bideshi-heading">
            <SectionHeading
              title={`${ui.bideshi[lang]} — ${lang === "bn" ? "শীর্ষ ৫" : "Top 5"}`}
              href="/bideshi"
              lang={lang}
            />
          </div>
          <ol className="divide-y divide-line">
            {bideshi.map((story, index) => (
              <NumberedStoryRow
                key={story.slug}
                story={story}
                index={index}
                lang={lang}
              />
            ))}
          </ol>
        </section>
      </div>

      {/* 3. Latest */}
      <section aria-labelledby="latest-heading" className="mt-12">
        <div id="latest-heading">
          <SectionHeading title={ui.latest[lang]} lang={lang} />
        </div>
        <ol className="divide-y divide-line">
          {latest.map((story) => (
            <LatestStoryRow key={story.slug} story={story} lang={lang} />
          ))}
        </ol>
      </section>
    </main>
  );
}
