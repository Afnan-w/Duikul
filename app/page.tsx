import type { Metadata } from "next";
import { HomeView } from "@/components/home-view";
import { getAllStories } from "@/lib/news";
import { siteConfig } from "@/lib/site";

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

export const metadata: Metadata = {
  title: "Duikul - Top Bangladesh & World News, Verified from Trusted Sources",
  description:
    "Top Bangladesh (Deshi) and world (Bideshi) news gathered from trusted outlets, grouped by story so you can see how many sources are reporting it.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const stories = await getAllStories();

  /* Structured data (Stage F): tells Google "this is a news website
     in Bangla, and you can search it with /search?q=..." */
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Duikul",
      url: siteConfig.url,
      description: siteConfig.descriptionEn,
      inLanguage: "bn",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteConfig.url}/search?q={query}`,
        },
        "query-input": "required name=query",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Duikul",
      url: siteConfig.url,
      description: siteConfig.descriptionEn,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        // JSON inside HTML must never contain a raw "<".
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <HomeView stories={stories} />
    </>
  );
}
