import type { Metadata } from "next";
import { HomeView } from "@/components/home-view";
import { HomeFaq, WhyDuikul } from "@/components/home-extra";
import { JsonLd } from "@/components/json-ld";
import { getAllStories } from "@/lib/news";
import {
  itemListJsonLd,
  organizationJsonLd,
  pageMeta,
  webSiteJsonLd,
} from "@/lib/seo";

/*
  HOME PAGE (server component)
  ----------------------------
  This runs on the server, downloads all 15 feeds ONCE every
  10 minutes (Vercel caches them) and passes the stories to the
  client view below. The visitor's browser never talks to the
  news sites directly.
*/

/* The page HTML itself is refreshed every 10 minutes too. */
export const revalidate = 600;

export const metadata: Metadata = pageMeta({
  path: "/",
  title: "দুইকূল — দেশি ও বিদেশি সংবাদ, এক জায়গায় | Duikul BD News",
  ogTitle: "দুইকূল — দেশি ও বিদেশি সংবাদ, এক জায়গায়",
  kicker: "বিশ্বস্ত সূত্র, এক জায়গায়",
  description:
    "বিশ্বস্ত সংবাদমাধ্যম থেকে সংগৃহীত দেশি ও বিদেশি সংবাদ, এক জায়গায় — দুইকূলে। শীর্ষ ৫ দেশি-বিদেশি খবর, প্রতি ১০ মিনিটে আপডেট, মূল সূত্রে এক ক্লিকে।",
});

export default async function HomePage() {
  const stories = await getAllStories();

  /*
    Structured data: the WebSite + SearchAction, the organisation
    with its verifiable identity, and ItemLists for the two daily
    "দেশি — শীর্ষ ৫" / "বিদেশি — শীর্ষ ৫" sections.
  */
  const ranked = [...stories].sort(
    (a, b) =>
      (b.score ?? 0) - (a.score ?? 0) ||
      Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
  );
  const deshiTop5 = ranked.filter((s) => s.section === "deshi").slice(0, 5);
  const bideshiTop5 = ranked.filter((s) => s.section === "bideshi").slice(0, 5);

  const jsonLd = [
    webSiteJsonLd(),
    organizationJsonLd(),
    itemListJsonLd("দেশি — শীর্ষ ৫ (Deshi news top 5)", deshiTop5),
    itemListJsonLd("বিদেশি — শীর্ষ ৫ (Bideshi world news top 5)", bideshiTop5),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <HomeView stories={stories}>
        <WhyDuikul />
        <HomeFaq />
      </HomeView>
    </>
  );
}
