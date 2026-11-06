import type { Metadata } from "next";
import { ListingPage } from "@/components/listing";
import { getStories } from "@/lib/news";

/* Fresh news every 10 minutes, no matter what. */
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Bideshi - Top World News",
  description:
    "Top, most popular and trustworthy world news from trusted outlets, grouped by story.",
  alternates: { canonical: "/bideshi" },
};

export default async function BideshiPage() {
  const stories = await getStories({ section: "bideshi", limit: 50 });

  return (
    <ListingPage
      heading={{ bn: "বিদেশি — বিশ্বের সংবাদ", en: "Bideshi — World News" }}
      stories={stories}
    />
  );
}
