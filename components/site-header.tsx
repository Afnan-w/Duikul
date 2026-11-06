"use client";

/*
  SITE HEADER  (sticky at the top of every page)
  ------------------------------------------------
  Contains: logo, navigation, search, language toggle,
  dark mode toggle and the A- / A+ text size control.
*/

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/language";
import { categories, navLinks, ui } from "@/lib/site";

/* Small inline icons - no icon library needed (keeps the site fast). */
function IconSearch({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function IconSun({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function IconMoon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

function IconMenu({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" aria-hidden="true" className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function IconClose({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" aria-hidden="true" className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/* One round icon button, 44x44 so every tap target meets the minimum size. */
function IconButton({
  label,
  onClick,
  children,
  active = false,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-11 w-11 place-items-center rounded-full transition-colors ${
        active
          ? "bg-accent-soft text-accent"
          : "text-fg/80 hover:bg-bg-soft hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}

export function SiteHeader() {
  const { lang, setLang } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Pick up the theme and text size the inline script already applied.
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  // Close overlays when the page changes.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  /* ---- Dark mode: one tap switches, and the choice is remembered ---- */
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    window.localStorage.setItem("duikul-theme", next ? "dark" : "light");
  }

  /* ---- Text size: small -> normal -> large ---- */
  function changeTextSize(step: 1 | -1) {
    const order = ["small", "normal", "large"];
    const current =
      document.documentElement.getAttribute("data-textsize") ?? "normal";
    let index = order.indexOf(current);
    if (index < 0) index = 1;
    index = Math.min(order.length - 1, Math.max(0, index + step));
    const value = order[index];

    if (value === "normal") {
      document.documentElement.removeAttribute("data-textsize");
    } else {
      document.documentElement.setAttribute("data-textsize", value);
    }
    window.localStorage.setItem("duikul-textsize", value);
  }

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  const textSizeButtons = (
    <div className="flex items-center gap-1" role="group" aria-label={ui.textSize[lang]}>
      <button
        type="button"
        onClick={() => changeTextSize(-1)}
        aria-label="Smaller text"
        title="Smaller text"
        className="h-11 w-11 rounded-full text-sm font-semibold text-fg/80 transition-colors hover:bg-bg-soft hover:text-fg"
      >
        A−
      </button>
      <button
        type="button"
        onClick={() => changeTextSize(1)}
        aria-label="Larger text"
        title="Larger text"
        className="h-11 w-11 rounded-full text-base font-semibold text-fg/80 transition-colors hover:bg-bg-soft hover:text-fg"
      >
        A+
      </button>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/95 backdrop-blur-sm">
      {/* Thin green rule - the editorial signature of the site */}
      <div className="h-[3px] w-full bg-accent-strong" />

      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="serif flex shrink-0 items-baseline gap-1.5 text-2xl font-bold tracking-tight text-fg"
        >
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-accent-strong" />
          Duikul
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Main" className="ml-6 hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-md px-3 py-2 text-[15px] transition-colors ${
                  active ? "text-accent" : "text-fg/75 hover:text-fg"
                }`}
              >
                {link[lang]}
                {active && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-px bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          {/* Desktop text size */}
          <div className="hidden lg:block">{textSizeButtons}</div>

          {/* Language toggle */}
          <button
            type="button"
            onClick={() => setLang(lang === "bn" ? "en" : "bn")}
            aria-label={lang === "bn" ? "Switch to English" : "বাংলায় দেখুন"}
            title={lang === "bn" ? "Switch to English" : "বাংলায় দেখুন"}
            className="h-11 rounded-full border border-line px-3 text-sm font-semibold text-fg/80 transition-colors hover:border-accent hover:text-accent"
          >
            {lang === "bn" ? "EN" : "বাং"}
          </button>

          {/* Search */}
          <IconButton
            label={ui.search[lang]}
            active={searchOpen}
            onClick={() => setSearchOpen((open) => !open)}
          >
            <IconSearch className="h-5 w-5" />
          </IconButton>

          {/* Dark mode */}
          <IconButton
            label={lang === "bn" ? "ডার্ক মোড" : "Dark mode"}
            onClick={toggleTheme}
          >
            {dark ? <IconMoon className="h-5 w-5" /> : <IconSun className="h-5 w-5" />}
          </IconButton>

          {/* Mobile menu */}
          <div className="md:hidden">
            <IconButton
              label={menuOpen ? ui.close[lang] : ui.menu[lang]}
              active={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
            </IconButton>
          </div>
        </div>
      </div>

      {/* Search row */}
      {searchOpen && (
        <div className="border-t border-line bg-bg">
          <form onSubmit={submitSearch} className="mx-auto flex max-w-6xl gap-2 px-4 py-3 sm:px-6">
            <div className="relative flex-1">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={ui.searchPlaceholder[lang]}
                aria-label={ui.search[lang]}
                className="h-11 w-full rounded-full border border-line bg-card pl-9 pr-4 text-[15px] text-fg placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="h-11 rounded-full bg-accent-strong px-5 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90"
            >
              {ui.search[lang]}
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-line bg-bg md:hidden">
          <nav aria-label="Mobile" className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center border-b border-line text-[15px] ${
                    active ? "text-accent" : "text-fg/85"
                  }`}
                >
                  {link[lang]}
                </Link>
              );
            })}

            <p className="pt-4 pb-1 text-xs font-semibold tracking-widest text-muted uppercase">
              {ui.allCategories[lang]}
            </p>
            <div className="flex flex-wrap gap-2 pb-3">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="flex min-h-11 items-center rounded-full border border-line px-4 text-sm text-fg/85"
                >
                  {category[lang]}
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-line py-2">
              <span className="text-sm text-muted">{ui.textSize[lang]}</span>
              {textSizeButtons}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
