import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { Bi } from "@/components/ui/Bi";
import { JsonLd } from "@/components/seo/JsonLd";
import type { SiteLocale } from "@/config/site";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";

export type BreadcrumbItem = {
  /** Bilingual label; the JSON-LD `name` uses the page's `locale`. */
  bn: string;
  en: string;
  /** Site path. Always present, because it is also the JSON-LD item URL. */
  path: string;
  /** Marks the last crumb: rendered as plain text, never as a link. */
  current?: boolean;
  icon?: ReactNode;
  /**
   * Raw node rendered instead of the bilingual label. Use it for content text
   * (a headline) that must stay in its own language, per the `Bi` rule.
   */
  node?: ReactNode;
  /** Tooltip for long current-page titles (story headlines). */
  title?: string;
  /** Class override for a `current` crumb. */
  className?: string;
};

type BreadcrumbsProps = {
  items: readonly BreadcrumbItem[];
  /** Language of this page's JSON-LD names. Defaults to Bangla. */
  locale?: SiteLocale;
  /**
   * Set to `false` on `noindex` pages: thin stories and briefings must emit no
   * structured data at all.
   */
  structured?: boolean;
};

const LINK_CLASS = "inline-flex min-h-11 items-center gap-1.5 hover:text-ink";
const CURRENT_CLASS = "inline-flex min-h-11 items-center gap-1.5 text-ink/80";

/**
 * Visible breadcrumb trail plus the matching `BreadcrumbList` JSON-LD, so the
 * on-page trail and the structured data can never drift apart. Every indexable
 * page is reachable through this trail from the home page.
 */
export function Breadcrumbs({
  items,
  locale = "bn",
  structured = true,
}: BreadcrumbsProps) {
  const jsonLd = structured
    ? breadcrumbJsonLd(
        items.map((item) => ({ name: item[locale], path: item.path })),
      )
    : null;

  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <nav
        aria-label="Breadcrumb"
        className="mt-5 flex flex-wrap items-center gap-2 font-ui text-[12px] text-muted"
      >
        {items.map((item, index) => (
          <Fragment key={`${item.path}-${index}`}>
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.current ? (
              <span
                aria-current="page"
                title={item.title}
                className={item.className ?? CURRENT_CLASS}
              >
                {item.icon}
                {item.node ?? <Bi bn={item.bn} en={item.en} />}
              </span>
            ) : (
              <Link href={item.path} className={LINK_CLASS}>
                {item.icon}
                <Bi bn={item.bn} en={item.en} />
              </Link>
            )}
          </Fragment>
        ))}
      </nav>
    </>
  );
}
