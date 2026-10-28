import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionGlyph } from "@/components/brand/SectionGlyph";
import { Bi } from "@/components/ui/Bi";
import { sectionFor } from "@/config/sections";
import type { NewsCategory } from "@/config/sources";

type SectionHeadingProps = {
  category: NewsCategory;
  count?: number;
  showAll?: boolean;
};

export function SectionHeading({
  category,
  count,
  showAll = true,
}: SectionHeadingProps) {
  const section = sectionFor(category);

  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b-2 border-ink/75 pb-3">
      <div className="flex items-center gap-3">
        <SectionGlyph
          section={category}
          className="h-6 w-6 shrink-0 text-accent"
        />
        <h2 className="headline text-[26px] leading-tight text-ink sm:text-[30px]">
          <Bi bn={section.labelBn} en={section.labelEn} />
        </h2>
        {typeof count === "number" ? (
          <span className="meta hidden sm:inline">
            <Bi
              bn={`${count}টি প্রতিবেদন`}
              en={`${count} ${count === 1 ? "story" : "stories"}`}
            />
          </span>
        ) : null}
      </div>

      {showAll ? (
        <Link
          href={section.href}
          className="inline-flex min-h-11 items-center gap-1.5 font-ui text-[12px] font-medium text-accent"
        >
          <Bi bn="সব দেখুন" en="See all" />
          <ArrowRight size={14} strokeWidth={1.7} aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
