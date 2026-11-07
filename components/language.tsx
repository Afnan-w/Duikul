"use client";

/*
  LANGUAGE TOGGLE
  ---------------
  Bangla is the default. The button in the header switches between
  Bangla (bn) and English (en) and remembers the choice in the browser.

  Two SEO-relevant behaviours live here as well:
  1. The <html lang="..."> attribute follows the toggle.
  2. /?lang=deep links work: every page honours ?lang=en|bn, and
     toggling updates the address, so the hreflang targets (…?lang=en)
     really show English.
*/

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "bn" | "en";

type LangValue = { lang: Lang; setLang: (l: Lang) => void };

const LanguageContext = createContext<LangValue>({
  lang: "bn",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("bn");

  // Read the saved choice / deep link after mount (avoids a
  // server/client mismatch - the server always SSRs Bangla first).
  useEffect(() => {
    const urlLang = new URLSearchParams(window.location.search).get("lang");
    const saved = window.localStorage.getItem("duikul-lang");
    const initial: Lang =
      urlLang === "en" || urlLang === "bn"
        ? urlLang
        : saved === "en"
          ? "en"
          : "bn";

    setLangState(initial);
    document.documentElement.lang = initial;
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    window.localStorage.setItem("duikul-lang", next);
    document.documentElement.lang = next;

    // Keep the address in sync: ?lang=en for English, clean URL for Bangla.
    try {
      const url = new URL(window.location.href);
      if (next === "bn") {
        url.searchParams.delete("lang");
      } else {
        url.searchParams.set("lang", next);
      }
      window.history.replaceState(null, "", url.toString());
    } catch {
      // Address could not be rewritten - the toggle still works.
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
