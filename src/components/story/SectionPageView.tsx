import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionGlyph } from "@/components/brand/SectionGlyph";
import { Bi } from "@/components/ui/Bi";
import { EmptyEdition } from "@/components/story/EmptyEdition";
import { LeadStory, StoryCard } from "@/components/story/StoryCard";
import { sectionFor } from "@/config/sections";
import type { NewsCategory } from "@/config/sources";
import type { StoryCluster } from "@/lib/data/clusters";
import {
  dhakaDateKey,
  formatRelativeTime,
  toBanglaDigits,
} from "@/lib/utils/date";

type SectionPageViewProps = {
  category: NewsCategory;
  clusters: StoryCluster[];
  configured: boolean;
};

export function SectionPageView({
  category,
  clusters,
  configured,
}: SectionPageViewProps) {
  const section = sectionFor(category);
  const [lead, ...rest] = clusters;

  return (
    <div className="container-editorial">
      <header className="mt-6 border-b border-rule pb-8 pt-4 sm:pb-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-[62ch]">
            <p className="ui-label flex items-center gap-2 text-accent">
              <SectionGlyph section={category} className="h-4 w-4" />
              <Bi bn="বিভাগ" en="Section" />
            </p>
            <h1 className="headline mt-3 text-[38px] leading-[1.15] text-ink sm:text-[48px]">
              <Bi bn={section.labelBn} en={section.labelEn} />
            </h1>
            <p className="mt-3 max-w-[58ch] text-[16px] leading-relaxed text-muted sm:text-[17px]">
              <Bi bn={section.descriptionBn} en={section.descriptionEn} />
            </p>
          </div>

          <div className="shrink-0 border-l-2 border-accent pl-4">
            <p className="font-ui text-[28px] font-semibold tabular-nums leading-none text-ink">
              <Bi
                bn={toBanglaDigits(clusters.length)}
                en={String(clusters.length)}
              />
            </p>
            <p className="meta mt-2">
              <Bi bn="প্রতিবেদন এই সংস্করণে" en="stories in this edition" />
            </p>
            {lead ? (
              <p className="meta mt-1">
                <Bi bn="সর্বশেষ" en="Updated" />{" "}
                <span className="lang-bn" lang="bn">
                  {formatRelativeTime(lead.lastPublishedAt, "bn")}
                </span>
                <span className="lang-en" lang="en">
                  {formatRelativeTime(lead.lastPublishedAt, "en")}
                </span>
              </p>
            ) : null}
          </div>
        </div>
      </header>

      {!lead ? (
        <EmptyEdition
          level="h2"
          showSetupHint={!configured && process.env.NODE_ENV !== "production"}
        />
      ) : (
        <>
          <section className="border-b border-rule py-8 sm:py-10">
            <LeadStory cluster={lead} />
          </section>

          {rest.length > 0 ? (
            <section className="grid gap-x-8 gap-y-12 py-10 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((cluster) => (
                <StoryCard
                  key={cluster.id}
                  cluster={cluster}
                />
              ))}
            </section>
          ) : null}

          <section className="border-t border-rule py-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm leading-relaxed text-muted">
                <Bi
                  bn={`এই বিভাগের খবর দেখুন ${toBanglaDigits(
                    clusters.length,
                  )}টি ক্লাস্টার, অথবা সারা দিনের ব্রিফিং পড়ুন।`}
                  en={`Browse ${clusters.length} clusters in this section, or read the briefing that covers the whole day.`}
                />
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <Link
                  href={`/daily/${dhakaDateKey()}`}
                  className="inline-flex min-h-11 items-center gap-1.5 font-ui text-[13px] font-medium text-accent underline decoration-accent/35 underline-offset-4"
                >
                  <Bi bn="আজকের দৈনিক ব্রিফিং" en="Today’s daily briefing" />
                  <ArrowUpRight size={14} strokeWidth={1.7} aria-hidden="true" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex min-h-11 items-center gap-1.5 font-ui text-[13px] font-medium text-accent underline decoration-accent/35 underline-offset-4"
                >
                  <Bi bn="পদ্ধতি" en="Methodology" />
                  <ArrowUpRight size={14} strokeWidth={1.7} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
