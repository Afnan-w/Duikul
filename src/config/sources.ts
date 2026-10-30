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

/**
 * Two or three factual sentences per publisher, shown on `/source/[id]`.
 * These are deliberately descriptive rather than evaluative: who publishes
 * the outlet, what it covers, and where its reporting appears online. Do not
 * add claims about quality, awards, or ownership without a citable source.
 */
export type SourceProfile = {
  bn: string;
  en: string;
};

export const SOURCE_PROFILES: Record<string, SourceProfile> = {
  "prothom-alo": {
    bn: "প্রথম আলো বাংলাদেশ থেকে প্রকাশিত একটি বাংলা ভাষার দৈনিক সংবাদপত্র। এটি জাতীয়, রাজনীতি, ব্যবসা ও আন্তর্জাতিক সংবাদ প্রকাশ করে এবং prothomalo.com-এ অনলাইনে পাওয়া যায়।",
    en: "Prothom Alo is a Bengali-language daily newspaper published in Bangladesh. It covers national, political, business, and international news, and publishes online at prothomalo.com.",
  },
  "the-daily-star": {
    bn: "দ্য ডেইলি স্টার ঢাকা থেকে প্রকাশিত একটি ইংরেজি ভাষার দৈনিক সংবাদপত্র। এটি বাংলাদেশ ও বিশ্বের সংবাদ প্রকাশ করে এবং thedailystar.net-এ অনলাইনে পাওয়া যায়।",
    en: "The Daily Star is an English-language daily newspaper published from Dhaka, Bangladesh. It covers Bangladeshi and world news and publishes online at thedailystar.net.",
  },
  "dhaka-tribune": {
    bn: "ঢাকা ট্রিবিউন ঢাকায় প্রকাশিত একটি ইংরেজি ভাষার দৈনিক সংবাদপত্র। এটি রাজনীতি, ব্যবসা ও আন্তর্জাতিক সংবাদ প্রকাশ করে এবং dhakatribune.com-এ অনলাইনে পাওয়া যায়।",
    en: "Dhaka Tribune is an English-language daily newspaper published in Dhaka, Bangladesh. It covers politics, business, and international news and publishes online at dhakatribune.com.",
  },
  bdnews24: {
    bn: "বিডিনিউজ২৪ ঢাকাভিত্তিক একটি বাংলাদেশি সংবাদ ওয়েবসাইট। এটি বাংলা ও ইংরেজিতে সর্বশেষ সংবাদ প্রকাশ করে এবং bdnews24.com-এ অনলাইনে পাওয়া যায়।",
    en: "bdnews24 is a Bangladeshi news website based in Dhaka. It publishes breaking news and current affairs in Bangla and English at bdnews24.com.",
  },
  "the-business-standard": {
    bn: "দ্য বিজনেস স্ট্যান্ডার্ড বাংলাদেশের একটি ইংরেজি ভাষার দৈনিক, যার মূল মনোযোগ ব্যবসা ও অর্থনীতিতে। এটি tbsnews.net-এ অনলাইনে প্রকাশিত হয়।",
    en: "The Business Standard is an English-language daily in Bangladesh with a focus on business and the economy. It publishes online at tbsnews.net.",
  },
  samakal: {
    bn: "সমকাল ঢাকা থেকে প্রকাশিত একটি বাংলা ভাষার দৈনিক সংবাদপত্র। এটি জাতীয় ও আন্তর্জাতিক সংবাদ প্রকাশ করে এবং samakal.com-এ অনলাইনে পাওয়া যায়।",
    en: "Samakal is a Bengali-language daily newspaper published from Dhaka, Bangladesh. It covers national and international news and publishes online at samakal.com.",
  },
  "bbc-bangla": {
    bn: "বিবিসি বাংলা বিবিসি ওয়ার্ল্ড সার্ভিসের বাংলা ভাষার সংবাদ সেবা। এটি সংবাদ, বিশ্লেষণ ও ফিচার প্রকাশ করে এবং bbc.com/bengali-এ অনলাইনে পাওয়া যায়।",
    en: "BBC Bangla is the Bengali-language news service of the BBC World Service. It publishes news, analysis, and features at bbc.com/bengali.",
  },
  "ajker-patrika": {
    bn: "আজকের পত্রিকা বাংলাদেশে প্রকাশিত একটি বাংলা ভাষার দৈনিক সংবাদপত্র। এটি জাতীয় ও আন্তর্জাতিক সংবাদ প্রকাশ করে এবং ajkerpatrika.com-এ অনলাইনে পাওয়া যায়।",
    en: "Ajker Patrika is a Bengali-language daily newspaper published in Bangladesh. It covers national and international news and publishes online at ajkerpatrika.com.",
  },
  ittefaq: {
    bn: "দৈনিক ইত্তেফাক বাংলাদেশের একটি পুরনো বাংলা ভাষার দৈনিক সংবাদপত্র। এখানে ব্যবহৃত ফিডটি এর ইংরেজি সংস্করণ en.ittefaq.com.bd থেকে আসে।",
    en: "The Daily Ittefaq is a long-established Bengali-language daily newspaper in Bangladesh. The feed used here is its English-language edition at en.ittefaq.com.bd.",
  },
  bss: {
    bn: "বাংলাদেশ সংবাদ সংস্থা (বিএসএস) বাংলাদেশের জাতীয় সংবাদ সংস্থা। এটি বাংলা ও ইংরেজিতে সংবাদ প্রকাশ করে এবং bssnews.net-এ অনলাইনে পাওয়া যায়।",
    en: "Bangladesh Sangbad Sangstha (BSS) is the national news agency of Bangladesh. It publishes news in Bangla and English at bssnews.net.",
  },
  jagonews24: {
    bn: "জাগোনিউজ২৪ বাংলাদেশভিত্তিক একটি বাংলা ভাষার অনলাইন সংবাদ পোর্টাল। এটি জাতীয়, রাজনীতি ও সমসাময়িক বিষয় প্রকাশ করে এবং jagonews24.com-এ পাওয়া যায়।",
    en: "JagoNews24 is a Bengali-language online news portal based in Bangladesh. It covers national, political, and current affairs at jagonews24.com.",
  },
  "bbc-world": {
    bn: "বিবিসি ওয়ার্ল্ড বিবিসি নিউজের আন্তর্জাতিক সংবাদ বিভাগ। এটি বিশ্বের সংবাদ ও বিশ্লেষণ প্রকাশ করে এবং bbc.com/news/world-এ পাওয়া যায়।",
    en: "BBC News World is the international news section of BBC News. It publishes world news and analysis at bbc.com/news/world.",
  },
  "al-jazeera": {
    bn: "আল জাজিরা কাতারের দোহায় অবস্থিত একটি আন্তর্জাতিক সংবাদ নেটওয়ার্ক। এর ইংরেজি সেবা বিশ্বের সংবাদ প্রকাশ করে এবং aljazeera.com-এ পাওয়া যায়।",
    en: "Al Jazeera is an international news network headquartered in Doha, Qatar. Its English-language service publishes world news at aljazeera.com.",
  },
  dw: {
    bn: "ডিডব্লিউ জার্মানির আন্তর্জাতিক সম্প্রচার সংস্থা। এর ইংরেজি সেবা বিশ্বের সংবাদ ও বিশ্লেষণ প্রকাশ করে এবং dw.com-এ পাওয়া যায়।",
    en: "DW is Germany's international broadcaster. Its English-language service publishes world news and analysis at dw.com.",
  },
  "guardian-world": {
    bn: "দ্য গার্ডিয়ান যুক্তরাজ্যের একটি দৈনিক সংবাদপত্র। এর বিশ্ব সংবাদ বিভাগ আন্তর্জাতিক প্রতিবেদন প্রকাশ করে এবং theguardian.com/world-এ পাওয়া যায়।",
    en: "The Guardian is a British daily newspaper. Its world news desk publishes international reporting at theguardian.com/world.",
  },
  "npr-world": {
    bn: "এনপিআর মার্কিন যুক্তরাষ্ট্রের একটি পাবলিক মিডিয়া সংস্থা। এর বিশ্ব সংবাদ বিভাগ আন্তর্জাতিক প্রতিবেদন প্রকাশ করে এবং npr.org/world-এ পাওয়া যায়।",
    en: "NPR is an American public media organisation. Its world news desk publishes international reporting at npr.org/world.",
  },
  "france-24": {
    bn: "ফ্রান্স ২৪ ফ্রান্সের একটি আন্তর্জাতিক সংবাদ চ্যানেল। এর ইংরেজি সেবা বিশ্বের সংবাদ প্রকাশ করে এবং france24.com/en-এ পাওয়া যায়।",
    en: "France 24 is a French international news channel. Its English-language service publishes world news at france24.com/en.",
  },
  "sky-news": {
    bn: "স্কাই নিউজ যুক্তরাজ্যের একটি সংবাদ চ্যানেল। এর বিশ্ব সংবাদ বিভাগ আন্তর্জাতিক প্রতিবেদন প্রকাশ করে এবং news.sky.com/world-এ পাওয়া যায়।",
    en: "Sky News is a British news channel. Its world news desk publishes international reporting at news.sky.com/world.",
  },
  euronews: {
    bn: "ইউরোনিউজ ইউরোপভিত্তিক একটি আন্তর্জাতিক সংবাদ চ্যানেল। এর ইংরেজি সেবা বিশ্বের সংবাদ প্রকাশ করে এবং euronews.com-এ পাওয়া যায়।",
    en: "Euronews is a European international news channel. Its English-language service publishes world news at euronews.com.",
  },
};

export function getSourceProfile(id: string): SourceProfile | undefined {
  return SOURCE_PROFILES[id];
}

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
