/*
  ============================================================
  SEO TOOLKIT  (shared by every page)
  ============================================================
  One place for the metadata objects and the structured-data
  (JSON-LD) entities. Every page imports from here so titles,
  canonical URLs, hreflang tags and schema stay consistent.

  Keyword targets woven in naturally: Duikul / দুইকূল,
  দেশি সংবাদ, বিদেশি সংবাদ, বাংলাদেশ নিউজ, BD news,
  Deshi Bideshi news, trusted sources news Bangladesh.
*/

import type { Metadata } from "next";
import { categories, siteConfig } from "@/lib/site";
import type { Story } from "@/lib/rss";

/* ------------------------------------------------------------ *
 *  Small text helpers
 * ------------------------------------------------------------ */

/** Does this string contain Bangla script? (picks article language) */
export function isBangla(text: string): boolean {
  return /[\u0980-\u09FF]/.test(text);
}

/** Trim long text for meta descriptions, cutting at a word edge. */
export function truncate(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max);
  const cut = Math.max(
    slice.lastIndexOf("।"),
    slice.lastIndexOf("."),
    slice.lastIndexOf(" ")
  );
  return (cut > max * 0.6 ? slice.slice(0, cut) : slice).trim() + "…";
}

/** Absolute URL of anything the feeds gave us, else undefined. */
function absoluteImage(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  return undefined;
}

/** Category label display name (also used by story components). */
export function categoryLabel(slug: string, lang: "bn" | "en"): string {
  const match = categories.find((item) => item.slug === slug);
  if (match) return match[lang];
  return lang === "bn" ? "সংবাদ" : "News";
}

/* ------------------------------------------------------------ *
 *  Branded Open Graph image (generated at /api/og)
 * ------------------------------------------------------------ */

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/*
  Bump this when the card design or text rendering changes. The
  version lands in the image URL, so crawlers (and Vercel's edge
  cache) fetch the fresh card instead of the old cached PNG.
  2 = Bangla drawn from HarfBuzz-shaped vector paths.
*/
const OG_CARD_VERSION = "2";

/** URL of the branded OG card for a title (the route draws it). */
export function buildOgUrl(opts: {
  title: string;
  kicker?: string;
}): string {
  const params = new URLSearchParams();
  params.set("t", truncate(opts.title, 120));
  if (opts.kicker) params.set("k", opts.kicker.slice(0, 40));
  params.set("v", OG_CARD_VERSION);
  return `/api/og?${params.toString()}`;
}

/** Images array for og:/twitter: tags - real photo first, branded card fallback. */
function ogImages(
  title: string,
  kicker: string,
  photoUrl?: string
): Array<{ url: string; width: number; height: number; alt: string }> {
  const branded = {
    url: buildOgUrl({ title, kicker }),
    width: OG_WIDTH,
    height: OG_HEIGHT,
    alt: truncate(title, 100),
  };
  const photo = absoluteImage(photoUrl);
  if (photo) return [{ url: photo, width: 1200, height: 630, alt: branded.alt }, branded];
  return [branded];
}

/* ------------------------------------------------------------ *
 *  The one metadata builder every page uses
 * ------------------------------------------------------------ */

export type PageMetaInput = {
  /** Path only (no domain), e.g. "/deshi" — also used as canonical. */
  path: string;
  /** Full <title> text (the layout appends nothing more). */
  title: string;
  /** Meta description, ideally ≤ 155 characters with a CTA. */
  description: string;
  /** Shorter, card-friendly title for og:/twitter: tags. */
  ogTitle?: string;
  /** Shorter, card-friendly description (defaults to `description`). */
  ogDescription?: string;
  /** "article" for single news stories. */
  type?: "website" | "article";
  /** Article published time (ISO) for NewsArticle pages. */
  publishedTime?: string;
  /** Real story photo, when the feed provided one. */
  photoUrl?: string;
  /** Small label on the OG card, e.g. "দেশি — শীর্ষ সংবাদ". */
  kicker?: string;
  noindex?: boolean;
};

/**
 * hreflang map. Bangla (bn-BD) is the canonical view; English is
 * reachable through the ?lang=en toggle that every page honours;
 * x-default falls back to the Bangla main page.
 */
export function languageAlternates(path: string): Record<string, string> {
  return {
    "bn-BD": path,
    en: `${path}?lang=en`,
    "x-default": path,
  };
}

export function pageMeta(input: PageMetaInput): Metadata {
  const {
    path,
    title,
    description,
    type = "website",
    publishedTime,
    photoUrl,
    kicker = "দুইকূল — বিশ্বস্ত সূত্র, এক জায়গায়",
    noindex = false,
  } = input;

  /* Cards carry the shorter, friendlier text; <title> keeps the SEO form. */
  const ogTitle = input.ogTitle ?? title;
  const ogDescription = truncate(input.ogDescription ?? description);
  const images = ogImages(ogTitle, kicker, photoUrl);

  return {
    title,
    description: truncate(description),
    alternates: {
      canonical: path,
      languages: languageAlternates(path),
    },
    openGraph: {
      type,
      url: path,
      siteName: "Duikul",
      locale: "bn_BD",
      title: ogTitle,
      description: ogDescription,
      ...(type === "article" || publishedTime
        ? {
            type: "article" as const,
            publishedTime,
            authors: [siteConfig.name],
          }
        : {}),
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: images.map((image) => image.url),
    },
    keywords: [
      "Duikul",
      "দুইকূল",
      "দেশি সংবাদ",
      "বিদেশি সংবাদ",
      "বাংলাদেশ নিউজ",
      "BD news",
      "Deshi Bideshi news",
    ],
    robots: {
      index: !noindex,
      follow: true,
      googleBot: {
        index: !noindex,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

/* ------------------------------------------------------------ *
 *  Structured data builders (JSON-LD)
 * ------------------------------------------------------------ */

/** The news website itself — with the /search SearchAction. */
export function webSiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Duikul",
    alternateName: "দুইকূল",
    url: siteConfig.url,
    description: siteConfig.descriptionBn,
    inLanguage: ["bn-BD", "en"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/search?q={query}`,
      },
      "query-input": "required name=query",
    },
    publisher: { "@type": "Organization", name: "Duikul", url: siteConfig.url },
  };
}

/** The organisation behind the site — logo + verifiable profiles. */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: "Duikul",
    alternateName: "দুইকূল",
    url: siteConfig.url,
    description: siteConfig.descriptionBn,
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.url}${siteConfig.logo}`,
      width: 512,
      height: 512,
    },
    foundingLocation: {
      "@type": "Place",
      address: "Chittagong, Bangladesh",
    },
    sameAs: siteConfig.sameAs,
    publishingPrinciples: `${siteConfig.url}/editorial-policy`,
    correctionsPolicy: `${siteConfig.url}/corrections`,
  };
}

/** Recent stories as a ranked list (দেশি — শীর্ষ ৫ / বিদেশি — শীর্ষ ৫ …). */
export function itemListJsonLd(
  name: string,
  stories: Story[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: stories.length,
    itemListElement: stories.map((story, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteConfig.url}/news/${story.slug}`,
      name: story.bn.title,
    })),
  };
}

/** A section page (দেশি / বিদেশি / বিভাগ) as a CollectionPage + ItemList. */
export function collectionJsonLd(
  name: string,
  path: string,
  stories: Story[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url: `${siteConfig.url}${path}`,
    inLanguage: "bn-BD",
    isPartOf: { "@type": "WebSite", name: "Duikul", url: siteConfig.url },
    mainEntity: itemListJsonLd(name, stories),
  };
}

/** Home → section → story breadcrumbs, for the rich result. */
export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`,
    })),
  };
}

/**
 * NewsArticle — the entity Google News and Discover read.
 * Honest by design: the original outlet stays the author and the
 * "reported by N outlets" fact is expressed as `citation`.
 */
export function newsArticleJsonLd(
  story: Story,
  path: string
): Record<string, unknown> {
  const kicker =
    story.section === "deshi"
      ? "দেশি সংবাদ"
      : "বিদেশি সংবাদ";
  const image =
    absoluteImage(story.imageUrl) ??
    `${siteConfig.url}${buildOgUrl({
      title: story.bn.title,
      kicker: `${kicker} — ${categoryLabel(story.category, "bn")}`,
    })}`;
  const categoryBn = categoryLabel(story.category, "bn");
  const categoryEn = categoryLabel(story.category, "en");
  const alt = isBangla(story.bn.title) ? "bn-BD" : "en";

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: story.bn.title,
    description: truncate(story.bn.excerpt || story.bn.title, 160),
    image: [image],
    datePublished: story.publishedAt,
    dateModified: story.publishedAt,
    inLanguage: alt,
    articleSection: categoryEn,
    keywords: [
      categoryBn,
      categoryEn,
      kicker,
      "Deshi Bideshi news",
      "Duikul",
      "বাংলাদেশ নিউজ",
    ],
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}${path}`,
    },
    author: story.outlets.map((outlet) => ({
      "@type": "Organization",
      name: outlet.name,
    })),
    publisher: {
      "@type": "NewsMediaOrganization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}${siteConfig.logo}`,
        width: 512,
        height: 512,
      },
    },
    isAccessibleForFree: true,
    ...(story.outlets.length > 1
      ? { citation: story.outlets.map((outlet) => outlet.url) }
      : {}),
    // Voice search (Assistant/Discover audio): which parts to read aloud.
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["#story-headline", "#story-excerpt"],
    },
  };
}
