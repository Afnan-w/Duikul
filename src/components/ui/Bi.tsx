import type { ReactNode } from "react";

type BiProps = {
  bn: ReactNode;
  en: ReactNode;
  /** Extra classes applied to both language spans. */
  className?: string;
};

/**
 * Renders both UI languages once. `html[data-lang]` CSS reveals the active
 * one, so there is no hydration mismatch and no client dictionary download.
 * Keep content text (headlines, summaries) in its original language instead;
 * this component is for interface labels only.
 */
export function Bi({ bn, en, className }: BiProps) {
  return (
    <>
      <span className={`lang-bn ${className ?? ""}`} lang="bn">
        {bn}
      </span>
      <span className={`lang-en ${className ?? ""}`} lang="en">
        {en}
      </span>
    </>
  );
}
