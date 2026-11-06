/*
  ============================================================
  GROUPING + RANKING  (Stage C)
  ============================================================
  Two simple, explainable jobs - no AI, no paid API:

  1. GROUPING: when several outlets report the same event, their
     headlines become ONE story with a list of sources, so the
     badge can say "Reported by 3 outlets" with links.

  2. SCORING: a tiny sum that decides what ranks highest:
        more outlets  = higher
        more trusted  = higher
        more recent   = higher
     The score itself is never shown to readers - it only orders
     the lists.
*/

import type { Story } from "@/lib/rss";

/* ------------------------------------------------------------
   1a. Turning a headline into a bag of comparable words
------------------------------------------------------------- */

/*
  Words too common to prove anything (dropped before comparing).
  English function words + very common Bangla function words.
*/
const STOPWORDS = new Set([
  // English
  "the", "a", "an", "of", "to", "in", "on", "at", "by", "for", "as", "and",
  "or", "with", "from", "into", "over", "after", "before", "than", "that",
  "this", "these", "those", "is", "are", "was", "were", "be", "been", "has",
  "have", "had", "will", "would", "can", "could", "says", "said", "say",
  "not", "but", "its", "his", "her", "their", "our", "we", "he", "she", "it",
  "they", "you", "what", "who", "how", "when", "where", "why", "more",
  "most", "about", "up", "out", "off", "so", "if", "per", "via", "new",
  "top", "amid", "against", "between", "during", "under", "while", "just",
  "now", "day", "days", "year", "years", "time", "way", "ways",
  // Bangla
  "ও", "এবং", "কে", "এর", "থেকে", "নিয়ে", "জন্য", "হয়", "হলো", "হয়েছে",
  "করে", "দিয়ে", "সঙ্গে", "সহ", "যে", "তার", "তাদের", "আর", "একটি", "এই",
  "সেই", "তারা", "করছে", "বলেন", "বলে", "হয়ে", "দেয়", "পেয়ে", "যায়",
  "করেছে", "না", "কি", "কী", "কেন", "এখন", "আজ", "গিয়ে", "এসে", "হিসেবে",
  "মধ্যে", "সে", "উপর", "নিচে", "পরে", "আগে", "নেই", "আছে", "ছিল", "থাকে",
  "দেওয়া", "নিয়ে", "হচ্ছে", "হবে", "করতে", "চান", "জানান", "জানালেন",
  "দেখে", "নিয়ে", "নেয়া", "নিয়ে", "ওই", "তখন", "এরকম", "মতো", "টি", "টার",
]);

/** Minimal English plural handling: elections -> election, talks -> talk. */
function normalizeWord(word: string): string {
  if (
    word.length > 3 &&
    word.endsWith("s") &&
    !word.endsWith("ss") &&
    !word.endsWith("is") &&
    !word.endsWith("us")
  ) {
    return word.slice(0, -1);
  }
  return word;
}

/** Break a headline into its meaningful words (lowercased, deduped). */
export function tokensOf(title: string): Set<string> {
  const words = title
    .toLowerCase()
    // keep letters and numbers only (spaces out punctuation/hyphens)
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));

  return new Set(words.map(normalizeWord));
}

/** Do these two headlines look like the same event? */
function similar(a: Set<string>, b: Set<string>): boolean {
  let shared = 0;
  for (const token of a) if (b.has(token)) shared++;

  if (shared < 2) return false;

  const union = a.size + b.size - shared;
  const jaccard = shared / union;
  // Clear word overlap (e.g. 45%+ of everything said).
  if (jaccard >= 0.45) return true;
  // Or at least half of the shorter headline's words appear in the
  // other one (covers "US midterm elections: Voting gets underway"
  // vs "Polls open in closely contested US midterm elections").
  const overlap = shared / Math.min(a.size, b.size);
  return shared >= 3 && overlap >= 0.5;
}

/* ------------------------------------------------------------
   1b. Grouping
------------------------------------------------------------- */

/** Two outlets must publish within this window to be "the same story". */
const GROUP_WINDOW_MS = 12 * 60 * 60 * 1000; // 12 hours

/** Merge every member of one event into a single Story. */
function mergeGroup(group: Story[]): Story {
  // group[0] is the newest member - it becomes the story readers see.
  const primary = group[0];

  // All outlets, newest story first, each outlet listed once.
  const outlets: Story["outlets"] = [];
  const seenOutlets = new Set<string>();
  for (const story of group) {
    for (const outlet of story.outlets) {
      if (seenOutlets.has(outlet.name)) continue;
      seenOutlets.add(outlet.name);
      outlets.push(outlet);
    }
  }

  // Category: majority vote, ties go to the newest story.
  const votes = new Map<string, number>();
  for (const story of group) {
    votes.set(story.category, (votes.get(story.category) ?? 0) + 1);
  }
  let category = primary.category;
  let best = -1;
  for (const [slug, count] of votes) {
    if (count > best) {
      best = count;
      category = slug;
    }
  }

  // Picture: the newest story's, otherwise borrow any member's.
  const withImage = group.find((story) => story.imageUrl);

  return {
    ...primary,
    outlets,
    category,
    // Newest publish time wins, so the story reads as fresh as it is.
    publishedAt: group[0].publishedAt,
    imageUrl: primary.imageUrl ?? withImage?.imageUrl,
    imageCredit: primary.imageUrl ? primary.imageCredit : withImage?.imageCredit,
    // The most trusted outlet in the group represents the group.
    trust: Math.max(...group.map((story) => story.trust)) as 1 | 2 | 3,
  };
}

/**
 * Combine headlines from different outlets that describe the same
 * event. Input order does not matter; the newest story of a group
 * becomes the one readers see.
 */
export function groupStories(stories: Story[]): Story[] {
  // Newest first, so groups anchor on the freshest headline.
  const sorted = [...stories].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
  );

  const consumed = new Array<boolean>(sorted.length).fill(false);
  const result: Story[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (consumed[i]) continue;

    const anchorTokens = tokensOf(sorted[i].bn.title);
    const members: Story[] = [sorted[i]];
    const memberTokens: Set<string>[] = [anchorTokens];

    // Very short headlines are too vague to match safely - leave them alone.
    if (anchorTokens.size >= 2) {
      for (let j = i + 1; j < sorted.length; j++) {
        if (consumed[j]) continue;
        if (sorted[j].section !== sorted[i].section) continue;
        if (
          Math.abs(
            Date.parse(sorted[i].publishedAt) - Date.parse(sorted[j].publishedAt)
          ) > GROUP_WINDOW_MS
        ) {
          continue;
        }

        const candidateTokens = tokensOf(sorted[j].bn.title);
        if (candidateTokens.size < 2) continue;

        const matches = memberTokens.some(
          (existing) => existing.size >= 2 && similar(existing, candidateTokens)
        );
        if (matches) {
          consumed[j] = true;
          members.push(sorted[j]);
          memberTokens.push(candidateTokens);
        }
      }
    }

    consumed[i] = true;
    result.push(members.length === 1 ? sorted[i] : mergeGroup(members));
  }

  return result;
}

/* ------------------------------------------------------------
   2. Scoring (ranking)
------------------------------------------------------------- */

/**
 * Higher = shown first. Three ingredients, in plain words:
 *   - coverage: each ADDITIONAL outlet reporting adds 20 points
 *     (1 outlet = 0, 2 = 20, 3 = 40 ... capped at 6 outlets)
 *   - trust: the outlet's trust level from sources.ts (1-3) x 5
 *   - freshness: 30 points, fading to 0 over the first 24+ hours
 *   - decay: everything fades toward 0 as the story ages, so a
 *     three-day-old headline can never beat fresh reporting of
 *     other events. Anything older than ~2 days sinks to the bottom.
 */
export function scoreStory(story: Story, now = Date.now()): number {
  const coverage = Math.min(Math.max(story.outlets.length - 1, 0), 5) * 20;
  const trustPoints = story.trust * 5;

  const ageHours = Math.max(0, (now - Date.parse(story.publishedAt)) / 3_600_000);
  const freshness = Math.max(0, 30 - ageHours);
  const decay = Math.max(0, 1 - ageHours / 48); // gone after 2 days

  return Math.round((coverage + trustPoints + freshness) * decay * 10) / 10;
}

/** Score every story, then sort highest-first (newest breaks ties). */
export function rankStories(stories: Story[]): Story[] {
  return [...stories]
    .map((story) => ({ ...story, score: scoreStory(story) }))
    .sort(
      (a, b) =>
        (b.score ?? 0) - (a.score ?? 0) ||
        Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
    );
}
