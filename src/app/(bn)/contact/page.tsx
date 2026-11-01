import { Mail } from "lucide-react";
import { TrustPage, trustMetadata } from "@/components/trust/TrustPage";
import {
  CONTACT_EMAIL,
  PUBLISHER_CONTACT,
  PUBLISHER_NAME,
  PUBLISHER_NAME_BN,
  SITE_NAME,
  SITE_NAME_BN,
  type SiteLocale,
} from "@/config/site";

export const metadata = trustMetadata({
  path: "/contact",
  title: "যোগাযোগ",
  titleEn: "Contact",
  description: `${SITE_NAME}-এ যোগাযোগের একমাত্র ঠিকানা, কোন বিষয়ে কীভাবে লিখবেন এবং কত দিনে উত্তর পাবেন।`,
});

const publisherConfigured =
  PUBLISHER_NAME !== "[PLACEHOLDER]" && PUBLISHER_NAME.trim().length > 0;

export default function ContactPage({ locale }: { locale?: SiteLocale }) {
  return (
    <TrustPage
      locale={locale}
      path="/contact"
      eyebrow={{
        icon: <Mail size={14} strokeWidth={1.8} aria-hidden="true" />,
        bn: "যোগাযোগ",
        en: "Contact",
      }}
      headline={{
        bn: "আমাদের সাথে কথা বলুন",
        en: "Get in touch",
      }}
      intro={{
        bn: `${SITE_NAME_BN}-এর একমাত্র অফিসিয়াল যোগাযোগ ঠিকানা: ${CONTACT_EMAIL}। অন্য কোনো ঠিকানা থেকে আমাদের নামে পাঠানো বার্তা আমাদের নয়।`,
        en: `${SITE_NAME}'s only official contact address is ${CONTACT_EMAIL}. Any message sent under our name from another address is not from us.`,
      }}
      sections={[
        {
          heading: { bn: "কোন বিষয়ে কীভাবে", en: "Which subject, which page" },
          rules: [
            {
              bn: "ভুল খবর বা ভুল ক্লাস্টার — সংশোধনী পাতা অনুসরণ করুন, ইমেইলে বিষয়ে ‘correction’ লিখুন।",
              en: "Wrong story or mis-grouped cluster — follow the corrections policy and put “correction” in the subject line.",
            },
            {
              bn: "শিরোনাম/সারাংশ অপসারণ বা কপিরাইট আপত্তি — অপসারণের অনুরোধ পাতা দেখুন।",
              en: "Excerpt removal or copyright objection — use the removal request page first.",
            },
            {
              bn: "নতুন উৎস প্রস্তাব — প্রকাশকের অফিসিয়াল ফিড লিংক ও সংক্ষিপ্ত পরিচয়সহ লিখুন।",
              en: "Proposing a new publisher — include the official feed link and a short description.",
            },
            {
              bn: "অন্য যেকোনো বিষয় — সরাসরি লিখুন; উত্তরের অপেক্ষা করবেন।",
              en: "Anything else — write directly and we will reply.",
            },
          ],
        },
        {
          heading: { bn: "উত্তরের সময়", en: "Response time" },
          body: [
            {
              bn: "সাধারণত ২–৩ কর্মদিবসের মধ্যে উত্তর দেওয়া হয়। আইনি বা অপসারণের অনুরোধ অগ্রাধিকার পায়।",
              en: "We usually reply within 2–3 working days. Legal and removal requests are prioritised.",
            },
          ],
        },
        {
          heading: {
            bn: "পরিচালনাকারী",
            en: "Operator",
          },
          body: [
            publisherConfigured
              ? {
                  bn: `এই সাইটটি পরিচালনা করেন ${PUBLISHER_NAME_BN !== "[PLACEHOLDER]" ? PUBLISHER_NAME_BN : PUBLISHER_NAME}। আইনি যোগাযোগ: ${PUBLISHER_CONTACT}।`,
                  en: `This site is operated by ${PUBLISHER_NAME}. Legal contact: ${PUBLISHER_CONTACT}.`,
                }
              : {
                  bn: "পরিচালনাকারীর আইনি নাম এখনও প্রকাশ করা হয়নি (প্লেসহোল্ডার)। লঞ্চের আগে এটি সেট করা হবে; এর আগে ইমেইল যোগাযোগই একমাত্র চ্যানেল।",
                  en: "The operator's legal name is not yet published (placeholder). It will be set before launch; until then, email is the only channel.",
                },
            {
              bn: "সোশ্যাল প্রোফাইল যুক্ত হলে এখানে যুক্ত হবে; অন্য কোনো অ্যাকাউন্ট আমাদের নয়।",
              en: "Verified social profiles will be listed here. No other account represents us.",
            },
          ],
        },
        {
          heading: { bn: "যা পাবেন না", en: "What we cannot do" },
          rules: [
            {
              bn: "খবরের সত্যতা নিয়ে রায় বা তদন্ত করতে পারি না — আমরা সংকলক, তদন্তকারী নই।",
              en: "We cannot rule on the truth of a report — we aggregate, we do not investigate.",
            },
            {
              bn: "প্রকাশকের ওয়েবসাইটে সংশোধন বা নোটিশ দেওয়ার ক্ষমতা আমাদের নেই; সেটি সরাসরি প্রকাশককে জানান।",
              en: "We cannot amend or annotate the publisher's own website — contact the publisher directly for that.",
            },
          ],
        },
      ]}
      sideLinks={[
        { href: `mailto:${CONTACT_EMAIL}`, bn: "ইমেইল পাঠান", en: "Send an email" },
        { href: "/corrections", bn: "সংশোধনী নীতি", en: "Corrections" },
        { href: "/removal-request", bn: "অপসারণের অনুরোধ", en: "Removal request" },
        { href: "/about", bn: "আমাদের সম্পর্কে", en: "About us" },
      ]}
    />
  );
}
