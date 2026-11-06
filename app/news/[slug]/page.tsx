/*
  ONE STORY - a permanent address:  /news/[slug]
  ====================================================
  Stage D. Every headline on the site links here. The slug is part
  of the story's own link, so the address never changes.

  The server finds the story by slug. If the address is wrong or the
  story has rotated out of the feeds, we show the custom 404 page.
  The page NEVER shows a full article - the full report is always
  read on the original outlet's site.
*/

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryView } from "@/components/story-view";
import { getAllStories } from "@/lib/news";
import { siteConfig } from "@/lib/site";
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

/** Feeds give image addresses in many shapes (https://, //host, none)
    - share previews need a full absolute address, or nothing. */
function absoluteImage(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  return undefined;
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

  const ogImage = absoluteImage(story.imageUrl);

  return {
    title: story.bn.title,
    description: story.bn.excerpt,
    alternates: { canonical: `/news/${story.slug}` },
    openGraph: {
      title: story.bn.title,
      description: story.bn.excerpt,
      url: `/news/${story.slug}`,
      type: "article",
      publishedTime: story.publishedAt,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: story.bn.title,
      description: story.bn.excerpt,
    },
  };
}

export default async function NewsStoryPage({ params }: Props) {
  const { slug } = await params;
  const story = await findStory(slug);

  if (!story) notFound();

  /* Structured data (Stage F): Google News and the Discover feed read
     this. The reported-by-M-outlets listing is expressed honestly as
     `citation`; the original outlet is the `author`. */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: story.bn.title,
    description: story.bn.excerpt,
    ...(absoluteImage(story.imageUrl) ? { image: [absoluteImage(story.imageUrl)] } : {}),
    datePublished: story.publishedAt,
    dateModified: story.publishedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/news/${story.slug}`,
    },
    author: [
      { "@type": "Organization", name: story.outlets[0]?.name ?? "Duikul" },
    ],
    publisher: { "@type": "Organization", name: "Duikul", url: siteConfig.url },
    isAccessibleForFree: true,
    ...(story.outlets.length > 1
      ? { citation: story.outlets.map((outlet) => outlet.url) }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON inside HTML must never contain a raw "<".
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* Story is a StoryLike (plus server-only extras the view ignores). */}
      <StoryView story={story} />
    </>
  );
}
