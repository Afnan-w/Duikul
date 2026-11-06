"use client";

/*
  Renders any of the pages defined in lib/static-pages.ts
  (About, Contact, Privacy, Terms, Editorial Policy, Corrections)
  in whichever language the visitor has selected.
*/

import Link from "next/link";
import { useLanguage } from "@/components/language";
import { staticPages } from "@/lib/static-pages";

export function StaticPage({ id }: { id: string }) {
  const { lang } = useLanguage();
  const page = staticPages[id];
  if (!page) return null;

  const homeLabel = lang === "bn" ? "হোম" : "Home";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="transition-colors hover:text-accent">
          {homeLabel}
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span className="text-fg">{page.title[lang]}</span>
      </nav>

      <h1 className="serif mt-4 text-3xl leading-tight font-bold tracking-tight text-fg sm:text-4xl">
        {page.title[lang]}
      </h1>

      <p className="article-body mt-4 border-l-2 border-accent-strong pl-4 text-fg/80">
        {page.intro[lang]}
      </p>

      <div className="article-body mt-8 space-y-5 text-fg/85">
        {page.body[lang].map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <p className="mt-10 border-t border-line pt-6 text-sm text-muted">
        {lang === "bn"
          ? "এই পাতাটি খসড়া অবস্থায় আছে — পূর্ণ নীতিমালা প্রকাশের আগে আরও বিস্তারিত যোগ হবে।"
          : "This page is a draft — more detail will be added before publication."}
      </p>
    </main>
  );
}
