import { INGEST_CONFIG } from "@/config/ingest";
import {
  characterTrigrams,
  diceSimilarity,
  jaccardSimilarity,
  setIntersectionSize,
  tokenSet,
} from "./text";

export type TitleSimilarity = {
  /** Token-set Jaccard over normalised, stopword-free words. */
  jaccard: number;
  /** Character-trigram Dice coefficient. Tolerant of inflection/spelling. */
  trigram: number;
  /** 0.6 * jaccard + 0.4 * trigram. */
  combined: number;
  sharedTokens: number;
  tokenCountA: number;
  tokenCountB: number;
};

export function compareTitles(a: string, b: string): TitleSimilarity {
  const tokensA = tokenSet(a);
  const tokensB = tokenSet(b);
  const jaccard = jaccardSimilarity(tokensA, tokensB);
  const trigram = diceSimilarity(
    characterTrigrams(a),
    characterTrigrams(b),
  );

  return {
    jaccard,
    trigram,
    combined: jaccard * 0.6 + trigram * 0.4,
    sharedTokens: setIntersectionSize(tokensA, tokensB),
    tokenCountA: tokensA.size,
    tokenCountB: tokensB.size,
  };
}

export type SameEventOptions = {
  threshold?: number;
  looseThreshold?: number;
  looseSharedTokens?: number;
  minSharedTokens?: number;
  strongJaccard?: number;
};

export function meetsSameEvent(
  similarity: TitleSimilarity,
  options: SameEventOptions = {},
): boolean {
  const threshold = options.threshold ?? INGEST_CONFIG.clusterThreshold;
  const looseThreshold =
    options.looseThreshold ?? INGEST_CONFIG.clusterLooseThreshold;
  const looseShared =
    options.looseSharedTokens ?? INGEST_CONFIG.clusterLooseSharedTokens;
  const minShared =
    options.minSharedTokens ?? INGEST_CONFIG.clusterMinSharedTokens;
  const strongJaccard =
    options.strongJaccard ?? INGEST_CONFIG.clusterStrongJaccard;

  const smallestTokenCount = Math.min(
    similarity.tokenCountA,
    similarity.tokenCountB,
  );
  const requiredShared = Math.min(minShared, smallestTokenCount);
  if (requiredShared > 0 && similarity.sharedTokens < requiredShared) {
    return false;
  }

  if (similarity.combined >= threshold) return true;
  if (
    similarity.sharedTokens >= looseShared &&
    similarity.combined >= looseThreshold
  ) {
    return true;
  }
  return similarity.jaccard >= strongJaccard && similarity.trigram >= 0.28;
}

/**
 * Two headlines describe the same event when they share meaningful words and
 * clear character-level overlap. Thresholds are intentionally explicit; a
 * future editor can read this function and understand every decision.
 */
export function isSameEvent(
  a: string,
  b: string,
  options: SameEventOptions = {},
): boolean {
  return meetsSameEvent(compareTitles(a, b), options);
}

