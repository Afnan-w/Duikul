/**
 * Single source of truth for every brand string and configurable value.
 *
 * Import from here everywhere. Never hard-code the Latin name, Bangla name,
 * contact address, or canonical origin in a component.
 *
 * Values marked `[PLACEHOLDER]` must be replaced before launch. They are
 * intentionally configurable through environment variables.
 */

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export const SITE_URL = trimTrailingSlash(
  process.env.NEXT_PUBLIC_SITE_URL || "https://duikul.vercel.app",
);

/** Latin brand name. Use this in titles, metadata, and English UI. */
export const SITE_NAME = "Duikul";

/** Bangla brand name. Use this in Bangla UI and bilingual metadata. */
export const SITE_NAME_BN = "দুইকুল";

/** ASCII slug used for filenames and internal application names. */
export const SITE_SLUG = "duikul";

export const SITE_TAGLINE_BN = "দেশ ও বিশ্ব, এক জায়গায়।";
export const SITE_TAGLINE_EN = "Bangladesh and the world, in one place.";

export const SITE_DESCRIPTION_BN =
  "দুইকুলে বাংলাদেশ ও বিশ্বের জরুরি খবর এক জায়গায়। একাধিক স্বাধীন সূত্রে যাচাই করা খবর, মূল প্রতিবেদনের সরাসরি লিংক এবং স্পষ্ট সম্পাদকীয় সীমা।";
export const SITE_DESCRIPTION_EN =
  "Bangladesh and world news in one calm place. Stories confirmed across independent outlets, direct links to original reporting, and clearly stated limits.";

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@duikul.com";

/** Default editorial/UI locale. English lives under `/en`. */
export const DEFAULT_LOCALE = "bn" as const;
export type SiteLocale = "bn" | "en";
export const LOCALES: readonly SiteLocale[] = ["bn", "en"] as const;

/**
 * [PLACEHOLDER] Real organisation or person that operates the site.
 * Fill these through the environment before launch; never invent a person.
 */
export const PUBLISHER_NAME =
  process.env.NEXT_PUBLIC_PUBLISHER_NAME || "[PLACEHOLDER]";
export const PUBLISHER_NAME_BN =
  process.env.NEXT_PUBLIC_PUBLISHER_NAME_BN || "[PLACEHOLDER]";
export const PUBLISHER_CONTACT =
  process.env.NEXT_PUBLIC_PUBLISHER_CONTACT || PUBLISHER_NAME;

/** Verification tokens, rendered by the Metadata API when set. */
export const GOOGLE_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
export const BING_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;

/** Social profile URLs. Replace with the real accounts before launch. */
export const SOCIAL_PROFILES: readonly string[] = [];

export function siteNameFor(locale: SiteLocale): string {
  return locale === "bn" ? SITE_NAME_BN : SITE_NAME;
}
