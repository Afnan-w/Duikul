import { SectionGlyph } from "@/components/brand/SectionGlyph";
import type { NewsCategory } from "@/config/sources";

type StoryImageProps = {
  src: string | null;
  alt: string;
  category: NewsCategory;
  className?: string;
};

/**
 * Publisher thumbnail, deliberately a plain <img>. We do not proxy or
 * re-optimise other people's images, and Vercel's image quota stays untouched.
 * The frame reserves space so there is no layout shift while it loads.
 */
export function StoryImage({
  src,
  alt,
  category,
  className = "aspect-[16/10]",
}: StoryImageProps) {
  return (
    <div
      className={`cover-frame ${className} ${
        src ? "" : "flex items-center justify-center"
      }`}
    >
      {src ? (
        // Plain <img> is an explicit product decision: no image proxy, no
        // Vercel optimisation quota, and publisher CDNs stay untouched.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          width={1200}
          height={750}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-accent/35">
          <SectionGlyph section={category} className="h-9 w-9" />
          <span className="font-ui text-[10px] uppercase tracking-[0.16em]">
            KhoborDaily
          </span>
        </div>
      )}
    </div>
  );
}
