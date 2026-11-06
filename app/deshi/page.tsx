import type { Metadata } from "next";
import { ListingPage } from "@/components/listing";
import { getStories } from "@/lib/news";

/* Fresh news every 10 minutes, no matter what. */
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Deshi - Top Bangladesh News",
  description:
    "Top, most popular and trustworthy Bangladesh news from trusted outlets, grouped by story.",
  alternates: { canonical: "/deshi" },
};

export default async function DeshiPage() {
  const stories = await getStories({ section: "deshi", limit: 50 });

  return (
    <ListingPage
      heading={{ bn: "দেশি — বাংলাদেশের সংবাদ", en: "Deshi — Bangladesh News" }}
      stories={stories}
    />
  );
}
