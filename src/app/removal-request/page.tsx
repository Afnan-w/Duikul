import { FileX } from "lucide-react";
import { TrustPage, trustMetadata } from "@/components/trust/TrustPage";
import { CONTACT_EMAIL, SITE_NAME } from "@/config/site";

export const metadata = trustMetadata({
  path: "/removal-request",
  title: "অপসারণের অনুরোধ",
  titleEn: "Removal request",
  description: `প্রকাশক, আইনজীবী বা উদ্বিগ্ন নাগরিক ${SITE_NAME} থেকে শিরোনাম/সংক্ষিপ্ত অংশ অপসারণ বা সংশোধন করতে কীভাবে অনুরোধ করবেন — প্রক্রিয়া ও সময়সীমা।`,
});

export default function RemovalRequestPage() {
  return (
    <TrustPage
      path="/removal-request"
      eyebrow={{
        icon: <FileX size={14} strokeWidth={1.8} aria-hidden="true" />,
        bn: "অপসারণের অনুরোধ",
        en: "Removal request",
      }}
      headline={{
        bn: "অপসারণ বা সংশোধনের অনুরোধ",
        en: "Request removal or correction",
      }}
      intro={{
        bn: `প্রকাশক, তাঁদের প্রতিনিধি, বা আইনগত অনুরোধকারী যদি ${SITE_NAME}-এ নিজের বিষয়বস্তু নিয়ে অনুরোধ করতে চান, এই পাতাটি পূরণ করুন। অনুরোধ পাঠান: ${CONTACT_EMAIL} (বিষয়ে “removal request” লিখুন)।`,
        en: `Publishers, their representatives, or legal requesters can ask about content on ${SITE_NAME} using this page. Send requests to ${CONTACT_EMAIL} with “removal request” in the subject.`,
      }}
      sections={[
        {
          heading: { bn: "কোন কোন ক্ষেত্রে", en: "Valid grounds" },
          rules: [
            {
              bn: "আপনি প্রকাশক বা তাঁর অনুমোদিত প্রতিনিধি এবং শিরোনাম/সংক্ষিপ্ত অংশ সরাতে চান।",
              en: "You are the publisher or an authorised representative and want the headline or excerpt removed.",
            },
            {
              bn: "শিরোনাম বা সংক্ষিপ্ত অংশ ভুল, অপ্রাসঙ্গিক, বা মূল লেখা থেকে সরে গেছে।",
              en: "The headline or excerpt is wrong, no longer relevant, or out of step with the original article.",
            },
            {
              bn: "কপিরাইট বা ব্যক্তিগত তথ্য নিয়ে আইনগত আপত্তি আছে।",
              en: "You have a legal objection about copyright or personal data.",
            },
          ],
        },
        {
          heading: { bn: "অনুরোধে যা দিতে হবে", en: "What to include" },
          rules: [
            {
              bn: "অনুরোধকারীর নাম, ভূমিকা ও যোগাযোগের ঠিকানা।",
              en: "Requester's name, role, and contact details.",
            },
            {
              bn: `যে পাতার লিংক বা স্টোরি URL অপসারণ বা সংশোধন করতে হবে।`,
              en: "The page link or story URL to remove or correct.",
            },
            {
              bn: "অনুরোধের কারণ (ভুল তথ্য, মালিকানা, ব্যক্তিগত তথ্য ইত্যাদি) ও সংক্ষিপ্ত যুক্তি।",
              en: "The ground (wrong fact, ownership, personal data, etc.) with a short justification.",
            },
            {
              bn: "আইনি অনুরোধে কর্তৃপক্ষের পক্ষে যোগাযোগের অনুমোদন।",
              en: "For legal requests, written authority to act for the party.",
            },
          ],
        },
        {
          heading: { bn: "প্রক্রিয়া", en: "Process" },
          rules: [
            {
              bn: "অনুরোধ যাচাই করে ২–৩ কর্মদিবসের মধ্যে সাড়া দেওয়া হয়; জটিল ক্ষেত্রে ৭ দিন পর্যন্ত সময় লাগতে পারে।",
              en: "We verify and reply within 2–3 working days; complex cases may take up to 7 days.",
            },
            {
              bn: "অনুমোদিত অনুরোধে সংশ্লিষ্ট স্টোরি বা ক্লাস্টার অপসারণ করা হয়, সার্চ ইঞ্জিন থেকে 410 দেখিয়ে।",
              en: "Approved requests remove the story or cluster with a 410 response so search engines drop it too.",
            },
            {
              bn: "অনুরোধকারী ভুল প্রমাণ দিলে অনুরোধ প্রত্যাখ্যান করা হয় এবং কারণ জানানো হয়।",
              en: "Requests without valid grounds are declined with the reason explained.",
            },
            {
              bn: "অপসারণের সিদ্ধান্ত ও কারণ সংশোধনী পাতায় নথিভুক্ত থাকে।",
              en: "The decision and its ground are logged on the corrections page.",
            },
          ],
        },
        {
          heading: { bn: "যা আমরা পারি না", en: "What we cannot do" },
          body: [
            {
              bn: "আমরা মূল প্রকাশকের ওয়েবসাইটের লেখা বদলাতে বা সরাতে পারি না — সেটি সরাসরি প্রকাশকের কাছে যান। আমরা কখনও সম্পূর্ণ লেখা সংরক্ষণ করি না, তাই অনুরোধ পাঠানোর সাথে সাথেই সার্ভার থেকে মুছে যায়।",
              en: "We cannot change or remove the publisher's own website — contact the publisher directly. We never store full articles, so approved excerpts vanish from our servers immediately.",
            },
            {
              bn: "সার্চ ইঞ্জিনের নিজস্ব ক্যাশ আমাদের নিয়ন্ত্রণের বাইরে; 410 সাড়া দিয়ে আমরা তাদের অনুরোধ করি মুছে ফেলতে।",
              en: "Search engines' own caches are outside our control; the 410 response asks them to drop the page.",
            },
          ],
        },
      ]}
      sideLinks={[
        { href: "/corrections", bn: "সংশোধনী নীতি", en: "Corrections" },
        { href: "/editorial-policy", bn: "সম্পাদকীয় নীতি", en: "Editorial policy" },
        { href: "/contact", bn: "যোগাযোগ", en: "Contact" },
      ]}
    />
  );
}
