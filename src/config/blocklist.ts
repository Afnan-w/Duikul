/**
 * Clickbait and spam filter, deliberately conservative.
 *
 * We would rather show a slightly excitable headline from a reputable outlet
 * than hide a real story. These rules only catch unambiguous engagement bait,
 * SHOUTING, and punctuation abuse. Edit this file to tune the filter; the
 * check itself lives in `src/lib/ingest/blocklist.ts`.
 */
export const CLICKBAIT_PHRASES: readonly string[] = [
  // English
  "you won't believe",
  "you wont believe",
  "you won’t believe",
  "what happened next",
  "what happened next will",
  "breaks the internet",
  "broke the internet",
  "the internet can't stop",
  "the internet cant stop",
  "this one trick",
  "mind blowing",
  "mind-blowing",
  "jaw dropping",
  "jaw-dropping",
  "goes viral",
  "went viral",
  "is going viral",
  "must see",
  "must-see",
  "you need to see",
  "click here to",
  "share this now",
  "doctors hate",
  "they don't want you to know",
  "they dont want you to know",
  "shocking truth",
  "epic fail",
  "unbelievable",
  "insane",
  "you will cry",

  // Bangla
  "আপনি বিশ্বাস করবেন না",
  "বিশ্বাস করবেন না",
  "অবিশ্বাস্য",
  "চমকে দেবে",
  "চমকে দিবে",
  "হতবাক হবেন",
  "জানলে অবাক হবেন",
  "আপনি কি জানেন",
  "দেখুন ভিডিও",
  "ভাইরাল ভিডিও",
  "ভাইরাল হয়ে",
  "ভাইরাল হয়ে",
  "ইন্টারনেট কাঁপিয়ে",
  "ইন্টারনেট কাঁপিয়ে",
  "কাঁপিয়ে দিয়েছে",
  "কাঁপিয়ে দিয়েছে",
  "এরপর কী ঘটেছে",
  "এরপর কি ঘটেছে",
  "না দেখলে মিস করবেন",
  "মিস করবেন না",
  "শেয়ার করুন এখনই",
  "শেয়ার করুন এখনই",
  "এমন কিছু জানেন",
];

/**
 * Structural clickbait patterns. Each entry carries a human-readable reason
 * that is counted in ingest stats, never shown to readers.
 */
export const CLICKBAIT_PATTERNS: readonly {
  pattern: RegExp;
  reason: string;
}[] = [
  { pattern: /\b(?:shocking|shockingly)\b/i, reason: "shock-word" },
  { pattern: /\b(?:click|tap)\s+(?:here|now)\b/i, reason: "click-command" },
  { pattern: /[!?]{2,}/, reason: "punctuation-abuse" },
  { pattern: /(?:\u09f7){2,}/, reason: "punctuation-abuse" },
];

export const BLOCKLIST_CONFIG = {
  /** Only apply the SHOUTING rule when there are enough letters to judge. */
  minCapsLetters: 24,
  maxCapsRatio: 0.72,
  minCapsWords: 3,
  minCapsWordLength: 5,
  /** Guard against blocking legitimate one-word acronym headlines. */
  minTitleWords: 4,
} as const;
