export type NewsCategory = "deshi" | "bideshi";
export type FeedLanguage = "bn" | "en";

export type NewsSource = {
  id: string;
  name: string;
  nameBn: string;
  category: NewsCategory;
  rssUrl: string;
  siteUrl: string;
  /** Editorial trust weight, 1–5. Used only in transparent agreement scoring. */
  trustWeight: 1 | 2 | 3 | 4 | 5;
  language: FeedLanguage;
};

/**
 * Whitelisted RSS sources only.
 *
 * Every URL below was fetched successfully by `npm run check:feeds` on
 * 2026-10-28. When a publisher retires or blocks a feed, the checker flags it;
 * remove it here rather than adding a proxy or bypass.
 */
export const SOURCES: readonly NewsSource[] = [
  // ---------------------------------------------------------------- Deshi
  {
    id: "prothom-alo",
    name: "Prothom Alo",
    nameBn: "প্রথম আলো",
    category: "deshi",
    rssUrl: "https://www.prothomalo.com/stories.rss",
    siteUrl: "https://www.prothomalo.com",
    trustWeight: 5,
    language: "bn",
  },
  {
    id: "the-daily-star",
    name: "The Daily Star",
    nameBn: "দ্য ডেইলি স্টার",
    category: "deshi",
    rssUrl: "https://www.thedailystar.net/taxonomy/term/1/rss.xml",
    siteUrl: "https://www.thedailystar.net",
    trustWeight: 5,
    language: "en",
  },
  {
    id: "dhaka-tribune",
    name: "Dhaka Tribune",
    nameBn: "ঢাকা ট্রিবিউন",
    category: "deshi",
    rssUrl: "https://www.dhakatribune.com/feed/",
    siteUrl: "https://www.dhakatribune.com",
    trustWeight: 4,
    language: "en",
  },
  {
    id: "bdnews24",
    name: "bdnews24",
    nameBn: "বিডিনিউজ২৪",
    category: "deshi",
    rssUrl:
      "https://prod-qt-images.s3.amazonaws.com/production/bdnews24-english/feed.xml",
    siteUrl: "https://bdnews24.com",
    trustWeight: 4,
    language: "en",
  },
  {
    id: "the-business-standard",
    name: "The Business Standard",
    nameBn: "দ্য বিজনেস স্ট্যান্ডার্ড",
    category: "deshi",
    rssUrl: "https://www.tbsnews.net/bangladesh/rss.xml",
    siteUrl: "https://www.tbsnews.net",
    trustWeight: 4,
    language: "en",
  },
  {
    id: "samakal",
    name: "Samakal",
    nameBn: "সমকাল",
    category: "deshi",
    rssUrl: "https://samakal.com/rss",
    siteUrl: "https://samakal.com",
    trustWeight: 4,
    language: "bn",
  },
  {
    id: "bbc-bangla",
    name: "BBC Bangla",
    nameBn: "বিবিসি বাংলা",
    category: "deshi",
    rssUrl: "https://feeds.bbci.co.uk/bengali/rss.xml",
    siteUrl: "https://www.bbc.com/bengali",
    trustWeight: 5,
    language: "bn",
  },
  {
    id: "ajker-patrika",
    name: "Ajker Patrika",
    nameBn: "আজকের পত্রিকা",
    category: "deshi",
    rssUrl: "https://www.ajkerpatrika.com/feed",
    siteUrl: "https://www.ajkerpatrika.com",
    trustWeight: 4,
    language: "bn",
  },
  {
    id: "ittefaq",
    name: "The Daily Ittefaq",
    nameBn: "দৈনিক ইত্তেফাক",
    category: "deshi",
    rssUrl: "https://en.ittefaq.com.bd/feed/bangladesh",
    siteUrl: "https://en.ittefaq.com.bd",
    trustWeight: 4,
    language: "en",
  },
  {
    id: "bss",
    name: "Bangladesh Sangbad Sangstha",
    nameBn: "বাংলাদেশ সংবাদ সংস্থা",
    category: "deshi",
    rssUrl: "https://www.bssnews.net/rss/rss.xml",
    siteUrl: "https://www.bssnews.net",
    trustWeight: 5,
    language: "en",
  },
  {
    id: "jagonews24",
    name: "JagoNews24",
    nameBn: "জাগোনিউজ২৪",
    category: "deshi",
    rssUrl: "https://www.jagonews24.com/rss/rss.xml",
    siteUrl: "https://www.jagonews24.com",
    trustWeight: 3,
    language: "bn",
  },

  // -------------------------------------------------------------- Bideshi
  {
    id: "bbc-world",
    name: "BBC News World",
    nameBn: "বিবিসি ওয়ার্ল্ড",
    category: "bideshi",
    rssUrl: "https://feeds.bbci.co.uk/news/world/rss.xml",
    siteUrl: "https://www.bbc.com/news/world",
    trustWeight: 5,
    language: "en",
  },
  {
    id: "al-jazeera",
    name: "Al Jazeera",
    nameBn: "আল জাজিরা",
    category: "bideshi",
    rssUrl: "https://www.aljazeera.com/xml/rss/all.xml",
    siteUrl: "https://www.aljazeera.com",
    trustWeight: 4,
    language: "en",
  },
  {
    id: "dw",
    name: "DW",
    nameBn: "ডিডব্লিউ",
    category: "bideshi",
    rssUrl: "https://rss.dw.com/rdf/rss-en-top",
    siteUrl: "https://www.dw.com",
    trustWeight: 5,
    language: "en",
  },
  {
    id: "guardian-world",
    name: "The Guardian World",
    nameBn: "দ্য গার্ডিয়ান",
    category: "bideshi",
    rssUrl: "https://www.theguardian.com/world/rss",
    siteUrl: "https://www.theguardian.com/world",
    trustWeight: 5,
    language: "en",
  },
  {
    id: "npr-world",
    name: "NPR World",
    nameBn: "এনপিআর",
    category: "bideshi",
    rssUrl: "https://feeds.npr.org/1004/rss.xml",
    siteUrl: "https://www.npr.org/world",
    trustWeight: 4,
    language: "en",
  },
  {
    id: "france-24",
    name: "France 24",
    nameBn: "ফ্রান্স ২৪",
    category: "bideshi",
    rssUrl: "https://www.france24.com/en/rss",
    siteUrl: "https://www.france24.com/en",
    trustWeight: 4,
    language: "en",
  },
  {
    id: "sky-news",
    name: "Sky News World",
    nameBn: "স্কাই নিউজ",
    category: "bideshi",
    rssUrl: "https://feeds.skynews.com/feeds/rss/world.xml",
    siteUrl: "https://news.sky.com/world",
    trustWeight: 4,
    language: "en",
  },
  {
    id: "euronews",
    name: "Euronews",
    nameBn: "ইউরোনিউজ",
    category: "bideshi",
    rssUrl: "https://www.euronews.com/rss?level=theme&name=news",
    siteUrl: "https://www.euronews.com",
    trustWeight: 4,
    language: "en",
  },
];

export const DESHI_SOURCES = SOURCES.filter(
  (source) => source.category === "deshi",
);
export const BIDESHI_SOURCES = SOURCES.filter(
  (source) => source.category === "bideshi",
);

export const SOURCE_BY_ID = new Map(SOURCES.map((source) => [source.id, source]));

export function getSource(id: string): NewsSource | undefined {
  return SOURCE_BY_ID.get(id);
}

export function getSourceName(
  id: string,
  lang: "bn" | "en" = "bn",
): string {
  const source = SOURCE_BY_ID.get(id);
  if (!source) return id;
  return lang === "bn" ? source.nameBn : source.name;
}

export function sourcesForCategory(category: NewsCategory): readonly NewsSource[] {
  return category === "deshi" ? DESHI_SOURCES : BIDESHI_SOURCES;
}
