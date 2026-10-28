import { describe, expect, it } from "vitest";
import { compareTitles, isSameEvent, meetsSameEvent } from "../similarity";

describe("title similarity", () => {
  it("matches English headlines about the same event", () => {
    const a =
      "Bangladesh, Japan sign six deals and pledge two loan projects";
    const b = "Bangladesh Japan sign 6 deals pledge two loan projects";
    const similarity = compareTitles(a, b);
    expect(similarity.jaccard).toBeGreaterThan(0.7);
    expect(similarity.sharedTokens).toBeGreaterThanOrEqual(5);
    expect(isSameEvent(a, b)).toBe(true);
  });

  it("matches Bangla headlines with different case markers and numerals", () => {
    const a = "বাংলাদেশ ও জাপানের মধ্যে ছয়টি চুক্তি স্বাক্ষর";
    const b = "জাপানের সঙ্গে ছয়টি চুক্তিতে স্বাক্ষর করল বাংলাদেশ";
    const similarity = compareTitles(a, b);
    expect(similarity.sharedTokens).toBeGreaterThanOrEqual(3);
    expect(isSameEvent(a, b)).toBe(true);
  });

  it("matches a fast-moving story with changing death-toll headlines", () => {
    expect(
      isSameEvent(
        "Spain: High-speed train crash kills dozens, rescue operations ongoing",
        "Death toll rises to 68 with dozens injured after high-speed train collision in Spain – latest updates",
      ),
    ).toBe(true);
    expect(
      isSameEvent(
        "Spain: High-speed train crash kills dozens, rescue operations ongoing",
        "Dozens of people killed after high-speed trains collide in central Spain",
      ),
    ).toBe(true);
  });

  it("does not match unrelated events", () => {
    expect(
      isSameEvent(
        "Bangladesh, Japan sign six deals and pledge two loan projects",
        "Australia win cricket series against India in Mumbai",
      ),
    ).toBe(false);
    expect(
      isSameEvent(
        "ঢাকায় ভয়াবহ অগ্নিকাণ্ডে পাঁচজন নিহত",
        "জাতীয় ক্রিকেট দলের নতুন কোচ নিয়োগ",
      ),
    ).toBe(false);
  });

  it("requires at least two shared significant tokens", () => {
    expect(isSameEvent("Dhaka mayor resigns", "Dhaka court opens")).toBe(false);
  });

  it("accepts very strong token overlap even when trigrams dip", () => {
    const similarity = {
      jaccard: 0.8,
      trigram: 0.3,
      combined: 0.6,
      sharedTokens: 4,
      tokenCountA: 5,
      tokenCountB: 5,
    };
    expect(meetsSameEvent(similarity, { threshold: 0.9 })).toBe(true);
  });

  it("treats numerical and punctuation variants as equal", () => {
    expect(
      isSameEvent(
        "Dhaka fire kills 5 people in Mirpur",
        "Fire in Dhaka's Mirpur kills five people",
      ),
    ).toBe(true);
  });
});
