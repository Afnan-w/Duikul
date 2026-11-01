import { Scale } from "lucide-react";
import { TrustPage, trustMetadata } from "@/components/trust/TrustPage";
import { INGEST_CONFIG } from "@/config/ingest";
import { SOURCES } from "@/config/sources";
import { SITE_NAME, SITE_NAME_BN, type SiteLocale } from "@/config/site";

export const metadata = trustMetadata({
  path: "/editorial-policy",
  title: "সম্পাদকীয় নীতি",
  titleEn: "Editorial policy",
  description: `${SITE_NAME} কী প্রকাশ করে, কীভাবে উৎস বাছাই হয়, কোনো অর্থ লেনদেন নেই কি নেই, এবং স্বয়ংক্রিয় সংকলনের সীমা কী — স্পষ্টভাবে লেখা।`,
});

export default function EditorialPolicyPage({
  locale,
}: {
  locale?: SiteLocale;
}) {
  return (
    <TrustPage
      locale={locale}
      path="/editorial-policy"
      eyebrow={{
        icon: <Scale size={14} strokeWidth={1.8} aria-hidden="true" />,
        bn: "সম্পাদকীয় নীতি",
        en: "Editorial policy",
      }}
      headline={{
        bn: "আমরা যা প্রকাশ করি, যা করি না",
        en: "What we publish, and what we never will",
      }}
      intro={{
        bn: `${SITE_NAME_BN} একটি সংযোজন সাইট: আমরা প্রকাশকদের শিরোনাম ও সংক্ষিপ্ত অংশ দেখাই, মূল লিংক দিই। আমরা সাংবাদিকতা তৈরি করি না — তাই নীতিগুলো সরল ও সীমিত।`,
        en: `${SITE_NAME} is an aggregation service: we show publisher headlines and short excerpts with links to the original. We do not produce journalism — so our policies are simple and narrow.`,
      }}
      sections={[
        {
          heading: { bn: "যা প্রকাশ হয়", en: "What appears" },
          rules: [
            {
              bn: `শিরোনাম, প্রকাশকের নাম, প্রকাশকাল, এবং সর্বোচ্চ ${INGEST_CONFIG.maxSummaryChars} অক্ষরের সংক্ষিপ্ত অংশ — ফিড থেকে যা প্রকাশক নিজেই দিয়েছেন।`,
              en: `Headline, publisher name, publication time, and an excerpt of at most ${INGEST_CONFIG.maxSummaryChars} characters — exactly what the publisher offers in its own feed.`,
            },
            {
              bn: "প্রতিটি প্রতিবেদনে মূল প্রকাশকের ওয়েবসাইটে যাওয়ার সরাসরি লিংক থাকে।",
              en: "Every item links directly to the publisher's own website.",
            },
            {
              bn: `একাধিক প্রতিবেদন থাকলে সেগুলো একই ঘটনার ক্লাস্টার হিসেবে দেখানো হয়, প্রতিটি শিরোনাম আলাদাভাবে উদ্ধৃত হয়।`,
              en: `When several reports cover one event, they are grouped as a cluster and each headline is quoted separately.`,
            },
          ],
        },
        {
          heading: { bn: "যা কখনও হবে না", en: "What will never happen" },
          rules: [
            {
              bn: "সাংবাদিকতার পরিবর্তে নিজের ভাষায় লেখা কোনো ‘রিপোর্ট’ বা সারাংশ দেখানো হবে না।",
              en: "No rewritten “report” or summary in our own words ever replaces the journalism.",
            },
            {
              bn: "বিজ্ঞাপন, স্পনসরশিপ বা অর্থ দিয়ে কোনো খবর এগিয়ে বা পিছিয়ে দেওয়া হবে না। বর্তমানে সাইটে কোনো বিজ্ঞাপন নেই।",
              en: "Advertising, sponsorship, or payment never boosts or buries a story. There is no advertising on the site today.",
            },
            {
              bn: "কোনো রাজনৈতিক দল, প্রতিষ্ঠান বা ব্যক্তির পক্ষে প্রকাশনা বা মতামত থাকবে না।",
              en: "No publishing or opinion in favour of any party, institution, or individual.",
            },
            {
              bn: "নির্বাচন, বিচার বা তদন্তমূলক বিষয়ে নিজস্ব অভিযোগ বা দাবি করা হবে না।",
              en: "We make no claims of our own about elections, courts, or investigations.",
            },
          ],
        },
        {
          heading: { bn: "উৎস বাছাই", en: "Choosing sources" },
          body: [
            {
              bn: `কেবল তারা প্রকাশকই তালিকাভুক্ত হন যাদের আগে থেকেই অফিসিয়াল ফিড আছে এবং যাদের সম্পাদকীয় যাচাইযোগ্য ইতিহাস রয়েছে — বর্তমানে ${SOURCES.length}টি প্রকাশক। নতুন প্রকাশক যোগ হলে প্রকাশক প্রোফাইল ও ট্রাস্ট ওজন প্রকাশ করা হয়।`,
              en: `Only publishers with a verifiable track record and an official feed are whitelisted — ${SOURCES.length} today. Any new publisher gets a public profile and a published trust weight.`,
            },
            {
              bn: "প্রতিটি উৎসের ওজন প্রকাশিত ও যুক্তিসহ; প্রোফাইল পাতায় দেখা যায়।",
              en: "Every weight is published with its reasoning, visible on each publisher profile.",
            },
          ],
        },
        {
          heading: { bn: "স্বয়ংক্রিয়তার ঘোষণা", en: "Automation disclosure" },
          body: [
            {
              bn: "বিষয়বস্তু সাজানো, ক্লাস্টার করা ও ‘নিশ্চিত’ চিহ্ন দেওয়া সম্পূর্ণ স্বয়ংক্রিয়। মানুষের হস্তক্ষেপ ঘটলে (যেমন সংশোধনী) সেটি সংশোধনী পাতায় নথিভুক্ত হয়।",
              en: "Grouping, ranking, and the confirmed label are fully automatic. When a human intervenes — such as a correction — it is documented on the corrections page.",
            },
            {
              bn: "কোনো লেখা জেনারেটিভ এআই দিয়ে তৈরি বা রিরাইট করা হয় না; সংক্ষিপ্ত অংশ ফিডের আক্ষরিক অংশ।",
              en: "No text on this site is generated or paraphrased by AI; excerpts are verbatim from the feed.",
            },
          ],
        },
        {
          heading: { bn: "দায় ও সীমা", en: "Responsibility and limits" },
          body: [
            {
              bn: "খবরের সত্যতা বা ভুলের জন্য দায়ী প্রকাশক; আমরা কেবল যা প্রকাশক নিজে প্রকাশ করেছেন তা দেখাই। ত্রুটি জানাতে সংশোধনী পাতা দেখুন।",
              en: "Accuracy is the publisher's responsibility; we only display what they published. To report an error, see the corrections page.",
            },
          ],
        },
      ]}
      sideLinks={[
        { href: "/corrections", bn: "সংশোধনী নীতি", en: "Corrections" },
        { href: "/removal-request", bn: "অপসারণের অনুরোধ", en: "Removal request" },
      ]}
    />
  );
}
