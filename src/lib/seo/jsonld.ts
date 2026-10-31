import { getSource } from "@/config/sources";
import {
  CONTACT_EMAIL,
  SITE_DESCRIPTION_EN,
  SITE_NAME,
  SITE_NAME_BN,
  SITE_URL,
  SOCIAL_PROFILES,
} from "@/config/site";
import type { DailyBriefing } from "@/lib/data/daily";
import type { StoryCluster, StorySource } from "@/lib/data/clusters";
import { truncateSnippet } from "@/lib/utils/text";
import { absoluteUrl, truncate } from "./metadata";

/**
 * Typed JSON-LD helpers (schema.org).
 *
 * Honesty rule baked into this module: Duikul aggregates headlines and short
 * excerpts, it does not write original news copy. Therefore a story page is a
 * `WebPage` whose `mainEntity` is an `ItemList` of the *publishers'* own
 * `NewsArticle`s. A top-level `NewsArticle` (see `dailyBriefingJsonLd`) is only
 * emitted for genuinely original editorial — a daily briefing carrying a
 * written editor note.
 */

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonLd = { "@context": "https://schema.org" } & Record<
  string,
  JsonValue
>;

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** Reusable `Organization` reference for the site itself. */
function organizationRef(): Record<string, JsonValue> {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
  };
}

/** The operator behind the site: brand, logo, contact, optional socials. */
export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    alternateName: SITE_NAME_BN,
    url: SITE_URL,
    description: SITE_DESCRIPTION_EN,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icons/icon-512.png`,
      width: 512,
      height: 512,
      caption: SITE_NAME,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "Corrections, removal requests, and reader questions",
        email: CONTACT_EMAIL,
        areaServed: "BD",
        availableLanguage: ["bn", "en"],
      },
    ],
    ...(SOCIAL_PROFILES.length > 0 ? { sameAs: [...SOCIAL_PROFILES] } : {}),
  };
}

/** Site-level `WebSite` node with a sitelinks search action. */
export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    alternateName: SITE_NAME_BN,
    description: SITE_DESCRIPTION_EN,
    inLanguage: ["bn", "en"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export type BreadcrumbItem = {
  /** Visible label as it appears in the on-page breadcrumb. */
  name: string;
  /** Site-relative path (`/deshi`) or an absolute URL. */
  path: string;
};

/** `BreadcrumbList` with 1-based positions, matching the visible trail. */
export function breadcrumbJsonLd(items: readonly BreadcrumbItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * A generic `WebPage` node for pages that are not original articles (sections,
 * trust pages, a daily briefing without an editor note).
 */
export function webPageJsonLd({
  path,
  name,
  description,
  dateModified,
  image,
}: {
  path: string;
  name: string;
  description?: string;
  dateModified?: Date;
  image?: string;
}): JsonLd {
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": url,
    url,
    name: truncate(name, 110),
    ...(description ? { description: truncateSnippet(description) } : {}),
    ...(image ? { primaryImageOfPage: { "@type": "ImageObject", url: image } } : {}),
    ...(dateModified
      ? { dateModified: dateModified.toISOString() }
      : {}),
    isPartOf: { "@type": "WebSite", "@id": WEBSITE_ID },
  };
}

/**
 * Story page: a `WebPage` plus an `ItemList` of the coverage, each entry a
 * `NewsArticle` attributed to (and linking to) the real publisher. No
 * `NewsArticle` is claimed for Duikul itself — we did not write the story.
 */
export function storyJsonLd({
  cluster,
  sources,
  canonical,
  sectionLabel,
}: {
  cluster: StoryCluster;
  sources: readonly StorySource[];
  canonical: string;
  sectionLabel: string;
}): JsonLd {
  const itemList = sources.map((source, index) => {
    const publisher = getSource(source.sourceId);
    const publisherName =
      cluster.language === "bn" ? source.sourceNameBn : source.sourceName;
    const snippet = source.summary.trim()
      ? truncateSnippet(source.summary)
      : "";

    return {
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "NewsArticle",
        headline: truncate(source.title, 110),
        ...(snippet ? { description: snippet } : {}),
        url: source.url,
        mainEntityOfPage: source.url,
        datePublished: source.publishedAt.toISOString(),
        inLanguage: publisher?.language ?? cluster.language,
        articleSection: sectionLabel,
        publisher: {
          "@type": "Organization",
          name: publisherName,
          ...(publisher ? { url: publisher.siteUrl } : {}),
        },
      },
    } satisfies JsonValue;
  });

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": canonical,
    url: canonical,
    name: truncate(cluster.title, 110),
    ...(cluster.summary.trim()
      ? { description: truncateSnippet(cluster.summary) }
      : {}),
    inLanguage: cluster.language,
    datePublished: cluster.firstPublishedAt.toISOString(),
    dateModified: cluster.lastPublishedAt.toISOString(),
    ...(cluster.imageUrl
      ? { primaryImageOfPage: { "@type": "ImageObject", url: cluster.imageUrl } }
      : {}),
    isPartOf: { "@type": "WebSite", "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "ItemList",
      "@id": `${canonical}#coverage`,
      name: `${cluster.title} — coverage`,
      numberOfItems: itemList.length,
      itemListElement: itemList,
    },
  };
}

/**
 * Daily briefing: the one place Duikul publishes original editorial. Returns a
 * `NewsArticle` only when an editor actually wrote a note for that day —
 * otherwise the briefing is an automatic compilation and no article is claimed.
 */
export function dailyBriefingJsonLd({
  briefing,
  headline,
  description,
  canonical,
}: {
  briefing: DailyBriefing;
  headline: string;
  description?: string;
  canonical: string;
}): JsonLd | null {
  if (!briefing.editorNote?.trim()) return null;

  const datePublished = new Date(`${briefing.date}T00:00:00+06:00`);
  const newestUpdate = briefing.clusters.reduce<Date>(
    (latest, cluster) =>
      cluster.lastPublishedAt > latest ? cluster.lastPublishedAt : latest,
    datePublished,
  );

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: truncate(headline, 110),
    ...(description ? { description: truncateSnippet(description) } : {}),
    url: canonical,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    datePublished: datePublished.toISOString(),
    dateModified: newestUpdate.toISOString(),
    inLanguage: "bn",
    articleSection: "Daily briefing",
    isAccessibleForFree: true,
    // Original editorial: written here, credited to the site, never to a
    // syndicated publisher.
    author: organizationRef(),
    publisher: {
      ...organizationRef(),
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icons/icon-512.png`,
        width: 512,
        height: 512,
      },
    },
  };
}

/**
 * Safe inlining: escapes `<` so headline text can never terminate the script
 * tag (or smuggle HTML) inside `<script type="application/ld+json">`.
 */
export function serializeJsonLd(data: JsonLd | readonly JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
