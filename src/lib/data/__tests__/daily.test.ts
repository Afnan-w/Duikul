import { describe, expect, it } from "vitest";
import { extractNumbers, headlinesDiffer, numbersDiffer } from "../daily";

describe("extractNumbers", () => {
  it("normalises Bangla digits and keeps decimals", () => {
    expect(extractNumbers("৪২ জন আহত, বাজার ১২.৫ শতাংশ কমেছে")).toEqual([
      "42",
      "12.5",
    ]);
  });

  it("drops thousands separators", () => {
    expect(extractNumbers("ক্ষতি ১,২৫০ কোটি টাকা")).toEqual(["1250"]);
  });
});

describe("numbersDiffer", () => {
  it("is false when both headlines quote the same figures", () => {
    expect(
      numbersDiffer(["এক কোটির বিল পাস", "এক কোটির বিল পাস করল সরকার"]),
    ).toBe(false);
  });

  it("is true when the figures disagree", () => {
    expect(numbersDiffer(["৩ নিহত", "৫ নিহত"])).toBe(true);
  });

  it("is false for a single title", () => {
    expect(numbersDiffer(["৩ নিহত"])).toBe(false);
  });
});

describe("headlinesDiffer", () => {
  it("flags overlapping wording with different numbers", () => {
    expect(headlinesDiffer(["কুয়াশায় ১০ ট্রেন বাতিল", "কুয়াশায় ১২ ট্রেন বাতিল"])).toBe(
      true,
    );
  });

  it("leaves near-identical same-number headlines alone", () => {
    expect(
      headlinesDiffer([
        "শেয়ার বাজার শুক্রবার হালকা নিম্নগামী",
        "শেয়ার বাজার শুক্রবার হালকা নিম্নগামী রইল",
      ]),
    ).toBe(false);
  });

  it("is false with fewer than two headlines", () => {
    expect(headlinesDiffer(["একমাত্র শিরোনাম"])).toBe(false);
  });
});
