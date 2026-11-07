"use client";

/*
  Renders any of the pages defined in lib/static-pages.ts
  (About, Contact, Privacy, Terms, Editorial Policy, Corrections)
  in whichever language the visitor has selected.
*/

import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { useLanguage } from "@/components/language";
import { staticPages } from "@/lib/static-pages";

export function StaticPage({ id }: { id: string }) {
  const { lang } = useLanguage();
  const page = staticPages[id];
  if (!page) return null;

  const homeLabel = lang === "bn" ? "হোম" : "Home";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-8 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "দুইকূল", path: "/" },
          { name: page.title[lang] ?? id, path: `/${id}` },
        ])}
      />

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
          ? "এই নীতিমালা বা পাতাটি সম্পর্কে প্রশ্ন থাকলে "
          : "Any questions about this page or policy? "}
        <Link
          href="/contact"
          className="text-accent underline-offset-2 transition-colors hover:underline"
        >
          {lang === "bn" ? "যোগাযোগ করুন" : "Get in touch"}
        </Link>
        {lang === "bn" ? " — আমরা সাধারণত ৪৮ ঘণ্টার মধ্যে উত্তর দিই।" : " — we usually reply within 48 hours."}
      </p>
    </main>
  );
}
