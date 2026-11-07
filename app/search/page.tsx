import type { Metadata } from "next";
import { SearchResults } from "@/components/search-results";
import { getAllStories } from "@/lib/news";
import { languageAlternates, truncate } from "@/lib/seo";

type Props = { searchParams: Promise<{ q?: string }> };

/* The list of stories behind search refreshes every 10 minutes. */
export const revalidate = 600;

export const metadata: Metadata = {
  title: "খুঁজুন — সংবাদে শব্দ মেলান | Search",
  description: truncate(
    "দুইকূলের সব দেশি ও বিদেশি সংবাদে শব্দ মেলান: শিরোনাম ও সারসংক্ষেপ ধরে সোজা ফলাফল। ইংরেজি শব্দেও কাজ করে সার্চ।",
    155
  ),
  // Search results are on-page tools, not content for Google.
  robots: { index: false, follow: true },
  alternates: {
    canonical: "/search",
    languages: languageAlternates("/search"),
  },
};

/** Clean the user query for safe display. */
function safeQuery(value: string | undefined): string {
  if (!value) return "";
  return truncate(value.replace(/[<>"]/g, ""), 80);
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const stories = await getAllStories();
  return <SearchResults query={safeQuery(q)} stories={stories} />;
}
