import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Bi } from "@/components/ui/Bi";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import { EmptyEdition } from "@/components/story/EmptyEdition";
import { LeadStory, StoryCard } from "@/components/story/StoryCard";
import { SectionHeading } from "@/components/story/SectionHeading";
import { SECTION_LIST, sectionFor } from "@/config/sections";
import { SOURCES, type NewsCategory } from "@/config/sources";
import { listClusters, type StoryCluster } from "@/lib/data/clusters";
import { isSupabaseConfigured } from "@/lib/supabase/public";
import { absoluteUrl } from "@/lib/seo/metadata";
import { dhakaDateKey, toBanglaDigits } from "@/lib/utils/date";
import {
  SITE_DESCRIPTION_BN,
  SITE_DESCRIPTION_EN,
  SITE_NAME,
  SITE_NAME_BN,
  TRUST_PATHS,
  type SiteLocale,
} from "@/config/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: `${SITE_NAME} — দেশি ও বিদেশি খবর, এক জায়গায়`,
  description: SITE_DESCRIPTION_BN,
  alternates: {
    canonical: absoluteUrl("/"),
    languages: {
      bn: absoluteUrl("/"),
      en: absoluteUrl("/en"),
      "x-default": absoluteUrl("/"),
    },
  },
  openGraph: {
    title: `${SITE_NAME} — দেশি ও বিদেশি খবর, এক জায়গায়`,
    description: SITE_DESCRIPTION_EN,
    url: "/",
  },
};

function pickLead(clusters: StoryCluster[]): StoryCluster | null {
  return (
    [...clusters].sort((a, b) => {
      if (a.isConfirmed !== b.isConfirmed) return a.isConfirmed ? -1 : 1;
      return b.popularScore - a.popularScore;
    })[0] ?? null
  );
}

function SectionBlock({
  category,
  clusters,
}: {
  category: NewsCategory;
  clusters: StoryCluster[];
}) {
  const section = sectionFor(category);
  const [first, ...rest] = clusters;
  const compact = rest.slice(0, 3);

  return (
    <section aria-labelledby={`section-${category}`} className="min-w-0">
      <div id={`section-${category}`}>
        <SectionHeading category={category} count={clusters.length} />
      </div>

      {first ? (
        <div className="mt-6">
          <StoryCard cluster={first} />
        </div>
      ) : (
        <p className="mt-6 border-b border-rule pb-6 text-sm leading-relaxed text-muted">
          <Bi
            bn={`${section.labelBn}-এ এই মুহূর্তে প্রকাশযোগ্য কোনো প্রতিবেদন নেই। পরের সংস্করণে আবার দেখুন।`}
            en={`No publishable ${section.labelEn.toLowerCase()} stories in this edition yet. Check the next update.`}
          />
        </p>
      )}

      {compact.length > 0 ? (
        <div className="mt-7">
          {compact.map((cluster) => (
            <StoryCard key={cluster.id} cluster={cluster} compact />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default async function HomePage({
  locale = "bn",
}: {
  locale?: SiteLocale;
}) {
  // Trust pages have English twins; the rest of the home page links to shared
  // news URLs (sections, briefings, publisher profiles).
  const trustHref = (href: string) =>
    locale === "en" && TRUST_PATHS.includes(href) ? `/en${href}` : href;

  const [deshi, bideshi] = await Promise.all([
    listClusters({ category: "deshi", limit: 12 }),
    listClusters({ category: "bideshi", limit: 12 }),
  ]);

  const all = [...deshi, ...bideshi];
  const lead = pickLead(all);

  const withoutLead = (clusters: StoryCluster[]) =>
    clusters.filter((cluster) => cluster.id !== lead?.id).slice(0, 4);

  const configured = isSupabaseConfigured();

  return (
    <div className="container-editorial">
      <h1 className="sr-only">
        {SITE_NAME_BN} — দেশি খবর ও বিদেশি খবর, এক জায়গায়
      </h1>

      <div className="double-rule mt-6 flex items-center justify-between gap-4 py-2.5">
        <p className="ui-label flex items-center gap-2 text-accent">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal" />
          <Bi bn="আজকের সংস্করণ" en="Today’s edition" />
        </p>
        <p className="meta">
          <Bi bn="ঢাকা · বাংলাদেশ" en="Dhaka · Bangladesh" />
        </p>
        <Link
          href={`/daily/${dhakaDateKey()}`}
          className="inline-flex min-h-11 items-center gap-1.5 font-ui text-[12px] font-semibold text-accent"
        >
          <Bi bn="দৈনিক ব্রিফিং" en="Daily briefing" />
          <ArrowUpRight size={14} strokeWidth={1.7} aria-hidden="true" />
        </Link>
      </div>

      {!lead ? (
        <EmptyEdition
          level="h2"
          showSetupHint={!configured && process.env.NODE_ENV !== "production"}
        />
      ) : (
        <>
          <section className="border-b border-rule py-8 sm:py-10">
            <p className="ui-label mb-5 text-muted">
              <Bi bn="আজকের প্রধান খবর" en="The lead story" />
            </p>
            <LeadStory cluster={lead} />
          </section>

          <div className="grid gap-12 py-12 lg:grid-cols-2 lg:gap-14">
            {SECTION_LIST.map((section) => (
              <SectionBlock
                key={section.glyph}
                category={section.glyph}
                clusters={withoutLead(
                  section.glyph === "deshi" ? deshi : bideshi,
                )}
              />
            ))}
          </div>
        </>
      )}

      <section
        aria-labelledby="home-sources-heading"
        className="border-t border-rule py-10 sm:py-12"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="ui-label text-accent">
              <Bi bn="যাদের খবর পড়ি" en="Whose reporting we read" />
            </p>
            <h2
              id="home-sources-heading"
              className="headline mt-3 max-w-[26ch] text-[26px] text-ink sm:text-[30px]"
            >
              <Bi bn="প্রকাশকদের প্রোফাইল" en="Publisher profiles" />
            </h2>
          </div>
          <Link
            href={trustHref("/methodology")}
            className="inline-flex min-h-11 items-center gap-1.5 font-ui text-[13px] font-medium text-accent underline decoration-accent/35 underline-offset-4"
          >
            <Bi bn="কীভাবে কাজ করে" en="How it works" />
            <ArrowUpRight size={14} strokeWidth={1.7} aria-hidden="true" />
          </Link>
        </div>
        <p className="mt-3 max-w-[72ch] text-[15px] leading-relaxed text-muted">
          <Bi
            bn={`শুধু নিচের ${toBanglaDigits(
              SOURCES.length,
            )}টি অনুমোদিত প্রকাশকের অফিসিয়াল ফিড থেকে খবর আসে। প্রতিটি নামে ক্লিক করলে সেই প্রকাশকের প্রোফাইল পাতা খোলে — ওজন, সীমা ও সাম্প্রতিক খবর।`}
            en={`News comes only from the ${SOURCES.length} approved publishers below, via their official feeds. Each name opens that publisher's profile — weight, limits, and recent stories.`}
          />
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-0">
          {SOURCES.map((source) => (
            <li key={source.id}>
              <Link
                href={`/source/${source.id}`}
                className="inline-flex min-h-11 items-center gap-1.5 text-[14px] text-ink/85 transition-colors hover:text-accent"
              >
                <Bi bn={source.nameBn} en={source.name} />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="newsletter"
        aria-labelledby="newsletter-heading"
        className="border-t border-rule py-12 sm:py-14"
      >
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-6">
            <p className="ui-label text-accent">
              <Bi bn="নিউজলেটার" en="Newsletter" />
            </p>
            <h2
              id="newsletter-heading"
              className="headline headline-section mt-3 max-w-[24ch] text-ink"
            >
              <Bi
                bn="এক ইমেইলে দেশ ও বিশ্বের জরুরি খবর।"
                en="The day’s essential news, in one email."
              />
            </h2>
            <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-muted">
              <Bi
                bn="প্রতিদিন সকালে একটি সংক্ষিপ্ত সংস্করণ — দুটি বিভাগ, যাচাই করা খবর, কোনো আওয়াজ নয়।"
                en="A short edition every morning — two sections, verified reporting, no noise."
              />
            </p>
          </div>
          <div className="md:col-span-6 md:pl-8">
            <NewsletterSignup source="homepage" />
          </div>
        </div>
      </section>

      <section className="border-t border-rule py-12 sm:py-14">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="ui-label text-accent">
              <Bi bn="আমাদের প্রতিশ্রুতি" en="Our promise" />
            </p>
            <h2 className="headline mt-3 max-w-[22ch] text-[28px] text-ink sm:text-[32px]">
              <Bi
                bn="শান্তভাবে পড়ার মতো সংবাদ।"
                en="News made calm enough to read."
              />
            </h2>
          </div>

          <ol className="grid gap-6 md:col-span-7 sm:grid-cols-3">
            {[
              {
                bn: "আমরা সংবাদ নিজেরা লিখি না বা অনুবাদ করি না।",
                en: "We do not rewrite or translate the reporting.",
              },
              {
                bn: "শিরোনাম, সংক্ষিপ্ত সারমর্ম ও মূল সূত্রে সরাসরি লিংক।",
                en: "Headline, short snippet, and a direct link to the source.",
              },
              {
                bn: "স্বাধীন সূত্রে নিশ্চিত হলে তবেই ‘নিশ্চিত’ চিহ্ন।",
                en: "The confirmation badge appears only when independent sources agree.",
              },
            ].map((item, index) => (
              <li key={item.en} className="border-t border-rule pt-4">
                <span className="font-ui text-[11px] font-semibold tabular-nums text-accent">
                  0{index + 1}
                </span>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/85">
                  <Bi bn={item.bn} en={item.en} />
                </p>
              </li>
            ))}
          </ol>
        </div>

        <Link
          href={trustHref("/about")}
          className="mt-8 inline-flex min-h-11 items-center gap-1.5 font-ui text-sm font-medium text-accent underline decoration-accent/35 underline-offset-4"
        >
          <Bi bn="পদ্ধতি ও সম্পাদকীয় নীতি" en="Methodology and editorial policy" />
          <ArrowUpRight size={15} strokeWidth={1.7} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
