/*
  ============================================================
  RSS HELPERS  (types + small functions used by lib/news.ts)
  ============================================================
  Nothing here downloads anything - it only turns text we already
  have into the shape the website displays.
*/

import Parser from "rss-parser";

export type Section = "deshi" | "bideshi";

export type Outlet = { name: string; url: string };

/** The shape every story has (matches components/story.tsx). */
export type Story = {
  slug: string;
  section: Section;
  category: string; // a slug from lib/site.ts -> categories, or "general"
  bn: { title: string; excerpt: string };
  en: { title: string; excerpt: string };
  outlets: Outlet[];
  publishedAt: string; // ISO string
  imageUrl?: string;
  imageCredit?: string;
  /** Width of imageUrl in pixels, if known (used to decide hero layout). */
  imageWidth?: number;
  /** Height of imageUrl in pixels, if known. */
  imageHeight?: number;
  sourceId: string; // which outlet in sources.ts produced it
  trust: 1 | 2 | 3;
  /** Ranking points. Attached by lib/rank.ts, never shown. */
  score?: number;
};

/* ---------- the parser (one shared instance, cheap to reuse) ---------- */

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail"],
      ["content:encoded", "contentEncoded"],
    ],
  },
});

export type FeedItem = {
  title?: string;
  link?: string;
  content?: string;
  contentSnippet?: string;
  contentEncoded?: string;
  isoDate?: string;
  pubDate?: string;
  enclosure?: { url?: string; type?: string; width?: number; height?: number };
  mediaContent?: { $?: { url?: string; medium?: string; width?: number; height?: number } }[];
  mediaThumbnail?: { $?: { url?: string; width?: number; height?: number } };
  categories?: (string | { _?: string })[];
};

export { parser };

/* ---------- tiny text helpers ---------- */

/** Decode the handful of HTML entities that appear in feed text. */
export function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&nbsp;/g, " ");
}

/** Remove HTML tags and collapse whitespace. */
export function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Some outlets (e.g. The Daily Star) paste raw HTML such as <img ...>,
 * <source srcset=...> or valueless attributes like `alt` into their
 * <title>/<description> WITHOUT wrapping it in CDATA, which strict XML
 * parsers reject. We escape that inner HTML so the XML stays valid;
 * the parser unescapes it again afterwards, so the stored text is
 * exactly the same as if the outlet had used CDATA.
 */
export function repairXml(xml: string): string {
  // 1. Escape raw markup inside title/description/content blocks
  //    (skip the ones already safely wrapped in CDATA).
  const escaped = xml.replace(
    /<(title|description|content:encoded)>([\s\S]*?)<\/\1>/g,
    (match, tag: string, inner: string) => {
      if (inner.includes("<![CDATA[") || !/[<&]/.test(inner)) return match;
      // Escape stray & first (only when not already a valid XML entity),
      // then the raw < tags.
      const safeAmp = inner.replace(
        /&(?!#\d+;|#x[0-9a-fA-F]+;|(?:amp|lt|gt|quot|apos);)/g,
        "&amp;"
      );
      return `<${tag}>${safeAmp.replace(/</g, "&lt;")}</${tag}>`;
    }
  );

  // 2. Backup: self-close HTML void tags that appear raw anywhere else.
  const fixed = escaped.replace(
    /<(img|br|hr|input)([^>]*?)>/gi,
    (match, tag: string, attrs: string) =>
      attrs.trimEnd().endsWith("/") ? match : `<${tag}${attrs}/>`
  );

  // 3. Backup: HTML <source srcset=...> inside <picture>. Only the HTML
  //    form is closed - the RSS <source url="...">name</source> element
  //    is left alone so its closing tag still matches.
  return fixed.replace(/<source([^>]*?)>/gi, (match, attrs: string) =>
    /(srcset|src|media|sizes)\s*=/i.test(attrs) && !attrs.trimEnd().endsWith("/")
      ? `<source${attrs}/>`
      : match
  );
}

/** Turn a headline into a URL-friendly slug.
    \p{M} keeps Bangla vowel signs attached (ি, ে, ু ...), so
    "অধ্যক্ষের" stays one word instead of অধ-যক-ষ-র. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/g, "");
}

/** A short stable hash so two stories with the same title stay unique. */
export function shortHash(text: string): string {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash + text.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36).slice(0, 6);
}

/** First ~2-3 sentences / 300 characters of an article body. */
export function makeExcerpt(htmlOrText: string, maxChars = 300): string {
  const plain = stripHtml(htmlOrText);
  if (plain.length <= maxChars) return plain;

  // Cut at the last sentence end before the limit, else hard-cut.
  const slice = plain.slice(0, maxChars);
  const lastStop = Math.max(
    slice.lastIndexOf("।"), // Bangla full stop
    slice.lastIndexOf(". "),
    slice.lastIndexOf("! "),
    slice.lastIndexOf("? ")
  );
  if (lastStop > maxChars * 0.5) return slice.slice(0, lastStop + 1).trim();
  return slice.trim() + "…";
}

/* ---------- category guessing (keywords, Bangla + English) ---------- */

/* Order matters: specific topics are checked before general politics. */
const CATEGORY_KEYWORDS: { slug: string; words: string[] }[] = [
  {
    slug: "sports",
    words: [
      "cricket", "football", "soccer", "match", "goal", "tournament",
      "world cup", "cup", "olympic", "premier league", "champions league",
      "league", "tennis", "inning", "batsman", "bowler", "coach",
      "transfer", "championship", "kabaddi", "hockey", "rugby", "trophy",
      "ক্রিকেট", "ফুটবল", "খেলা", "ম্যাচ", "টুর্নামেন্ট", "বিশ্বকাপ",
      "ওয়ানডে", "টেস্ট ম্যাচ", "রান", "উইকেট", "খেলোয়াড়", "কাপ", "লিগ",
      "চ্যাম্পিয়নশিপ", "কাবাডি",
    ],
  },
  {
    slug: "technology",
    words: [
      "technology", "internet", "artificial intelligence", "ai", "app",
      "software", "smartphone", "computer", "space", "nasa", "robot",
      "cyber", "chip", "gadget", "startup", "data", "satellite",
      "গুগল", "ইন্টারনেট", "ফোন", "কম্পিউটার", "সফটওয়্যার", "মহাকাশ",
      "স্যাটেলাইট", "রোবট", "এআই", "সাইবার", "অ্যাপ",
    ],
  },
  {
    slug: "entertainment",
    words: [
      "film", "movie", "music", "song", "actor", "actress", "celebrity",
      "oscar", "tv series", "web series", "drama", "concert", "album",
      "box office", "netflix", "hollywood", "bollywood", "premiere",
      "trailer",
      "সিনেমা", "চলচ্চিত্র", "গান", "অভিনয়", "বিনোদন", "নাটক", "অভিনেতা",
      "অভিনেত্রী", "প্রিমিয়ার", "সিরিজ", "তারকা",
    ],
  },
  {
    slug: "health",
    words: [
      "health", "hospital", "disease", "virus", "vaccine", "covid",
      "doctor", "medicine", "outbreak", "flu", "patient", "clinic",
      "cancer", "nutrition", "mental health", "dengue", "measles",
      "cholera", "nippah", "diphtheria", "hospitals",
      "স্বাস্থ্য", "হাসপাতাল", "রোগ", "ওষুধ", "টিকা", "ভাইরাস", "চিকিৎসা",
      "ডাক্তার", "রোগী", "কোভিড", "পুষ্টি",
    ],
  },
  {
    slug: "business",
    words: [
      "business", "economy", "market", "export", "import", "bank", "stock",
      "trade war", "trade deal", "trade talks", "trade deficit", "trading",
      "inflation", "gdp", "dollar", "taka", "price", "shares",
      "corporate", "industry", "remittance", "investment", "revenue",
      "earnings", "garment", "rmg", "oil",
      "বাণিজ্য", "অর্থ", "বাজার", "রপ্তানি", "আমদানি", "ব্যাংক", "শেয়ার",
      "মূল্যস্ফীতি", "টাকা", "দাম", "বিনিয়োগ", "রপ্তানি", "পোশাক", "তেল",
      "মূল্য", "আয়",
    ],
  },
  {
    slug: "politics",
    words: [
      "election", "government", "minister", "parliament", "president",
      "prime minister", "opposition", "cabinet", "vote", "campaign",
      "politics", "congress", "senate", "white house", "diplomat", "summit",
      "envoy", "charter", "reform", "trump", "vance", "washington",
      "peace talks", "talks",
      "সরকার", "মন্ত্রী", "নির্বাচন", "সংসদ", "রাজনীতি", "আওয়ামী", "বিএনপি",
      "রাষ্ট্রপতি", "প্রধানমন্ত্রী", "বিরোধী", "ভোট", "মন্ত্রণালয়",
      "আলোচনা", "বৈঠক", "ট্রাম্প", "ভ্যান্স",
    ],
  },
];

/** Does `text` contain `word` as a whole word (English or Bangla)? */
function hasWord(text: string, word: string): boolean {
  const clean = word.trim();
  if (!clean) return false;

  const isAscii = /^[\x00-\x7F]+$/.test(clean);

  if (isAscii) {
    // English: whole word only + simple plural, so "ai" never matches "airport".
    const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}(?:s|es)?\\b`, "i").test(text);
  }

  /*
    Bangla has no spaces inside compounds, so we balance two risks:
    - SHORT words (<=3 letters) are checked strictly on both sides,
      otherwise "রান" would hide inside "ইরানের" (Iran's).
    - LONG words (>=4 letters, e.g. বিশ্বকাপ, খেলোয়াড়) match anywhere,
      because they are almost always real compound words.
  */
  const bnLetter = /[\u0980-\u09FF]/;
  // A vowel sign (matra), hasant or sign legally follows a word:
  // ম্যাচ + এ = ম্যাচে. A fresh consonant/independent vowel means the
  // match is stuck inside a bigger word: কাপ + ড় = কাপড় (cloth, not
  // the sports cup); র + া + ন inside ফেরানোর (to bring back).
  const bnContinuation = /[\u09BE-\u09CC\u09D7\u09CD\u0981-\u0983\u09BC\u09C1\u09C2\u09C4]/;

  const letters = [...clean].filter((ch) => bnLetter.test(ch)).length;
  if (letters >= 4) return text.includes(clean);

  let from = 0;
  for (;;) {
    const at = text.indexOf(clean, from);
    if (at === -1) return false;
    const before = at > 0 ? text[at - 1] : "";
    const after = text[at + clean.length] ?? "";
    const startsWord = before === "" || !bnLetter.test(before);
    const continuesWord =
      after !== "" && bnLetter.test(after) && !bnContinuation.test(after);
    if (startsWord && !continuesWord) return true;
    from = at + 1;
  }
}

/** Guess a category slug from the headline + feed categories. */
export function guessCategory(
  title: string,
  feedCategories: (string | { _?: string })[] | undefined
): string {
  // 1. The outlet's own category label, if we recognise it.
  const labels = (feedCategories ?? []).map((c) =>
    typeof c === "string" ? c : String(c._ ?? "")
  );
  for (const { slug, words } of CATEGORY_KEYWORDS) {
    if (labels.some((label) => words.some((w) => hasWord(label, w)))) {
      return slug;
    }
  }

  // 2. Fall back to scanning the headline.
  for (const { slug, words } of CATEGORY_KEYWORDS) {
    if (words.some((word) => hasWord(title, word))) return slug;
  }

  return "general"; // shown to readers as "সংবাদ / News"
}
