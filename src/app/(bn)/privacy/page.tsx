import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Bi } from "@/components/ui/Bi";
import { CONTACT_EMAIL, SITE_NAME, SITE_NAME_BN } from "@/config/site";
import { formatShortDate } from "@/lib/utils/date";

export const metadata: Metadata = {
  title: "গোপনীয়তা নীতি",
  description: `${SITE_NAME_BN} কী তথ্য সংগ্রহ করে, কী করে না, এবং আপনার তথ্যের ওপর কী অধিকার আছে — সহজ ভাষায় গোপনীয়তা নীতি।`,
  alternates: {
    canonical: "/privacy",
    languages: { bn: "/privacy", en: "/en/privacy", "x-default": "/privacy" },
  },
  openGraph: {
    title: `গোপনীয়তা নীতি — ${SITE_NAME}`,
    description: `What ${SITE_NAME} stores, what it does not, and the choices you have.`,
    url: "/privacy",
  },
};

const EFFECTIVE_DATE = new Date("2026-10-29T00:00:00+06:00");

function Point({
  titleBn,
  titleEn,
  children,
}: {
  titleBn: string;
  titleEn: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-rule py-8">
      <h2 className="headline text-[24px] text-ink sm:text-[27px]">
        <Bi bn={titleBn} en={titleEn} />
      </h2>
      <div className="mt-3 max-w-[68ch] space-y-3 text-[15px] leading-relaxed text-muted">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="container-editorial">
      <header className="mt-6 border-b border-rule pb-8 pt-4 sm:pb-10">
        <p className="ui-label flex items-center gap-2 text-accent">
          <LockKeyhole size={14} strokeWidth={1.8} aria-hidden="true" />
          <Bi bn="গোপনীয়তা" en="Privacy" />
        </p>
        <h1 className="headline mt-3 text-[38px] leading-[1.15] text-ink sm:text-[50px]">
          <Bi bn="গোপনীয়তা নীতি" en="Privacy policy" />
        </h1>
        <p className="mt-4 max-w-[62ch] text-[17px] leading-relaxed text-muted sm:text-[18px]">
          <Bi
            bn="সংক্ষেপে: আমরা কোনো অ্যাকাউন্ট চাই না, বিজ্ঞাপন দেখাই না, আর পাঠককে ট্র্যাক করি না। নিউজলেটার চাইলে শুধু আপনার ইমেইল সংরক্ষণ করি।"
            en="The short version: no account, no advertising, and no reader tracking. If you join the newsletter, we store only your email address."
          />
        </p>
        <p className="meta mt-4">
          <Bi bn="কার্যকর:" en="Effective:" />{" "}
          <span className="lang-bn" lang="bn">
            {formatShortDate(EFFECTIVE_DATE, "bn")}
          </span>
          <span className="lang-en" lang="en">
            {formatShortDate(EFFECTIVE_DATE, "en")}
          </span>
        </p>
      </header>

      <div className="grid gap-10 py-6 lg:grid-cols-12 lg:gap-16">
        <div className="min-w-0 lg:col-span-8">
          <div className="flex items-start gap-4 border-l-2 border-accent bg-accent-soft/60 px-5 py-4">
            <ShieldCheck
              size={22}
              strokeWidth={1.8}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-accent"
            />
            <p className="text-[14px] leading-relaxed text-ink/85">
              <Bi
                bn={`${SITE_NAME_BN} একটি সংবাদ-সংগ্রাহক সাইট। আমরা নিজেরা প্রতিবেদন লিখি না, পাঠকের ব্যক্তিগত তথ্য বিক্রি করি না, এবং বিজ্ঞাপন বা তৃতীয় পক্ষের ট্র্যাকিং স্ক্রিপ্ট চালাই না।`}
                en={`${SITE_NAME} is a news aggregator. We do not write the reporting, sell personal data, or run advertising and third-party tracking scripts.`}
              />
            </p>
          </div>

          <Point titleBn="আমরা কী সংরক্ষণ করি" titleEn="What we store">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <Bi
                  bn="ভাষা ও রঙের পছন্দ — আপনার ব্রাউজারের localStorage-এ, কেবল আপনার ডিভাইসে। কোনো কুকি নয়।"
                  en="Your language and colour preference — in your browser's localStorage, on your device only. Not a cookie."
                />
              </li>
              <li>
                <Bi
                  bn="অফলাইনে পড়ার সুবিধার জন্য আপনার ব্রাউজার সম্প্রতি দেখা পৃষ্ঠা ও সাইটের ফাইল ক্যাশে রাখে। ক্যাশটি আপনার ডিভাইসেই থাকে এবং ব্রাউজার সেটিংস থেকে মুছে ফেলা যায়।"
                  en="To make offline reading possible, your browser caches recently viewed pages and site files. The cache stays on your device and can be cleared from browser settings."
                />
              </li>
              <li>
                <Bi
                  bn="নিউজলেটারে যোগ দিলে আপনার ইমেইল ঠিকানা, পছন্দের ভাষা, যোগদানের সময় ও উৎস। এই তথ্য আমাদের ডেটাবেসে থাকে এবং শুধু নিউজলেটার পাঠাতে ব্যবহার হয়।"
                  en="If you join the newsletter: your email address, preferred language, signup time, and signup source. This is stored in our database and used only to send the newsletter."
                />
              </li>
              <li>
                <Bi
                  bn="সাইনআপের অপব্যবহার ঠেকাতে আপনার আইপি ঠিকানার একটি অপরিবর্তনীয় হ্যাশ ও অনুরোধের সময় সংরক্ষণ করা হয়। কাঁচা আইপি ঠিকানা সংরক্ষণ করা হয় না।"
                  en="To stop signup abuse, we store a one-way hash of your IP address and the request time. The raw IP address is not stored."
                />
              </li>
              <li>
                <Bi
                  bn="হোস্টিং প্রদানকারী (Vercel) ও ডেটাবেস প্রদানকারী (Supabase) স্বাভাবিক সার্ভার লগ রাখতে পারে, যেমন অনুরোধের সময়, ব্রাউজারের ধরন ও ত্রুটির বিবরণ।"
                  en="Our host (Vercel) and database provider (Supabase) may keep standard server logs such as request time, browser type, and error details."
                />
              </li>
            </ul>
          </Point>

          <Point titleBn="আমরা কী করি না" titleEn="What we do not do">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <Bi
                  bn="কোনো অ্যাকাউন্ট, লগইন বা প্রোফাইল নেই।"
                  en="No accounts, logins, or reader profiles."
                />
              </li>
              <li>
                <Bi
                  bn="কোনো বিজ্ঞাপন, অ্যাড-নেটওয়ার্ক বা তৃতীয় পক্ষের অ্যানালিটিক্স নেই।"
                  en="No advertising, ad networks, or third-party analytics."
                />
              </li>
              <li>
                <Bi
                  bn="আমরা পাঠকের পড়ার অভ্যাস, অবস্থান বা ডিভাইস শনাক্ত করার চেষ্টা করি না।"
                  en="We do not try to identify your reading habits, location, or device."
                />
              </li>
              <li>
                <Bi
                  bn="আমরা ইমেইল ঠিকানা বিক্রি বা বিজ্ঞাপনদাতার সঙ্গে ভাগ করি না।"
                  en="We do not sell email addresses or share them with advertisers."
                />
              </li>
            </ul>
          </Point>

          <Point titleBn="নিউজলেটার" titleEn="Newsletter">
            <p>
              <Bi
                bn="নিউজলেটার পাঠানোর আইনি ভিত্তি হলো আপনার সম্মতি। আপনি যেকোনো সময় সদস্যতা বাতিল করতে পারবেন; প্রতিটি ইমেইলে বাতিলের লিংক থাকবে, অথবা আমাদের লিখে জানাতে পারেন। বাতিলের পর আপনার ইমেইল আমাদের সক্রিয় তালিকা থেকে সরে যাবে, তবে আইনি বা নিরাপত্তার প্রয়োজনে কিছু সময় সংরক্ষিত থাকতে পারে।"
                en="Our legal basis for the newsletter is your consent. You can unsubscribe at any time using the link in every email, or by writing to us. After unsubscribing, your email is removed from the active list, though it may be retained for a limited period for legal or security reasons."
              />
            </p>
            <p>
              <Bi
                bn="নিউজলেটার এখনো চালু হয়নি। এই সাইটে দেওয়া ফর্মটি প্রস্তুতির অংশ; চালু হলে এই নীতিতে ডেলিভারি প্রদানকারীর নাম যোগ করা হবে।"
                en="The newsletter is not sending yet. The form on this site is part of the build; when delivery starts, the provider's name will be added to this policy."
              />
            </p>
          </Point>

          <Point titleBn="কুকি ও স্থানীয় স্টোরেজ" titleEn="Cookies and local storage">
            <p>
              <Bi
                bn="আমরা বিজ্ঞাপন বা অ্যানালিটিক্স কুকি ব্যবহার করি না। আপনার ভাষা, থিম ও ইনস্টল প্রস্তাব বন্ধ করার পছন্দ সংরক্ষণ করতে তিনটি কী ব্যবহার হয়: "
                en="We use no advertising or analytics cookies. Three keys store your language, theme, and install-prompt preference: "
              />{" "}
              <code className="font-ui text-[13px] text-ink">kd-lang</code>{" "}
              <Bi bn="এবং" en="and" />{" "}
              <code className="font-ui text-[13px] text-ink">kd-theme</code>{" "}
              <Bi bn="এবং" en="and" />{" "}
              <code className="font-ui text-[13px] text-ink">
                kd-install-dismissed
              </code>
              <Bi
                bn="। এগুলো আপনার ব্রাউজারেই থাকে এবং সার্ভারে পাঠানো হয় না।"
                en=". They stay in your browser and are not sent to our server."
              />
            </p>
          </Point>

          <Point titleBn="বাইরের লিংক ও ছবি" titleEn="External links and images">
            <p>
              <Bi
                bn="প্রতিটি খবরের সঙ্গে মূল প্রকাশকের ওয়েবসাইটের লিংক থাকে। সেখানে গেলে সেই প্রকাশকের নিজস্ব গোপনীয়তা নীতি ও কুকি প্রযোজ্য হবে। আমরা সেই সাইটগুলোর বিষয়বস্তু নিয়ন্ত্রণ করি না।"
                en="Every story links to the original publisher's website. Once you follow that link, the publisher's own privacy policy and cookies apply. We do not control those sites."
              />
            </p>
            <p>
              <Bi
                bn="প্রকাশকের ছবি সরাসরি তাদের সার্ভার থেকে লোড হয়। আমরা ছবি কপি বা প্রসেস করি না, এবং রেফারার তথ্য পাঠাই না। তবুও ছবির অনুরোধে আপনার আইপি ঠিকানা প্রকাশকের সার্ভারে পৌঁছায়।"
                en="Publisher images load directly from their servers. We do not copy or process them, and we send no referrer information. Their server will still receive your IP address when the image loads."
              />
            </p>
          </Point>

          <Point titleBn="কতদিন রাখা হয়" titleEn="How long we keep data">
            <p>
              <Bi
                bn="সংবাদ ও মূল প্রতিবেদনের লিংক ১৪ দিন পর্যন্ত সংরক্ষিত থাকে, তারপর স্বয়ংক্রিয়ভাবে মুছে যায়। নিউজলেটারের ইমেইল সদস্যতা বাতিল বা তালিকা বন্ধ না হওয়া পর্যন্ত থাকে। সাইনআপ-সীমার হ্যাশ স্বল্প সময়ের জন্য রাখা হয়। সার্ভার লগ প্রদানকারীর নিজস্ব সময়সূচি অনুযায়ী মুছে যায়।"
                en="News items and source links are kept for up to 14 days and then removed automatically. Newsletter emails remain until you unsubscribe or the list closes. Signup-limit hashes are kept for a short period. Server logs expire on our providers' own schedules."
              />
            </p>
          </Point>

          <Point titleBn="আপনার অধিকার" titleEn="Your choices and rights">
            <p>
              <Bi
                bn="আপনি জানতে পারেন আমাদের কাছে আপনার কী তথ্য আছে, তা সংশোধন বা মুছে ফেলার অনুরোধ করতে পারেন, এবং নিউজলেটার থেকে সরে আসতে পারেন। অনুরোধ করতে আমাদের ইমেইলে লিখুন; যুক্তিসঙ্গত সময়ের মধ্যে উত্তর দেওয়া হবে।"
                en="You can ask what data we hold about you, request a correction or deletion, and unsubscribe from the newsletter. Write to us to make a request; we will respond within a reasonable time."
              />
            </p>
            <p>
              <Bi
                bn="প্রযোজ্য আইন অনুযায়ী কিছু তথ্য সংরক্ষণ করার বাধ্যবাধকতা থাকলে, বা অনুরোধটি স্পষ্টভাবে ভুয়া হলে আমরা তা পূরণ করতে না-ও পারি। সেক্ষেত্রে কারণ জানানো হবে।"
                en="We may be unable to fulfil a request if the law requires us to retain certain data, or if the request is clearly unfounded. We will explain why."
              />
            </p>
          </Point>

          <Point titleBn="শিশুদের গোপনীয়তা" titleEn="Children's privacy">
            <p>
              <Bi
                bn="সাইটটি সাধারণ পাঠকের জন্য, এবং আমরা জেনেশুনে ১৩ বছরের কম বয়সী শিশুর কাছ থেকে ব্যক্তিগত তথ্য সংগ্রহ করি না। অভিভাবক হিসেবে এমন তথ্য পাওয়ার কথা জানলে আমাদের লিখুন, আমরা তা মুছে ফেলব।"
                en="The site is intended for a general readership, and we do not knowingly collect personal information from children under 13. If you believe a child has provided information, write to us and we will delete it."
              />
            </p>
          </Point>

          <Point titleBn="নীতির পরিবর্তন" titleEn="Changes to this policy">
            <p>
              <Bi
                bn="নীতিতে বড় পরিবর্তন হলে এই পৃষ্ঠায় নতুন কার্যকর তারিখসহ প্রকাশ করা হবে। গুরুত্বপূর্ণ পরিবর্তনের ক্ষেত্রে সাইটে আলাদা ঘোষণা দেওয়া হতে পারে।"
                en="If this policy changes materially, we will publish the new version here with a new effective date. Significant changes may also be announced on the site."
              />
            </p>
          </Point>

          <Point titleBn="যোগাযোগ" titleEn="Contact">
            <p>
              <Bi
                bn="গোপনীয়তা, তথ্য সংশোধন বা সদস্যতা বাতিলের জন্য আমাদের লিখুন:"
                en="For privacy questions, data corrections, or unsubscribe requests, write to:"
              />
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex min-h-11 items-center gap-2 font-ui text-[14px] font-semibold text-accent underline decoration-accent/35 underline-offset-4"
            >
              <Mail size={16} strokeWidth={1.7} aria-hidden="true" />
              {CONTACT_EMAIL}
            </a>
          </Point>
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-36 border-t-2 border-accent bg-surface/50 p-5">
            <p className="ui-label text-muted">
              <Bi bn="এক নজরে" en="At a glance" />
            </p>
            <ul className="mt-3 space-y-3 text-[14px] leading-relaxed text-ink/80">
              {[
                {
                  bn: "কোনো অ্যাকাউন্ট নেই",
                  en: "No account required",
                },
                {
                  bn: "কোনো বিজ্ঞাপন বা ট্র্যাকার নেই",
                  en: "No ads or trackers",
                },
                {
                  bn: "শুধু পছন্দগুলো লোকালস্টোরেজে",
                  en: "Only preferences in local storage",
                },
                {
                  bn: "নিউজলেটার শুধু সম্মতিতে",
                  en: "Newsletter only with consent",
                },
              ].map((item) => (
                <li key={item.en} className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                  />
                  <Bi bn={item.bn} en={item.en} />
                </li>
              ))}
            </ul>

            <div className="mt-5 border-t border-rule pt-4">
              <Link
                href="/about"
                className="inline-flex min-h-11 items-center gap-1.5 font-ui text-[13px] font-medium text-accent"
              >
                <Bi bn="পদ্ধতি ও সম্পাদকীয় নীতি" en="Methodology and editorial policy" />
                <ArrowUpRight size={14} strokeWidth={1.7} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
