import type { SVGProps } from "react";

type LogoMarkProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

/**
 * The KhoborDaily mark: a rounded-square green badge holding a geometric K.
 * The upper diagonal ends in a small solid circle — a quiet rising-sun nod.
 * The badge paints with currentColor; the counter-form uses the paper token.
 */
export function LogoMark({
  title = "KhoborDaily",
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
        d="M19.5 17v30M19.5 34.5 36 17M24.5 30.5 43 47"
        fill="none"
        stroke="var(--accent-contrast)"
        strokeWidth="5"
        strokeLinecap="square"
      />
      <circle cx="44" cy="17" r="4.5" fill="var(--accent-contrast)" />
    </svg>
  );
}
