/*
  ============================================================
  SITE-WIDE SETTINGS  (edit these - plain text only)
  ============================================================
  Everything that appears in more than one place lives here so you
  only ever have to change it once.
*/

/** Where the site will live online.
 *  - During local development the fallback below is fine.
 *  - In Stage G (deploy) you set NEXT_PUBLIC_SITE_URL in Vercel
 *    to the real address, e.g. https://duikul.vercel.app
 *  This is used for canonical URLs, sitemaps and share images. */
export const siteConfig = {
  name: "Duikul",
  nameBn: "দুইকূল",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://duikul.vercel.app",
  tagline:
    "দুইকূল — দেশি ও বিদেশি সংবাদ, এক জায়গায় | Duikul BD News",
  descriptionEn:
    "Deshi & Bideshi news from trusted Bangladesh and world outlets, in one place — every story linked to its original source.",
  descriptionBn:
    "বিশ্বস্ত সংবাদমাধ্যম থেকে সংগৃহীত দেশি ও বিদেশি সংবাদ, এক জায়গায়। দুইকূল — সব সংবাদ তার মূল সূত্রেই যুক্ত।",
  /** Change this if you buy a different domain. */
  languageDefault: "bn" as "bn" | "en",
  /** Profiled logo for search engines (square PNG, served from this site). */
  logo: "/icons/icon-512.png",
  /** The owner's public profiles (used in the Organization schema). */
  sameAs: [
    "https://www.instagram.com/wamphead/",
    "https://github.com/Afnan-w",
  ],
};

/** Category pages. Add a new one here and it appears in the menu. */
export const categories: { slug: string; bn: string; en: string }[] = [
  { slug: "politics", bn: "রাজনীতি", en: "Politics" },
  { slug: "business", bn: "বাণিজ্য", en: "Business" },
  { slug: "sports", bn: "খেলাধুলা", en: "Sports" },
  { slug: "technology", bn: "প্রযুক্তি", en: "Technology" },
  { slug: "entertainment", bn: "বিনোদন", en: "Entertainment" },
  { slug: "health", bn: "স্বাস্থ্য", en: "Health" },
];

/** Main navigation. href must match a real folder in app/. */
export const navLinks: { href: string; bn: string; en: string }[] = [
  { href: "/", bn: "হোম", en: "Home" },
  { href: "/deshi", bn: "দেশি", en: "Deshi" },
  { href: "/bideshi", bn: "বিদেশি", en: "Bideshi" },
  { href: "/categories", bn: "বিভাগ", en: "Categories" },
];

/** Short UI translations so the language toggle works everywhere. */
export const ui = {
  search: { bn: "খুঁজুন", en: "Search" },
  searchPlaceholder: { bn: "সংবাদ খুঁজুন...", en: "Search news..." },
  menu: { bn: "মেনু", en: "Menu" },
  close: { bn: "বন্ধ", en: "Close" },
  textSize: { bn: "লেখার আকার", en: "Text size" },
  topStory: { bn: "শীর্ষ সংবাদ", en: "Top Story" },
  deshi: { bn: "দেশি", en: "Deshi" },
  bideshi: { bn: "বিদেশি", en: "Bideshi" },
  latest: { bn: "সর্বশেষ", en: "Latest" },
  reportedBy: { bn: "{n}টি সূত্রে প্রতিবেদন", en: "Reported by {n} outlets" },
  readFull: { bn: "পূর্ণ সংবাদ পড়ুন", en: "Read full story" },
  whyItMatters: { bn: "কেন গুরুত্বপূর্ণ", en: "Why it matters" },
  allCategories: { bn: "সব বিভাগ", en: "All categories" },
};

/** Helper: pick the right language from a { bn, en } pair. */
export function pick(
  lang: "bn" | "en",
  pair: { bn: string; en: string }
): string {
  return lang === "en" ? pair.en : pair.bn;
}
