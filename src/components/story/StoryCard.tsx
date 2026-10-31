import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { SectionGlyph } from "@/components/brand/SectionGlyph";
import { Bi } from "@/components/ui/Bi";
import { sectionFor } from "@/config/sections";
import type { StoryCluster } from "@/lib/data/clusters";
import { formatRelativeTime } from "@/lib/utils/date";
import { ConfirmationBadge } from "./ConfirmationBadge";
import { StoryImage } from "./StoryImage";

function TimeAgo({ date }: { date: Date }) {
  return (
    <>
      <span className="lang-bn" lang="bn">
        {formatRelativeTime(date, "bn")}
      </span>
      <span className="lang-en" lang="en">
        {formatRelativeTime(date, "en")}
      </span>
    </>
  );
}

function Kicker({ cluster }: { cluster: StoryCluster }) {
  const section = sectionFor(cluster.category);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex min-h-8 items-center gap-1.5 font-ui text-[11px] font-semibold uppercase tracking-[0.09em] text-accent">
        <SectionGlyph section={cluster.category} className="h-3.5 w-3.5" />
        <Bi bn={section.labelBn} en={section.labelEn} />
      </span>
      <ConfirmationBadge
        sourceCount={cluster.distinctSourceCount}
        confirmed={cluster.isConfirmed}
      />
    </div>
  );
}

function StoryMeta({ cluster }: { cluster: StoryCluster }) {
  return (
    <p className="meta mt-4 flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="inline-flex items-center gap-1.5">
        <Clock size={12} strokeWidth={1.7} aria-hidden="true" />
        <TimeAgo date={cluster.firstPublishedAt} />
      </span>
      <span aria-hidden="true">·</span>
      <span>{cluster.primarySourceName}</span>
    </p>
  );
}

export function LeadStory({ cluster }: { cluster: StoryCluster }) {
  return (
    <article className="grid gap-6 md:grid-cols-12 md:items-center md:gap-10">
      <div className="md:col-span-7">
        <Link
          href={`/story/${cluster.id}`}
          className="block"
          tabIndex={-1}
          aria-hidden="true"
        >
          <StoryImage
            src={cluster.imageUrl}
            alt=""
            category={cluster.category}
            className="aspect-[16/9]"
            priority
          />
        </Link>
      </div>

      <div className="md:col-span-5">
        <Kicker cluster={cluster} />
        <h2
          className="headline headline-feature mt-4"
          lang={cluster.language}
        >
          <Link
            href={`/story/${cluster.id}`}
            className="story-link story-title text-ink"
          >
            {cluster.title}
          </Link>
        </h2>
        {cluster.summary ? (
          <p
            className="body-copy mt-4 line-clamp-4 text-ink/80"
            lang={cluster.language}
          >
            {cluster.summary}
          </p>
        ) : null}
        <StoryMeta cluster={cluster} />
        <Link
          href={`/story/${cluster.id}`}
          className="mt-6 inline-flex min-h-11 items-center gap-1.5 font-ui text-sm font-medium text-accent underline decoration-accent/35 underline-offset-4"
        >
          <Bi bn="সারসংক্ষেপ পড়ুন" en="Read the summary" />
          <ArrowUpRight size={15} strokeWidth={1.7} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

type StoryCardProps = {
  cluster: StoryCluster;
  compact?: boolean;
};

export function StoryCard({
  cluster,
  compact = false,
}: StoryCardProps) {
  if (compact) {
    return (
      <article className="border-b border-rule py-5 first:pt-0 last:border-b-0 last:pb-0">
        <div className="grid grid-cols-[1fr_auto] items-start gap-4">
          <div>
            <Kicker cluster={cluster} />
            <h3
              className="headline mt-2.5 text-[20px] leading-[1.3]"
              lang={cluster.language}
            >
              <Link
                href={`/story/${cluster.id}`}
                className="story-link story-title inline-block min-h-11 text-ink"
              >
                {cluster.title}
              </Link>
            </h3>
            <StoryMeta cluster={cluster} />
          </div>
          <Link
            href={`/story/${cluster.id}`}
            tabIndex={-1}
            aria-hidden="true"
            className="hidden w-24 shrink-0 sm:block"
          >
            <StoryImage
              src={cluster.imageUrl}
              alt=""
              category={cluster.category}
              className="aspect-square"
            />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="flex h-full flex-col">
      <Link
        href={`/story/${cluster.id}`}
        className="block"
        tabIndex={-1}
        aria-hidden="true"
      >
        <StoryImage
          src={cluster.imageUrl}
          alt=""
          category={cluster.category}
          className="aspect-[16/10]"
        />
      </Link>
      <div className="flex flex-1 flex-col pt-4">
        <Kicker cluster={cluster} />
        <h3
          className="headline headline-card mt-3 text-ink"
          lang={cluster.language}
        >
          <Link
            href={`/story/${cluster.id}`}
            className="story-link story-title inline-block min-h-11"
          >
            {cluster.title}
          </Link>
        </h3>
        {cluster.summary ? (
          <p
            className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-muted"
            lang={cluster.language}
          >
            {cluster.summary}
          </p>
        ) : null}
        <div className="mt-auto">
          <StoryMeta cluster={cluster} />
        </div>
      </div>
    </article>
  );
}
