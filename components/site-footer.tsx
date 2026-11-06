"use client";

/*
  SITE FOOTER
  -----------
  Simple, three columns of links. Every link points to a real page.
*/

import { useEffect, useState } from "react";
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

/* The owner's own links (shown as icons in the bottom bar).
   The email address never appears in the served HTML - it is
   assembled in the browser only, so email-harvesting bots that
   read the page source find nothing to steal. */
const socials = [
  {
    name: "Instagram" as const,
    href: "https://www.instagram.com/wamphead/",
    external: true,
    bn: "Instagram: @wamphead",
    en: "Instagram: @wamphead",
  },
  {
    name: "Email" as const,
    href: "", // filled in after the page loads (see mailHref below)
    external: false,
    bn: "ইমেইল: ox17afnan [at] gmail [dot] com",
    en: "Email: ox17afnan [at] gmail [dot] com",
  },
  {
    name: "GitHub" as const,
    href: "https://github.com/Afnan-w",
    external: true,
    bn: "GitHub: Afnan-w",
    en: "GitHub: Afnan-w",
  },
];

/* Simple hand-drawn brand icons - no icon package needed. */
function SocialMark({ name }: { name: "Instagram" | "Email" | "GitHub" }) {
  if (name === "GitHub") {
    return (
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className="h-5 w-5"
        fill="currentColor"
      >
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
      </svg>
    );
  }

  if (name === "Email") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
        <path d="M3.5 7l8.5 5.5L20.5 7" />
      </svg>
    );
  }

  /* Instagram: rounded camera square, lens circle, flash dot. */
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

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

  /* The mailto address is built ONLY in the browser (never on the
     server), so the page source shows no email to harvesting bots. */
  const [mailHref, setMailHref] = useState<string | null>(null);
  useEffect(() => {
    setMailHref(
      "mailto:ox" + "17afnan" + "@" + "gmail" + "." + "com"
    );
  }, []);

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

        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}.{" "}
            {lang === "bn"
              ? "সব সংবাদ তার মূল সূত্রেই যুক্ত।"
              : "Every headline links back to its original source."}
          </p>

          {/* Instagram / email / GitHub - the owner's own links. */}
          <div className="flex items-center gap-2">
            {socials.map((social) => {
              const label = lang === "bn" ? social.bn : social.en;
              const isMail = social.name === "Email";
              const href = isMail ? mailHref ?? undefined : social.href;
              return (
                <a
                  key={social.name}
                  href={href}
                  aria-disabled={isMail && !href}
                  target={social.external ? "_blank" : undefined}
                  rel={social.external ? "noopener noreferrer" : undefined}
                  aria-label={label}
                  title={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card text-fg/70 transition-colors hover:border-accent hover:text-accent"
                >
                  <SocialMark name={social.name} />
                </a>
              );
            })}
          </div>

          <p className="text-xs">
            {lang === "bn" ? "চট্টগ্রাম, বাংলাদেশ" : "Chittagong, Bangladesh"}
          </p>
        </div>
      </div>
    </footer>
  );
}
