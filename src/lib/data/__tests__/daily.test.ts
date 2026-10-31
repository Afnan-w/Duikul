import { describe, expect, it } from "vitest";
import {
  extractNumbers,
  groupBriefingDays,
  headlinesDiffer,
  numbersDiffer,
} from "../daily";

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

describe("groupBriefingDays", () => {
  const row = (first: string, last = first) => ({
    firstPublishedAt: new Date(first),
    lastPublishedAt: new Date(last),
  });

  it("keeps only days with at least five clustered stories", () => {
    const rows = [
      row("2026-10-30T08:00:00+06:00"),
      row("2026-10-30T09:00:00+06:00"),
      row("2026-10-30T10:00:00+06:00"),
      row("2026-10-30T11:00:00+06:00"),
      row("2026-10-30T12:00:00+06:00"),
      // Only three stories: that day's briefing is not indexable.
      row("2026-10-29T08:00:00+06:00"),
      row("2026-10-29T09:00:00+06:00"),
      row("2026-10-29T10:00:00+06:00"),
    ];

    const days = groupBriefingDays(rows, { today: "2026-10-30" });
    expect(days.map((day) => day.date)).toEqual(["2026-10-30"]);
  });

  it("uses the latest modification within the day as lastmod", () => {
    const rows = [
      row("2026-10-30T08:00:00+06:00", "2026-10-30T08:10:00+06:00"),
      row("2026-10-30T09:00:00+06:00", "2026-10-30T15:45:00+06:00"),
      row("2026-10-30T10:00:00+06:00", "2026-10-30T11:00:00+06:00"),
      row("2026-10-30T11:00:00+06:00"),
      row("2026-10-30T12:00:00+06:00"),
    ];

    const [day] = groupBriefingDays(rows, { today: "2026-10-30" });
    expect(day.lastModified).toEqual(
      new Date("2026-10-30T15:45:00+06:00"),
    );
  });

  it("never lists future-dated days, which the daily page 404s", () => {
    const rows = [
      row("2026-11-02T08:00:00+06:00"),
      row("2026-11-02T09:00:00+06:00"),
      row("2026-11-02T10:00:00+06:00"),
      row("2026-11-02T11:00:00+06:00"),
      row("2026-11-02T12:00:00+06:00"),
    ];

    expect(groupBriefingDays(rows, { today: "2026-10-30" })).toEqual([]);
  });

  it("returns days newest first", () => {
    const rows = [
      row("2026-10-28T08:00:00+06:00"),
      row("2026-10-28T09:00:00+06:00"),
      row("2026-10-28T10:00:00+06:00"),
      row("2026-10-28T11:00:00+06:00"),
      row("2026-10-28T12:00:00+06:00"),
      row("2026-10-30T08:00:00+06:00"),
      row("2026-10-30T09:00:00+06:00"),
      row("2026-10-30T10:00:00+06:00"),
      row("2026-10-30T11:00:00+06:00"),
      row("2026-10-30T12:00:00+06:00"),
    ];

    expect(
      groupBriefingDays(rows, { today: "2026-10-30" }).map((d) => d.date),
    ).toEqual(["2026-10-30", "2026-10-28"]);
  });

  it("honours a custom threshold", () => {
    const rows = [
      row("2026-10-30T08:00:00+06:00"),
      row("2026-10-30T09:00:00+06:00"),
    ];
    expect(
      groupBriefingDays(rows, { today: "2026-10-30", minStories: 2 }),
    ).toHaveLength(1);
    expect(groupBriefingDays(rows, { today: "2026-10-30" })).toHaveLength(0);
  });
});
