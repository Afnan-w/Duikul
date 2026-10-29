import Link from "next/link";
import { Search } from "lucide-react";
import { LogoLockup } from "@/components/brand/LogoLockup";
import { SITE_NAME } from "@/config/site";
import { formatMastheadDate } from "@/lib/utils/date";
import { LanguageToggle } from "./LanguageToggle";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  const now = new Date();

  return (
    <header className="no-print sticky top-0 z-50 border-b border-rule bg-bg/90 backdrop-blur-[14px]">
      <div className="container-editorial">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link
            href="/"
            className="tap-target inline-flex shrink-0 items-center"
            aria-label={`${SITE_NAME} — home`}
          >
            <LogoLockup
              markClassName="h-8 w-8 text-accent"
              wordmarkClassName="h-6 w-auto text-ink"
            />
          </Link>

          <div className="flex items-center gap-0.5">
            <Link
              href="/search"
              className="tap-target inline-flex items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
              aria-label="Search / খুঁজুন"
            >
              <Search size={18} strokeWidth={1.6} aria-hidden="true" />
            </Link>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex items-end justify-between gap-4 border-t border-rule">
          <NavLinks />
          <p className="hidden shrink-0 pb-2 font-bangla-ui text-[12px] text-muted lg:block">
            {formatMastheadDate(now, "bn")}
          </p>
        </div>
      </div>
    </header>
  );
}
