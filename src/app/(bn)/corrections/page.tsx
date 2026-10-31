import { ClipboardCheck } from "lucide-react";
import { TrustPage, trustMetadata } from "@/components/trust/TrustPage";
import { INGEST_CONFIG } from "@/config/ingest";
import { CONTACT_EMAIL, SITE_NAME } from "@/config/site";

export const metadata = trustMetadata({
  path: "/corrections",
  title: "সংশোধনী নীতি",
  titleEn: "Corrections",
  description: `ভুল খুঁজে পেলে কীভাবে জানাবেন, ${SITE_NAME} কীভাবে সংশোধন বা অপসারণ করে এবং কোন ক্ষেত্রে স্বয়ংক্রিয়ভাবেই খবর সরিয়ে যায়।`,
});

export default function CorrectionsPage() {
  return (
    <TrustPage
      path="/corrections"
      eyebrow={{
        icon: <ClipboardCheck size={14} strokeWidth={1.8} aria-hidden="true" />,
        bn: "সংশোধনী নীতি",
        en: "Corrections",
      }}
      headline={{
        bn: "ভুল দেখলে আমাদের জানান",
        en: "Tell us when something is wrong",
      }}
      intro={{
        bn: `স্বয়ংক্রিয় সংকলনে ভুল হতে পারে — ক্লাস্টার ভুল হওয়া, পুরোনো শিরোনাম থেকে যাওয়া, বা প্রকাশকের নিজের ভুল। জানাতে লিখুন: ${CONTACT_EMAIL}`,
        en: `Automated aggregation can go wrong — a mis-grouped cluster, a stale headline, or an error inherited from the publisher. Write to us at ${CONTACT_EMAIL}.`,
      }}
      sections={[
        {
          heading: { bn: "কী জানাবেন", en: "What to include" },
          rules: [
            {
              bn: "যে স্টোরি বা দৈনিক ব্রিফিংয়ের লিংক, এবং ঠিক কোন অংশ ভুল।",
              en: "The story or daily briefing link, and the exact part that is wrong.",
            },
            {
              bn: "সংশোধিত তথ্যের সঠিক মান ও তার প্রকাশকের লিংক (যদি থাকে)।",
              en: "The corrected fact with a link to the publisher's own page, if available.",
            },
            {
              bn: "আপনার নাম ও যোগাযোগ — প্রয়োজনে ফলো-আপের জন্য।",
              en: "Your name and contact details, in case we follow up.",
            },
          ],
        },
        {
          heading: { bn: "কী হয় তারপর", en: "What happens next" },
          rules: [
            {
              bn: "দাবিটি যাচাই করা হয় মূল প্রকাশকের বর্তমান প্রকাশনার সাথে মিলিয়ে।",
              en: "We check the claim against the publisher's current output.",
            },
            {
              bn: "প্রকাশকের নিজের সংশোধনী দিলে আমাদের সংস্করণ সেটি অনুসরণ করে।",
              en: "When the publisher issues its own correction, our copy follows it.",
            },
            {
              bn: "গুরুতর ভুল হলে স্টোরি সার্চ ইঞ্জিন থেকে সরিয়ে 410 দেখানো হয়।",
              en: "A serious error removes the story from search engines and returns 410.",
            },
            {
              bn: "একই ক্লাস্টারের সব প্রতিবেদন একসাথে সংশোধিত হয়, আলাদাভাবে নয়।",
              en: "A correction applies to the whole cluster, not just one headline.",
            },
          ],
        },
        {
          heading: { bn: "স্বয়ংক্রিয় অপসারণ", en: "Automatic removal" },
          body: [
            {
              bn: `প্রতিটি প্রতিবেদন ${INGEST_CONFIG.retentionDays} দিন পর নিজে থেকেই মুছে যায় এবং পুরোনো স্টোরি লিংক 404 দেয় — এটি নীতি, বাগ নয়। প্রকাশক যদি মূল লেখাটি সরিয়ে দেন, আমাদের সংস্করণও স্বয়ংক্রিয়ভাবে সরে যায়, কারণ আমরা মূল লেখা সংরক্ষণই করি না।`,
              en: `Every article expires automatically after ${INGEST_CONFIG.retentionDays} days and old story links return 404 — that is policy, not a bug. If a publisher deletes the original, our copy disappears too, because we never store full text.`,
            },
            {
              bn: "অপসারণ বা অধিকার নিয়ে আপত্তি থাকলে আলাদা ফর্ম আছে: অপসারণের অনুরোধ পাতা।",
              en: "For takedowns and rights objections, use the separate removal request page.",
            },
          ],
        },
        {
          heading: { bn: "কৃতজ্ঞতা", en: "Thanks" },
          body: [
            {
              bn: "যাঁরা ভুল ধরিয়ে দেন, তাঁদের নাম প্রকাশ করা হয় না কিন্তু তাঁদের অবদান নথিতে থাকে। প্রতিটি প্রকাশিত সংশোধনী এই পাতায় যুক্ত হয়।",
              en: "Corrections contributors are not named without permission, but every published correction is logged on this page.",
            },
          ],
        },
        {
          heading: { bn: "প্রকাশিত সংশোধনী", en: "Published corrections" },
          body: [
            {
              bn: "এখনও কোনো সংশোধনী লিপিবদ্ধ হয়নি। প্রথম সংশোধনী এখানে তারিখ ও বিবরণ সহ দেখা যাবে।",
              en: "No corrections have been logged yet. The first one will appear here with its date and details.",
            },
          ],
        },
      ]}
      sideLinks={[
        { href: "/editorial-policy", bn: "সম্পাদকীয় নীতি", en: "Editorial policy" },
        { href: "/removal-request", bn: "অপসারণের অনুরোধ", en: "Removal request" },
        { href: "/methodology", bn: "পদ্ধতি", en: "Methodology" },
      ]}
    />
  );
}
