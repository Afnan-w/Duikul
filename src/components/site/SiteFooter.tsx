import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { LogoLockup } from "@/components/brand/LogoLockup";
import { Bi } from "@/components/ui/Bi";
import {
  CONTACT_EMAIL,
  SITE_NAME,
  SITE_TAGLINE_EN,
  TRUST_PATHS,
  type SiteLocale,
} from "@/config/site";
import { dhakaDateKey } from "@/lib/utils/date";

const FOOTER_LINKS = [
  { href: "/deshi", bn: "দেশি খবর", en: "Bangladesh" },
  { href: "/bideshi", bn: "বিদেশি খবর", en: "World" },
] as const;

const TRUST_LINKS = [
  { href: "/about", bn: "আমাদের সম্পর্কে", en: "About & methodology" },
  { href: "/editorial-policy", bn: "সম্পাদকীয় নীতি", en: "Editorial policy" },
  { href: "/corrections", bn: "সংশোধনী নীতি", en: "Corrections" },
  { href: "/removal-request", bn: "অপসারণের অনুরোধ", en: "Removal request" },
  { href: "/privacy", bn: "গোপনীয়তা", en: "Privacy" },
  { href: "/terms", bn: "শর্তাবলি", en: "Terms" },
  { href: "/contact", bn: "যোগাযোগ", en: "Contact" },
] as const;

export function SiteFooter({ locale = "bn" }: { locale?: SiteLocale }) {
  // Trust pages exist in both languages; sections and briefings are shared
  // URLs, so only the bilingual routes move to the /en tree.
  const trustHref = (href: string) =>
    locale === "en" && TRUST_PATHS.includes(href) ? `/en${href}` : href;

  return (
    <footer className="no-print mt-16 border-t border-rule bg-surface/60">
      <div className="border-b border-rule">
        <div className="container-editorial flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-ui text-[15px] font-medium text-ink">
            <Bi
              bn="প্রতিদিনের সংস্করণ, সরাসরি ইনবক্সে।"
              en="The daily edition, in your inbox."
            />
          </p>
          <Link
            href="/#newsletter"
            className="tap-target inline-flex min-h-11 items-center gap-1.5 self-start rounded-full border border-accent/25 bg-accent-soft px-4 font-ui text-[12px] font-semibold text-accent transition-colors hover:border-accent/45 sm:self-auto"
          >
            <Bi bn="নিউজলেটারে যোগ দিন" en="Join the newsletter" />
            <ArrowUpRight size={15} strokeWidth={1.7} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="container-editorial grid gap-10 py-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <LogoLockup
            markClassName="h-8 w-8 text-accent"
            wordmarkClassName="h-6 w-auto text-ink"
          />
          <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-muted">
            <Bi
              bn="দেশ ও বিশ্বের জরুরি খবর, এক জায়গায়। মূল সূত্রে লিংক, স্পষ্ট সীমা, কোনো ক্লিকবেইট নয়।"
              en="The news that matters, in one place. Direct source links, clear limits, no clickbait."
            />
          </p>
          <p className="mt-4 font-ui text-[11px] uppercase tracking-[0.12em] text-muted">
            Dhaka, Bangladesh
          </p>
          <Link
            href={locale === "en" ? "/" : "/en"}
            className="mt-2 inline-flex min-h-11 items-center gap-1.5 font-ui text-[13px] font-medium text-accent underline decoration-accent/35 underline-offset-4"
          >
            <Bi bn="ইংরেজি সংস্করণ" en="বাংলা সংস্করণ" />
            <ArrowUpRight size={14} strokeWidth={1.7} aria-hidden="true" />
          </Link>
        </div>

        <div className="md:col-span-3">
          <h2 className="ui-label text-muted">
            <Bi bn="বিভাগ" en="Sections" />
          </h2>
          <ul className="mt-4 space-y-1">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center text-[15px] text-ink/90 transition-colors hover:text-accent"
                >
                  <Bi bn={link.bn} en={link.en} />
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={`/daily/${dhakaDateKey()}`}
                className="inline-flex min-h-11 items-center text-[15px] text-ink/90 transition-colors hover:text-accent"
              >
                <Bi bn="দৈনিক ব্রিফিং" en="Daily briefing" />
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h2 className="ui-label text-muted">
            <Bi bn="বিশ্বাস ও নীতি" en="Trust & policies" />
          </h2>
          <ul className="mt-4 space-y-1">
            {TRUST_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={trustHref(link.href)}
                  className="inline-flex min-h-11 items-center text-[15px] text-ink/90 transition-colors hover:text-accent"
                >
                  <Bi bn={link.bn} en={link.en} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <h2 className="ui-label text-muted">
            <Bi bn="যোগাযোগ" en="Contact" />
          </h2>
          <p className="mt-4 max-w-[30ch] text-sm leading-relaxed text-muted">
            <Bi
              bn="সংবাদ সংশোধন, সূত্র সংযোজন বা অভিযোগের জন্য আমাদের লিখুন।"
              en="Write to us for corrections, source suggestions, or complaints."
            />
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-4 inline-flex min-h-11 items-center gap-2 font-ui text-sm text-accent underline decoration-accent/40 underline-offset-4"
          >
            <Mail size={16} strokeWidth={1.6} aria-hidden="true" />
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>

      <div className="border-t border-rule">
        <div className="container-editorial flex flex-col gap-2 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="meta">
            © {new Date().getFullYear()} {SITE_NAME}. {SITE_TAGLINE_EN}
          </p>
          <p className="meta">
            <Bi
              bn="শিরোনাম ও সারমর্ম মূল প্রকাশকের। সম্পূর্ণ প্রতিবেদন তাদের সাইটে পড়ুন।"
              en="Headlines and snippets belong to the original publishers. Read full reports on their sites."
            />
          </p>
        </div>
      </div>
    </footer>
  );
}
