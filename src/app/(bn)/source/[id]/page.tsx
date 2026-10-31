import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  Languages,
  ShieldCheck,
} from "lucide-react";
import { SectionGlyph } from "@/components/brand/SectionGlyph";
import { StoryCard } from "@/components/story/StoryCard";
import { Bi } from "@/components/ui/Bi";
import { sectionFor } from "@/config/sections";
import {
  getSource,
  getSourceProfile,
  SOURCES,
  type NewsSource,
} from "@/config/sources";
import { SITE_NAME } from "@/config/site";
import { listClustersBySource } from "@/lib/data/clusters";
import { toBanglaDigits } from "@/lib/utils/date";
import { truncateSnippet } from "@/lib/utils/text";

export const revalidate = 300;

type SourcePageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return SOURCES.map((source) => ({ id: source.id }));
}

export async function generateMetadata({
  params,
}: SourcePageProps): Promise<Metadata> {
  const { id } = await params;
  const source = getSource(id);
  const profile = getSourceProfile(id);

  if (!source || !profile) {
    return { title: "সূত্র পাওয়া যায়নি", robots: { index: false, follow: false } };
  }

  const description = truncateSnippet(profile.en, 155);
  const canonical = `/source/${source.id}`;

  return {
    title: source.name,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: `${source.name} | ${SITE_NAME}`,
      description,
      url: canonical,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `${source.name} | ${SITE_NAME}`,
      description,
    },
  };
}

function trustExplanation(source: NewsSource): { bn: string; en: string } {
  if (source.trustWeight >= 5) {
    return {
      bn: "৫/৫ — একটি প্রতিষ্ঠিত প্রধান প্রকাশনা। সূত্র মেলানোর স্কোরে এটি শক্তিশালী সংকেত, তবে সত্যের চূড়ান্ত রায় নয়।",
      en: "5/5 — a major established outlet. A strong signal in source-agreement scoring, not a final truth rating.",
    };
  }

  if (source.trustWeight === 4) {
    return {
      bn: "৪/৫ — নিয়মিত সংবাদ প্রকাশ করে এমন একটি প্রতিষ্ঠিত প্রকাশনা। সূত্র মেলানোর স্কোরে শক্তিশালী সংকেত।",
      en: "4/5 — an established outlet with regular newsroom output. A strong signal in source-agreement scoring.",
    };
  }

  return {
    bn: "৩/৫ — তুলনামূলক ছোট বা নতুন প্রকাশনা। এটি কর্রবোরেশন হিসেবে গণ্য হয়, একা ‘নিশ্চিত’ করার জন্য যথেষ্ট নয়।",
    en: "3/5 — a smaller or newer outlet. Used as corroboration, not enough on its own to confirm a story.",
  };
}

export default async function SourcePage({ params }: SourcePageProps) {
  const { id } = await params;
  const source = getSource(id);
  const profile = getSourceProfile(id);

  if (!source || !profile) notFound();

  const section = sectionFor(source.category);
  const recent = await listClustersBySource(source.id, 12);
  const trust = trustExplanation(source);

  return (
    <div className="container-editorial">
      <nav
        aria-label="Breadcrumb"
        className="mt-5 flex flex-wrap items-center gap-2 font-ui text-[12px] text-muted"
      >
        <Link href="/" className="inline-flex min-h-11 items-center hover:text-ink">
          <Bi bn="প্রথম পাতা" en="Home" />
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href={section.href}
          className="inline-flex min-h-11 items-center gap-1.5 hover:text-ink"
        >
          <SectionGlyph section={source.category} className="h-3.5 w-3.5" />
          <Bi bn={section.labelBn} en={section.labelEn} />
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink/80">
          <Bi bn={source.nameBn} en={source.name} />
        </span>
      </nav>

      <header className="mt-4 border-b border-rule pb-8 pt-2 sm:pb-10">
        <p className="ui-label flex items-center gap-2 text-accent">
          <ShieldCheck size={14} strokeWidth={1.8} aria-hidden="true" />
          <Bi bn="প্রকাশক প্রোফাইল" en="Publisher profile" />
        </p>
        <h1 className="headline mt-3 text-[38px] leading-[1.15] text-ink sm:text-[50px]">
          <Bi bn={source.nameBn} en={source.name} />
        </h1>
        <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted">
          <Bi bn={profile.bn} en={profile.en} />
        </p>
      </header>

      <div className="grid gap-10 py-10 lg:grid-cols-12 lg:gap-14">
        <section aria-labelledby="source-facts" className="lg:col-span-7">
          <h2 id="source-facts" className="headline text-[24px] text-ink">
            <Bi bn="প্রকাশক সম্পর্কে" en="About this publisher" />
          </h2>
          <dl className="mt-5 divide-y divide-rule border-y border-rule">
            <div className="grid grid-cols-[8rem_1fr] gap-4 py-3">
              <dt className="meta">
                <Bi bn="ভাষা" en="Language" />
              </dt>
              <dd className="text-[15px] text-ink/85">
                {source.language === "bn" ? (
                  <Bi bn="বাংলা" en="Bangla" />
                ) : (
                  <Bi bn="ইংরেজি" en="English" />
                )}
              </dd>
            </div>
            <div className="grid grid-cols-[8rem_1fr] gap-4 py-3">
              <dt className="meta">
                <Bi bn="বিভাগ" en="Section" />
              </dt>
              <dd className="text-[15px] text-ink/85">
                <Link
                  href={section.href}
                  className="inline-flex min-h-11 items-center gap-1.5 text-accent underline decoration-accent/35 underline-offset-4"
                >
                  <SectionGlyph section={source.category} className="h-3.5 w-3.5" />
                  <Bi bn={section.labelBn} en={section.labelEn} />
                </Link>
              </dd>
            </div>
            <div className="grid grid-cols-[8rem_1fr] gap-4 py-3">
              <dt className="meta">
                <Bi bn="ওয়েবসাইট" en="Website" />
              </dt>
              <dd className="text-[15px]">
                <a
                  href={source.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 break-all text-accent underline decoration-accent/35 underline-offset-4"
                >
                  {source.siteUrl.replace(/^https?:\/\//, "")}
                  <ExternalLink size={13} strokeWidth={1.7} aria-hidden="true" />
                </a>
              </dd>
            </div>
          </dl>

          <h2 className="headline mt-9 text-[24px] text-ink">
            <Bi bn="ট্রাস্ট ওয়েট কী" en="What the trust weight means" />
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink/85">
            <Bi
              bn="ট্রাস্ট ওয়েট হলো আমাদের সূত্র-মিলনের হিসাবের একটি ইনপুট। এটি প্রকাশকের সাংবাদিকতার মান, নির্ভুলতা বা রাজনৈতিক অবস্থান সম্পর্কে চূড়ান্ত রায় নয়।"
              en="Trust weight is one input to our source-agreement calculation. It is not a final judgement about a publisher's journalism, accuracy, or political position."
            />
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            <Bi bn={trust.bn} en={trust.en} />
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            <Bi
              bn={`আমরা এই প্রকাশকের ${toBanglaDigits(source.trustWeight)}/৫ ওয়েট ব্যবহার করি শুধু একই ঘটনা নিয়ে কতজন স্বাধীন সূত্র বলেছে তা হিসাব করতে।`}
              en={`We use this publisher's ${source.trustWeight}/5 weight only to calculate how many independent sources carried the same event.`}
            />
          </p>

          <Link
            href="/about"
            className="mt-5 inline-flex min-h-11 items-center gap-1.5 font-ui text-[13px] font-medium text-accent underline decoration-accent/35 underline-offset-4"
          >
            <Bi bn="সম্পূর্ণ পদ্ধতি পড়ুন" en="Read the full methodology" />
            <ArrowUpRight size={14} strokeWidth={1.7} aria-hidden="true" />
          </Link>
        </section>

        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="border-t-2 border-accent bg-surface/50 p-5">
            <p className="ui-label flex items-center gap-2 text-accent">
              <Languages size={14} strokeWidth={1.8} aria-hidden="true" />
              <Bi bn="ভাষা ও বিভাগ" en="Language and section" />
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-muted">
              <Bi
                bn={`${source.nameBn} মূলত ${source.language === "bn" ? "বাংলা" : "ইংরেজি"} ভাষায় প্রকাশিত হয় এবং ${section.labelBn} বিভাগে তালিকাভুক্ত।`}
                en={`${source.name} publishes primarily in ${source.language === "bn" ? "Bangla" : "English"} and is listed in the ${section.labelEn} section.`}
              />
            </p>
            <a
              href={source.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-full bg-accent px-4 font-ui text-[13px] font-semibold text-accent-contrast transition-opacity hover:opacity-90"
            >
              <Bi bn="প্রকাশকের সাইটে যান" en="Visit the publisher" />
              <ExternalLink size={14} strokeWidth={1.8} aria-hidden="true" />
            </a>
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

      <section className="border-t border-rule py-10">
        <div className="flex items-end justify-between gap-4 border-b-2 border-ink/75 pb-3">
          <h2 className="headline text-[24px] text-ink">
            <Bi
              bn="এই প্রকাশকের সাম্প্রতিক ক্লাস্টার"
              en="Recent clustered stories from this publisher"
            />
          </h2>
          <span className="meta">
            <Bi
              bn={`${toBanglaDigits(recent.length)}টি`}
              en={`${recent.length}`}
            />
          </span>
        </div>

        {recent.length > 0 ? (
          <div className="mt-7 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((cluster) => (
              <StoryCard key={cluster.id} cluster={cluster} />
            ))}
          </div>
        ) : (
          <p className="mt-5 max-w-[60ch] text-[15px] leading-relaxed text-muted">
            <Bi
              bn="এই মুহূর্তে এই প্রকাশকের কোনো সাম্প্রতিক ক্লাস্টার সংস্করণে নেই। পুরনো প্রতিবেদন প্রকাশকের নিজের সাইটে পাওয়া যাবে।"
              en="No recent clustered stories from this publisher are in the current edition. Older reporting is available on the publisher's own site."
            />
          </p>
        )}
      </section>
    </div>
  );
}
