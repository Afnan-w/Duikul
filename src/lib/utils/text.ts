/**
 * Normalise and bound publisher snippets. We never render more than a short
 * extract of someone else's reporting; this helper enforces that limit on the
 * server so the DOM and the page source cannot leak a longer copy.
 */
export function truncateSnippet(text: string, max = 280): string {
  if (max <= 0) return "";

  const normalized = text.replace(/\s+/g, " ").trim();
  const characters = Array.from(normalized);
  if (characters.length <= max) return normalized;

  let cut = characters.slice(0, max).join("");
  const lastSpace = cut.lastIndexOf(" ");

  // Prefer a word boundary, but never discard more than roughly a third of
  // the allowance just to avoid cutting mid-word.
  if (lastSpace > Math.floor(max * 0.66)) {
    cut = cut.slice(0, lastSpace);
  }

  return `${cut.trimEnd()}…`;
}
