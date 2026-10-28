import { describe, expect, it } from "vitest";
import {
  canonicalizeUrl,
  canonicalUrlHash,
  hashCanonicalUrl,
  isTrackingParam,
} from "../url";

describe("canonicalizeUrl", () => {
  it("strips tracking parameters, fragments and trailing slashes", () => {
    expect(
      canonicalizeUrl(
        "https://www.prothomalo.com/bangladesh/story/12?utm_source=facebook&utm_medium=social&fbclid=abc#comments",
      ),
    ).toBe("https://www.prothomalo.com/bangladesh/story/12");
  });

  it("keeps meaningful query parameters and sorts them", () => {
    expect(canonicalizeUrl("https://example.com/news/?b=2&a=1&gclid=x")).toBe(
      "https://example.com/news?a=1&b=2",
    );
  });

  it("normalises protocol, host, default port, duplicate slashes and root", () => {
    expect(canonicalizeUrl("HTTP://Example.COM:80/a//b/")).toBe(
      "http://example.com/a/b",
    );
    expect(canonicalizeUrl("https://example.com")).toBe(
      "https://example.com/",
    );
  });

  it("resolves relative links against the publisher site", () => {
    expect(canonicalizeUrl("/news/1?utm_campaign=x", "https://example.com")).toBe(
      "https://example.com/news/1",
    );
  });

  it("is idempotent, including for Bangla paths", () => {
    const once = canonicalizeUrl(
      "https://example.com/খবর/ঢাকা?utm_source=rss",
    );
    expect(once).not.toBeNull();
    expect(canonicalizeUrl(once as string)).toBe(once);
  });

  it("rejects non-web and malformed URLs", () => {
    expect(canonicalizeUrl("javascript:alert(1)")).toBeNull();
    expect(canonicalizeUrl("mailto:news@example.com")).toBeNull();
    expect(canonicalizeUrl("/relative/only")).toBeNull();
    expect(canonicalizeUrl("")).toBeNull();
  });

  it("recognises the tracking parameters we remove", () => {
    expect(isTrackingParam("utm_content")).toBe(true);
    expect(isTrackingParam("fbclid")).toBe(true);
    expect(isTrackingParam("id")).toBe(false);
    expect(isTrackingParam("page")).toBe(false);
  });
});

describe("url hashing", () => {
  it("produces a stable 64-character SHA-256 hash", () => {
    const hash = hashCanonicalUrl("https://example.com/story/1");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hashCanonicalUrl("https://example.com/story/1")).toBe(hash);
    expect(hashCanonicalUrl("https://example.com/story/2")).not.toBe(hash);
  });

  it("hashes the canonical form, so tracking variants collide", () => {
    const a = canonicalUrlHash("https://example.com/story?utm_source=a#x");
    const b = canonicalUrlHash("https://example.com/story/?fbclid=b");
    expect(a).toBe(b);
  });

  it("returns null for an invalid URL", () => {
    expect(canonicalUrlHash("not a url")).toBeNull();
  });
});
