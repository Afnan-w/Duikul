import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { ListingPage } from "@/components/listing";
import { getStories } from "@/lib/news";
import { breadcrumbJsonLd, collectionJsonLd, pageMeta } from "@/lib/seo";

/* Fresh news every 10 minutes, no matter what. */
export const revalidate = 600;

export const metadata: Metadata = pageMeta({
  path: "/deshi",
  kicker: "দেশি সংবাদ — বাংলাদেশ",
  ogTitle: "দেশি সংবাদ — বাংলাদেশের শীর্ষ খবর",
  title: "দেশি সংবাদ — শীর্ষ বাংলাদেশ নিউজ, এক জায়গায় | Duikul",
  description:
    "শীর্ষ দেশি সংবাদ: বিশ্বস্ত বাংলাদেশি সংবাদমাধ্যম থেকে সংগৃহীত, একই ঘটনা এক পাতায়, সূত্রসংখ্যাসহ। প্রতি ১০ মিনিটে আপডেট হওয়া Bangladesh news এখনই দেখুন।",
});

export default async function DeshiPage() {
  const stories = await getStories({ section: "deshi", limit: 50 });

  return (
    <>
      <JsonLd
        data={[
          collectionJsonLd("দেশি — বাংলাদেশের সংবাদ", "/deshi", stories),
          breadcrumbJsonLd([
            { name: "দুইকূল", path: "/" },
            { name: "দেশি সংবাদ", path: "/deshi" },
          ]),
        ]}
      />
      <ListingPage
        heading={{ bn: "দেশি — বাংলাদেশের সংবাদ", en: "Deshi — Bangladesh News" }}
        headingAs="h1"
        intro={{
          bn: "বিশ্বস্ত সংবাদমাধ্যম থেকে সংগৃহীত দেশি সংবাদ (Deshi news) — বাংলাদেশ নিউজ এক জায়গায়, একই ঘটনা একত্রে, কতগুলো সূত্র প্রতিবেদন করেছে তা ব্যাজে দেখা যায়।",
          en: "Top Bangladesh news (Deshi) gathered from trusted outlets — grouped by event, with a badge showing how many sources report it.",
        }}
        relatedLinks={[
          { href: "/bideshi", bn: "বিদেশি সংবাদ", en: "Bideshi news" },
          { href: "/categories", bn: "সব বিভাগ", en: "All categories" },
          { href: "/", bn: "আজকের শীর্ষ ৫", en: "Today's Top 5" },
        ]}
        stories={stories}
      />
    </>
  );
}
