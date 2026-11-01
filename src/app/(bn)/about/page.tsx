import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  CircleAlert,
  ExternalLink,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { SectionGlyph } from "@/components/brand/SectionGlyph";
import { Bi } from "@/components/ui/Bi";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SECTION_LIST } from "@/config/sections";
import { INGEST_CONFIG } from "@/config/ingest";
import { SOURCES } from "@/config/sources";
import {
  CONTACT_EMAIL,
  PUBLISHER_NAME,
  PUBLISHER_NAME_BN,
  SITE_NAME,
  SITE_NAME_BN,
  type SiteLocale,
} from "@/config/site";

/** Prefixes a link with /en only when the English twin of that route exists. */
function trustHref(href: string, locale?: SiteLocale) {
  return locale === "en" ? `/en${href}` : href;
}
import { toBanglaDigits } from "@/lib/utils/date";

export const metadata: Metadata = {
  title: "আমাদের সম্পর্কে ও পদ্ধতি",
  description: `${SITE_NAME_BN} কীভাবে সংবাদ সংগ্রহ করে, একই ঘটনার প্রতিবেদন একত্র করে, ‘নিশ্চিত’ চিহ্ন দেয় এবং কোন সীমা মেনে চলে — সম্পূর্ণ পদ্ধতি।`,
  alternates: {
    canonical: "/about",
    languages: { bn: "/about", en: "/en/about", "x-default": "/about" },
  },
  openGraph: {
    title: `আমাদের সম্পর্কে ও পদ্ধতি — ${SITE_NAME}`,
    description: `How ${SITE_NAME} gathers the edition, groups reports about the same event, and marks confirmation.`,
    url: "/about",
  },
};

function Rule({ children }: { children: ReactNode }) {
  return <div className="border-t border-rule">{children}</div>;
}

const publisherConfigured =
  PUBLISHER_NAME !== "[PLACEHOLDER]" && PUBLISHER_NAME.trim().length > 0;

export default function AboutPage({ locale }: { locale?: SiteLocale }) {
  const deshiSources = SOURCES.filter((source) => source.category === "deshi");
  const bideshiSources = SOURCES.filter(
    (source) => source.category === "bideshi",
  );

  return (
    <div className="container-editorial">
      <Breadcrumbs
        locale={locale}
        items={[
          { bn: "প্রথম পাতা", en: "Home", path: "/" },
          {
            bn: "আমাদের সম্পর্কে",
            en: "About us",
            path: locale === "en" ? "/en/about" : "/about",
            current: true,
          },
        ]}
      />
      <header className="mt-4 border-b border-rule pb-8 pt-4 sm:pb-10">
        <p className="ui-label flex items-center gap-2 text-accent">
          <ShieldCheck size={14} strokeWidth={1.8} aria-hidden="true" />
          <Bi bn="আমাদের সম্পর্কে" en="About us" />
        </p>
        <h1 className="headline mt-3 max-w-[24ch] text-[38px] leading-[1.15] text-ink sm:text-[50px]">
          <Bi
            bn="সংবাদ নয়, সংবাদের মানচিত্র।"
            en="A map of the news, not more noise."
          />
        </h1>
        <p className="mt-4 max-w-[64ch] text-[17px] leading-relaxed text-muted sm:text-[18px]">
          <Bi
            bn={`${SITE_NAME_BN} বাংলাদেশ ও বিশ্বের জরুরি খবর এক জায়গায় সাজায়। আমরা নিজেরা প্রতিবেদন লিখি না; নির্ভরযোগ্য প্রকাশকের শিরোনাম ও সংক্ষিপ্ত অংশ দেখাই, একই ঘটনার একাধিক প্রতিবেদন একত্র করি, এবং মূল সূত্রে সরাসরি লিংক দিই।`}
            en={`${SITE_NAME} brings the important news from Bangladesh and the world into one calm place. We do not write the reporting ourselves: we show trusted publishers' headlines and short snippets, group reports about the same event, and link directly to the original source.`}
          />
        </p>
      </header>

      <div className="grid gap-12 py-10 lg:grid-cols-12 lg:gap-16">
        <div className="min-w-0 lg:col-span-8">
          <section aria-labelledby="sections-heading">
            <h2 id="sections-heading" className="headline text-[28px] text-ink">
              <Bi bn="দুটি বিভাগ, কোনো বাড়তি শব্দ" en="Two sections, no extra noise" />
            </h2>
            <p className="mt-3 max-w-[64ch] text-[16px] leading-relaxed text-muted">
              <Bi
                bn="সংবাদটি দেশের ভেতরের না বাইরের, সেই সিদ্ধান্তটুকুই আমাদের একমাত্র বিভাজন। প্রতিটি বিভাগে সর্বশেষ ৪৮ ঘণ্টার প্রকাশযোগ্য খবর রাখা হয়।"
                en="The only division we make is whether the story is inside Bangladesh or outside it. Each section carries publishable stories from the last 48 hours."
              />
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {SECTION_LIST.map((section) => (
                <div key={section.href} className="border border-rule bg-surface/35 p-5">
                  <SectionGlyph
                    section={section.glyph}
                    className="h-6 w-6 text-accent"
                  />
                  <h3 className="headline mt-3 text-[22px] text-ink">
                    <Bi bn={section.labelBn} en={section.labelEn} />
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">
                    <Bi
                      bn={section.descriptionBn}
                      en={section.descriptionEn}
                    />
                  </p>
                  <Link
                    href={section.href}
                    className="mt-3 inline-flex min-h-11 items-center gap-1.5 font-ui text-[13px] font-medium text-accent"
                  >
                    <Bi bn="বিভাগটি দেখুন" en="Open the section" />
                    <ArrowUpRight size={14} strokeWidth={1.7} aria-hidden="true" />
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <Rule>
            <section aria-labelledby="edition-heading" className="py-10">
              <h2 id="edition-heading" className="headline text-[28px] text-ink">
                <Bi bn="সংস্করণ কীভাবে তৈরি হয়" en="How the edition is built" />
              </h2>
              <ol className="mt-5 space-y-6">
                {[
                  {
                    bn: "সংগ্রহ",
                    en: "Collect",
                    bodyBn: `প্রতি ৩০ মিনিটে ${SOURCES.length}টি অনুমোদিত আরএসএস ফিড থেকে শিরোনাম, সংক্ষিপ্ত অংশ, সময় ও ছবির লিংক আনা হয়। প্রতিটি অনুরোধে ৮ সেকেন্ডের সময়সীমা, দুইবার পুনরায় চেষ্টা এবং স্পষ্ট বট পরিচয় থাকে।`,
                    bodyEn: `Every 30 minutes we read ${SOURCES.length} approved RSS feeds for headlines, short snippets, timestamps, and image links. Each request has an 8-second timeout, two retries, and an honest bot identity.`,
                  },
                  {
                    bn: "একত্র করা",
                    en: "Group",
                    bodyBn: `শিরোনামের শব্দ, সংখ্যা ও নাম মিলিয়ে একই ঘটনার প্রতিবেদন এক ক্লাস্টারে আনা হয়। এটি কোনো কৃত্রিম বুদ্ধিমত্তার মডেল নয় — একটি প্রকাশ্য, পুনরাবৃত্ত নিয়ম। কেউ একই ঘটনা ভিন্ন ভাষায় বা ভিন্ন কোণ থেকে লিখলেও ক্লাস্টার একই থাকে।`,
                    bodyEn:
                      "Headlines are grouped when their words, numbers, and names overlap. This is not an AI model: it is a published, repeatable rule. The same event stays in one cluster even when outlets write in different languages or from a different angle.",
                  },
                  {
                    bn: "নিশ্চিত করা",
                    en: "Confirm",
                    bodyBn:
                      "একই ঘটনা নিয়ে অন্তত তিনটি স্বাধীন সূত্র প্রতিবেদন করলে, অথবা দুইটি উচ্চ-নির্ভরযোগ্য সূত্রের মিলিত সম্পাদকীয় ওজন ৯ হলে ‘নিশ্চিত’ চিহ্ন দেওয়া হয়। সূত্র গণনা হয় প্রকাশকভিত্তিক, প্রতিবেদনের সংখ্যাভিত্তিক নয়।",
                    bodyEn:
                      "A story is marked “Confirmed” when at least three independent sources report it, or when two high-trust sources reach a combined editorial weight of 9. Sources are counted per publisher, never per article.",
                  },
                  {
                    bn: "প্রকাশ",
                    en: "Publish",
                    bodyBn:
                      "সংস্করণ পাঁচ মিনিট পরপর নতুন করে তৈরি হয়। পুরোনো খবর ১৪ দিন পর স্বয়ংক্রিয়ভাবে সরানো হয়; কোনো সম্পূর্ণ প্রতিবেদন আমাদের কাছে সংরক্ষিত থাকে না।",
                    bodyEn:
                      "The edition is revalidated every five minutes. Stories older than 14 days are removed automatically. We never store a full article body.",
                  },
                ].map((step, index) => (
                  <li
                    key={step.en}
                    className="grid gap-2 border-t border-rule pt-4 sm:grid-cols-[auto_1fr] sm:gap-5"
                  >
                    <span className="font-ui text-[12px] font-semibold tabular-nums text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="headline text-[20px] text-ink">
                        <Bi bn={step.bn} en={step.en} />
                      </h3>
                      <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
                        <Bi bn={step.bodyBn} en={step.bodyEn} />
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </Rule>

          <Rule>
            <section aria-labelledby="confirmed-heading" className="py-10">
              <h2
                id="confirmed-heading"
                className="headline text-[28px] text-ink"
              >
                <Bi
                  bn="‘নিশ্চিত’ চিহ্নের অর্থ কী"
                  en="What the confirmation badge means"
                />
              </h2>

              <div className="mt-5 flex items-start gap-4 border-l-2 border-accent bg-accent-soft/60 px-5 py-4">
                <BadgeCheck
                  size={22}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-accent"
                />
                <div>
                  <p className="font-ui text-[13px] font-semibold text-accent">
                    <Bi
                      bn="তিনটি স্বাধীন সূত্র একই ঘটনার কথা বলছে"
                      en="Three independent sources report the same event"
                    />
                  </p>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink/80">
                    <Bi
                      bn="এটি সত্যতার চূড়ান্ত সনদ নয়। এটি শুধু বলে যে একই ঘটনা নিয়ে একাধিক প্রকাশক আলাদাভাবে প্রতিবেদন করেছে। ভুল তথ্য একাধিক সূত্রে ছড়াতে পারে; সন্দেহ হলে মূল প্রতিবেদনটি পড়ুন।"
                      en="This is not a final certificate of truth. It only says that more than one publisher reported the same event independently. Errors can spread across outlets; when in doubt, read the original report."
                    />
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-[64ch] text-[15px] leading-relaxed text-muted">
                <Bi
                  bn="একটি মাত্র সূত্রের খবর সাধারণত সংস্করণে দেখানো হয় না, যদি না সূত্রটির সম্পাদকীয় ওজন যথেষ্ট বেশি (৪/৫) হয়। সম্পাদকের সংক্ষিপ্ত নোট থাকলে একক-সূত্রের স্টোরি পেজটি অনুসন্ধানযোগ্য হতে পারে এবং নোটটি স্টোরি পেজে স্পষ্টভাবে দেখা যায়।"
                  en="A single-source story is normally kept out of the edition unless the outlet carries enough editorial weight (4/5). A short editor note can make a single-source story page indexable, and the note is displayed clearly on that page."
                />
              </p>
            </section>
          </Rule>

          <Rule>
            <section aria-labelledby="limits-heading" className="py-10">
              <h2 id="limits-heading" className="headline text-[28px] text-ink">
                <Bi bn="আমরা কী করি না" en="What we do not do" />
              </h2>
              <ul className="mt-5 space-y-4">
                {[
                  {
                    bn: "আমরা অন্যের প্রতিবেদন অনুবাদ বা পুনর্লিখন করি না। শিরোনাম ও সংক্ষিপ্ত অংশ মূল ভাষাতেই থাকে।",
                    en: "We do not translate or rewrite other people's reporting. Headlines and snippets stay in their original language.",
                  },
                  {
                    bn: "আমরা সম্পূর্ণ প্রতিবেদন সংরক্ষণ বা প্রদর্শন করি না। প্রতিটি কার্ড থেকে মূল প্রকাশকের সাইটে যেতে হয়।",
                    en: "We do not store or display full articles. Every card sends you to the original publisher.",
                  },
                  {
                    bn: "আমরা ক্লিকবেইট শিরোনাম বানাই না, উদ্ধৃতি বানাই না, বা ছবি সম্পাদনা করি না।",
                    en: "We do not write clickbait headlines, invent quotes, or edit publisher images.",
                  },
                  {
                    bn: "আমরা বিজ্ঞাপন বা ট্র্যাকিং স্ক্রিপ্ট চালাই না। আপনার ভাষা, রঙের পছন্দ ও ইনস্টল প্রস্তাব বন্ধ করার সিদ্ধান্ত কেবল আপনার ব্রাউজারে থাকে; অফলাইনে পড়ার জন্য সাম্প্রতিক পৃষ্ঠাগুলোও আপনার ডিভাইসে ক্যাশে থাকে।",
                    en: "We run no advertising or tracking scripts. Your language, colour preference, and install-prompt choice stay in your browser; recently viewed pages are also cached on your device for offline reading.",
                  },
                ].map((item) => (
                  <li key={item.en} className="flex items-start gap-3">
                    <CircleAlert
                      size={16}
                      strokeWidth={1.7}
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-signal"
                    />
                    <p className="text-[15px] leading-relaxed text-ink/85">
                      <Bi bn={item.bn} en={item.en} />
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </Rule>

          <Rule>
            <section aria-labelledby="sources-heading" className="py-10">
              <h2 id="sources-heading" className="headline text-[28px] text-ink">
                <Bi bn="আমাদের সূত্রের তালিকা" en="Our source list" />
              </h2>
              <p className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-muted">
                <Bi
                  bn={`শুধু নিচের তালিকার প্রকাশকদের আরএসএস ফিড পড়া হয়। তালিকায় নেই এমন কোনো সাইট থেকে আমরা স্বয়ংক্রিয়ভাবে খবর আনি না। প্রতিটি সূত্রের পাশে সম্পাদকীয় ওজন (১–৫) দেখানো হয়েছে; এটি শুধু নিশ্চিতকরণের হিসাবে ব্যবহৃত হয়।`}
                  en={`We read RSS feeds only from the publishers below. We do not automatically ingest from any site outside this list. The editorial weight (1–5) beside each source is used only in the confirmation calculation.`}
                />
              </p>

              <div className="mt-6 grid gap-8 sm:grid-cols-2">
                {[
                  { titleBn: "দেশি খবর", titleEn: "Bangladesh", list: deshiSources },
                  { titleBn: "বিদেশি খবর", titleEn: "World", list: bideshiSources },
                ].map((group) => (
                  <div key={group.titleEn}>
                    <h3 className="ui-label text-muted">
                      <Bi bn={group.titleBn} en={group.titleEn} />{" "}
                      <span className="normal-case tracking-normal">
                        ({group.list.length})
                      </span>
                    </h3>
                    <ul className="mt-2">
                      {group.list.map((source) => (
                        <li
                          key={source.id}
                          className="flex items-baseline justify-between gap-3 border-b border-rule py-2.5"
                        >
                          <a
                            href={source.siteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex min-h-11 items-center gap-1.5 text-[14px] text-ink/85 hover:text-accent"
                          >
                            <span lang={source.language} className="font-medium">
                              {source.nameBn}
                            </span>
                            <span className="text-[12px] text-muted">
                              {source.name}
                            </span>
                            <ExternalLink
                              size={12}
                              strokeWidth={1.6}
                              aria-hidden="true"
                              className="text-muted group-hover:text-accent"
                            />
                          </a>
                          <span className="shrink-0 font-ui text-[11px] tabular-nums text-muted">
                            <Bi
                              bn={`${toBanglaDigits(source.trustWeight)}/৫`}
                              en={`${source.trustWeight}/5`}
                            />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </Rule>

          <Rule>
            <section aria-labelledby="numbers-heading" className="py-10">
              <h2 id="numbers-heading" className="headline text-[28px] text-ink">
                <Bi bn="পদ্ধতির সংখ্যাগুলো" en="The numbers behind the method" />
              </h2>
              <p className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-muted">
                <Bi
                  bn="আমাদের সিদ্ধান্তের সব সীমা প্রকাশ্য। নিচের সংখ্যাগুলো বদলালে সংস্করণের আচরণও বদলাবে, এবং এই পৃষ্ঠাও হালনাগাদ হবে।"
                  en="Every threshold we use is public. If a number changes, the edition's behaviour changes with it, and this page is updated."
                />
              </p>

              <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {[
                  {
                    bn: "সংস্করণের সময়সীমা",
                    en: "Edition window",
                    valueBn: `${toBanglaDigits(INGEST_CONFIG.windowHours)} ঘণ্টা`,
                    valueEn: `${INGEST_CONFIG.windowHours} hours`,
                  },
                  {
                    bn: "সংরক্ষণ",
                    en: "Retention",
                    valueBn: `${toBanglaDigits(INGEST_CONFIG.retentionDays)} দিন`,
                    valueEn: `${INGEST_CONFIG.retentionDays} days`,
                  },
                  {
                    bn: "ক্লাস্টারের সময়সীমা",
                    en: "Clustering window",
                    valueBn: `${toBanglaDigits(INGEST_CONFIG.clusterWindowHours)} ঘণ্টা`,
                    valueEn: `${INGEST_CONFIG.clusterWindowHours} hours`,
                  },
                  {
                    bn: "ক্লাস্টার সীমা",
                    en: "Cluster threshold",
                    valueBn: toBanglaDigits(INGEST_CONFIG.clusterThreshold),
                    valueEn: String(INGEST_CONFIG.clusterThreshold),
                  },
                  {
                    bn: "নিশ্চিতকরণের সূত্র",
                    en: "Sources for confirmation",
                    valueBn: `${toBanglaDigits(INGEST_CONFIG.confirmedMinSources)}টি`,
                    valueEn: `${INGEST_CONFIG.confirmedMinSources}`,
                  },
                  {
                    bn: "উচ্চ-নির্ভরতা সীমা",
                    en: "High-trust threshold",
                    valueBn: `${toBanglaDigits(INGEST_CONFIG.confirmedHighTrustSources)}টি সূত্র, ওজন ${toBanglaDigits(INGEST_CONFIG.confirmedHighTrustSum)}`,
                    valueEn: `${INGEST_CONFIG.confirmedHighTrustSources} sources, weight ${INGEST_CONFIG.confirmedHighTrustSum}`,
                  },
                ].map((item) => (
                  <div
                    key={item.en}
                    className="flex items-baseline justify-between gap-4 border-b border-rule pb-3"
                  >
                    <dt className="text-[14px] text-muted">
                      <Bi bn={item.bn} en={item.en} />
                    </dt>
                    <dd className="shrink-0 font-ui text-[14px] font-semibold tabular-nums text-ink">
                      <Bi bn={item.valueBn} en={item.valueEn} />
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </Rule>

          <Rule>
            <section aria-labelledby="contact-heading" className="py-10">
              <h2 id="contact-heading" className="headline text-[28px] text-ink">
                <Bi bn="সংশোধন, সূত্র ও অভিযোগ" en="Corrections, sources, and complaints" />
              </h2>
              <p className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-muted">
                <Bi
                  bn="কোনো শিরোনাম ভুল, কোনো সূত্র বাদ পড়েছে, বা কোনো প্রকাশকের সঙ্গে আমাদের সম্পর্ক নিয়ে প্রশ্ন থাকলে লিখুন। সংশোধন হলে স্টোরি পেজে সম্পাদকের নোট যোগ করা হবে।"
                  en="If a headline is wrong, a source is missing, or you have a question about our relationship with a publisher, write to us. Corrections are noted on the story page."
                />
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 font-ui text-[13px] font-semibold text-accent-contrast transition-opacity hover:opacity-90"
                >
                  <Mail size={15} strokeWidth={1.7} aria-hidden="true" />
                  {CONTACT_EMAIL}
                </a>
                <Link
                  href={trustHref("/privacy", locale)}
                  className="inline-flex min-h-11 items-center gap-1.5 font-ui text-[13px] font-medium text-accent underline decoration-accent/35 underline-offset-4"
                >
                  <Bi bn="গোপনীয়তা নীতি" en="Privacy policy" />
                  <ArrowUpRight size={14} strokeWidth={1.7} aria-hidden="true" />
                </Link>
                <Link
                  href={trustHref("/corrections", locale)}
                  className="inline-flex min-h-11 items-center gap-1.5 font-ui text-[13px] font-medium text-accent underline decoration-accent/35 underline-offset-4"
                >
                  <Bi bn="সংশোধনী নীতি" en="Corrections policy" />
                  <ArrowUpRight size={14} strokeWidth={1.7} aria-hidden="true" />
                </Link>
                <Link
                  href={trustHref("/removal-request", locale)}
                  className="inline-flex min-h-11 items-center gap-1.5 font-ui text-[13px] font-medium text-accent underline decoration-accent/35 underline-offset-4"
                >
                  <Bi bn="অপসারণের অনুরোধ" en="Removal request" />
                  <ArrowUpRight size={14} strokeWidth={1.7} aria-hidden="true" />
                </Link>
              </div>
            </section>
          </Rule>
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-36 border-t-2 border-accent bg-surface/50 p-5">
            <p className="ui-label text-muted">
              <Bi bn="প্রকাশক" en="Publisher" />
            </p>
            {publisherConfigured ? (
              <p className="mt-2 text-[15px] leading-relaxed text-ink/85">
                <span lang="bn" className="font-bangla-ui">
                  {PUBLISHER_NAME_BN}
                </span>
                <span className="mt-1 block font-ui text-[13px] text-muted">
                  {PUBLISHER_NAME}
                </span>
              </p>
            ) : (
              <p className="mt-2 text-[14px] leading-relaxed text-muted">
                <Bi
                  bn="প্রকাশকের বিবরণ শীঘ্রই প্রকাশ করা হবে।"
                  en="Publisher details will be published before launch."
                />
              </p>
            )}

            <dl className="mt-5 space-y-3 border-t border-rule pt-4 text-[13px]">
              <div>
                <dt className="meta">
                  <Bi bn="প্রতিষ্ঠান" en="Publication" />
                </dt>
                <dd className="mt-0.5 text-ink/80">
                  <Bi bn={SITE_NAME_BN} en={SITE_NAME} />
                </dd>
              </div>
              <div>
                <dt className="meta">
                  <Bi bn="কেন্দ্র" en="Based in" />
                </dt>
                <dd className="mt-0.5 text-ink/80">
                  <Bi bn="ঢাকা, বাংলাদেশ" en="Dhaka, Bangladesh" />
                </dd>
              </div>
              <div>
                <dt className="meta">
                  <Bi bn="যোগাযোগ" en="Contact" />
                </dt>
                <dd className="mt-0.5">
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-accent underline decoration-accent/35 underline-offset-4"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
