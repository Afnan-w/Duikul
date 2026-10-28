import { describe, expect, it } from "vitest";
import { choosePrimaryArticle, computeClusterMetrics } from "../score";
import type { ScorableArticle } from "../score";

const NOW = new Date("2026-10-28T12:00:00.000Z");

function article(
  sourceId: string,
  trustWeight: number,
  hoursAgo: number,
  feedPosition = 0,
): ScorableArticle {
  return {
    sourceId,
    trustWeight,
    feedPosition,
    publishedAt: new Date(NOW.getTime() - hoursAgo * 3_600_000),
  };
}

describe("cluster scoring", () => {
  it("confirms a story carried by three independent sources", () => {
    const metrics = computeClusterMetrics(
      [article("a", 5, 2), article("b", 4, 2), article("c", 4, 2)],
      NOW,
    );
    expect(metrics.distinctSourceCount).toBe(3);
    expect(metrics.trustWeightSum).toBe(13);
    expect(metrics.verifiedScore).toBe(16);
    expect(metrics.isConfirmed).toBe(true);
    expect(metrics.isVisible).toBe(true);
  });

  it("confirms two sources when their combined trust is high", () => {
    const metrics = computeClusterMetrics(
      [article("a", 5, 2), article("b", 5, 2)],
      NOW,
    );
    expect(metrics.isConfirmed).toBe(true);
  });

  it("does not confirm two mid-trust sources", () => {
    const metrics = computeClusterMetrics(
      [article("a", 4, 2), article("b", 3, 2)],
      NOW,
    );
    expect(metrics.isConfirmed).toBe(false);
    expect(metrics.isVisible).toBe(true);
  });

  it("counts a source only once even if it published several articles", () => {
    const metrics = computeClusterMetrics(
      [article("a", 5, 2), article("a", 5, 1), article("b", 4, 2)],
      NOW,
    );
    expect(metrics.distinctSourceCount).toBe(2);
    expect(metrics.trustWeightSum).toBe(9);
  });

  it("shows single-source stories only from trusted outlets", () => {
    const trusted = computeClusterMetrics([article("a", 4, 1)], NOW);
    const untrusted = computeClusterMetrics([article("a", 3, 1)], NOW);
    expect(trusted.isVisible).toBe(true);
    expect(untrusted.isVisible).toBe(false);
  });

  it("decays with age", () => {
    const fresh = computeClusterMetrics([article("a", 5, 1)], NOW);
    const older = computeClusterMetrics([article("a", 5, 25)], NOW);
    expect(fresh.popularScore).toBeGreaterThan(older.popularScore);
  });

  it("rewards a better feed position", () => {
    const top = computeClusterMetrics([article("a", 4, 2, 0)], NOW);
    const deep = computeClusterMetrics([article("a", 4, 2, 25)], NOW);
    expect(top.popularScore).toBeGreaterThan(deep.popularScore);
  });
});

describe("choosePrimaryArticle", () => {
  it("prefers trust, then the earliest report", () => {
    const early = { ...article("early", 4, 5), title: "Early" };
    const trusted = { ...article("trusted", 5, 4), title: "Trusted" };
    const late = { ...article("late", 4, 1), title: "Late" };
    expect(choosePrimaryArticle([early, late, trusted])?.sourceId).toBe(
      "trusted",
    );

    const earlyTrusted = { ...article("a", 5, 6), title: "First" };
    const lateTrusted = { ...article("b", 5, 2), title: "Second" };
    expect(choosePrimaryArticle([lateTrusted, earlyTrusted])?.sourceId).toBe(
      "a",
    );
  });

  it("returns null for an empty cluster", () => {
    expect(choosePrimaryArticle([])).toBeNull();
  });
});
