"use client";

/**
 * Cycles the interface language between Bangla (default) and English.
 *
 * The visible label names the *other* language: in Bangla UI it says
 * "English", in English UI it says "বাংলা". Content headlines are never
 * translated; they stay in the publisher's language.
 */
export function LanguageToggle() {
  function toggleLanguage() {
    const root = document.documentElement;
    const next = root.dataset.lang === "en" ? "bn" : "en";
    root.dataset.lang = next;
    root.lang = next;
    try {
      localStorage.setItem("kd-lang", next);
    } catch {
      // Storage may be unavailable; the current page still switches.
    }
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="tap-target inline-flex min-w-11 items-center justify-center rounded-full px-2.5 font-bangla-ui text-[13px] font-semibold text-muted transition-colors hover:bg-surface hover:text-ink"
      aria-label="Switch language / ভাষা পরিবর্তন করুন"
    >
      <span className="lang-bn" lang="en">
        English
      </span>
      <span className="lang-en" lang="bn">
        বাংলা
      </span>
    </button>
  );
}
