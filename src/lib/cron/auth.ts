import { timingSafeEqual } from "node:crypto";

/**
 * Constant-time check for `Authorization: Bearer <CRON_SECRET>`.
 *
 * Kept separate from the route so the security rule can be tested without
 * touching the database or starting an ingest run. A missing secret always
 * fails closed: an unconfigured deployment must never expose the cron route.
 */
export function isAuthorizedCronRequest(
  authorization: string | null,
  secret: string | undefined,
): boolean {
  if (!secret) return false;
  if (!authorization) return false;

  const prefix = "Bearer ";
  if (!authorization.startsWith(prefix)) return false;

  const provided = Buffer.from(authorization.slice(prefix.length), "utf8");
  const expected = Buffer.from(secret, "utf8");
  if (provided.length !== expected.length) return false;

  return timingSafeEqual(provided, expected);
}
