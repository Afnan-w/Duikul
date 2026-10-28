import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, SearchX } from "lucide-react";
import { SectionGlyph } from "@/components/brand/SectionGlyph";
import { Bi } from "@/components/ui/Bi";
import {
  SearchForm,
  SearchSectionFilter,
} from "@/components/search/SearchForm";
import { StoryCard } from "@/components/story/StoryCard";
import { SECTION_LIST } from "@/config/sections";
import type { NewsCategory } from "@/config/sources";
import { listClusters, searchClusters } from "@/lib/data/clusters";
import { toBanglaDigits } from "@/lib/utils/date";

export const metadata: Metadata = {
  title: "খুঁজুন — Search",
  description:
    "খবর ডেইলির দেশি ও বিদেশি সংস্করণে শিরোনাম ও সারমর্মে খুঁজুন। Search KhoborDaily's Bangladesh and world editions.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    section?: string | string[];
  }>;
};

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function categoryFrom(value: string): NewsCategory | undefined {
  return value === "deshi" || value === "bideshi" ? value : undefined;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = first(params.q).trim().slice(0, 80);
  const category = categoryFrom(first(params.section));
  const viable = Array.from(query).length >= 2;

  const [results, latest] = await Promise.all([
    viable ? searchClusters(query, { category, limit: 30 }) : Promise.resolve([]),
    viable ? Promise.resolve([]) : listClusters({ limit: 6 }),
  ]);

  return (
    <div className="container-editorial">
      <header className="mt-6 border-b border-rule pb-8 pt-4 sm:pb-10">
        <p className="ui-label flex items-center gap-2 text-accent">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal" />
          <Bi bn="সংস্করণে খুঁজুন" en="Search the edition" />
        </p>
        <h1 className="headline mt-3 text-[38px] leading-[1.15] text-ink sm:text-[48px]">
          <Bi bn="খুঁজুন" en="Search" />
        </h1>
        <p className="mt-3 max-w-[60ch] text-[16px] leading-relaxed text-muted sm:text-[17px]">
          <Bi
            bn="দেশি ও বিদেশি — দুই বিভাগের সর্বশেষ সংস্করণে শিরোনাম ও সংক্ষিপ্ত সারমর্মে খুঁজুন। মূল প্রতিবেদনের লিংক ফলাফলেই পাবেন।"
            en="Look through the latest Bangladesh and world editions by headline and short snippet. Every result links to the original report."
          />
        </p>

        <SearchForm query={query} category={category} />
        <SearchSectionFilter query={query} active={category} />
      </header>

      {viable ? (
        <section aria-labelledby="search-results-heading" className="py-8 sm:py-10">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b-2 border-ink/75 pb-3">
            <h2
              id="search-results-heading"
              className="headline text-[24px] text-ink"
            >
              <Bi bn="ফলাফল" en="Results" />
            </h2>
            <p className="meta">
              <Bi
                bn={`“${query}” — ${toBanglaDigits(results.length)}টি প্রতিবেদন`}
                en={`“${query}” — ${results.length} ${
                  results.length === 1 ? "story" : "stories"
                }`}
              />
            </p>
          </div>

          {results.length > 0 ? (
            <>
              <div className="mt-7 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((cluster, index) => (
                  <StoryCard
                    key={cluster.id}
                    cluster={cluster}
                    eager={index < 3}
                  />
                ))}
              </div>
              <p className="meta mt-10 border-t border-rule pt-4">
                <Bi
                  bn="ফলাফল সর্বশেষ ৪৮ ঘণ্টার প্রকাশিত খবর থেকে, গুরুত্ব অনুসারে সাজানো। আরও পুরোনো খবর ১৪ দিন পর্যন্ত সংরক্ষিত থাকে।"
                  en="Results come from the last 48 hours, ordered by relevance. Older stories remain archived for up to 14 days."
                />
              </p>
            </>
          ) : (
            <div className="mt-8 border border-rule bg-surface/40 px-6 py-14 text-center">
              <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-rule bg-bg text-muted">
                <SearchX size={22} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h3 className="headline mt-5 text-[26px] text-ink">
                <Bi
                  bn="এই শব্দে কিছু পাওয়া যায়নি"
                  en="No stories matched that search"
                />
              </h3>
              <p className="mx-auto mt-3 max-w-[52ch] text-[15px] leading-relaxed text-muted">
                <Bi
                  bn="বানান বদলে দেখুন, আরও সাধারণ শব্দ ব্যবহার করুন, অথবা বিভাগের সীমা সরিয়ে সব বিভাগে খুঁজুন।"
                  en="Try another spelling, a shorter phrase, or remove the section filter to search everything."
                />
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                {SECTION_LIST.map((section) => (
                  <Link
                    key={section.href}
                    href={section.href}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-rule px-4 font-ui text-[13px] font-medium text-ink hover:border-accent/40"
                  >
                    <SectionGlyph
                      section={section.glyph}
                      className="h-4 w-4 text-accent"
                    />
                    <Bi bn={section.labelBn} en={section.labelEn} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : (
        <>
          {query.length > 0 ? (
            <p
              role="status"
              className="mt-6 border-l-2 border-signal bg-surface/50 px-4 py-3 text-sm leading-relaxed text-muted"
            >
              <Bi
                bn="খোঁজার জন্য কমপক্ষে দুই অক্ষর লিখুন।"
                en="Please type at least two characters to search."
              />
            </p>
          ) : null}

          <section
            aria-labelledby="browse-heading"
            className="grid gap-6 py-10 md:grid-cols-2"
          >
            <h2 id="browse-heading" className="sr-only">
              Browse by section
            </h2>
            {SECTION_LIST.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="group flex flex-col justify-between border-t-2 border-ink/75 bg-surface/35 p-6 transition-colors hover:bg-surface"
              >
                <div>
                  <SectionGlyph
                    section={section.glyph}
                    className="h-8 w-8 text-accent"
                  />
                  <h3 className="headline mt-4 text-[30px] text-ink">
                    <Bi bn={section.labelBn} en={section.labelEn} />
                  </h3>
                  <p className="mt-2 max-w-[42ch] text-[15px] leading-relaxed text-muted">
                    <Bi
                      bn={section.descriptionBn}
                      en={section.descriptionEn}
                    />
                  </p>
                </div>
                <span className="mt-5 inline-flex min-h-11 items-center gap-1.5 font-ui text-[13px] font-medium text-accent">
                  <Bi bn="বিভাগে যান" en={`Open ${section.labelEn}`} />
                  <ArrowUpRight
                    size={15}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </span>
              </Link>
            ))}
          </section>

          {latest.length > 0 ? (
            <section className="border-t border-rule py-10">
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b-2 border-ink/75 pb-3">
                <h2 className="headline text-[24px] text-ink">
                  <Bi bn="সর্বশেষ সংস্করণ" en="Latest edition" />
                </h2>
                <Link
                  href="/"
                  className="inline-flex min-h-11 items-center gap-1.5 font-ui text-[12px] font-medium text-accent"
                >
                  <Bi bn="প্রথম পাতা" en="Home" />
                  <ArrowUpRight
                    size={14}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </Link>
              </div>
              <div className="mt-7 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {latest.map((cluster, index) => (
                  <StoryCard
                    key={cluster.id}
                    cluster={cluster}
                    eager={index < 3}
                  />
                ))}
              </div>
            </section>
          ) : (
            <section className="border-t border-rule py-10">
              <p className="max-w-[60ch] text-[15px] leading-relaxed text-muted">
                <Bi
                  bn="এই মুহূর্তে কোনো সর্বশেষ সংস্করণ নেই। কিছুক্ষণ পরে আবার দেখুন, অথবা পদ্ধতি সম্পর্কে জানুন।"
                  en="There is no latest edition to show yet. Check back shortly, or read how the edition is built."
                />
              </p>
              <Link
                href="/about"
                className="mt-4 inline-flex min-h-11 items-center gap-1.5 font-ui text-sm font-medium text-accent underline decoration-accent/35 underline-offset-4"
              >
                <Bi bn="পদ্ধতি পড়ুন" en="Read the methodology" />
                <ArrowUpRight size={15} strokeWidth={1.7} aria-hidden="true" />
              </Link>
            </section>
          )}
        </>
      )}

      <section className="border-t border-rule py-8">
        <p className="meta max-w-[72ch]">
          <Bi
            bn="খোঁজার ফলাফলে মূল প্রতিবেদনের শিরোনাম ও সংক্ষিপ্ত সারমর্ম দেখানো হয়। সম্পূর্ণ প্রতিবেদন প্রকাশকের সাইটে পড়ুন।"
            en="Search results show the original headline and a short snippet. Read the full report on the publisher's site."
          />{" "}
          <Link
            href="/about"
            className="text-accent underline decoration-accent/35 underline-offset-4"
          >
            <Bi bn="পদ্ধতি" en="Methodology" />
          </Link>
        </p>
      </section>
    </div>
  );
}
