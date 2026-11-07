"use client";

/* The /categories page: a grid of category cards, keyword-labelled,
   with a per-category description line that doubles as internal-link
   anchor context for crawlers. */

import Link from "next/link";
import { useLanguage } from "@/components/language";
import { SectionHeading } from "@/components/story";
import { categories } from "@/lib/site";

/** Short, per-category description shown on each card. */
const DESCRIPTIONS: Record<string, { bn: string; en: string }> = {
  politics: {
    bn: "রাজনীতির সর্বশেষ খবর",
    en: "The latest politics news",
  },
  business: {
    bn: "বাজার ও অর্থনীতির খবর",
    en: "Markets and economy news",
  },
  sports: {
    bn: "ক্রিকেট, ফুটবল ও আরও সব খেলা",
    en: "Cricket, football and more",
  },
  technology: {
    bn: "AI, গ্যাজেট ও টেক নিউজ",
    en: "AI, gadgets and tech news",
  },
  entertainment: {
    bn: "চলচ্চিত্র, সঙ্গীত ও তারকা নিউজ",
    en: "Film, music and celebrity news",
  },
  health: {
    bn: "রোগ, চিকিৎসা ও স্বাস্থ্যখবর",
    en: "Disease, care and health news",
  },
};

export function CategoriesView() {
  const { lang } = useLanguage();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-8 pb-8 sm:px-6">
      <nav
        aria-label={lang === "bn" ? "ব্রেডক্রাম্ব" : "Breadcrumb"}
        className="text-sm text-muted"
      >
        <Link href="/" className="transition-colors hover:text-accent">
          {lang === "bn" ? "হোম" : "Home"}
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span className="text-fg/70">
          {lang === "bn" ? "সব বিভাগ" : "All categories"}
        </span>
      </nav>

      <p className="article-body mt-4 max-w-3xl text-fg/80">
        {lang === "bn"
          ? "বিশ্বস্ত সংবাদমাধ্যম থেকে সংগৃহীত দেশি ও বিদেশি সংবাদ — বিভাগ অনুযায়ী সাজানো দেখুন: বাংলাদেশ নিউজ ও বিশ্বের খবর এক জায়গায়।"
          : "News about Bangladesh and the world, gathered from trusted outlets and sorted by category — Deshi and Bideshi news, in one place."}
      </p>

      <SectionHeading
        title={lang === "bn" ? "সব বিভাগ" : "All categories"}
        lang={lang}
        as="h1"
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/category/${category.slug}`}
              className="group flex min-h-28 flex-col justify-between rounded-xl border border-line bg-card p-5 transition-colors hover:border-accent"
            >
              <span className="serif text-xl font-semibold text-fg transition-colors group-hover:text-accent">
                {category[lang]}
              </span>
              <span className="text-sm text-muted">
                {DESCRIPTIONS[category.slug]?.[lang] ??
                  (lang === "bn" ? "সংবাদ দেখুন" : "View stories")}
              </span>
              <span className="text-sm text-accent">
                {lang === "bn" ? "খবর দেখুন →" : "View stories →"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
