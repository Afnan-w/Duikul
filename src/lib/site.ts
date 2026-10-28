/**
 * Single source of truth for every brand string and configurable value
 * across KhoborDaily. Import from here everywhere; never hard-code
 * "KhoborDaily" / "খবর ডেইলি" / the contact email / etc. in components.
 *
 * Run placeholders (replace before launch) are flagged with `[PLACEHOLDER]`.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://khobordaily.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "KhoborDaily";
export const SITE_NAME_BN = "খবর ডেইলি";
export const SITE_TAGLINE_BN = "দেশ ও বিশ্বের জরুরি খবর, এক জায়গায়";
export const SITE_TAGLINE_EN = "The news that matters, in one place.";
export const SITE_DESCRIPTION_BN =
  "বাংলাদেশ ও বিশ্বের যাচাইকৃত জরুরি খবর এক জায়গায়। দেশি ও বিদেশি শীর্ষ সংবাদ, একাধিক সূত্রে নিশ্চিত হলে তা স্পষ্টভাবে চিহ্নিত।";
export const SITE_DESCRIPTION_EN =
  "Verified news from Bangladesh and around the world, in one calm place. Stories confirmed by multiple independent outlets are clearly marked.";
export const CONTACT_EMAIL = "hello@khobordaily.com";

/** Default locale (UI language) for crawlers and un-hreflang'd entrypoints. */
export const DEFAULT_LOCALE = "bn";

/**
 * [PLACEHOLDER] Real organisation/person that operates the site.
 * Fill before launch — never invent. Shown on About / Editorial Policy.
 */
export const PUBLISHER_NAME = process.env.NEXT_PUBLIC_PUBLISHER_NAME || "[PLACEHOLDER]";
export const PUBLISHER_NAME_BN =
  process.env.NEXT_PUBLIC_PUBLISHER_NAME_BN || "[PLACEHOLDER]";
export const PUBLISHER_CONTACT = process.env.NEXT_PUBLIC_PUBLISHER_CONTACT || PUBLISHER_NAME;

/** Verification token env vars (rendered as meta tags when set). */
export const GOOGLE_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
export const BING_SITE_VERIFICATION = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;
