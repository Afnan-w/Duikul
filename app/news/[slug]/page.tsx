/*
  ONE STORY - a permanent address:  /news/[slug]
  ====================================================
  Every headline on the site links here. The slug is part
  of the story's own link, so the address never changes.

  The server finds the story by slug. If the address is wrong or the
  story has rotated out of the feeds, we show the custom 404 page.
  The page NEVER shows a full article - the full report is always
  read on the original outlet's site.

  SEO: NewsArticle JSON-LD (freshness signals for Google News and
  Discover), BreadcrumbList, a speakable reading selector, and a
  related-stories block - one of the strongest internal links
  clusters on the site.
*/

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { StoryView } from "@/components/story-view";
import { getAllStories } from "@/lib/news";
import {
  breadcrumbJsonLd,
  newsArticleJsonLd,
  pageMeta,
  truncate,
} from "@/lib/seo";
import { categories } from "@/lib/site";
import type { Story } from "@/lib/rss";

type Props = { params: Promise<{ slug: string }> };

// Segment configs must be literal values - 600 matches the 10-minute
// feed cache in lib/news.ts.
export const revalidate = 600;

/** Next.js hands dynamic route params percent-encoded in some versions
    and decoded in others - match either way. */
function safeDecodeSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

async function findStory(rawSlug: string): Promise<Story | undefined> {
  const slug = safeDecodeSegment(rawSlug);
  const stories = await getAllStories();
  return stories.find((story) => story.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = await findStory(slug);

  if (!story) {
    return {
      title: "সংবাদ পাওয়া যায়নি | Page not found | Duikul",
      robots: { index: false, follow: false },
    };
  }

  const sectionKicker =
    story.section === "deshi" ? "দেশি সংবাদ" : "বিদেশি সংবাদ";
  const categoryLabel =
    categories.find((item) => item.slug === story.category)?.bn ?? "সংবাদ";

  return pageMeta({
    path: `/news/${story.slug}`,
    title: story.bn.title,
    kicker: `${sectionKicker} — ${categoryLabel}`,
    description:
      story.bn.excerpt && story.bn.excerpt !== story.bn.title
        ? story.bn.excerpt
        : `${story.bn.title} — ${sectionKicker}, বিশ্বস্ত সূত্র থেকে যুক্ত।`,
    type: "article",
    publishedTime: story.publishedAt,
    photoUrl: story.imageUrl,
  });
}

/** Related stories: same category first, then same section, newest first. */
function pickRelated(all: Story[], story: Story): Story[] {
  const others = all
    .filter((item) => item.slug !== story.slug)
    .sort(
      (a, b) =>
        (b.score ?? 0) - (a.score ?? 0) ||
        Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
    );

  const sameCategory = others.filter((item) => item.category === story.category);
  const rest = others.filter(
    (item) =>
      item.category !== story.category && item.section === story.section
  );

  return [...sameCategory, ...rest].slice(0, 6);
}

export default async function NewsStoryPage({ params }: Props) {
  const { slug } = await params;
  const story = await findStory(slug);

  if (!story) notFound();

  const path = `/news/${story.slug}`;
  const related = pickRelated(await getAllStories(), story);

  const sectionKicker =
    story.section === "deshi" ? "দেশি সংবাদ" : "বিদেশি সংবাদ";
  const sectionPath = story.section === "deshi" ? "/deshi" : "/bideshi";

  return (
    <>
      <JsonLd
        data={[
          newsArticleJsonLd(story, path),
          breadcrumbJsonLd([
            { name: "দুইকূল", path: "/" },
            { name: sectionKicker, path: sectionPath },
            { name: truncate(story.bn.title, 60), path },
          ]),
        ]}
      />
      {/* Related feeds the internal linking strategy - and reuse the
          already-cached story list (no extra feed downloads). */}
      <StoryView story={story} related={related} />
    </>
  );
}
