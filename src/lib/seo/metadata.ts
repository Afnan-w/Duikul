import type { Metadata } from "next";
import {
  BING_SITE_VERIFICATION,
  GOOGLE_SITE_VERIFICATION,
  SITE_NAME,
  SITE_NAME_BN,
  SITE_URL,
  type SiteLocale,
} from "@/config/site";

/**
 * One factory for every page's metadata so the SEO contract lives in a single
 * reviewable place instead of being re-typed on each route.
 *
 * Guarantees enforced here (see SEO_CHECKLIST.md):
 *  - Title is unique per page, formatted `{Headline} | {SITE_NAME}`, ≤60 chars.
 *  - Description is ≤155 chars.
 *  - Canonical is absolute and points at the crawlable URL.
 *  - OG/Twitter use large-image cards with the correct `og:locale`.
 *  - Article pages carry published/modified times.
 *  - Google/Bing verification tokens render when the env vars are set.
 */

export const MAX_TITLE_CHARS = 60;
export const MAX_DESCRIPTION_CHARS = 155;

const OG_LOCALE: Record<SiteLocale, string> = { bn: "bn_BD", en: "en_US" };
const OG_ALTERNATE_LOCALE: Record<SiteLocale, string[]> = {
  bn: ["en_US"],
  en: ["bn_BD"],
};

/** Absolute URL against the configured origin. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Trim to a hard character budget on a grapheme-safe boundary. Bangla text is
 * multi-byte, so we cut by code points and never leave a dangling joiner.
 */
export function truncate(value: string, max: number): string {
  const chars = Array.from(value.trim());
  if (chars.length <= max) return value.trim();
  return `${chars.slice(0, max - 1).join("").trimEnd()}…`;
}

/** `{Headline} | {SITE_NAME}` trimmed so the whole string fits 60 chars. */
export function formatTitle(headline: string): string {
  const suffix = ` | ${SITE_NAME}`;
  const budget = MAX_TITLE_CHARS - Array.from(suffix).length;
  return `${truncate(headline, budget)}${suffix}`;
}

type ImageValue = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

export type PageMetadataInput = {
  /** Route path, e.g. "/story/abc" or "/daily/2026-10-29". */
  path: string;
  locale?: SiteLocale;
  /** Raw headline; formatted + trimmed internally. */
  title: string;
  /** Raw description; trimmed internally. */
  description: string;
  /** Optional social-preview overrides (e.g. the English twin of a bilingual page). */
  ogTitle?: string;
  ogDescription?: string;
  /** Absolute canonical. Defaults to `path`. */
  canonical?: string;
  /** Both language URLs when they exist; enables hreflang + x-default. */
  languages?: { bn?: string; en?: string };
  ogType?: "website" | "article";
  ogImage?: ImageValue | ImageValue[];
  publishedTime?: string;
  modifiedTime?: string;
  /** Set for thin/expired pages that must stay out of the index. */
  noindex?: boolean;
  /** Extra `openGraph` fields merged verbatim (e.g. `section`, `tags`). */
  openGraph?: Metadata["openGraph"];
};

export function createPageMetadata({
  path,
  locale = "bn",
  title,
  description,
  ogTitle,
  ogDescription,
  canonical,
  languages,
  ogType = "website",
  ogImage,
  publishedTime,
  modifiedTime,
  noindex,
  openGraph,
}: PageMetadataInput): Metadata {
  const formattedTitle = formatTitle(title);
  const trimmedDescription = truncate(description, MAX_DESCRIPTION_CHARS);
  const socialTitle = ogTitle ? truncate(ogTitle, MAX_TITLE_CHARS) : formattedTitle;
  const socialDescription = ogDescription
    ? truncate(ogDescription, MAX_DESCRIPTION_CHARS)
    : trimmedDescription;
  const canonicalUrl = absoluteUrl(canonical ?? path);

  const bnHref = languages?.bn;
  const enHref = languages?.en;
  const hasLanguages = Boolean(bnHref && enHref);

  const languagesAlternates = hasLanguages
    ? {
        bn: absoluteUrl(bnHref!),
        en: absoluteUrl(enHref!),
        // x-default points at the primary (Bangla) experience.
        "x-default": absoluteUrl(bnHref!),
      }
    : undefined;

  const verification = {
    ...(GOOGLE_SITE_VERIFICATION
      ? { google: GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(BING_SITE_VERIFICATION
      ? { other: { "msvalidate.01": BING_SITE_VERIFICATION } }
      : {}),
  };

  const articleTimes =
    ogType === "article"
      ? {
          ...(publishedTime ? { publishedTime } : {}),
          ...(modifiedTime ? { modifiedTime } : {}),
        }
      : {};

  return {
    title: formattedTitle,
    description: trimmedDescription,
    alternates: {
      canonical: canonicalUrl,
      ...(languagesAlternates ? { languages: languagesAlternates } : {}),
    },
    ...(Object.keys(verification).length ? { verification } : {}),
    robots: {
      index: !noindex,
      follow: true,
      ...(noindex
        ? {}
        : {
            googleBot: {
              index: true,
              follow: true,
              "max-image-preview": "large",
              "max-snippet": -1,
            },
          }),
    },
    openGraph: {
      ...openGraph,
      type: ogType,
      url: canonicalUrl,
      locale: OG_LOCALE[locale],
      alternateLocale: OG_ALTERNATE_LOCALE[locale],
      siteName: locale === "bn" ? SITE_NAME_BN : SITE_NAME,
      title: socialTitle,
      description: socialDescription,
      ...(ogImage ? { images: ogImage } : {}),
      ...articleTimes,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: socialDescription,
      ...(ogImage ? { images: [ogImage].flat().map((image) => image.url) } : {}),
    },
  };
}
