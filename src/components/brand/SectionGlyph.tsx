import type { SVGProps } from "react";

type SectionGlyphProps = SVGProps<SVGSVGElement> & {
  section: "deshi" | "bideshi";
  title?: string;
};

/**
 * Small line glyphs: a delta-river mark for Bangladesh, a meridian globe for
 * the world. One shared 1.5px stroke language.
 */
export function SectionGlyph({
  section,
  title,
  className,
  ...props
}: SectionGlyphProps) {
  if (section === "deshi") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        role={title ? "img" : undefined}
        aria-label={title}
        aria-hidden={title ? undefined : true}
        className={className}
        {...props}
      >
        {title ? <title>{title}</title> : null}
        <path d="M3 6.5c3.2 1.8 5.8 5.2 7 9.5" />
        <path d="M8 4.5c3.1 2.2 5.8 6 7 11" />
        <path d="M13.5 4c2.7 2.3 5 5.9 6.3 10.2" />
        <path d="M3 18.5h18" opacity=".45" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c3 3.1 3 14.9 0 18-3-3.1-3-14.9 0-18Z" />
      <path d="M5.4 6.5c3.4 1.8 10.3 1.8 13.2 0" opacity=".55" />
      <path d="M5.4 17.5c3.4-1.8 10.3-1.8 13.2 0" opacity=".55" />
    </svg>
  );
}
