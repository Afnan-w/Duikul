import type { Metadata } from "next";
import { SearchResults } from "@/components/search-results";
import { getAllStories } from "@/lib/news";

type Props = { searchParams: Promise<{ q?: string }> };

/* The list of stories behind search refreshes every 10 minutes. */
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Search",
  description: "Search Duikul for news by keyword.",
  // Search results are on-page tools, not content for Google.
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const stories = await getAllStories();
  return <SearchResults query={q ?? ""} stories={stories} />;
}
