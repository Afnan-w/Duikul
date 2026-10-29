import type { SVGProps } from "react";
import { SITE_NAME, SITE_NAME_BN } from "@/config/site";

type WordmarkProps = SVGProps<SVGSVGElement> & {
  variant?: "latin" | "bangla";
  label?: string;
};

/**
 * Typographic wordmark built as live SVG text, so it inherits the loaded
 * editorial fonts and the accent token in both colour schemes.
 */
export function Wordmark({
  variant = "latin",
  label,
  className,
  ...props
}: WordmarkProps) {
  const accessibleLabel =
    label ?? (variant === "bangla" ? SITE_NAME_BN : SITE_NAME);

  if (variant === "bangla") {
    return (
      <svg
        viewBox="0 0 120 52"
        role="img"
        aria-label={accessibleLabel}
        className={className}
        {...props}
      >
        <title>{accessibleLabel}</title>
        <text
          x="1"
          y="38"
          fontSize="36"
          fontWeight="700"
          fill="currentColor"
          style={{
            fontFamily:
              "var(--font-noto-serif-bengali), 'Noto Serif Bengali', serif",
          }}
        >
          দুই
          <tspan fill="var(--accent)" fontStyle="normal">
            কুল
          </tspan>
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 104 40"
      role="img"
      aria-label={accessibleLabel}
      className={className}
      {...props}
    >
      <title>{accessibleLabel}</title>
      <text
        x="0"
        y="29"
        fontSize="30"
        fontWeight="700"
        letterSpacing="-0.7"
        fill="currentColor"
        style={{
          fontFamily: "var(--font-source-serif), 'Source Serif 4', Georgia, serif",
        }}
      >
        Dui
        <tspan fontWeight="400" fontStyle="italic" fill="var(--accent)">
          kul
        </tspan>
      </text>
    </svg>
  );
}
