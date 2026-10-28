import { getSource } from "@/config/sources";
import type { NormalizedArticle } from "../types";

let sequence = 0;

/**
 * Test-only article factory. Trust, category and language come from the real
 * source whitelist so tests cannot drift from production configuration.
 */
export function makeArticle(
  sourceId: string,
  title: string,
  overrides: Partial<NormalizedArticle> = {},
): NormalizedArticle {
  const source = getSource(sourceId);
  if (!source) throw new Error(`Unknown test source: ${sourceId}`);
  sequence += 1;

  return {
    sourceId,
    title,
    summary: `Summary for ${title}`,
    url: `https://example.com/${sourceId}/${sequence}`,
    urlHash: `${sourceId}-${sequence}`.padEnd(16, "0"),
    imageUrl: null,
    publishedAt: new Date("2026-10-28T10:00:00.000Z"),
    category: source.category,
    language: source.language,
    feedPosition: 0,
    trustWeight: source.trustWeight,
    ...overrides,
  };
}
