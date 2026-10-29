import { describe, expect, it } from "vitest";
import {
  isConfirmedCluster,
  isWithinRetention,
  mapClusterRow,
} from "../clusters";

describe("isConfirmedCluster", () => {
  it("confirms three independent sources", () => {
    expect(
      isConfirmedCluster({ distinctSourceCount: 3, trustWeightSum: 9 }),
    ).toBe(true);
  });

  it("confirms two sources only when their combined trust is high", () => {
    expect(
      isConfirmedCluster({ distinctSourceCount: 2, trustWeightSum: 9 }),
    ).toBe(true);
    expect(
      isConfirmedCluster({ distinctSourceCount: 2, trustWeightSum: 8 }),
    ).toBe(false);
  });

  it("never confirms a single source", () => {
    expect(
      isConfirmedCluster({ distinctSourceCount: 1, trustWeightSum: 5 }),
    ).toBe(false);
  });
});

describe("isWithinRetention", () => {
  const now = new Date("2026-10-29T12:00:00.000Z");

  it("keeps stories inside the 14-day window", () => {
    expect(isWithinRetention(new Date("2026-10-29T11:00:00.000Z"), now)).toBe(
      true,
    );
    expect(isWithinRetention(new Date("2026-10-15T12:00:01.000Z"), now)).toBe(
      true,
    );
  });

  it("expires stories once they pass 14 days", () => {
    expect(isWithinRetention(new Date("2026-10-15T11:59:59.000Z"), now)).toBe(
      false,
    );
  });

  it("treats an invalid date as expired", () => {
    expect(isWithinRetention(new Date("not a date"), now)).toBe(false);
  });
});

describe("mapClusterRow", () => {
  const row = {
    id: "0e0a7a5e-3a4b-4c2d-9e8f-1a2b3c4d5e6f",
    title: "বাংলাদেশ-জাপান ছয় সহযোগিতা চুক্তি স্বাক্ষর",
    summary: null,
    category: "deshi" as const,
    language: "bn" as const,
    image_url: null,
    primary_source_id: "prothom-alo",
    primary_article_url: "https://www.prothomalo.com/story",
    distinct_source_count: 2,
    trust_weight_sum: 9,
    verified_score: 11,
    popular_score: 1.25,
    editor_note: null,
    first_published_at: "2026-10-28T04:00:00.000Z",
    last_published_at: "2026-10-28T06:30:00.000Z",
  };

  it("maps database snake_case into typed, display-ready values", () => {
    const cluster = mapClusterRow(row);
    expect(cluster.summary).toBe("");
    expect(cluster.primarySourceName).toBe("প্রথম আলো");
    expect(cluster.isConfirmed).toBe(true);
    expect(cluster.isIndexable).toBe(true);
    expect(cluster.firstPublishedAt.toISOString()).toBe(
      "2026-10-28T04:00:00.000Z",
    );
  });

  it("makes a single-source cluster indexable only with an editor note", () => {
    expect(
      mapClusterRow({
        ...row,
        distinct_source_count: 1,
        trust_weight_sum: 5,
        editor_note: null,
      }).isIndexable,
    ).toBe(false);

    expect(
      mapClusterRow({
        ...row,
        distinct_source_count: 1,
        trust_weight_sum: 5,
        editor_note: "  A note from the editor.  ",
      }).isIndexable,
    ).toBe(true);
  });
});
