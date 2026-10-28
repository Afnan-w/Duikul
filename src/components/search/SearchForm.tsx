import Link from "next/link";
import { Search } from "lucide-react";
import { Bi } from "@/components/ui/Bi";
import type { NewsCategory } from "@/config/sources";

type SearchFormProps = {
  query: string;
  category?: NewsCategory;
};

/**
 * Plain GET form: search works without JavaScript, keeps the current section
 * filter, and is easy to share as a URL.
 */
export function SearchForm({ query, category }: SearchFormProps) {
  return (
    <form action="/search" method="get" role="search" className="mt-8">
      {category ? (
        <input type="hidden" name="section" value={category} />
      ) : null}

      <label htmlFor="search-q" className="ui-label block text-muted">
        <Bi bn="শব্দ বা বাক্যাংশ" en="Word or phrase" />
      </label>

      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search
            size={18}
            strokeWidth={1.6}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            id="search-q"
            name="q"
            type="search"
            defaultValue={query}
            minLength={2}
            maxLength={80}
            autoComplete="off"
            enterKeyHint="search"
            placeholder="যেমন: নির্বাচন · e.g. Spain"
            className="h-12 w-full rounded-full border border-rule bg-bg pl-11 pr-4 font-ui text-[15px] text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <button
          type="submit"
          className="tap-target inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-accent px-6 font-ui text-[13px] font-semibold text-accent-contrast transition-opacity hover:opacity-90"
        >
          <Bi bn="খুঁজুন" en="Search" />
        </button>
      </div>

      <p className="meta mt-3">
        <Bi
          bn="কমপক্ষে দুই অক্ষর লিখুন। শিরোনাম ও সারমর্মে খোঁজা হয়।"
          en="Use at least two characters. We search headlines and snippets."
        />
      </p>
    </form>
  );
}

type SearchSectionFilterProps = {
  query: string;
  active?: NewsCategory;
};

const FILTERS: Array<{
  value?: NewsCategory;
  bn: string;
  en: string;
}> = [
  { bn: "সব বিভাগ", en: "All sections" },
  { value: "deshi", bn: "দেশি খবর", en: "Bangladesh" },
  { value: "bideshi", bn: "বিদেশি খবর", en: "World" },
];

/** Section chips are links so filtering also works without JavaScript. */
export function SearchSectionFilter({ query, active }: SearchSectionFilterProps) {
  const hrefFor = (value?: NewsCategory) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (value) params.set("section", value);
    const search = params.toString();
    return search ? `/search?${search}` : "/search";
  };

  return (
    <nav aria-label="Filter search results" className="mt-5">
      <ul className="flex flex-wrap items-center gap-2">
        {FILTERS.map((filter) => {
          const isActive = filter.value === active;
          return (
            <li key={filter.value ?? "all"}>
              <Link
                href={hrefFor(filter.value)}
                aria-current={isActive ? "page" : undefined}
                className={`chip min-h-11 border px-3.5 transition-colors ${
                  isActive
                    ? "border-accent/25 bg-accent-soft text-accent"
                    : "border-rule bg-surface text-muted hover:text-ink"
                }`}
              >
                <Bi bn={filter.bn} en={filter.en} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
