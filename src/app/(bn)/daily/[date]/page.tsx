import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ExternalLink,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { SectionGlyph } from "@/components/brand/SectionGlyph";
import { StoryCard } from "@/components/story/StoryCard";
import { Bi } from "@/components/ui/Bi";
import { INGEST_CONFIG } from "@/config/ingest";
import { SECTION_LIST } from "@/config/sections";
import { SITE_NAME } from "@/config/site";
import { getDailyBriefing, type DailyBriefing } from "@/lib/data/daily";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/seo/metadata";
import {
  breadcrumbJsonLd,
  dailyBriefingJsonLd,
  webPageJsonLd,
} from "@/lib/seo/jsonld";
import {
  daysBetweenDateKeys,
  dhakaDateKey,
  formatDateKey,
  isValidDateKey,
  shiftDateKey,
  toBanglaDigits,
} from "@/lib/utils/date";

export const revalidate = 300;

type DailyPageProps = {
  params: Promise<{ date: string }>;
};

function dailyTitle(date: string): string {
  return `দৈনিক ব্রিফিং — ${formatDateKey(date, "bn")}`;
}

function dailyDescription(briefing: DailyBriefing, date: string): string {
  return briefing.clusters.length > 0
    ? `${formatDateKey(date, "bn")}-এর দৈনিক ব্রিফিং: ${toBanglaDigits(briefing.clusters.length)}টি খবর, ${toBanglaDigits(briefing.confirmed.length)}টি একাধিক সূত্রে নিশ্চিত, ${toBanglaDigits(briefing.outletCount)}টি প্রকাশক।`
    : `${formatDateKey(date, "bn")}-এর জন্য স্বয়ংক্রিয়ভাবে সংকলিত দৈনিক ব্রিফিং।`;
}

export async function generateMetadata({
  params,
}: DailyPageProps): Promise<Metadata> {
  const { date } = await params;

  if (!isValidDateKey(date)) {
    return {
      title: "ব্রিফিং পাওয়া যায়নি",
      robots: { index: false, follow: false },
    };
  }

  const briefing = await getDailyBriefing(date);
  if (!briefing) {
    return {
      title: "ব্রিফিং পাওয়া যায়নি",
      robots: { index: false, follow: false },
    };
  }

  const description = dailyDescription(briefing, date);

  return {
    title: dailyTitle(date),
    description,
    alternates: { canonical: `/daily/${date}` },
    robots: {
      index: briefing.isIndexable,
      follow: true,
      googleBot: {
        index: briefing.isIndexable,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      title: `${dailyTitle(date)} | ${SITE_NAME}`,
      description,
      url: `/daily/${date}`,
      siteName: SITE_NAME,
      locale: "bn_BD",
    },
    twitter: {
      card: "summary_large_image",
      title: `${dailyTitle(date)} | ${SITE_NAME}`,
      description,
    },
  };
}

function Stat({
  labelBn,
  labelEn,
  value,
}: {
  labelBn: string;
  labelEn: string;
  value: string;
}) {
  return (
    <div className="border-t border-rule pt-3">
      <dt className="meta">
        <Bi bn={labelBn} en={labelEn} />
      </dt>
      <dd className="mt-1 font-ui text-[22px] font-semibold tabular-nums text-ink">
        {value}
      </dd>
    </div>
  );
}

export default async function DailyPage({ params }: DailyPageProps) {
  const { date } = await params;
  if (!isValidDateKey(date)) notFound();

  const today = dhakaDateKey();
  const age = daysBetweenDateKeys(date, today);
  if (age < 0 || age > INGEST_CONFIG.retentionDays) notFound();

  const briefing = await getDailyBriefing(date);
  if (!briefing) notFound();

  const previous = shiftDateKey(date, -1);
  const next = shiftDateKey(date, 1);
  const showPrevious =
    daysBetweenDateKeys(previous, today) <= INGEST_CONFIG.retentionDays;
  const showNext = daysBetweenDateKeys(next, today) >= 0;

  const canonical = absoluteUrl(`/daily/${date}`);
  const description = dailyDescription(briefing, date);
  // Original editorial exists only when an editor wrote a note; otherwise the
  // day is an automatic compilation and only a plain WebPage is described.
  const briefingArticle = briefing.isIndexable
    ? dailyBriefingJsonLd({
        briefing,
        headline: dailyTitle(date),
        description,
        canonical,
      })
    : null;
  const structuredData = briefing.isIndexable
    ? [
        briefingArticle ??
          webPageJsonLd({
            path: `/daily/${date}`,
            name: dailyTitle(date),
            description,
          }),
        breadcrumbJsonLd([
          { name: "প্রথম পাতা", path: "/" },
          { name: "দৈনিক ব্রিফিং", path: `/daily/${date}` },
        ]),
      ]
    : null;

  return (
    <div className="container-editorial">
      {structuredData ? <JsonLd data={structuredData} /> : null}
      <nav
        aria-label="Breadcrumb"
        className="mt-5 flex flex-wrap items-center gap-2 font-ui text-[12px] text-muted"
      >
        <Link href="/" className="inline-flex min-h-11 items-center hover:text-ink">
          <Bi bn="প্রথম পাতা" en="Home" />
        </Link>
        <span aria-hidden="true">/</span>
        <span className="inline-flex min-h-11 items-center gap-1.5 text-ink/80">
          <CalendarDays size={13} strokeWidth={1.7} aria-hidden="true" />
          <Bi bn="দৈনিক ব্রিফিং" en="Daily briefing" />
        </span>
      </nav>

      <header className="mt-4 border-b border-rule pb-8 pt-2 sm:pb-10">
        <p className="ui-label flex items-center gap-2 text-accent">
          <FileText size={14} strokeWidth={1.8} aria-hidden="true" />
          <Bi bn="স্বয়ংক্রিয় সংকলন" en="Automated compilation" />
        </p>
        <h1 className="headline mt-3 text-[38px] leading-[1.15] text-ink sm:text-[50px]">
          <Bi
            bn={`${formatDateKey(date, "bn")}-এর ব্রিফিং`}
            en={`Briefing for ${formatDateKey(date, "en")}`}
          />
        </h1>
        <p className="mt-4 max-w-[68ch] text-[16px] leading-relaxed text-muted">
          <Bi
            bn="এই পাতা স্বনামধন্য প্রকাশকের প্রকাশিত সংবাদ থেকে স্বয়ংক্রিয়ভাবে সংকলিত। এটি সম্পাদকীয় প্রতিবেদন নয়; প্রতিটি শিরোনাম ও সারমর্ম মূল প্রকাশকের।"
            en="Compiled automatically from reputable outlets. This is not an editorial report; every headline and extract belongs to its original publisher."
          />
        </p>
      </header>

      {briefing.editorNote ? (
        <aside className="mt-8 border-l-2 border-signal bg-surface/50 px-5 py-4">
          <p className="ui-label text-signal">
            <Bi bn="সম্পাদকের নোট" en="Editor’s note" />
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-ink/85">
            {briefing.editorNote}
          </p>
        </aside>
      ) : null}

      <section aria-labelledby="daily-numbers" className="py-8">
        <h2 id="daily-numbers" className="sr-only">
          <Bi bn="দিনের সংখ্যা" en="The day in numbers" />
        </h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
          <Stat
            labelBn="ক্লাস্টার"
            labelEn="Stories"
            value={toBanglaDigits(briefing.clusters.length)}
          />
          <Stat
            labelBn="নিশ্চিত"
            labelEn="Confirmed"
            value={toBanglaDigits(briefing.confirmed.length)}
          />
          <Stat
            labelBn="প্রকাশক"
            labelEn="Outlets"
            value={toBanglaDigits(briefing.outletCount)}
          />
          <Stat
            labelBn="মূল লিংক"
            labelEn="Source links"
            value={toBanglaDigits(briefing.articleCount)}
          />
        </dl>
      </section>

      {briefing.clusters.length === 0 ? (
        <section className="border-t border-rule py-10">
          <p className="max-w-[62ch] text-[16px] leading-relaxed text-muted">
            <Bi
              bn="এই দিনের জন্য সংস্করণে কোনো প্রকাশযোগ্য ক্লাস্টার নেই। সংবাদ সংগ্রহ চলছে; অন্য দিনের ব্রিফিং দেখুন বা আজকের সংস্করণে ফিরে যান।"
              en="There are no publishable clusters for this day in the edition. Browse another day's briefing or return to today's edition."
            />
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex min-h-11 items-center gap-1.5 font-ui text-sm font-medium text-accent underline decoration-accent/35 underline-offset-4"
          >
            <Bi bn="আজকের সংস্করণে যান" en="Go to today’s edition" />
            <ArrowUpRight size={15} strokeWidth={1.7} aria-hidden="true" />
          </Link>
        </section>
      ) : null}

      {briefing.clusters.length > 0
        ? SECTION_LIST.map((section) => {
            const confirmed = briefing.confirmedBySection[section.glyph].slice(
              0,
              3,
            );
            if (confirmed.length === 0) return null;

            return (
              <section
                key={section.glyph}
                aria-labelledby={`daily-${section.glyph}`}
                className="border-t border-rule py-10"
              >
                <div className="flex items-end justify-between gap-4 border-b-2 border-ink/75 pb-3">
                  <h2
                    id={`daily-${section.glyph}`}
                    className="headline flex items-center gap-2 text-[24px] text-ink"
                  >
                    <SectionGlyph
                      section={section.glyph}
                      className="h-4 w-4 text-accent"
                    />
                    <Bi bn={section.labelBn} en={section.labelEn} />
                  </h2>
                  <span className="meta">
                    <Bi bn="শীর্ষ নিশ্চিত" en="Top confirmed" />
                  </span>
                </div>
                <div className="mt-2">
                  {confirmed.map((cluster) => (
                    <StoryCard key={cluster.id} cluster={cluster} compact />
                  ))}
                </div>
              </section>
            );
          })
        : null}

      {briefing.sourceActivity.length > 0 ? (
        <section
          aria-labelledby="daily-outlets"
          className="border-t border-rule py-10"
        >
          <h2 id="daily-outlets" className="headline text-[24px] text-ink">
            <Bi bn="সবচেয়ে সক্রিয় প্রকাশক" en="Most active outlets" />
          </h2>
          <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-muted">
            <Bi
              bn="একই দিনে কয়টি আলাদা ক্লাস্টারে প্রতিটি প্রকাশকের প্রতিবেদন আছে, তার হিসাব।"
              en="How many distinct clusters each publisher contributed to on this day."
            />
          </p>
          <ul className="mt-5 divide-y divide-rule border-y border-rule">
            {briefing.sourceActivity.map((outlet) => (
              <li
                key={outlet.sourceId}
                className="flex flex-wrap items-center justify-between gap-3 py-2"
              >
                <Link
                  href={`/source/${outlet.sourceId}`}
                  className="inline-flex min-h-11 items-center gap-2 text-[15px] text-ink hover:text-accent"
                >
                  <Bi bn={outlet.nameBn} en={outlet.name} />
                  <ArrowUpRight size={13} strokeWidth={1.7} aria-hidden="true" />
                </Link>
                <span className="meta tabular-nums">
                  <Bi
                    bn={`${toBanglaDigits(outlet.storyCount)}টি ক্লাস্টার`}
                    en={`${outlet.storyCount} ${outlet.storyCount === 1 ? "cluster" : "clusters"}`}
                  />
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {briefing.differences.length > 0 ? (
        <section
          aria-labelledby="daily-differences"
          className="border-t border-rule py-10"
        >
          <h2
            id="daily-differences"
            className="headline text-[24px] text-ink"
          >
            <Bi bn="যেখানে প্রতিবেদন আলাদা" en="Where reports differ" />
          </h2>
          <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-muted">
            <Bi
              bn="একই ঘটনা নিয়ে প্রকাশকদের সংখ্যা বা শিরোনামের জোর আলাদা হলে এখানে দেখানো হয়। এটি পাঠককে মূল প্রতিবেদন দুটোই পড়তে উৎসাহিত করে, কোনো রায় নয়।"
              en="When publishers differ on numbers or headline emphasis, both are shown. This invites you to read the originals; it is not a verdict."
            />
          </p>

          <div className="mt-7 space-y-8">
            {briefing.differences.map((difference) => (
              <article
                key={difference.cluster.id}
                className="border border-rule bg-surface/40 p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip border border-rule bg-bg text-muted">
                    <Bi
                      bn={
                        difference.kind === "numbers"
                          ? "সংখ্যায় পার্থক্য"
                          : "শিরোনামে পার্থক্য"
                      }
                      en={
                        difference.kind === "numbers"
                          ? "Numbers differ"
                          : "Headlines differ"
                      }
                    />
                  </span>
                  <Link
                    href={`/story/${difference.cluster.id}`}
                    className="text-[17px] font-medium leading-snug text-ink underline decoration-rule underline-offset-4 hover:text-accent"
                  >
                    {difference.cluster.title}
                  </Link>
                </div>
                <ul className="mt-4 space-y-3">
                  {difference.variants.slice(0, 4).map((variant) => (
                    <li
                      key={`${variant.sourceId}-${variant.url}`}
                      className="grid gap-1 border-t border-rule pt-3 first:border-t-0 first:pt-0 sm:grid-cols-[10rem_1fr] sm:gap-4"
                    >
                      <span className="meta">
                        <Bi bn={variant.nameBn} en={variant.name} />
                      </span>
                      <a
                        href={variant.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-start gap-1.5 text-[15px] leading-snug text-ink/85 hover:text-accent hover:underline hover:decoration-accent/40 hover:underline-offset-4"
                      >
                        {variant.title}
                        <ExternalLink
                          size={13}
                          strokeWidth={1.7}
                          aria-hidden="true"
                          className="mt-1 shrink-0 text-muted"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-t border-rule py-8">
        <div className="flex items-center justify-between gap-4">
          {showPrevious ? (
            <Link
              href={`/daily/${previous}`}
              className="inline-flex min-h-11 items-center gap-2 font-ui text-[13px] font-medium text-accent"
            >
              <ArrowLeft size={15} strokeWidth={1.7} aria-hidden="true" />
              <Bi
                bn={`${formatDateKey(previous, "bn")}-এর ব্রিফিং`}
                en={`Briefing for ${formatDateKey(previous, "en")}`}
              />
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
          {showNext ? (
            <Link
              href={`/daily/${next}`}
              className="inline-flex min-h-11 items-center gap-2 font-ui text-[13px] font-medium text-accent"
            >
              <Bi
                bn={`${formatDateKey(next, "bn")}-এর ব্রিফিং`}
                en={`Briefing for ${formatDateKey(next, "en")}`}
              />
              <ArrowRight size={15} strokeWidth={1.7} aria-hidden="true" />
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
        </div>
      </section>

      <aside className="border-t border-rule py-8">
        <p className="ui-label flex items-center gap-2 text-accent">
          <ShieldCheck size={14} strokeWidth={1.8} aria-hidden="true" />
          <Bi bn="সংকলনটি কীভাবে তৈরি" en="How this compilation is made" />
        </p>
        <p className="mt-3 max-w-[68ch] text-[14px] leading-relaxed text-muted">
          <Bi
            bn={`আমরা ${toBanglaDigits(INGEST_CONFIG.retentionDays)} দিনের মধ্যে প্রকাশিত ক্লাস্টার থেকে দিনের ব্রিফিং তৈরি করি। প্রতিটি ক্লাস্টার কমপক্ষে দুটি স্বাধীন সূত্রে থাকলে বা সম্পাদকের নোট থাকলে তবেই এই পাতায় দেখা যায়; পাঁচটির কম ক্লাস্টার থাকলে পাতাটি সার্চ ইঞ্জিনের জন্য উন্মুক্ত নয়।`}
            en={`The briefing is built from clusters published within the last ${INGEST_CONFIG.retentionDays} days. A cluster appears here only when it has at least two independent sources or an editor note; pages with fewer than five clusters are kept out of search engines.`}
          />
        </p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          <Link
            href={`/daily/${today}`}
            className="inline-flex min-h-11 items-center gap-1.5 font-ui text-[13px] font-medium text-accent underline decoration-accent/35 underline-offset-4"
          >
            <Bi bn="আজকের ব্রিফিং" en="Today’s briefing" />
            <ArrowUpRight size={14} strokeWidth={1.7} aria-hidden="true" />
          </Link>
          <Link
            href="/about"
            className="inline-flex min-h-11 items-center gap-1.5 font-ui text-[13px] font-medium text-accent underline decoration-accent/35 underline-offset-4"
          >
            <Bi bn="পদ্ধতি পড়ুন" en="Read the methodology" />
            <ArrowUpRight size={14} strokeWidth={1.7} aria-hidden="true" />
          </Link>
        </div>
      </aside>
    </div>
  );
}
