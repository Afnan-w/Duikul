import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Clock,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { SectionGlyph } from "@/components/brand/SectionGlyph";
import { Bi } from "@/components/ui/Bi";
import { ConfirmationBadge } from "@/components/story/ConfirmationBadge";
import { CoverageTimeline } from "@/components/story/CoverageTimeline";
import { ShareMenu } from "@/components/story/ShareMenu";
import { StoryCard } from "@/components/story/StoryCard";
import { StoryImage } from "@/components/story/StoryImage";
import { sectionFor } from "@/config/sections";
import {
  getClusterDetail,
  listClusters,
  listRelatedClusters,
} from "@/lib/data/clusters";
import {
  formatDateTime,
  formatRelativeTime,
  toBanglaDigits,
} from "@/lib/utils/date";
import { isUuid } from "@/lib/utils/uuid";
import { truncateSnippet } from "@/lib/utils/text";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { storyJsonLd } from "@/lib/seo/jsonld";
import { SITE_NAME, SITE_URL } from "@/config/site";

export const revalidate = 300;

type StoryPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const [deshi, bideshi] = await Promise.all([
    listClusters({ category: "deshi", limit: 12 }),
    listClusters({ category: "bideshi", limit: 12 }),
  ]);

  return [...deshi, ...bideshi].map((cluster) => ({ id: cluster.id }));
}

export async function generateMetadata({
  params,
}: StoryPageProps): Promise<Metadata> {
  const { id } = await params;
  if (!isUuid(id)) {
    return { title: "খবর পাওয়া যায়নি", robots: { index: false, follow: false } };
  }

  const detail = await getClusterDetail(id);
  if (!detail) {
    return { title: "খবর পাওয়া যায়নি", robots: { index: false, follow: false } };
  }

  const { cluster } = detail;
  const section = sectionFor(cluster.category);
  const description =
    cluster.summary ||
    `${cluster.title} — ${cluster.primarySourceName}, ${section.labelEn}`;
  const canonical = `/story/${cluster.id}`;

  return {
    title: cluster.title,
    description,
    alternates: { canonical },
    robots: {
      index: cluster.isIndexable,
      follow: true,
      googleBot: {
        index: cluster.isIndexable,
        follow: true,
        "max-image-preview": "large",
      },
    },
    openGraph: {
      type: "article",
      title: cluster.title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: cluster.language === "bn" ? "bn_BD" : "en_US",
      publishedTime: cluster.firstPublishedAt.toISOString(),
      modifiedTime: cluster.lastPublishedAt.toISOString(),
      section: section.labelEn,
    },
    twitter: {
      card: "summary_large_image",
      title: cluster.title,
      description,
    },
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const detail = await getClusterDetail(id);
  if (!detail) notFound();

  const { cluster, sources } = detail;
  const section = sectionFor(cluster.category);
  const related = await listRelatedClusters(cluster.category, cluster.id, 3);
  const canonical = `${SITE_URL}/story/${cluster.id}`;

  // Duikul did not write this report, so no NewsArticle is claimed for the
  // site: the page is a WebPage listing the publishers' own articles.
  // Thin (noindex) stories carry no structured data at all, breadcrumb
  // included (the `structured` flag below).
  const structuredData = cluster.isIndexable
    ? [
        storyJsonLd({
          cluster,
          sources,
          canonical,
          sectionLabel: section.labelEn,
        }),
      ]
    : null;

  return (
    <div className="container-editorial">
      {structuredData ? <JsonLd data={structuredData} /> : null}

      <Breadcrumbs
        locale={cluster.language}
        structured={cluster.isIndexable}
        items={[
          { bn: "প্রথম পাতা", en: "Home", path: "/" },
          {
            bn: section.labelBn,
            en: section.labelEn,
            path: section.href,
            icon: (
              <SectionGlyph section={cluster.category} className="h-3.5 w-3.5" />
            ),
          },
          {
            bn: cluster.title,
            en: cluster.title,
            path: canonical,
            current: true,
            node: cluster.title,
            title: cluster.title,
            className: "max-w-[52ch] truncate text-ink/80",
          },
        ]}
      />

      <article className="pb-4 pt-2">
        <header className="max-w-[78ch]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip border border-accent/20 bg-accent-soft text-accent">
                <SectionGlyph section={cluster.category} className="h-3 w-3" />
                <Bi bn={section.labelBn} en={section.labelEn} />
              </span>
              <ConfirmationBadge
                sourceCount={cluster.distinctSourceCount}
                confirmed={cluster.isConfirmed}
              />
            </div>
            <ShareMenu
              url={canonical}
              title={cluster.title}
              squareImageUrl={`/story/${cluster.id}/square`}
            />
          </div>

          <h1
            className="headline mt-5 text-[34px] leading-[1.2] text-ink sm:text-[46px] sm:leading-[1.12]"
            lang={cluster.language}
          >
            {cluster.title}
          </h1>

          {cluster.summary ? (
            <p
              className="body-copy mt-5 max-w-[68ch] text-[19px] leading-[1.7] text-ink/80 sm:text-[21px]"
              lang={cluster.language}
            >
              {cluster.summary}
            </p>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-rule pt-4">
            <p className="meta inline-flex items-center gap-1.5">
              <Clock size={13} strokeWidth={1.7} aria-hidden="true" />
              <Bi bn="প্রথম প্রকাশ" en="First reported" />{" "}
              <span className="text-ink/80">
                <span className="lang-bn" lang="bn">
                  {formatRelativeTime(cluster.firstPublishedAt, "bn")}
                </span>
                <span className="lang-en" lang="en">
                  {formatRelativeTime(cluster.firstPublishedAt, "en")}
                </span>
              </span>
            </p>
            <p className="meta">
              <Bi
                bn={`${toBanglaDigits(cluster.distinctSourceCount)}টি স্বাধীন সূত্র`}
                en={`${cluster.distinctSourceCount} independent ${
                  cluster.distinctSourceCount === 1 ? "source" : "sources"
                }`}
              />
            </p>
            <p className="meta">
              <Bi bn="শেষ হালনাগাদ" en="Last updated" />{" "}
              <span className="text-ink/80">
                <span className="lang-bn" lang="bn">
                  {formatRelativeTime(cluster.lastPublishedAt, "bn")}
                </span>
                <span className="lang-en" lang="en">
                  {formatRelativeTime(cluster.lastPublishedAt, "en")}
                </span>
              </span>
            </p>
          </div>
        </header>

        {cluster.imageUrl ? (
          <div className="mt-8">
            <StoryImage
              src={cluster.imageUrl}
              alt={cluster.title}
              category={cluster.category}
              className="aspect-[16/9] max-h-[560px]"
              priority
            />
            <p className="meta mt-2 text-right">
              <Bi bn="ছবি: মূল প্রতিবেদন" en="Image: original report" />
            </p>
          </div>
        ) : null}

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 lg:col-span-7">
            {cluster.editorNote ? (
              <aside className="mb-8 border-l-2 border-signal bg-surface/50 px-5 py-4">
                <p className="ui-label text-signal">
                  <Bi bn="সম্পাদকের নোট" en="Editor’s note" />
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/85">
                  {cluster.editorNote}
                </p>
              </aside>
            ) : null}

            <CoverageTimeline sources={sources} />

            <section aria-labelledby="sources-heading" className="mt-8">
              <div className="flex items-end justify-between gap-4 border-b-2 border-ink/75 pb-2">
                <h2
                  id="sources-heading"
                  className="headline text-[22px] text-ink"
                >
                  <Bi
                    bn="প্রকাশকরা কী শিরোনাম দিয়েছে"
                    en="How outlets headlined it"
                  />
                </h2>
                <span className="meta">
                  {sources.length > 0 ? (
                    <Bi
                      bn={`${toBanglaDigits(sources.length)}টি লিংক`}
                      en={`${sources.length} ${sources.length === 1 ? "link" : "links"}`}
                    />
                  ) : null}
                </span>
              </div>
              <p className="mt-3 max-w-[62ch] text-[14px] leading-relaxed text-muted">
                <Bi
                  bn="শিরোনাম ও সংক্ষিপ্ত সারমর্ম প্রতিটি প্রকাশকের নিজস্ব। সম্পূর্ণ প্রতিবেদন পড়তে মূল লিংকে যান।"
                  en="Each headline and short extract belongs to its publisher. Follow the original link for the full report."
                />
              </p>

              {sources.length > 0 ? (
                <ol className="mt-2">
                  {sources.map((source, index) => (
                    <li key={source.id} className="border-b border-rule">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group grid min-h-11 grid-cols-[auto_1fr_auto] gap-3 py-4"
                      >
                        <span className="pt-0.5 font-ui text-[11px] font-semibold tabular-nums text-accent">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>
                          <span className="ui-label block text-muted">
                            <span
                              lang={cluster.language}
                              className={
                                cluster.language === "bn"
                                  ? "font-bangla-ui"
                                  : undefined
                              }
                            >
                              {cluster.language === "bn"
                                ? source.sourceNameBn
                                : source.sourceName}
                            </span>
                            <span aria-hidden="true"> · </span>
                            <span className="normal-case tracking-normal">
                              <span className="lang-bn" lang="bn">
                                {formatDateTime(source.publishedAt, "bn")}
                              </span>
                              <span className="lang-en" lang="en">
                                {formatDateTime(source.publishedAt, "en")}
                              </span>
                            </span>
                          </span>
                          <span
                            className="mt-1 block text-[16px] font-medium leading-snug text-ink group-hover:text-accent group-hover:underline group-hover:decoration-accent/40 group-hover:underline-offset-4"
                            lang={cluster.language}
                          >
                            {source.title}
                          </span>
                          {source.summary ? (
                            <span
                              className="mt-1 block text-[14px] leading-relaxed text-muted"
                              lang={cluster.language}
                            >
                              {truncateSnippet(source.summary)}
                            </span>
                          ) : null}
                        </span>
                        <ExternalLink
                          size={15}
                          strokeWidth={1.6}
                          aria-hidden="true"
                          className="mt-1 text-muted group-hover:text-accent"
                        />
                      </a>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  <Bi
                    bn="এই প্রতিবেদনের সূত্রের তালিকা এখনো পাওয়া যায়নি। মূল প্রকাশকের সাইটে সরাসরি যান।"
                    en="The source list is not available yet. Use the link to the original publisher."
                  />
                </p>
              )}
            </section>

            <aside
              aria-labelledby="confirmation-heading"
              className="mt-8 border border-rule bg-surface/40 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2
                  id="confirmation-heading"
                  className="ui-label flex items-center gap-2 text-accent"
                >
                  <ShieldCheck size={14} strokeWidth={1.8} aria-hidden="true" />
                  <Bi
                    bn="নিশ্চিতকরণের অবস্থা"
                    en="Confirmation status"
                  />
                </h2>
                <ConfirmationBadge
                  sourceCount={cluster.distinctSourceCount}
                  confirmed={cluster.isConfirmed}
                />
              </div>
              <p className="mt-3 text-[14px] leading-relaxed text-muted">
                {cluster.isConfirmed ? (
                  <Bi
                    bn={`এই ঘটনা নিয়ে অন্তত ${toBanglaDigits(
                      cluster.distinctSourceCount,
                    )}টি স্বাধীন প্রকাশক প্রতিবেদন করেছে। ‘নিশ্চিত’ মানে আমরা একই ঘটনার একাধিক স্বতন্ত্র প্রতিবেদন পেয়েছি — এটি ঘটনার প্রতিটি দাবির স্বাধীন যাচাই নয়।`}
                    en={`At least ${cluster.distinctSourceCount} independent publishers have reported this event. “Confirmed” means we found separate reports of the same event; it is not independent verification of every claim.`}
                  />
                ) : (
                  <Bi
                    bn="এই ঘটনাটি এখনো একাধিক স্বাধীন প্রকাশকের প্রতিবেদনে নিশ্চিত হয়নি। আমরা শিরোনাম ও সংক্ষিপ্ত সারমর্ম দেখাচ্ছি, কিন্তু এটিকে ‘নিশ্চিত’ বলে দাবি করছি না।"
                    en="This event has not yet been confirmed by more than one independent publisher. We show the headline and a short extract without calling it confirmed."
                  />
                )}
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-muted">
                <Bi
                  bn="আমরা শিরোনাম ও সংক্ষিপ্ত সারমর্ম দেখাই, সম্পূর্ণ প্রতিবেদন নয়। মূল প্রতিবেদন পড়তে প্রকাশকের লিংকে যান।"
                  en="We show headlines and short extracts, never the full report. Follow the publisher’s link to read the original."
                />
              </p>
              <Link
                href="/about"
                className="mt-3 inline-flex min-h-11 items-center gap-1.5 font-ui text-[13px] font-medium text-accent underline decoration-accent/35 underline-offset-4"
              >
                <Bi bn="পদ্ধতি পড়ুন" en="Read the methodology" />
                <ArrowUpRight size={14} strokeWidth={1.7} aria-hidden="true" />
              </Link>
            </aside>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="sticky top-36 border-t-2 border-accent bg-surface/50 p-5">
              <p className="ui-label text-muted">
                <Bi bn="মূল প্রতিবেদন" en="Original report" />
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/85">
                <Bi
                  bn={`${cluster.primarySourceName}-এ প্রকাশিত সম্পূর্ণ প্রতিবেদনটি পড়ুন।`}
                  en={`Read the full report at ${cluster.primarySourceName}.`}
                />
              </p>
              <a
                href={cluster.primaryArticleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-full bg-accent px-4 font-ui text-[13px] font-semibold text-accent-contrast transition-opacity hover:opacity-90"
              >
                <Bi bn="সূত্রে যান" en="Open source" />
                <ExternalLink size={14} strokeWidth={1.8} aria-hidden="true" />
              </a>
              {cluster.primarySourceId ? (
                <Link
                  href={`/source/${cluster.primarySourceId}`}
                  className="mt-3 inline-flex min-h-11 items-center gap-1.5 font-ui text-[13px] font-medium text-accent underline decoration-accent/35 underline-offset-4"
                >
                  <Bi
                    bn="প্রকাশক প্রোফাইল"
                    en="Publisher profile"
                  />
                  <ArrowUpRight size={14} strokeWidth={1.7} aria-hidden="true" />
                </Link>
              ) : null}

              <dl className="mt-6 space-y-3 border-t border-rule pt-4 text-[13px]">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="meta">
                    <Bi bn="প্রথম প্রকাশ" en="First reported" />
                  </dt>
                  <dd className="text-right text-ink/80">
                    <span className="lang-bn" lang="bn">
                      {formatDateTime(cluster.firstPublishedAt, "bn")}
                    </span>
                    <span className="lang-en" lang="en">
                      {formatDateTime(cluster.firstPublishedAt, "en")}
                    </span>
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="meta">
                    <Bi bn="স্বাধীন সূত্র" en="Independent sources" />
                  </dt>
                  <dd className="font-ui font-semibold tabular-nums text-ink">
                    <Bi
                      bn={toBanglaDigits(cluster.distinctSourceCount)}
                      en={String(cluster.distinctSourceCount)}
                    />
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="meta">
                    <Bi bn="বিভাগ" en="Section" />
                  </dt>
                  <dd className="text-right">
                    <Link
                      href={section.href}
                      className="text-accent underline decoration-accent/35 underline-offset-4"
                    >
                      <Bi bn={section.labelBn} en={section.labelEn} />
                    </Link>
                  </dd>
                </div>
              </dl>
            </div>

            <Link
              href={section.href}
              className="mt-6 inline-flex min-h-11 items-center gap-2 font-ui text-[13px] font-medium text-muted hover:text-ink"
            >
              <ArrowLeft size={15} strokeWidth={1.7} aria-hidden="true" />
              <Bi
                bn={`${section.labelBn}-এ ফিরে যান`}
                en={`Back to ${section.labelEn}`}
              />
            </Link>
          </aside>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="border-t border-rule py-10">
          <div className="flex items-end justify-between gap-4 border-b-2 border-ink/75 pb-3">
            <h2 className="headline text-[24px] text-ink">
              <Bi bn="একই বিভাগে আরও" en="More in this section" />
            </h2>
            <Link
              href={section.href}
              className="inline-flex min-h-11 items-center gap-1.5 font-ui text-[12px] font-medium text-accent"
            >
              <Bi bn="সব দেখুন" en="See all" />
              <ArrowUpRight size={14} strokeWidth={1.7} aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-7 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <StoryCard key={item.id} cluster={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
