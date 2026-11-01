"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TRUST_PATHS } from "@/config/site";

const LINKS = [
  { href: "/", bn: "প্রথম পাতা", en: "Home" },
  { href: "/deshi", bn: "দেশি খবর", en: "Bangladesh" },
  { href: "/bideshi", bn: "বিদেশি খবর", en: "World" },
  { href: "/search", bn: "খুঁজুন", en: "Search" },
  { href: "/about", bn: "আমাদের সম্পর্কে", en: "About" },
] as const;

export function NavLinks() {
  const pathname = usePathname();
  // Inside the English tree, links with an English twin follow it there.
  // News sections and search stay on their shared URLs.
  const onEnglishTree = pathname === "/en" || pathname.startsWith("/en/");
  const localHref = (href: string) => {
    if (!onEnglishTree) return href;
    if (href === "/") return "/en";
    return TRUST_PATHS.includes(href) ? `/en${href}` : href;
  };

  return (
    <nav aria-label="Primary" className="min-w-0">
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-0 sm:gap-x-7">
        {LINKS.map((link) => {
          const href = localHref(link.href);
          const active =
            href === "/"
              ? pathname === "/" || pathname === "/en"
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={link.href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center border-b-2 pt-1 font-ui text-[12px] font-medium tracking-[0.02em] transition-colors sm:text-[13px] ${
                  active
                    ? "border-accent text-ink"
                    : "border-transparent text-muted hover:border-rule hover:text-ink"
                }`}
              >
                <span className="lang-bn font-bangla-ui text-[14px]" lang="bn">
                  {link.bn}
                </span>
                <span className="lang-en" lang="en">
                  {link.en}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
