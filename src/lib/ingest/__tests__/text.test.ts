import { describe, expect, it } from "vitest";
import {
  characterTrigrams,
  createSummary,
  decodeHtmlEntities,
  extractText,
  extractUrlValue,
  normalizeForMatch,
  plainText,
  stripHtml,
  tokenizeForMatch,
  truncateText,
} from "../text";

describe("decodeHtmlEntities", () => {
  it("decodes named, decimal and hexadecimal entities", () => {
    expect(decodeHtmlEntities("A &amp; B &lt;C&gt; &#2476; &#x995;")).toBe(
      "A & B <C> ব ক",
    );
  });

  it("leaves unknown entities untouched", () => {
    expect(decodeHtmlEntities("&notarealentity;")).toBe("&notarealentity;");
  });
});

describe("HTML to plain text", () => {
  it("removes scripts, styles, comments and tags", () => {
    expect(
      plainText(
        "<p>Hello <strong>world</strong></p><script>alert(1)</script><!--x--><style>p{}</style>",
      ),
    ).toBe("Hello world");
  });

  it("keeps useful spacing around block elements", () => {
    expect(stripHtml("<p>One</p><p>Two</p>")).toContain("One");
    expect(plainText("<p>One</p><p>Two</p>")).toBe("One Two");
  });

  it("decodes entities after stripping tags", () => {
    expect(plainText("<p>Budget &amp; policy</p>")).toBe("Budget & policy");
  });
});

describe("Bangla-safe truncation", () => {
  it("cuts on a word boundary and never exceeds the limit", () => {
    const input =
      "বাংলাদেশের রাজনীতি নিয়ে নতুন খবর প্রকাশিত হয়েছে এবং সবাই এটি নিয়ে আলোচনা করছে";
    const result = truncateText(input, 30);
    expect(Array.from(result).length).toBeLessThanOrEqual(30);
    expect(result.endsWith("…")).toBe(true);
    expect(result).not.toMatch(/\s…$/u);
  });

  it("keeps short text unchanged", () => {
    expect(truncateText("সংক্ষিপ্ত খবর", 40)).toBe("সংক্ষিপ্ত খবর");
  });

  it("creates a summary at or below 280 characters", () => {
    const body = `<p>${"দেশের জরুরি খবর ".repeat(60)}</p>`;
    const summary = createSummary(body);
    expect(Array.from(summary).length).toBeLessThanOrEqual(280);
    expect(summary).not.toContain("<");
  });
});

describe("rss-parser shape helpers", () => {
  it("extracts text from nested namespaced titles (The Daily Star)", () => {
    expect(
      extractText({
        a: [
          {
            _: "Bangladesh, Japan sign six deals",
            $: { href: "/news/bangladesh" },
          },
        ],
      }),
    ).toBe("Bangladesh, Japan sign six deals");
  });

  it("extracts an Atom link from an attributes object", () => {
    expect(
      extractUrlValue({
        a: [
          {
            _: "Headline text",
            $: { href: "https://example.com/story" },
          },
        ],
      }),
    ).toBe("https://example.com/story");
  });

  it("extracts href from a fast-xml-parser link array", () => {
    expect(
      extractUrlValue([
        { "@_rel": "self", "@_href": "https://example.com/feed" },
        { "@_rel": "alternate", "@_href": "https://example.com/story" },
      ]),
    ).toBe("https://example.com/feed");
  });
});

describe("match normalisation", () => {
  it("lowercases, strips punctuation and numerals, keeps Bangla marks", () => {
    const normalized = normalizeForMatch(
      "২০২৬ সালে Dhaka-তে ৩টি ঘটনা! দ্রুত।",
    );
    expect(normalized).not.toMatch(/[0-9০-৯!?।,-]/u);
    expect(normalized).toContain("dhaka");
    expect(normalized).toContain("ঘটনা");
  });

  it("removes Bangla and English stopwords from the token set", () => {
    const tokens = tokenizeForMatch(
      "The government and Bangladesh এবং জনগণ আজ",
    );
    expect(tokens).not.toContain("the");
    expect(tokens).not.toContain("and");
    expect(tokens).not.toContain("এবং");
    expect(tokens).toContain("bangladesh");
  });

  it("builds character trigrams and handles very short strings", () => {
    expect(characterTrigrams("abc").size).toBe(1);
    expect(characterTrigrams("বাংলা").size).toBeGreaterThan(0);
  });

  it("folds common English inflections without touching Bangla", () => {
    const tokens = tokenizeForMatch("trains train killed kills operations");
    expect(tokens).toContain("train");
    expect(tokens).toContain("kill");
    expect(tokens).toContain("operation");
    expect(tokens).not.toContain("trains");
    expect(tokens).not.toContain("killed");

    expect(tokenizeForMatch("ট্রেন ট্রেনে")).toEqual(["ট্রেন", "ট্রেনে"]);
  });
});
