/**
 * Text utilities shared by ingest, clustering and search.
 *
 * The rules here are deliberately language-aware: Bangla is whitespace-tokenised
 * just like English, but combining marks mean truncation must never split a
 * grapheme cluster or a word.
 */

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ensp: " ",
  emsp: " ",
  thinsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  minus: "−",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  laquo: "«",
  raquo: "»",
  bull: "•",
  middot: "·",
  copy: "©",
  reg: "®",
  trade: "™",
  deg: "°",
  euro: "€",
  pound: "£",
  yen: "¥",
  taka: "৳",
  times: "×",
  divide: "÷",
  frac12: "½",
  frac14: "¼",
  frac34: "¾",
  shy: "",
  zwj: "",
  zwnj: "",
};

export function decodeHtmlEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-f]+|[a-z][a-z0-9]+);/gi, (match, entity: string) => {
    if (entity.startsWith("#")) {
      const hexadecimal = entity[1]?.toLowerCase() === "x";
      const raw = entity.slice(hexadecimal ? 2 : 1);
      const code = Number.parseInt(raw, hexadecimal ? 16 : 10);
      if (
        Number.isFinite(code) &&
        code >= 0 &&
        code <= 0x10ffff &&
        !(code >= 0xd800 && code <= 0xdfff)
      ) {
        return String.fromCodePoint(code);
      }
      return match;
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

/** Removes markup, scripts, styles and comments while keeping text spacing. */
export function stripHtml(input: string): string {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|template)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6]|blockquote|tr|td|figure|figcaption)>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ");
}

export function normalizeWhitespace(input: string): string {
  return input
    .replace(/[\u200b-\u200d\u2060\ufeff]/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** HTML/entity-safe plain text. Useful for RSS titles, summaries and content. */
export function plainText(input: unknown): string {
  if (typeof input !== "string") return "";
  const once = stripHtml(input);
  const decoded = decodeHtmlEntities(once);
  return normalizeWhitespace(stripHtml(decoded));
}

/** Truncates on a word boundary without splitting grapheme clusters. */
export function truncateText(
  input: string,
  maxChars: number,
  ellipsis = "…",
): string {
  const text = normalizeWhitespace(input);
  const graphemes = Array.from(text);
  if (graphemes.length <= maxChars) return text;

  const budget = Math.max(1, maxChars - Array.from(ellipsis).length);
  const slice = graphemes.slice(0, budget).join("");
  const lastSpace = slice.search(/\s+\S*$/u);

  const base =
    lastSpace > budget * 0.55 ? slice.slice(0, lastSpace) : slice;

  return `${base.replace(/[\s,;:.।!?-]+$/u, "")}${ellipsis}`;
}

/** Exactly the summary contract: HTML stripped, entities decoded, ~280 chars. */
export function createSummary(input: unknown, maxChars = 280): string {
  return truncateText(plainText(input), maxChars);
}

export function truncateTitle(input: unknown, maxChars = 300): string {
  return truncateText(plainText(input), maxChars, "");
}

/** Handles rss-parser's occasional `{ _: "text" }` / `{ "#text": ... }` shapes. */
export function extractText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return value.map(extractText).filter(Boolean).join(" ");
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["_", "#text", "text", "value", "name"]) {
      if (key in record) {
        const extracted = extractText(record[key]);
        if (extracted) return extracted;
      }
    }
    // Some publishers wrap the headline in a namespaced element, e.g.
    // `{ a: [{ _: "Headline", $: { href: "/story" } }] }`.
    for (const nested of Object.values(record)) {
      const extracted = extractText(nested);
      if (extracted) return extracted;
    }
  }
  return "";
}

function looksLikeUrl(value: string): boolean {
  return (
    /^(https?:)?\/\//i.test(value) ||
    value.startsWith("/") ||
    /^[\w.-]+\.[a-z]{2,}(?:[/?#]|$)/i.test(value)
  );
}

export function extractUrlValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    for (const item of value) {
      const url = extractUrlValue(item);
      if (url) return url;
    }
    return "";
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    // `$` / `@attributes` hold xml2js/fast-xml-parser attributes. Check them
    // before text nodes so a wrapped headline can never leak as a URL.
    for (const key of [
      "@_href",
      "href",
      "url",
      "@_url",
      "@_resolved",
      "@_src",
      "src",
      "@attributes",
      "$",
      "_",
      "#text",
    ]) {
      const candidate = record[key];
      if (typeof candidate === "string" && candidate.trim()) return candidate;
      if (candidate && typeof candidate === "object") {
        const nested = extractUrlValue(candidate);
        if (nested) return nested;
      }
    }
    for (const nested of Object.values(record)) {
      const candidate = extractUrlValue(nested);
      if (candidate && looksLikeUrl(candidate)) return candidate;
    }
  }
  return "";
}

const BN_STOPWORDS = new Set([
  "এবং",
  "বা",
  "কিন্তু",
  "তবে",
  "যে",
  "যা",
  "এই",
  "সেই",
  "এক",
  "একটি",
  "একটা",
  "এর",
  "ও",
  "এ",
  "তে",
  "থেকে",
  "জন্য",
  "সঙ্গে",
  "সাথে",
  "হয়",
  "হয়েছে",
  "হয়েছিল",
  "হবে",
  "করে",
  "করা",
  "করেছে",
  "করেন",
  "করেছিলেন",
  "বলে",
  "জানা",
  "জানিয়েছে",
  "যায়",
  "পরে",
  "আগে",
  "আজ",
  "গত",
  "আরও",
  "না",
  "নেই",
  "আছে",
  "ছিল",
  "ছিলেন",
  "প্রায়",
  "মধ্যে",
  "উপর",
  "নিচে",
  "দিন",
  "আজকের",
  "খবর",
  "সংবাদ",
  "নতুন",
  "বড়",
  "ছোট",
  "কেন",
  "কী",
  "কি",
  "তার",
  "তাকে",
  "তিনি",
  "তারা",
  "আমরা",
  "আমি",
  "আপনি",
  "সে",
  "এখন",
  "তখন",
  "বলেছেন",
  "বলেন",
  "জানান",
  "জানিয়েছেন",
  "হয়েছেন",
  "করেছেন",
  "হিসেবে",
  "মাধ্যমে",
  "বিষয়ে",
  "কোনো",
  "কিনা",
  "হলো",
  "শেষ",
]);

const EN_STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "been",
  "but",
  "by",
  "can",
  "could",
  "did",
  "do",
  "does",
  "for",
  "from",
  "had",
  "has",
  "have",
  "he",
  "her",
  "his",
  "how",
  "in",
  "into",
  "is",
  "it",
  "its",
  "may",
  "might",
  "more",
  "new",
  "no",
  "not",
  "of",
  "on",
  "or",
  "our",
  "out",
  "over",
  "said",
  "says",
  "she",
  "than",
  "that",
  "the",
  "their",
  "them",
  "then",
  "these",
  "they",
  "this",
  "those",
  "to",
  "under",
  "up",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "will",
  "with",
  "would",
  "you",
  "your",
]);

/**
 * Match normalisation: NFKC, lowercase, tracking URLs, punctuation, symbols,
 * standalone numerals and common stopwords removed. Keeps Bangla combining
 * marks intact (they are not punctuation).
 */
export function normalizeForMatch(input: string): string {
  return input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/www\.\S+/g, " ")
    .replace(/[\u200b-\u200d\u2060\ufeff]/g, "")
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/[\p{Nd}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Very light English suffix folding so "train", "trains" and "killed", "kills"
 * compare as the same content word. It is deliberately not a full stemmer:
 * Bangla is untouched, and obscure English forms are better left alone than
 * folded into a false match.
 */
function lightStemEnglish(token: string): string {
  if (!/^[a-z]+$/.test(token) || token.length < 5) return token;
  if (/(?:ss|us|is)$/.test(token)) return token;
  if (token.endsWith("ies") && token.length > 5) {
    return `${token.slice(0, -3)}y`;
  }
  if (token.endsWith("ing") && token.length > 6) return token.slice(0, -3);
  if (token.endsWith("ed") && token.length > 5) return token.slice(0, -2);
  if (token.endsWith("es") && token.length > 5) return token.slice(0, -2);
  if (token.endsWith("s") && token.length > 4) return token.slice(0, -1);
  return token;
}

export function tokenizeForMatch(input: string): string[] {
  const normalized = normalizeForMatch(input);
  if (!normalized) return [];
  return normalized
    .split(" ")
    .filter((token) => token.length >= 2)
    .filter((token) => !BN_STOPWORDS.has(token) && !EN_STOPWORDS.has(token))
    .map(lightStemEnglish)
    .filter((token) => token.length >= 2)
    .filter((token) => !BN_STOPWORDS.has(token) && !EN_STOPWORDS.has(token));
}

export function tokenSet(input: string): Set<string> {
  return new Set(tokenizeForMatch(input));
}

export function characterTrigrams(input: string): Set<string> {
  const normalized = normalizeForMatch(input);
  const characters = Array.from(normalized);
  const result = new Set<string>();
  if (characters.length === 0) return result;
  if (characters.length < 3) {
    result.add(characters.join(""));
    return result;
  }
  for (let index = 0; index <= characters.length - 3; index += 1) {
    result.add(characters.slice(index, index + 3).join(""));
  }
  return result;
}

export function setIntersectionSize(a: Set<string>, b: Set<string>): number {
  let count = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const value of small) {
    if (large.has(value)) count += 1;
  }
  return count;
}

export function setUnionSize(a: Set<string>, b: Set<string>): number {
  return a.size + b.size - setIntersectionSize(a, b);
}

export function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  return setIntersectionSize(a, b) / setUnionSize(a, b);
}

export function diceSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  return (2 * setIntersectionSize(a, b)) / (a.size + b.size);
}
