import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Bi } from "@/components/ui/Bi";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createPageMetadata } from "@/lib/seo/metadata";
import { toBanglaDigits } from "@/lib/utils/date";
import { SITE_NAME, SITE_NAME_BN, TRUST_PATHS, type SiteLocale } from "@/config/site";

type BiText = { bn: string; en: string };

export type TrustBlock = {
  heading: BiText;
  body?: BiText[];
  rules?: BiText[];
};

export type TrustLink = { href: string } & BiText;

type TrustPageProps = {
  /** Route path used for canonical + OG URL, e.g. "/methodology". */
  path: string;
  eyebrow: { icon: ReactNode } & BiText;
  headline: BiText;
  intro: BiText;
  sections: TrustBlock[];
  /** Extra factual sidebar links, shown under the automatic trust links. */
  sideLinks?: TrustLink[];
  /**
   * Which language this render serves. The English twins under `/en` pass
   * "en" so the breadcrumb JSON-LD names match the visible trail.
   */
  locale?: SiteLocale;
};

const footerLinks: TrustLink[] = [
  { href: "/methodology", bn: "পদ্ধতি", en: "Methodology" },
  {
    href: "/editorial-policy",
    bn: "সম্পাদকীয় নীতি",
    en: "Editorial policy",
  },
  { href: "/corrections", bn: "সংশোধনী", en: "Corrections" },
  { href: "/removal-request", bn: "অপসারণের অনুরোধ", en: "Removal request" },
  { href: "/contact", bn: "যোগাযোগ", en: "Contact" },
  { href: "/privacy", bn: "গোপনীয়তা", en: "Privacy" },
  { href: "/terms", bn: "শর্তাবলি", en: "Terms" },
];

/**
 * Builds page metadata for a bilingual trust page. The visible title stays in
 * Bangla (the site's primary language) while the English variant surfaces in
 * the social preview. Canonical is absolute via `metadataBase` on the layout.
 */
export function trustMetadata({
  path,
  title,
  titleEn,
  description,
}: {
  path: string;
  title: string;
  titleEn: string;
  description: string;
}): Metadata {
  return createPageMetadata({
    path,
    locale: "bn",
    title,
    description,
    ogTitle: `${titleEn} — ${SITE_NAME_BN}`,
    ogDescription: description,
    ogType: "website",
    // Every trust page has a real English twin under /en, so advertise both.
    languages: { bn: path, en: `/en${path}` },
  });
}

/**
 * Shared shell for the site's trust and policy pages. Sections render in the
 * site's editorial type scale, fully bilingual through the `Bi` pattern.
 */
export function TrustPage({
  path,
  eyebrow,
  headline,
  intro,
  sections,
  sideLinks,
  locale = "bn",
}: TrustPageProps) {
  const linkSet = sideLinks ? [...footerLinks, ...sideLinks] : footerLinks;
  // The English twins live under /en, so the crumb URL must follow them.
  const crumbPath = locale === "en" ? `/en${path}` : path;
  // Bilingual routes move with the locale; shared URLs (publisher profiles,
  // contact query links to shared pages) must never be prefixed.
  const withLocale = (href: string) => {
    if (locale !== "en") return href;
    const [route, query] = href.split("?");
    return TRUST_PATHS.includes(route)
      ? `/en${route}${query ? `?${query}` : ""}`
      : href;
  };

  return (
    <div className="container-editorial">
      <Breadcrumbs
        locale={locale}
        items={[
          { bn: "প্রথম পাতা", en: "Home", path: "/" },
          { bn: eyebrow.bn, en: eyebrow.en, path: crumbPath, current: true },
        ]}
      />
      <header className="mt-4 border-b border-rule pb-8 pt-4 sm:pb-10">
        <p className="ui-label flex items-center gap-2 text-accent">
          {eyebrow.icon}
          <Bi bn={eyebrow.bn} en={eyebrow.en} />
        </p>
        <h1 className="headline mt-3 max-w-[24ch] text-[34px] leading-[1.15] text-ink sm:text-[46px]">
          <Bi bn={headline.bn} en={headline.en} />
        </h1>
        <p className="mt-4 max-w-[64ch] text-[17px] leading-relaxed text-muted sm:text-[18px]">
          <Bi bn={intro.bn} en={intro.en} />
        </p>
      </header>

      <div className="grid gap-x-10 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          {sections.map((section, index) => (
            <section key={section.heading.en} className="border-t border-rule py-8">
              <p className="ui-label text-muted">
                {toBanglaDigits(index + 1).padStart(2, "০")}
              </p>
              <h2 className="headline mt-2 text-[24px] text-ink sm:text-[28px]">
                <Bi bn={section.heading.bn} en={section.heading.en} />
              </h2>
              {section.body?.map((paragraph) => (
                <p
                  key={paragraph.en}
                  className="mt-4 max-w-[68ch] text-[16px] leading-[1.8] text-muted sm:text-[17px]"
                >
                  <Bi bn={paragraph.bn} en={paragraph.en} />
                </p>
              ))}
              {section.rules ? (
                <ul className="mt-5 grid gap-3">
                  {section.rules.map((rule) => (
                    <li
                      key={rule.en}
                      className="flex gap-3 text-[15px] leading-relaxed text-muted sm:text-[16px]"
                    >
                      <span
                        className="mt-[10px] h-1 w-4 shrink-0 bg-rule-strong"
                        aria-hidden="true"
                      />
                      <Bi bn={rule.bn} en={rule.en} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <section className="border-t border-rule py-8">
            <h2 className="headline text-[22px] text-ink sm:text-[26px]">
              <Bi bn="এই পাতাটি কী করে না" en="What this page is not" />
            </h2>
            <p className="mt-4 max-w-[68ch] text-[16px] leading-[1.8] text-muted sm:text-[17px]">
              <Bi
                bn={`${SITE_NAME_BN} কোনো সরকারি সংবাদমাধ্যম নয়, কোনো ঘটনার স্বাধীন তদন্ত করে না, এবং কোনো প্রকাশকের পক্ষে কথা বলে না। “নিশ্চিত” চিহ্ন মানে একাধিক নির্ভরযোগ্য প্রকাশক একই ঘটনা রিপোর্ট করছে — এটি স্বাধীন সত্যায়ন নয়।`}
                en={`${SITE_NAME} is not a government or state media outlet. We do not independently investigate events and we do not speak for any publisher. A “confirmed” label means several trusted outlets reported the same event — it is not independent verification.`}
              />
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              <Bi
                bn="পদ্ধতির বিস্তারিত দেখুন"
                en="Read the full methodology"
              />{" "}
              <Link
                href={withLocale("/methodology")}
                className="inline-flex min-h-11 items-center gap-1 font-ui text-[13px] font-medium text-accent underline decoration-accent/35 underline-offset-4"
              >
                <Bi bn="পদ্ধতি পাতা" en="Methodology page" />
                <ArrowUpRight size={14} strokeWidth={1.7} aria-hidden="true" />
              </Link>
            </p>
          </section>
        </div>

        <aside className="border-t border-rule py-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-2">
          <p className="ui-label text-muted">
            <Bi bn="সম্পর্কিত পাতা" en="Related pages" />
          </p>
          <ul className="mt-4 grid gap-1">
            {linkSet.map((link) => (
              <li key={link.href}>
                <Link
                  href={withLocale(link.href)}
                  className="inline-flex min-h-11 items-center gap-1 font-ui text-[14px] font-medium text-ink underline decoration-rule-strong underline-offset-4 hover:text-accent"
                  aria-current={link.href === path ? "page" : undefined}
                >
                  <Bi bn={link.bn} en={link.en} />
                  <ArrowUpRight
                    size={13}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
