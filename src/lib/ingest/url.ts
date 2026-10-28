import { createHash } from "node:crypto";

/**
 * Query parameters that only track the reader. Never remove parameters that
 * can identify a story (`id`, `p`, `story`, `output`, pagination, etc.).
 */
const TRACKING_PARAM_PATTERNS: readonly RegExp[] = [
  /^utm_/i,
  /^ga_/i,
  /^pk_/i,
  /^mtm_/i,
  /^fbclid$/i,
  /^gclid$/i,
  /^dclid$/i,
  /^gbraid$/i,
  /^wbraid$/i,
  /^msclkid$/i,
  /^yclid$/i,
  /^twclid$/i,
  /^igshid$/i,
  /^mc_cid$/i,
  /^mc_eid$/i,
  /^_ga$/i,
  /^_gl$/i,
  /^ref_src$/i,
  /^cmpid$/i,
  /^ocid$/i,
  /^s_cid$/i,
  /^at_medium$/i,
  /^at_campaign$/i,
  /^at_custom\d$/i,
  /^spm$/i,
  /^share$/i,
];

export function isTrackingParam(name: string): boolean {
  return TRACKING_PARAM_PATTERNS.some((pattern) => pattern.test(name));
}

/**
 * Canonical article URL:
 *  - http(s) only
 *  - lower-case protocol + host, default port removed
 *  - fragment removed
 *  - tracking parameters removed, remaining parameters sorted
 *  - duplicate slashes collapsed, trailing slash removed (except root)
 *
 * Returns `null` for anything that is not a usable web URL.
 */
export function canonicalizeUrl(input: string, base?: string): string | null {
  const raw = input?.trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = base ? new URL(raw, base) : new URL(raw);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (!url.hostname) return null;

  url.protocol = url.protocol.toLowerCase();
  url.hostname = url.hostname.toLowerCase();
  url.hash = "";

  if (
    (url.protocol === "http:" && url.port === "80") ||
    (url.protocol === "https:" && url.port === "443")
  ) {
    url.port = "";
  }

  const params: [string, string][] = [];
  for (const [name, value] of url.searchParams.entries()) {
    if (!isTrackingParam(name)) params.push([name, value]);
  }
  params.sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
  url.search = new URLSearchParams(params).toString();

  let pathname = url.pathname.replace(/\/{2,}/g, "/");
  if (pathname.length > 1) pathname = pathname.replace(/\/+$/, "");
  url.pathname = pathname || "/";

  return url.toString();
}

/** Stable SHA-256 of the canonical URL, used as the database uniqueness key. */
export function hashCanonicalUrl(canonicalUrl: string): string {
  return createHash("sha256").update(canonicalUrl, "utf8").digest("hex");
}

/** Canonicalise then hash. Returns null when the URL cannot be used. */
export function canonicalUrlHash(input: string, base?: string): string | null {
  const canonical = canonicalizeUrl(input, base);
  return canonical ? hashCanonicalUrl(canonical) : null;
}
