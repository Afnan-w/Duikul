import { createHmac } from "node:crypto";

/**
 * Best-effort client IP for rate limiting. Vercel sets `x-real-ip`; other
 * proxies use the first `x-forwarded-for` hop. There is no trust boundary in
 * local development, where the fallback is intentionally shared.
 */
export function getClientIp(headers: Pick<Headers, "get">): string {
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const cloudflareIp = headers.get("cf-connecting-ip")?.trim();
  if (cloudflareIp) return cloudflareIp;

  const forwarded = headers.get("x-forwarded-for");
  const firstHop = forwarded?.split(",")[0]?.trim();
  if (firstHop) return firstHop;

  return "unknown";
}

/**
 * Keyed hash so the stored limiter key cannot be reversed by enumerating
 * IPv4 addresses. The salt stays server-side.
 */
export function hashClientIp(ip: string, salt: string): string {
  return createHmac("sha256", salt).update(ip).digest("hex");
}

/**
 * Prefer a dedicated salt. Falling back to the service-role key keeps a
 * configured deployment working if the optional variable was missed.
 */
export function newsletterIpSalt(): string {
  return (
    process.env.NEWSLETTER_IP_SALT?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "khobordaily-development-salt"
  );
}
