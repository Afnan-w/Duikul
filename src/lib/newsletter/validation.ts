/**
 * Shared, dependency-free validation for newsletter signups. Keeping it
 * outside the route means the same rules can be tested without a database.
 */
export type NewsletterLocale = "bn" | "en";
export type SignupSource = "homepage" | "footer" | "site";

const EMAIL_LOCAL_PATTERN = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i;
const EMAIL_DOMAIN_LABEL_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
const SIGNUP_SOURCES = new Set(["homepage", "footer"]);

/**
 * Returns a normalized email address or null. The rules are deliberately
 * pragmatic — enough to reject malformed input without pretending to
 * implement RFC 5322. The database still enforces a unique lower-case email.
 */
export function normalizeNewsletterEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const email = value.trim().toLowerCase();
  if (email.length < 3 || email.length > 254) return null;
  if (/[\s\u0000-\u001f\u007f]/.test(email)) return null;

  const at = email.indexOf("@");
  if (at < 1 || at !== email.lastIndexOf("@")) return null;

  const local = email.slice(0, at);
  const domain = email.slice(at + 1);

  if (local.length > 64) return null;
  if (!EMAIL_LOCAL_PATTERN.test(local)) return null;
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) {
    return null;
  }

  if (!domain || domain.length > 253 || !domain.includes(".")) return null;

  const labels = domain.split(".");
  if (labels.some((label) => !EMAIL_DOMAIN_LABEL_PATTERN.test(label))) {
    return null;
  }

  const tld = labels[labels.length - 1];
  if (!tld || tld.length < 2 || /^\d+$/.test(tld)) return null;

  return email;
}

export function parseNewsletterLocale(value: unknown): NewsletterLocale {
  return value === "en" ? "en" : "bn";
}

export function parseSignupSource(value: unknown): SignupSource {
  return typeof value === "string" && SIGNUP_SOURCES.has(value)
    ? (value as SignupSource)
    : "site";
}

/**
 * A hidden field only bots tend to fill. Whitespace-only values are treated
 * as empty so a browser autofill quirk cannot silently discard a signup.
 */
export function isHoneypotFilled(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
