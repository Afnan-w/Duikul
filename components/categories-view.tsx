"use client";

/* The /categories page: a simple grid of category cards. */

import Link from "next/link";
import { useLanguage } from "@/components/language";
import { SectionHeading } from "@/components/story";
import { categories, ui } from "@/lib/site";

export function CategoriesView() {
  const { lang } = useLanguage();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-8 pb-8 sm:px-6">
      <SectionHeading title={ui.allCategories[lang]} lang={lang} />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/category/${category.slug}`}
              className="group flex min-h-24 flex-col justify-between rounded-xl border border-line bg-card p-5 transition-colors hover:border-accent"
            >
              <span className="serif text-xl font-semibold text-fg transition-colors group-hover:text-accent">
                {category[lang]}
              </span>
              <span className="text-sm text-muted">
                {lang === "bn" ? "সংবাদ দেখুন" : "View stories"} →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
