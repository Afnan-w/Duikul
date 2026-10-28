import type { NewsCategory } from "@/config/sources";

export type SectionConfig = {
  href: string;
  labelBn: string;
  labelEn: string;
  shortBn: string;
  shortEn: string;
  descriptionBn: string;
  descriptionEn: string;
  glyph: NewsCategory;
};

/**
 * The site has exactly two editorial sections. Everything the reader sees
 * about a section (label, description, route) comes from here so the
 * navigation, page metadata, and cards cannot drift apart.
 */
export const SECTIONS: Record<NewsCategory, SectionConfig> = {
  deshi: {
    href: "/deshi",
    labelBn: "দেশি খবর",
    labelEn: "Bangladesh",
    shortBn: "দেশি",
    shortEn: "Bangladesh",
    descriptionBn:
      "বাংলাদেশের রাজনীতি, অর্থনীতি, সমাজ ও দৈনন্দিন জীবনের জরুরি খবর — একাধিক নির্ভরযোগ্য সূত্রে যাচাই করা।",
    descriptionEn:
      "Bangladesh's politics, economy, society, and daily life, cross-checked across independent outlets.",
    glyph: "deshi",
  },
  bideshi: {
    href: "/bideshi",
    labelBn: "বিদেশি খবর",
    labelEn: "World",
    shortBn: "বিদেশি",
    shortEn: "World",
    descriptionBn:
      "বিশ্বের রাজনীতি, সংঘাত, অর্থনীতি ও জলবায়ুর গুরুত্বপূর্ণ খবর — বাংলাদেশি পাঠকের জন্য নির্বাচিত।",
    descriptionEn:
      "World politics, conflict, economy, and climate — selected for readers in Bangladesh.",
    glyph: "bideshi",
  },
};

export const SECTION_LIST: readonly SectionConfig[] = [
  SECTIONS.deshi,
  SECTIONS.bideshi,
];

export function sectionFor(category: NewsCategory): SectionConfig {
  return SECTIONS[category];
}
