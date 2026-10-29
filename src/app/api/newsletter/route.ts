import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getClientIp,
  hashClientIp,
  newsletterIpSalt,
} from "@/lib/newsletter/ip";
import {
  isHoneypotFilled,
  normalizeNewsletterEmail,
  parseNewsletterLocale,
  parseSignupSource,
} from "@/lib/newsletter/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

const NO_STORE = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};
const MAX_BODY_BYTES = 4_096;
const RATE_LIMIT_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_SECONDS = 3_600;

function json(
  status: number,
  body: Record<string, unknown>,
  headers?: Record<string, string>,
): Response {
  return Response.json(body, {
    status,
    headers: { ...NO_STORE, ...headers },
  });
}

function hasNewsletterBackend(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/**
 * Newsletter signup.
 *
 * This route only stores the address and rate-limits the request. It does
 * not send mail: the welcome template is rendered separately and can be
 * previewed locally at /newsletter/preview.
 *
 * Abuse controls:
 *  - a hidden honeypot field that real readers never see;
 *  - an HMAC of the client IP, used by the atomic Postgres limiter;
 *  - a small JSON body limit;
 *  - a duplicate-email insert is treated as success (no account probing).
 */
export async function POST(request: Request): Promise<Response> {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/json")) {
    return json(415, { ok: false, error: "unsupported_media_type" });
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return json(413, { ok: false, error: "payload_too_large" });
  }

  let payload: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return json(400, { ok: false, error: "invalid_request" });
    }
    payload = parsed as Record<string, unknown>;
  } catch {
    return json(400, { ok: false, error: "invalid_request" });
  }

  // Pretend the signup worked so simple bots do not learn what tripped them.
  if (isHoneypotFilled(payload.website)) {
    return json(200, { ok: true });
  }

  if (!hasNewsletterBackend()) {
    return json(503, { ok: false, error: "not_configured" });
  }

  const email = normalizeNewsletterEmail(payload.email);
  if (!email) {
    return json(422, { ok: false, error: "invalid_email" });
  }

  const locale = parseNewsletterLocale(payload.locale);
  const source = parseSignupSource(payload.source);
  const ipHash = hashClientIp(getClientIp(request.headers), newsletterIpSalt());

  try {
    const admin = getSupabaseAdmin();

    const { data: allowed, error: limitError } = await admin.rpc(
      "consume_signup_attempt",
      {
        p_ip_hash: ipHash,
        p_limit: RATE_LIMIT_ATTEMPTS,
        p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
      },
    );

    if (limitError) throw limitError;
    if (allowed !== true) {
      return json(
        429,
        { ok: false, error: "rate_limited" },
        { "Retry-After": String(RATE_LIMIT_WINDOW_SECONDS) },
      );
    }

    const { error: insertError } = await admin.from("subscribers").insert({
      email,
      locale,
      source,
    });

    // 23505 = unique_violation. The reader is already on the list; returning
    // success avoids turning the endpoint into an email-enumeration oracle.
    if (insertError && insertError.code !== "23505") throw insertError;

    return json(200, { ok: true });
  } catch (error) {
    console.error(
      "[newsletter] signup failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    return json(500, { ok: false, error: "server_error" });
  }
}
