/*
  HOME PAGE EXTRAS  (server components - always in the served HTML)
  ------------------------------------------------------------------
  Two sections that live at the bottom of the homepage:

  1. WhyDuikul  — "কেন দুইকূল": short, keyword-rich value pitch
                  with internal links (Deshi news, Bideshi news,
                  categories, editorial policy).
  2. HomeFaq    — an FAQ accordion in <details>/<summary> (no JS,
                  zero layout shift) plus the matching FAQPage
                  JSON-LD so Google can answer People-Also-Ask
                  style questions about দুইকূল.
*/

import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { siteConfig } from "@/lib/site";

const whyCards = [
  {
    title: "যাচাইয়ের সংখ্যা দেখে পড়ুন",
    body: "একই ঘটনা আরও বিশ্বস্ত সংবাদমাধ্যম প্রতিবেদন করেছে কি না, তা প্রতিটি সংবাদের ব্যাজে দেখা যায় — multi-source news BD নীতি।",
  },
  {
    title: "প্রতিদিন শীর্ষ ৫",
    body: "দেশি — শীর্ষ ৫ ও বিদেশি — শীর্ষ ৫ তালিকা: কোভারেজ, সূত্রের বিশ্বাসস্তর ও সাম্প্রতিকতা মিলিয়ে দিনের সবচেয়ে আলোচিত খবর।",
  },
  {
    title: "সব সংবাদ মূল সূত্রেই যুক্ত",
    body: "আমরা খবর করি না, কপিও করি না। প্রতিটি শিরোনাম trusted sources news Bangladesh নীতিতে সরাসরি মূল নিবন্ধে যুক্ত।",
  },
  {
    title: "ফ্রি, অ্যাপের মতো, ট্র্যাকিং নেই",
    body: "একবার হোম স্ক্রিনে যোগ করলেই newsapp BD হয়ে যায় দুইকূল — বিজ্ঞাপন নেই, কোনো ট্র্যাকার নেই, ডেটা ব্যবহারও কম।",
  },
] as const;

export function WhyDuikul() {
  return (
    <section
      aria-labelledby="why-heading"
      className="mt-14 border-t border-line pt-10"
    >
      <h2
        id="why-heading"
        className="serif flex items-center gap-3 text-xl font-bold tracking-tight text-fg sm:text-2xl"
      >
        <span aria-hidden="true" className="h-4 w-1 bg-accent-strong" />
        কেন দুইকূল — Duikul কী?
      </h2>

      <p className="article-body mt-4 max-w-3xl text-fg/80">
        দুইকূল (Duikul) বাংলাদেশের সংবাদমাধ্যম ও বিশ্বের শীর্ষ মিডিয়া থেকে
        Deshi Bideshi news একত্র করে এক জায়গায় সাজিয়ে দেয়। একই ঘটনা পাশের
        সংবাদমাধ্যমগুলো যখন একসাথে প্রতিবেদন করে, তখন সেগুলো এক পাতায় জোট বাঁধে
        আর দর্শক দেখতে পান কতগুলো সূত্র ঘটনাটি নিশ্চিত করেছে — বাংলাদেশ নিউজ
        পড়ার সবচেয়ে ভরসাযোগ্য পথ।
      </p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {whyCards.map((card) => (
          <li
            key={card.title}
            className="rounded-xl border border-line bg-card p-5"
          >
            <h3 className="serif text-lg font-semibold text-fg">
              {card.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-fg/75">
              {card.body}
            </p>
          </li>
        ))}
      </ul>

      <nav
        aria-label="দুইকূলে আরও"
        className="mt-6 flex flex-wrap gap-2 text-sm"
      >
        {[
          { href: "/deshi", label: "দেশি সংবাদ দেখুন" },
          { href: "/bideshi", label: "বিদেশি সংবাদ দেখুন" },
          { href: "/categories", label: "বিভাগভিত্তিক খবর" },
          { href: "/about", label: "আমাদের সম্পর্কে" },
          { href: "/editorial-policy", label: "সম্পাদনী নীতি" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex min-h-9 items-center rounded-full border border-line bg-card px-4 text-fg/80 transition-colors hover:border-accent hover:text-accent"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </section>
  );
}

/* ------------------------------------------------------------ */

type FaqItem = { q: string; a: string };

/* Bangla-first content (the SSR view Google crawlers read).
   The visible text and the FAQPage JSON-LD always match. */
const FAQ_ITEMS: FaqItem[] = [
  {
    q: "দুইকূল (Duikul) কী?",
    a: "দুইকূল একটি বিনামূল্যের news aggregator — বাংলাদেশের বিশ্বস্ত সংবাদমাধ্যম থেকে দেশি সংবাদ (Deshi news) এবং বিশ্বের শীর্ষ মিডিয়া থেকে বিদেশি সংবাদ (Bideshi news) সংগ্রহ করে এক জায়গায় সাজিয়ে দেয়। আমরা নিজের কোনো সংবাদ লিখি না।",
  },
  {
    q: "দুইকূলের খবর কি যাচাই করা (verified news Bangladesh)?",
    a: "আমরা কখনো '১০০% যাচাইকৃত' দাবি করি না। বরং প্রতিটি ঘটনার পাশে দেখানো হয় কতটি বিশ্বস্ত সংবাদমাধ্যম একই কথা প্রতিবেদন করেছে এবং সেই সূত্রগুলোর সরাসরি লিংক — যাচাইটা আপনি নিজেই মিলিয়ে নিতে পারেন।",
  },
  {
    q: "একই সংবাদ কয়েকটি সূত্রে আসে কেন?",
    a: "একটি বড় ঘটনা যখন একাধিক স্বাধীন সংবাদমাধ্যম প্রতিবেদন করে তখন তা বেশি নিশ্চিত বলে ধরা হয়। দুইকূল সেই একই ঘটনার সব সংবাদ একত্র করে এক আইটেমে দেখায় — এটাই multi-source news BD পদ্ধতি।",
  },
  {
    q: "পুরো প্রতিবেদন কি এখানেই পড়া যায়?",
    a: "না। প্রতিটি সংবাদ 'পূর্ণ সংবাদ পড়ুন' বোতামে মূল সংবাদমাধ্যমের নিবন্ধে নিয়ে যায়। শিরোনাম ও দুই-তিন বাক্যের সারসংক্ষেপ কেবল পরিচয়ের জন্য — সম্পূর্ণ নিবন্ধের স্বত্ব মূল সংবাদমাধ্যমের।",
  },
  {
    q: "'দেশি — শীর্ষ ৫' ও 'বিদেশি — শীর্ষ ৫' কীভাবে ঠিক হয়?",
    a: "তিনটি স্পষ্ট নিয়মে তৈরি হয়: ঘটনাটি কতটি সূত্রে প্রতিবেদিত হয়েছে, সূত্রগুলোর বিশ্বাসস্তর কেমন, এবং খবরটি কতটা নতুন। প্রতি ১০ মিনিটে তালিকা নিজেই আপডেট হয়।",
  },
  {
    q: "দুইকূল কি ফ্রি? অ্যাপ আছে?",
    a: "সম্পূর্ণ ফ্রি, বিজ্ঞাপন নেই, লগইন নেই। মোবাইলের ব্রাউজারে 'হোম স্ক্রিনে যোগ করুন' চাপলেই দুইকূল একটি newsapp BD হয়ে যায় — অ্যাপ স্টোরের দরকার নেই।",
  },
  {
    q: "খবর প্রতি কতক্ষণে আপডেট হয়?",
    a: "প্রতি ১০ মিনিটে সব ফিড থেকে নতুন সংবাদ এসে জোট বাঁধে এবং একই ঘটনার প্রতিবেদনগুলো পুনরায় মেলানো হয়। হোমপেজ সবসময় সর্বশেষ তথ্য দেখায়।",
  },
  {
    q: "সাইটটি ইংরেজিতে দেখা যায়?",
    a: "হ্যাঁ। প্রধান মেনুর EN বোতামে ক্লিক করলে ইংরেজি ভিউ আসে, আবার 'বাং' দিয়ে ফিরে আসে। ভাষা ব্রাউজারে মনে রাখা হয়, আবার /?lang=en ঠিকানা সরাসরি ইংরেজি ভিউ দেয়।",
  },
];

export function HomeFaq() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <section
      aria-labelledby="faq-heading"
      className="mt-12 border-t border-line pt-10"
    >
      <JsonLd data={faqJsonLd} />

      <h2
        id="faq-heading"
        className="serif flex items-center gap-3 text-xl font-bold tracking-tight text-fg sm:text-2xl"
      >
        <span aria-hidden="true" className="h-4 w-1 bg-accent-strong" />
        সাধারণ প্রশ্ন — দুইকূল সম্পর্কে
      </h2>

      <p className="mt-3 max-w-2xl text-sm text-muted">
        আরও জানতে {siteConfig.nameBn} চট্টগ্রাম থেকে সারা বাংলাদেশের খবর
        সরবরাহ করে। প্রশ্ন থাকলে{" "}
        <Link href="/contact" className="text-accent underline-offset-2 hover:underline">
          যোগাযোগ
        </Link>{" "}
        পাতায় লিখুন।
      </p>

      <div className="mt-6 space-y-3">
        {FAQ_ITEMS.map((item) => (
          <details
            key={item.q}
            className="group rounded-xl border border-line bg-card"
          >
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 font-semibold text-fg">
              {item.q}
              <span
                aria-hidden="true"
                className="text-xl leading-none text-accent transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="px-5 pb-5 text-[15px] leading-relaxed text-fg/80">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
