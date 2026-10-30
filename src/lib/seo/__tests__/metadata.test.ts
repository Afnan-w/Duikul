import { describe, expect, it } from "vitest";
import { SITE_NAME, SITE_NAME_BN, SITE_URL } from "@/config/site";
import {
  MAX_DESCRIPTION_CHARS,
  MAX_TITLE_CHARS,
  absoluteUrl,
  createPageMetadata,
  formatTitle,
  truncate,
} from "../metadata";

function robotsOf(meta: ReturnType<typeof createPageMetadata>) {
  return meta.robots as Extract<typeof meta.robots, object>;
}

function ogOf(meta: ReturnType<typeof createPageMetadata>) {
  return meta.openGraph as Extract<typeof meta.openGraph, object> &
    Record<string, unknown>;
}

describe("absoluteUrl", () => {
  it("prefixes relative paths with the site origin", () => {
    expect(absoluteUrl("/about")).toBe(`${SITE_URL}/about`);
  });

  it("leaves absolute URLs untouched", () => {
    expect(absoluteUrl("https://example.com/x")).toBe("https://example.com/x");
  });

  it("normalises paths without a leading slash", () => {
    expect(absoluteUrl("about")).toBe(`${SITE_URL}/about`);
  });
});

describe("truncate", () => {
  it("keeps short strings as-is and trims whitespace", () => {
    expect(truncate("  hello  ", 10)).toBe("hello");
  });

  it("caps length and appends an ellipsis", () => {
    const out = truncate("a".repeat(200), 155);
    expect(Array.from(out).length).toBe(155);
    expect(out.endsWith("…")).toBe(true);
  });
});

describe("formatTitle", () => {
  it("appends the brand", () => {
    expect(formatTitle("Headline")).toBe(`Headline | ${SITE_NAME}`);
  });

  it("never exceeds the 60-character budget", () => {
    const out = formatTitle("ব".repeat(120));
    expect(Array.from(out).length).toBeLessThanOrEqual(MAX_TITLE_CHARS);
    expect(out.endsWith(SITE_NAME)).toBe(true);
  });
});

describe("createPageMetadata", () => {
  it("builds an absolute canonical and Bangla OG locale by default", () => {
    const meta = createPageMetadata({
      path: "/about",
      title: "আমাদের সম্পর্কে",
      description: "A description.",
    });

    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/about`);
    expect(ogOf(meta).locale).toBe("bn_BD");
    expect(ogOf(meta).siteName).toBe(SITE_NAME_BN);
    expect(robotsOf(meta).index).toBe(true);
  });

  it("emits hreflang for both languages plus x-default when provided", () => {
    const meta = createPageMetadata({
      path: "/about",
      title: "About",
      description: "A description.",
      languages: { bn: "/about", en: "/en/about" },
    });

    expect(meta.alternates?.languages).toEqual({
      bn: `${SITE_URL}/about`,
      en: `${SITE_URL}/en/about`,
      "x-default": `${SITE_URL}/about`,
    });
  });

  it("omits hreflang when only one language exists", () => {
    const meta = createPageMetadata({
      path: "/story/abc",
      title: "Story",
      description: "A description.",
      languages: { bn: "/story/abc" },
    });

    expect(meta.alternates?.languages).toBeUndefined();
  });

  it("sets English OG locale for the /en tree", () => {
    const meta = createPageMetadata({
      path: "/en",
      locale: "en",
      title: "Duikul",
      description: "English description.",
    });

    expect(ogOf(meta).locale).toBe("en_US");
    expect(ogOf(meta).siteName).toBe(SITE_NAME);
  });

  it("adds article timestamps only for the article type", () => {
    const article = createPageMetadata({
      path: "/story/abc",
      title: "Story",
      description: "A description.",
      ogType: "article",
      publishedTime: "2026-10-29T10:00:00Z",
      modifiedTime: "2026-10-29T12:00:00Z",
    });
    const website = createPageMetadata({
      path: "/about",
      title: "About",
      description: "A description.",
      publishedTime: "2026-10-29T10:00:00Z",
    });

    expect(ogOf(article).publishedTime).toBe("2026-10-29T10:00:00Z");
    expect(ogOf(article).modifiedTime).toBe("2026-10-29T12:00:00Z");
    expect(ogOf(website).publishedTime).toBeUndefined();
  });

  it("switches robots to noindex for thin pages", () => {
    const meta = createPageMetadata({
      path: "/story/thin",
      title: "Thin",
      description: "A description.",
      noindex: true,
    });

    expect(robotsOf(meta).index).toBe(false);
    expect(robotsOf(meta).googleBot).toBeUndefined();
  });

  it("trims over-long descriptions to the 155-char cap", () => {
    const meta = createPageMetadata({
      path: "/about",
      title: "About",
      description: "d".repeat(400),
    });

    expect(Array.from(String(meta.description)).length).toBe(
      MAX_DESCRIPTION_CHARS,
    );
  });
});
