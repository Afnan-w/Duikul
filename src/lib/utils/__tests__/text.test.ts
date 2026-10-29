import { describe, expect, it } from "vitest";
import { truncateSnippet } from "../text";

describe("truncateSnippet", () => {
  it("leaves short snippets untouched apart from whitespace normalisation", () => {
    expect(truncateSnippet("  A short\nreport.  ")).toBe("A short report.");
  });

  it("cuts long snippets at a word boundary and adds an ellipsis", () => {
    const text = "word ".repeat(100);
    const result = truncateSnippet(text, 40);

    expect(Array.from(result).length).toBeLessThanOrEqual(41);
    expect(result.endsWith("…")).toBe(true);
    expect(result.includes("  ")).toBe(false);
  });

  it("counts Bangla characters rather than UTF-16 code units", () => {
    const text = "খবর ".repeat(100);
    const result = truncateSnippet(text, 30);

    expect(Array.from(result).length).toBeLessThanOrEqual(31);
    expect(result.endsWith("…")).toBe(true);
  });

  it("returns an empty string for a non-positive limit", () => {
    expect(truncateSnippet("anything", 0)).toBe("");
  });
});
