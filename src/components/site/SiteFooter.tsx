import Link from "next/link";
import { Mail } from "lucide-react";
import { LogoLockup } from "@/components/brand/LogoLockup";
import { Bi } from "@/components/ui/Bi";
import { CONTACT_EMAIL, SITE_NAME, SITE_TAGLINE_EN } from "@/lib/site";

const FOOTER_LINKS = [
  { href: "/deshi", bn: "দেশি খবর", en: "Bangladesh" },
  { href: "/bideshi", bn: "বিদেশি খবর", en: "World" },
  { href: "/about", bn: "আমাদের সম্পর্কে", en: "About & methodology" },
  { href: "/privacy", bn: "গোপনীয়তা", en: "Privacy" },
] as const;

export function SiteFooter() {
  return (
    <footer className="no-print mt-16 border-t border-rule bg-surface/60">
      <div className="container-editorial grid gap-10 py-12 md:grid-cols-12">
        <div className="md:col-span-5">
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
          </ul>
        </div>

        <div className="md:col-span-4">
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
