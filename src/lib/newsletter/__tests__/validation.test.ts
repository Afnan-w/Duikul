import { describe, expect, it } from "vitest";
import {
  isHoneypotFilled,
  normalizeNewsletterEmail,
  parseNewsletterLocale,
  parseSignupSource,
} from "@/lib/newsletter/validation";

describe("normalizeNewsletterEmail", () => {
  it("trims, lower-cases, and keeps plus tags", () => {
    expect(normalizeNewsletterEmail("  Reader+News@Example.COM ")).toBe(
      "reader+news@example.com",
    );
  });

  it("accepts a normal address with a multi-label domain", () => {
    expect(normalizeNewsletterEmail("reader@news.example.co.uk")).toBe(
      "reader@news.example.co.uk",
    );
  });

  it("rejects malformed or risky input", () => {
    for (const value of [
      undefined,
      null,
      42,
      "",
      "reader",
      "reader@example",
      "reader@.example.com",
      "reader@example..com",
      "reader @example.com",
      "reader\n@example.com",
      ".reader@example.com",
      "reader.@example.com",
      "a..b@example.com",
      "a@b.c",
      "a@b.123",
      "a@-example.com",
      "a@example-.com",
      `${"a".repeat(65)}@example.com`,
      `${"a".repeat(250)}@example.com`,
    ]) {
      expect(normalizeNewsletterEmail(value), String(value)).toBeNull();
    }
  });
});

describe("parseNewsletterLocale", () => {
  it("only enables English when explicitly requested", () => {
    expect(parseNewsletterLocale("en")).toBe("en");
    expect(parseNewsletterLocale("bn")).toBe("bn");
    expect(parseNewsletterLocale("EN")).toBe("bn");
    expect(parseNewsletterLocale(undefined)).toBe("bn");
  });
});

describe("parseSignupSource", () => {
  it("keeps the two known form placements", () => {
    expect(parseSignupSource("homepage")).toBe("homepage");
    expect(parseSignupSource("footer")).toBe("footer");
  });

  it("falls back to a neutral source for anything else", () => {
    expect(parseSignupSource("somewhere")).toBe("site");
    expect(parseSignupSource(null)).toBe("site");
  });
});

describe("isHoneypotFilled", () => {
  it("ignores empty and whitespace-only values", () => {
    expect(isHoneypotFilled("")).toBe(false);
    expect(isHoneypotFilled("   ")).toBe(false);
    expect(isHoneypotFilled(undefined)).toBe(false);
  });

  it("detects a filled hidden field", () => {
    expect(isHoneypotFilled("https://spam.example")).toBe(true);
  });
});
