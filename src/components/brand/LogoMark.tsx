import type { SVGProps } from "react";
import { SITE_NAME } from "@/config/site";

type LogoMarkProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

/**
 * The Duikul mark: a rounded-square green badge holding a geometric D.
 * The small solid circle is a quiet rising-sun nod. The badge paints with
 * currentColor; the counter-form uses the paper token.
 */
export function LogoMark({
  title = SITE_NAME,
  className,
  ...props
}: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={className}
      {...props}
    >
      <title>{title}</title>
      <rect x="1" y="1" width="62" height="62" rx="16" fill="currentColor" />
      <path
        d="M21 17v30M21 17h9.5C40.5 17 47 23.5 47 32s-6.5 15-16.5 15H21"
        fill="none"
        stroke="var(--accent-contrast)"
        strokeWidth="5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <circle cx="46" cy="17" r="4.5" fill="var(--accent-contrast)" />
    </svg>
  );
}
