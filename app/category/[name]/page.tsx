import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { ListingPage } from "@/components/listing";
import { getStories } from "@/lib/news";
import { breadcrumbJsonLd, collectionJsonLd, pageMeta } from "@/lib/seo";
import { categories } from "@/lib/site";

type Props = { params: Promise<{ name: string }> };

export const revalidate = 600;

/** Per-category SEO copy - human-written (not templated), so every
    category page has a unique, keyword-rich title + description. */
const CATEGORY_SEO: Record<string, { title: string; description: string }> = {
  politics: {
    title: "রাজনীতি সংবাদ — সর্বশেষ রাজনীতির খবর | Politics News",
    description:
      "রাজনীতির সর্বশেষ ও সবচেয়ে আলোচিত খবর — বিশ্বস্ত সংবাদমাধ্যম থেকে সংগৃহীত, একই ঘটনা এক পাতায়, সূত্রসংখ্যাসহ। প্রতি ১০ মিনিটে আপডেট, দুইকূলে এখনই দেখুন।",
  },
  business: {
    title: "বাণিজ্য সংবাদ — অর্থনীতি, বাজার, রিমিট্যান্স | Economy News",
    description:
      "অর্থনীতি ও বাণিজ্যের খবর: বাজার, শেয়ার, রপ্তানি-আমদানি, রিমিট্যান্স — বিশ্বস্ত সূত্র থেকে সংগৃহীত, সূত্রসংখ্যাসহ এক জায়গায়। দুইকূলে এখনই দেখুন।",
  },
  sports: {
    title: "খেলাধুলা সংবাদ — ক্রিকেট, ফুটবল | Sports News",
    description:
      "খেলাধুলার সর্বশেষ খবর: ক্রিকেট, ফুটবল ও আরও সব খেলা — বিশ্বস্ত সংবাদমাধ্যম থেকে সংগৃহীত, একই ম্যাচ/ঘটনা এক পাতায়, সূত্রসংখ্যাসহ। এখনই দেখুন।",
  },
  technology: {
    title: "প্রযুক্তি সংবাদ — AI, গ্যাজেট, ইন্টারনেট | Tech News",
    description:
      "প্রযুক্তির খবর: AI, স্মার্টফোন, স্টার্টআপ, মহাকাশ — বিশ্বস্ত সংবাদমাধ্যম থেকে সংগৃহীত টেক নিউজ এক জায়গায়, সূত্রসংখ্যাসহ। প্রতি ১০ মিনিটে ফ্রেশ।",
  },
  entertainment: {
    title: "বিনোদন সংবাদ — চলচ্চিত্র, সঙ্গীত | Entertainment News",
    description:
      "বিনোদনের খবর: চলচ্চিত্র, সঙ্গীত, তারকাদের সংবাদ — বিশ্বস্ত সংবাদমাধ্যম থেকে সংগৃহীত, একই ঘটনা এক পাতায়, সূত্রসংখ্যাসহ। দুইকূলে এখনই দেখুন।",
  },
  health: {
    title: "স্বাস্থ্য সংবাদ — রোগ, চিকিৎসা, ডেঙ্গু | Health News",
    description:
      "স্বাস্থ্যের খবর: রোগ, চিকিৎসা, টিকা, ডেঙ্গু সংক্রমণ — বিশ্বস্ত সংবাদমাধ্যম থেকে সংগৃহীত, এক জায়গায়, সূত্রসংখ্যাসহ। প্রতি ১০ মিনিটে আপডেট।",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const match = categories.find((item) => item.slug === name);
  // Unknown categories have no page content - keep them unindexable.
  if (!match) {
    return {
      title: "বিভাগ পাওয়া যায়নি | Duikul",
      robots: { index: false, follow: false },
    };
  }

  const seo = CATEGORY_SEO[name];

  return pageMeta({
    path: `/category/${name}`,
    kicker: `বিভাগ: ${match.bn}`,
    ogTitle: `${match.bn} সংবাদ — শীর্ষ খবর`,
    title: seo ? seo.title : `${match.bn} সংবাদ | ${match.en} News`,
    description: seo
      ? seo.description
      : `${match.bn} বিষয়ে সর্বশেষ ও সবচেয়ে আলোচিত সংবাদ — বিশ্বস্ত সংবাদমাধ্যম থেকে সংগৃহীত, সূত্রসংখ্যাসহ। দুইকূলে ${match.en} নিউজ দেখুন।`,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { name } = await params;
  const match = categories.find((item) => item.slug === name);
  if (!match) notFound();

  const stories = await getStories({ category: name, limit: 50 });

  // Localised heading in both languages (slug fallback never triggers
  // for known slugs, but stays safe for deep links).
  const heading = match ? { bn: match.bn, en: match.en } : { bn: name, en: name };

  return (
    <>
      <JsonLd
        data={[
          collectionJsonLd(`${match.bn} — বিভাগের সংবাদ`, `/category/${name}`, stories),
          breadcrumbJsonLd([
            { name: "দুইকূল", path: "/" },
            { name: "সব বিভাগ", path: "/categories" },
            { name: match.bn, path: `/category/${name}` },
          ]),
        ]}
      />
      <ListingPage
        heading={heading}
        headingAs="h1"
        intro={{
          bn: `${match.bn} বিষয়ে সর্বশেষ ও সবচেয়ে আলোচিত সংবাদ — বিশ্বস্ত সংবাদমাধ্যম থেকে সংগৃহীত, একই ঘটনা একত্রে, সূত্রসংখ্যাসহ। দেশি ও বিদেশি দুই ভাগের ${match.bn} নিউজ এক জায়গায়।`,
          en: `The latest ${match.en} news, gathered from trusted Bangladesh and world outlets — grouped by event with a badge showing how many sources report it.`,
        }}
        relatedLinks={[
          { href: "/deshi", bn: "দেশি সংবাদ", en: "Deshi news" },
          { href: "/bideshi", bn: "বিদেশি সংবাদ", en: "Bideshi news" },
          { href: "/categories", bn: "সব বিভাগ", en: "All categories" },
        ]}
        stories={stories}
      />
    </>
  );
}
