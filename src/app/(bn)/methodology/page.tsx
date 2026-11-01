import { BookOpen } from "lucide-react";
import { TrustPage, trustMetadata } from "@/components/trust/TrustPage";
import { INGEST_CONFIG } from "@/config/ingest";
import { SOURCES } from "@/config/sources";
import { SITE_NAME, SITE_NAME_BN, type SiteLocale } from "@/config/site";

export const metadata = trustMetadata({
  path: "/methodology",
  title: "পদ্ধতি",
  titleEn: "Methodology",
  description: `${SITE_NAME} কীভাবে খবর সংগ্রহ করে, একই ঘটনার প্রতিবেদন একত্র করে, ‘নিশ্চিত’ চিহ্ন দেয় এবং ১৪ দিন পর সরিয়ে দেয় — প্রতিটি ধাপের সংখ্যা সহ।`,
});

export default function MethodologyPage({ locale }: { locale?: SiteLocale }) {
  return (
    <TrustPage
      locale={locale}
      path="/methodology"
      eyebrow={{ icon: <BookOpen size={14} strokeWidth={1.8} aria-hidden="true" />, bn: "পদ্ধতি", en: "Methodology" }}
      headline={{
        bn: "কীভাবে দুইকুল সংবাদ সাজায়",
        en: "How Duikul assembles the news",
      }}
      intro={{
        bn: `${SITE_NAME_BN} একটি স্বয়ংক্রিয় সংকলন। নিচের প্রতিটি সংখ্যা কোডের ভেতরের সেটিং, মেছতা কোনো দাবি নয়। নীতিগত সিদ্ধান্ত আলাদা পাতায়: সম্পাদকীয় নীতি ও সংশোধনী নীতি।`,
        en: `${SITE_NAME} is an automated aggregator. Every number below is a setting in our code, not a marketing claim. Editorial decisions live on separate pages: editorial policy and corrections.`,
      }}
      sections={[
        {
          heading: { bn: "সংগ্রহ", en: "Gathering" },
          body: [
            {
              bn: `প্রতি ঘণ্টায় একটি স্বয়ংক্রিয় প্রক্রিয়া ${SOURCES.length}টি অনুমোদিত প্রকাশকের অফিসিয়াল ফিড (RSS) পড়ে। কোনো ফেসবুক পোস্ট, টুইট, বা অজ্ঞাত ব্লগ নেওয়া হয় না।`,
              en: `Every hour, an automated job reads the official RSS feeds of ${SOURCES.length} whitelisted publishers. We never ingest Facebook posts, tweets, or anonymous blogs.`,
            },
            {
              bn: `কোনো ফিডের প্রতিটি লিংক একটি সার্ভারে সংরক্ষিত হয়; প্রতিটি রিপোর্টের প্রকাশক ও প্রকাশকাল স্পষ্ট থাকে।`,
              en: `Every link fetched from a feed is stored on our servers with its publisher and publication time intact.`,
            },
          ],
        },
        {
          heading: { bn: "একই ঘটনা চেনা", en: "Recognising the same event" },
          body: [
            {
              bn: `শিরোনামের ভাষা-স্বাধীন শব্দ ও ট্রাইগ্রাম মিলিয়ে দেখা হয়, কোন প্রতিবেদনগুলো একই ঘটনার। মিল স্কোর ${INGEST_CONFIG.clusterThreshold} বা তার বেশি হলে একই ক্লাস্টার; দীর্ঘ শিরোনামে অন্তত ${INGEST_CONFIG.clusterLooseSharedTokens}টি গুরুত্বপূর্ণ শব্দ মিললে আরেকটি শিথিল ধাপ চলে।`,
              en: `Headlines are compared with language-independent word and trigram overlap. A combined score of ${INGEST_CONFIG.clusterThreshold} or more groups reports into one cluster; a looser pass groups long headlines that share at least ${INGEST_CONFIG.clusterLooseSharedTokens} significant words.`,
            },
            {
              bn: `এটি পারদর্শী হিউরিস্টিক, কোনো লুকানো এআই মডেল নয় — তাই ভুল হতে পারে, এবং ভুল হলে সংশোধনী পাতায় জানানো হয়।`,
              en: `These are transparent heuristics, not a hidden AI model — they can be wrong, and mistakes are logged on the corrections page.`,
            },
          ],
        },
        {
          heading: { bn: "‘নিশ্চিত’ চিহ্ন", en: "The “confirmed” label" },
          body: [
            {
              bn: `একটি ক্লাস্টার ‘নিশ্চিত’ হয় যখন — অন্তত ${INGEST_CONFIG.confirmedMinSources}টি স্বাধীন প্রকাশক রিপোর্ট করে, অথবা অন্তত ${INGEST_CONFIG.confirmedHighTrustSources}টি উচ্চ-নির্ভরযোগ্য প্রকাশক রিপোর্ট করে যাদের ট্রাস্ট ওজনের যোগফল কমপক্ষে ${INGEST_CONFIG.confirmedHighTrustSum}।`,
              en: `A cluster is marked confirmed when either at least ${INGEST_CONFIG.confirmedMinSources} independent publishers report it, or at least ${INGEST_CONFIG.confirmedHighTrustSources} high-trust publishers report it with a combined trust weight of ${INGEST_CONFIG.confirmedHighTrustSum} or more.`,
            },
            {
              bn: "‘নিশ্চিত’ মানে একাধিক নির্ভরযোগ্য প্রকাশক একই ঘটনা বলছে — এটি স্বাধীন সত্যায়ন নয়, আমরা ঘটনাস্থলে যাই না।",
              en: "“Confirmed” means several trusted outlets report the same event. It is not independent verification — we do not visit scenes or interview anyone.",
            },
          ],
        },
        {
          heading: { bn: "একক উৎসের খবর", en: "Single-source stories" },
          body: [
            {
              bn: `একাধিক প্রকাশক না থাকলে খবরটি দেখানো হয়, যদি তার ট্রাস্ট ওজন কমপক্ষে ${INGEST_CONFIG.visibleSingleSourceTrust} হয় এবং প্রকাশক পৃষ্ঠায় স্পষ্ট লেখা থাকে ‘একাধিক সূত্রে নিশ্চিত নয়’।`,
              en: `Single-publisher stories appear only when the publisher's trust weight is at least ${INGEST_CONFIG.visibleSingleSourceTrust}, and the page states clearly that they are not confirmed across sources.`,
            },
            {
              bn: "নির্ভরযোগ্যতার ওজন বাংলাদেশের প্রতিষ্ঠিত প্রকাশকদের পক্ষে সামান্য বেশি; পুরো তালিকা ও যুক্তি প্রকাশক প্রোফাইল পাতায় পাওয়া যায়।",
              en: "Trust weights lean slightly toward established Banglish-language outlets in Bangladesh; the full list and reasoning appear on each publisher profile.",
            },
          ],
        },
        {
          heading: { bn: "মেয়াদ ও অপসারণ", en: "Retention and expiry" },
          body: [
            {
              bn: `প্রতিটি প্রতিবেদন ${INGEST_CONFIG.retentionDays} দিন পর সার্ভার থেকে মুছে যায় এবং স্টোরি লিংক 404 দেয়। খবর আর প্রকাশকের ওয়েবসাইটেই থাকে; আমরা শুধু সাময়িক সংকলন রাখি।`,
              en: `Every article is deleted from our servers after ${INGEST_CONFIG.retentionDays} days and its story link returns 404. The news itself stays on the publisher's site; we only keep a temporary index.`,
            },
          ],
        },
        {
          heading: { bn: "দৈনিক ব্রিফিং", en: "The daily briefing" },
          body: [
            {
              bn: `প্রতি দিন ঢাকা সময় অনুযায়ী (UTC+6) সেই দিনের সেরা প্রতিবেদনগুলো দিয়ে একটি ব্রিফিং তৈরি হয়। কমপক্ষে ৫টি ক্লাস্টার না থাকলে সেই দিনের ব্রিফিং সার্চ ইঞ্জিনে ইনডেক্স হয় না।`,
              en: `Each day (in Asia/Dhaka time, UTC+6) a briefing is compiled from the day's strongest reports. A day is only indexable when it holds at least 5 clusters.`,
            },
            {
              bn: "‘যেখানে মতভেদ’ অংশটি স্বয়ংক্রিয় হিউরিস্টিক: শিরোনামের সংখ্যা বা শব্দগুলো যথেষ্ট ভিন্ন হলে সেটি দেখানো হয়।",
              en: "The “where reports differ” block is an automatic heuristic: it appears when headline numbers or wording disagree enough.",
            },
          ],
        },
        {
          heading: { bn: "যা আমরা করি না", en: "What we never do" },
          rules: [
            {
              bn: "প্রকাশকের শিরোনাম বা লিংক সহ ২৮০ অক্ষরের বেশি সারাংশ কখনও দেখাই না।",
              en: "We never show more than a 280-character snippet of any publisher's text.",
            },
            {
              bn: "নিজের কথায় খবর লিখি না, শিরোনাম বদলাই না, ভুল তথ্য যোগ করি না।",
              en: "We never rewrite headlines, add facts, or present paraphrased reporting as ours.",
            },
            {
              bn: "কোনো প্রকাশকের পক্ষে সাশ্রয়ী বা বিরুদ্ধে পক্ষপাত করি না; ট্রাস্ট ওজন সবার জন্য একই নিয়মে প্রযোজ্য।",
              en: "We favour no publisher; the same trust-weight rules apply to everyone.",
            },
            {
              bn: "প্রকাশকের মালিকানাধীন সম্পূর্ণ লেখা কখনও সংরক্ষণ বা পুনর্প্রকাশ করি না।",
              en: "We never store or republish a publisher's full article text.",
            },
          ],
        },
      ]}
      sideLinks={[
        { href: "/editorial-policy", bn: "সম্পাদকীয় নীতি", en: "Editorial policy" },
        { href: "/source/the-daily-star", bn: "প্রকাশক প্রোফাইলের উদাহরণ", en: "Example publisher profile" },
        { href: `/contact?subject=methodology`, bn: "পদ্ধতি নিয়ে প্রশ্ন", en: "Ask about methodology", },
      ]}
    />
  );
}
