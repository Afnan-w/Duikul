import {
  BLOCKLIST_CONFIG,
  CLICKBAIT_PATTERNS,
  CLICKBAIT_PHRASES,
} from "@/config/blocklist";
import { normalizeWhitespace } from "./text";

export type BlocklistVerdict =
  | { blocked: false }
  | { blocked: true; reason: string; match?: string };

function countCapsWords(title: string): { capsWords: number; letters: number; capitals: number } {
  const words = normalizeWhitespace(title).split(" ");
  let capsWords = 0;
  let letters = 0;
  let capitals = 0;

  for (const word of words) {
    const clean = word.replace(/[^\p{L}]/gu, "");
    if (!clean) continue;
    const wordLetters = Array.from(clean);
    letters += wordLetters.length;
    const upper = wordLetters.filter((character) => /\p{Lu}/u.test(character)).length;
    capitals += upper;
    if (
      wordLetters.length >= BLOCKLIST_CONFIG.minCapsWordLength &&
      upper / wordLetters.length >= 0.8
    ) {
      capsWords += 1;
    }
  }

  return { capsWords, letters, capitals };
}

/**
 * Returns a reason when a headline is unambiguous engagement bait. The title
 * is checked, never the summary: summaries often quote excitable language.
 */
export function checkBlocklist(title: string): BlocklistVerdict {
  const normalized = normalizeWhitespace(title).normalize("NFKC");
  if (!normalized) return { blocked: false };

  const lowered = normalized.toLowerCase();

  for (const phrase of CLICKBAIT_PHRASES) {
    if (lowered.includes(phrase)) {
      return { blocked: true, reason: "clickbait-phrase", match: phrase };
    }
  }

  for (const { pattern, reason } of CLICKBAIT_PATTERNS) {
    const match = pattern.exec(normalized);
    if (match) {
      return { blocked: true, reason, match: match[0] };
    }
  }

  const words = normalized.split(" ").filter(Boolean);
  const { capsWords, letters, capitals } = countCapsWords(normalized);

  if (
    words.length >= BLOCKLIST_CONFIG.minTitleWords &&
    capsWords >= BLOCKLIST_CONFIG.minCapsWords &&
    letters >= BLOCKLIST_CONFIG.minCapsLetters &&
    capitals / letters >= BLOCKLIST_CONFIG.maxCapsRatio
  ) {
    return { blocked: true, reason: "excessive-caps" };
  }

  return { blocked: false };
}

export function isBlocked(title: string): boolean {
  return checkBlocklist(title).blocked;
}
