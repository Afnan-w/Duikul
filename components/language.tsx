"use client";

/*
  LANGUAGE TOGGLE
  ---------------
  Bangla is the default. The button in the header switches between
  Bangla (bn) and English (en) and remembers the choice in the browser.
  In Stage D this will also switch the page address to /bn/... and /en/...
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

  // Read the saved choice after mount (avoids a server/client mismatch).
  useEffect(() => {
    const saved = window.localStorage.getItem("duikul-lang");
    if (saved === "en" || saved === "bn") setLangState(saved);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    window.localStorage.setItem("duikul-lang", next);
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
