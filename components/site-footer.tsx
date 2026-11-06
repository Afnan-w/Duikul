"use client";

/*
  SITE FOOTER
  -----------
  Simple, three columns of links. Every link points to a real page.
*/

import Link from "next/link";
import { useLanguage } from "@/components/language";
import { siteConfig } from "@/lib/site";

const explore = [
  { href: "/", bn: "হোম", en: "Home" },
  { href: "/deshi", bn: "দেশি", en: "Deshi" },
  { href: "/bideshi", bn: "বিদেশি", en: "Bideshi" },
  { href: "/categories", bn: "বিভাগ", en: "Categories" },
];

const trust = [
  { href: "/about", bn: "আমাদের সম্পর্কে", en: "About Us" },
  { href: "/editorial-policy", bn: "সম্পাদনী নীতি", en: "Editorial Policy" },
  { href: "/corrections", bn: "সংশোধনী নীতি", en: "Corrections" },
];

const legal = [
  { href: "/privacy", bn: "গোপনীয়তা নীতি", en: "Privacy Policy" },
  { href: "/terms", bn: "শর্তাবলি", en: "Terms" },
  { href: "/contact", bn: "যোগাযোগ", en: "Contact" },
];

function LinkColumn({
  title,
  links,
  lang,
}: {
  title: string;
  links: { href: string; bn: string; en: string }[];
  lang: "bn" | "en";
}) {
  return (
    <div>
      <h2 className="text-xs font-semibold tracking-widest text-muted uppercase">
        {title}
      </h2>
      <ul className="mt-3 space-y-1">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex min-h-9 items-center text-[15px] text-fg/75 transition-colors hover:text-accent"
            >
              {link[lang]}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const { lang } = useLanguage();

  return (
    <footer className="mt-16 border-t border-line bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="serif flex items-baseline gap-1.5 text-2xl font-bold text-fg">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-accent-strong" />
              Duikul
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              {lang === "bn"
                ? "বিশ্বস্ত সংবাদমাধ্যম থেকে সংগ্রহ করা দেশি ও বিদেশি সংবাদ, এক জায়গায়।"
                : "Top Bangladesh and world news, gathered from trusted outlets and shown in one place."}
            </p>
          </div>

          <LinkColumn title={lang === "bn" ? "ঘাঁটুন" : "Explore"} links={explore} lang={lang} />
          <LinkColumn title={lang === "bn" ? "বিশ্বাসযোগ্যতা" : "Trust"} links={trust} lang={lang} />
          <LinkColumn title={lang === "bn" ? "আইনি" : "Legal"} links={legal} lang={lang} />
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}.{" "}
            {lang === "bn"
              ? "সব সংবাদ তার মূল সূত্রেই যুক্ত।"
              : "Every headline links back to its original source."}
          </p>
          <p className="text-xs">
            {lang === "bn" ? "ঢাকা, বাংলাদেশ" : "Dhaka, Bangladesh"}
          </p>
        </div>
      </div>
    </footer>
  );
}
