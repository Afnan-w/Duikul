import { describe, expect, it } from "vitest";
import {
  clusterArticles,
  mergeSimilarClusters,
  touchedClusters,
  type ClusterSeed,
  type WorkingCluster,
} from "../cluster";
import type { NormalizedArticle } from "../types";
import { makeArticle } from "./factory";

const NOW = new Date("2026-10-28T12:00:00.000Z");
const at = (hoursAgo: number) =>
  new Date(NOW.getTime() - hoursAgo * 3_600_000);

describe("clusterArticles", () => {
  it("clusters the same English event across two outlets", () => {
    const clusters = clusterArticles(
      [
        makeArticle(
          "the-daily-star",
          "Bangladesh, Japan sign six deals and pledge two loan projects",
          { publishedAt: at(2) },
        ),
        makeArticle(
          "dhaka-tribune",
          "Bangladesh Japan sign 6 deals pledge two loan projects",
          { publishedAt: at(1) },
        ),
      ],
      [],
      { now: NOW },
    );

    expect(clusters).toHaveLength(1);
    expect(clusters[0].articles).toHaveLength(2);
    expect(new Set(clusters[0].articles.map((a) => a.sourceId)).size).toBe(2);
  });

  it("clusters the same Bangla event across two outlets", () => {
    const clusters = clusterArticles(
      [
        makeArticle(
          "prothom-alo",
          "বাংলাদেশ ও জাপানের মধ্যে ছয়টি চুক্তি স্বাক্ষর",
          { publishedAt: at(2) },
        ),
        makeArticle(
          "samakal",
          "জাপানের সঙ্গে ছয়টি চুক্তিতে স্বাক্ষর করল বাংলাদেশ",
          { publishedAt: at(1) },
        ),
      ],
      [],
      { now: NOW },
    );

    expect(clusters).toHaveLength(1);
    expect(clusters[0].category).toBe("deshi");
    expect(clusters[0].language).toBe("bn");
  });

  it("keeps unrelated events apart", () => {
    const clusters = clusterArticles(
      [
        makeArticle(
          "the-daily-star",
          "Bangladesh, Japan sign six deals and pledge two loan projects",
          { publishedAt: at(2) },
        ),
        makeArticle(
          "the-daily-star",
          "Australia win cricket series against India in Mumbai",
          { publishedAt: at(1), url: "https://example.com/cricket" },
        ),
      ],
      [],
      { now: NOW },
    );

    expect(clusters).toHaveLength(2);
  });

  it("does not cluster across languages", () => {
    const clusters = clusterArticles(
      [
        makeArticle(
          "the-daily-star",
          "Bangladesh, Japan sign six deals and pledge two loan projects",
          { publishedAt: at(2) },
        ),
        makeArticle(
          "prothom-alo",
          "জাপানের সঙ্গে ছয়টি চুক্তি স্বাক্ষর করল বাংলাদেশ",
          { publishedAt: at(1) },
        ),
      ],
      [],
      { now: NOW },
    );

    expect(clusters).toHaveLength(2);
    expect(new Set(clusters.map((cluster) => cluster.language))).toEqual(
      new Set(["en", "bn"]),
    );
  });

  it("joins an existing cluster instead of creating a duplicate", () => {
    const seed: ClusterSeed = {
      id: "cluster-stable-id",
      title: "Bangladesh, Japan sign six deals and pledge two loan projects",
      category: "deshi",
      language: "en",
      firstPublishedAt: at(3),
      lastPublishedAt: at(3),
    };

    const clusters = clusterArticles(
      [
        makeArticle(
          "dhaka-tribune",
          "Bangladesh Japan sign 6 deals pledge two loan projects",
          { publishedAt: at(1) },
        ),
      ],
      [seed],
      { now: NOW },
    );

    expect(clusters).toHaveLength(1);
    expect(clusters[0].id).toBe("cluster-stable-id");
    expect(clusters[0].articles).toHaveLength(1);
  });

  it("does not join a cluster outside the event window", () => {
    const seed: ClusterSeed = {
      id: "old-cluster",
      title: "Bangladesh, Japan sign six deals and pledge two loan projects",
      category: "deshi",
      language: "en",
      firstPublishedAt: at(40),
      lastPublishedAt: at(40),
    };

    const clusters = clusterArticles(
      [
        makeArticle(
          "dhaka-tribune",
          "Bangladesh Japan sign 6 deals pledge two loan projects",
          { publishedAt: at(1) },
        ),
      ],
      [seed],
      { now: NOW },
    );

    expect(clusters).toHaveLength(2);
    expect(clusters.filter((cluster) => cluster.articles.length > 0)).toHaveLength(
      1,
    );
  });

  it("is deterministic regardless of input order", () => {
    const a = makeArticle(
      "the-daily-star",
      "Bangladesh, Japan sign six deals and pledge two loan projects",
      { publishedAt: at(2) },
    );
    const b = makeArticle(
      "dhaka-tribune",
      "Bangladesh Japan sign 6 deals pledge two loan projects",
      { publishedAt: at(1) },
    );
    const c = makeArticle(
      "the-business-standard",
      "Bangladesh and Japan sign six agreements, pledge loan projects",
      { publishedAt: at(3) },
    );

    const first = clusterArticles([a, b, c], [], { now: NOW });
    const second = clusterArticles([c, b, a], [], { now: NOW });

    expect(first).toHaveLength(1);
    expect(first[0].articles.map((article) => article.urlHash)).toEqual(
      second[0].articles.map((article) => article.urlHash),
    );
  });

  it("returns only clusters touched by new articles", () => {
    const clusters = clusterArticles(
      [
        makeArticle(
          "the-daily-star",
          "Bangladesh, Japan sign six deals and pledge two loan projects",
          { publishedAt: at(2) },
        ),
      ],
      [
        {
          id: "untouched",
          title: "Some older event",
          category: "bideshi",
          language: "en",
          firstPublishedAt: at(30),
          lastPublishedAt: at(30),
        },
      ],
      { now: NOW },
    );

    expect(clusters).toHaveLength(2);
    expect(touchedClusters(clusters)).toHaveLength(1);
    expect(touchedClusters(clusters)[0].id).toBeNull();
  });
});

function workingCluster(
  articles: NormalizedArticle[],
  overrides: Partial<WorkingCluster> = {},
): WorkingCluster {
  return {
    id: null,
    title: articles[0].title,
    titleVariants: articles.map((article) => article.title),
    category: articles[0].category,
    language: articles[0].language,
    articles,
    firstPublishedAt: new Date(
      Math.min(...articles.map((article) => article.publishedAt.getTime())),
    ),
    lastPublishedAt: new Date(
      Math.max(...articles.map((article) => article.publishedAt.getTime())),
    ),
    ...overrides,
  };
}

describe("mergeSimilarClusters", () => {
  it("merges two new clusters about the same fast-moving event", () => {
    const first = workingCluster(
      [
        makeArticle(
          "dw",
          "Spain: High-speed train crash kills dozens, rescue operations ongoing",
          { publishedAt: at(3) },
        ),
      ],
    );
    const second = workingCluster(
      [
        makeArticle(
          "al-jazeera",
          "Spain high-speed train collision kills 64, injures over 100",
          { publishedAt: at(1) },
        ),
      ],
    );

    const merged = mergeSimilarClusters([first, second]);
    expect(merged).toHaveLength(1);
    expect(merged[0].articles).toHaveLength(2);
    expect(new Set(merged[0].articles.map((a) => a.sourceId))).toEqual(
      new Set(["dw", "al-jazeera"]),
    );
  });

  it("keeps unrelated clusters apart", () => {
    const first = workingCluster([
      makeArticle(
        "dw",
        "Spain: High-speed train crash kills dozens, rescue operations ongoing",
        { publishedAt: at(3) },
      ),
    ]);
    const second = workingCluster([
      makeArticle(
        "al-jazeera",
        "Australia win cricket series against India in Mumbai",
        { publishedAt: at(1) },
      ),
    ]);

    expect(mergeSimilarClusters([first, second])).toHaveLength(2);
  });

  it("never merges two established clusters", () => {
    const first = workingCluster(
      [
        makeArticle(
          "dw",
          "Spain: High-speed train crash kills dozens, rescue operations ongoing",
          { publishedAt: at(3) },
        ),
      ],
      { id: "cluster-a" },
    );
    const second = workingCluster(
      [
        makeArticle(
          "al-jazeera",
          "Spain high-speed train collision kills 64, injures over 100",
          { publishedAt: at(1) },
        ),
      ],
      { id: "cluster-b" },
    );

    const merged = mergeSimilarClusters([first, second]);
    expect(merged).toHaveLength(2);
    expect(new Set(merged.map((cluster) => cluster.id))).toEqual(
      new Set(["cluster-a", "cluster-b"]),
    );
  });

  it("merges a new cluster into an established one and keeps its id", () => {
    const seed = workingCluster(
      [
        makeArticle(
          "dw",
          "Spain: High-speed train crash kills dozens, rescue operations ongoing",
          { publishedAt: at(3) },
        ),
      ],
      { id: "stable-cluster" },
    );
    const fresh = workingCluster([
      makeArticle(
        "al-jazeera",
        "Spain high-speed train collision kills 64, injures over 100",
        { publishedAt: at(1) },
      ),
    ]);

    const merged = mergeSimilarClusters([seed, fresh]);
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe("stable-cluster");
    expect(merged[0].articles).toHaveLength(2);
  });
});
