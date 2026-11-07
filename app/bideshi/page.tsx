import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { ListingPage } from "@/components/listing";
import { getStories } from "@/lib/news";
import { breadcrumbJsonLd, collectionJsonLd, pageMeta } from "@/lib/seo";

/* Fresh news every 10 minutes, no matter what. */
export const revalidate = 600;

export const metadata: Metadata = pageMeta({
  path: "/bideshi",
  kicker: "বিদেশি সংবাদ — বিশ্ব",
  ogTitle: "বিদেশি সংবাদ — বিশ্বের বড় খবর",
  title: "বিদেশি সংবাদ — বিশ্বের বড় খবর বাংলায় | Duikul",
  description:
    "বিদেশি সংবাদ: বিশ্বের শীর্ষ সংবাদমাধ্যম থেকে সংগৃহীত আন্তর্জাতিক খবর, এক জায়গায় — সূত্রসংখ্যাসহ। World news Bangla প্রতি ১০ মিনিটে আপডেট, এখনই দেখুন।",
});

export default async function BideshiPage() {
  const stories = await getStories({ section: "bideshi", limit: 50 });

  return (
    <>
      <JsonLd
        data={[
          collectionJsonLd("বিদেশি — বিশ্বের সংবাদ", "/bideshi", stories),
          breadcrumbJsonLd([
            { name: "দুইকূল", path: "/" },
            { name: "বিদেশি সংবাদ", path: "/bideshi" },
          ]),
        ]}
      />
      <ListingPage
        heading={{ bn: "বিদেশি — বিশ্বের সংবাদ", en: "Bideshi — World News" }}
        headingAs="h1"
        intro={{
          bn: "বিশ্বের শীর্ষ সংবাদমাধ্যম থেকে সংগৃহীত বিদেশি সংবাদ (Bideshi news / World news Bangla) — আন্তর্জাতিক বড় খবর এক জায়গায়, একই ঘটনা একত্রে, সূত্রসংখ্যাসহ।",
          en: "Top world news (Bideshi) gathered from trusted international outlets — grouped by event, with a badge showing how many sources report it.",
        }}
        relatedLinks={[
          { href: "/deshi", bn: "দেশি সংবাদ", en: "Deshi news" },
          { href: "/categories", bn: "সব বিভাগ", en: "All categories" },
          { href: "/", bn: "আজকের শীর্ষ ৫", en: "Today's Top 5" },
        ]}
        stories={stories}
      />
    </>
  );
}
