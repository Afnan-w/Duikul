import { ScrollText } from "lucide-react";
import { TrustPage, trustMetadata } from "@/components/trust/TrustPage";
import { INGEST_CONFIG } from "@/config/ingest";
import {
  CONTACT_EMAIL,
  PUBLISHER_NAME,
  SITE_NAME,
  SITE_NAME_BN,
} from "@/config/site";

export const metadata = trustMetadata({
  path: "/terms",
  title: "ব্যবহারের শর্তাবলি",
  titleEn: "Terms of use",
  description: `${SITE_NAME} ব্যবহারের শর্ত: সংকলিত শিরোনাম ও সংক্ষিপ্ত অংশের মালিকানা, বিজ্ঞাপনহীনতা, দায়মুক্তি এবং পরিবর্তনের নীতি।`,
});

const operatorConfigured =
  PUBLISHER_NAME !== "[PLACEHOLDER]" && PUBLISHER_NAME.trim().length > 0;

export default function TermsPage() {
  return (
    <TrustPage
      path="/terms"
      eyebrow={{
        icon: <ScrollText size={14} strokeWidth={1.8} aria-hidden="true" />,
        bn: "শর্তাবলি",
        en: "Terms of use",
      }}
      headline={{
        bn: "ব্যবহারের শর্তাবলি",
        en: "Terms of use",
      }}
      intro={{
        bn: `${SITE_NAME_BN} ব্যবহার করলেই আপনি এই শর্তাবলিতে সম্মত হন। কোনো অনুমতি ছাড়া সাইট ব্যবহার করতে চাইলে এখনই বন্ধ করে দিন।`,
        en: `By using ${SITE_NAME} you accept these terms. If you do not agree, stop using the site.`,
      }}
      sections={[
        {
          heading: { bn: "সেবার ধরন", en: "The service" },
          body: [
            {
              bn: `${SITE_NAME} একটি বিনামূল্যের, বিজ্ঞাপনহীন সংকলন সেবা। এটি ${INGEST_CONFIG.retentionDays} দিনের মধ্যে পুরোনো প্রতিবেদন সরিয়ে দেয়; স্থায়ী আর্কাইভ নয়।`,
              en: `${SITE_NAME} is a free, advertising-free aggregator. Articles older than ${INGEST_CONFIG.retentionDays} days are removed; this is not a permanent archive.`,
            },
            {
              bn: "সেবাটি ‘যেমন আছে তেমন’ প্রদান করা হয়; নিরবচ্ছিন্ন বা ত্রুটিহীন হবে এমন নিশ্চয়তা নেই।",
              en: "The service is provided “as is”, with no guarantee of uninterrupted or error-free operation.",
            },
          ],
        },
        {
          heading: { bn: "বিষয়বস্তুর মালিকানা", en: "Content ownership" },
          rules: [
            {
              bn: "প্রতিটি শিরোনাম, সংক্ষিপ্ত অংশ ও মূল লেখার মালিক সংশ্লিষ্ট প্রকাশক। আমরা কেবল প্রকাশকের নিজস্ব ফিডে প্রকাশিত বৈধ অংশ দেখাই।",
              en: "Each headline, excerpt, and article belongs to its publisher. We only display excerpts the publisher itself distributes in its official feed.",
            },
            {
              bn: `সংক্ষিপ্ত অংশ সর্বোচ্চ ${INGEST_CONFIG.maxSummaryChars} অক্ষরের এবং সবসময় মূল লিংকসহ — এটি নিষ্ঠুর ব্যবহার (fair use) নীতির সীমারেখা মেনে।`,
              en: `Excerpts never exceed ${INGEST_CONFIG.maxSummaryChars} characters and always carry the original link — within the limits of quotation and fair use.`,
            },
            {
              bn: `${SITE_NAME}-এর নিজের নাম, লোগো ও পাতার নকশা আমাদের; প্রকাশকদের নাম ও লোগো তাঁদের।`,
              en: `${SITE_NAME}'s own name, logo, and page design are ours; publisher names and logos remain theirs.`,
            },
          ],
        },
        {
          heading: { bn: "ব্যবহারের নিয়ম", en: "Acceptable use" },
          rules: [
            {
              bn: "স্ক্র্যাপিং, স্বয়ংক্রিয় ডাউনলোড বা পুনঃপ্রকাশ সীমাহীনভাবে করা যাবে না; প্রয়োজনে অনুরোধ করুন।",
              en: "Bulk scraping, automated downloading, or republication at scale is not allowed; ask us first.",
            },
            {
              bn: "সাইটের সুরক্ষা বা কার্যক্রম বাধাগ্রস্ত করার চেষ্টা নিষিদ্ধ।",
              en: "Attempts to disrupt or bypass the site's security or operation are prohibited.",
            },
          ],
        },
        {
          heading: { bn: "দায় সীমা", en: "Liability" },
          body: [
            {
              bn: "খবরের বিষয়ে সিদ্ধান্ত নেওয়ার আগে মূল প্রকাশকের ওয়েবসাইট দেখুন। সংকলিত তথ্য নিয়ে সিদ্ধান্তের ফলে ক্ষতির জন্য আমরা দায়ী নই, যতদূর আইন অনুমতি দেয়।",
              en: `Check the publisher's own site before acting on any information. To the extent the law allows, we are not liable for decisions made on aggregated content.`,
            },
          ],
        },
        {
          heading: { bn: "পরিবর্তন", en: "Changes" },
          body: [
            {
              bn: "শর্তাবলি বদলালে এই পাতায় সংশোধনীর তারিখসহ দেখা যাবে। অব্যাহত ব্যবহার মানে নতুন শর্তে সম্মতি।",
              en: "Changes appear on this page with a revision date. Continued use means acceptance of the new terms.",
            },
            {
              bn: `বর্তমান সংস্করণ: ২৯ অক্টোবর ২০২৬। প্রশ্ন: ${CONTACT_EMAIL}`,
              en: `Current version: 29 October 2026. Questions: ${CONTACT_EMAIL}`,
            },
          ],
        },
        {
          heading: { bn: "পরিচালক", en: "Operator" },
          body: [
            operatorConfigured
              ? {
                  bn: `এই সাইটের পরিচালক: ${PUBLISHER_NAME}। আইনি বিষয়ে যোগাযোগ: ${CONTACT_EMAIL}`,
                  en: `Site operator: ${PUBLISHER_NAME}. Legal contact: ${CONTACT_EMAIL}`,
                }
              : {
                  bn: "পরিচালকের আইনি নাম প্লেসহোল্ডার; লঞ্চের আগে এটি এখানে যুক্ত হবে।",
                  en: "The operator's legal name is a placeholder and will be published here before launch.",
                },
          ],
        },
      ]}
      sideLinks={[
        { href: "/privacy", bn: "গোপনীয়তা নীতি", en: "Privacy policy" },
        { href: "/editorial-policy", bn: "সম্পাদকীয় নীতি", en: "Editorial policy" },
        { href: "/contact", bn: "যোগাযোগ", en: "Contact" },
      ]}
    />
  );
}
