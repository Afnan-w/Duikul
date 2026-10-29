import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hashClientIp } from "@/lib/newsletter/ip";
import { POST } from "./route";

const db = vi.hoisted(() => ({
  rpc: vi.fn(),
  insert: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => ({
    rpc: db.rpc,
    from: db.from,
  }),
}));

const ENDPOINT = "https://duikul.test/api/newsletter";

function request(
  body: unknown,
  {
    headers = {},
    raw,
  }: { headers?: Record<string, string>; raw?: string } = {},
): Request {
  return new Request(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-real-ip": "203.0.113.7",
      ...headers,
    },
    body: raw ?? JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role");
  vi.stubEnv("NEWSLETTER_IP_SALT", "test-salt");

  db.rpc.mockReset();
  db.insert.mockReset();
  db.from.mockReset();

  db.rpc.mockResolvedValue({ data: true, error: null });
  db.insert.mockResolvedValue({ error: null });
  db.from.mockReturnValue({ insert: db.insert });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("POST /api/newsletter", () => {
  it("stores a normalized address with locale, source, and a hashed IP", async () => {
    const response = await POST(
      request({
        email: "  Reader+News@Example.COM ",
        locale: "en",
        source: "footer",
        website: "",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(db.rpc).toHaveBeenCalledWith("consume_signup_attempt", {
      p_ip_hash: hashClientIp("203.0.113.7", "test-salt"),
      p_limit: 5,
      p_window_seconds: 3600,
    });
    expect(db.insert).toHaveBeenCalledWith({
      email: "reader+news@example.com",
      locale: "en",
      source: "footer",
    });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("treats a duplicate address as success", async () => {
    db.insert.mockResolvedValue({ error: { code: "23505" } });

    const response = await POST(request({ email: "reader@example.com" }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("rejects an invalid address without touching the database", async () => {
    const response = await POST(request({ email: "reader@example" }));

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "invalid_email",
    });
    expect(db.rpc).not.toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("accepts honeypot submissions without writing anything", async () => {
    const response = await POST(
      request({ email: "bot@example.com", website: "spam.example" }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(db.rpc).not.toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("returns 429 when the fixed-window limiter refuses the attempt", async () => {
    db.rpc.mockResolvedValue({ data: false, error: null });

    const response = await POST(request({ email: "reader@example.com" }));

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "rate_limited",
    });
    expect(response.headers.get("retry-after")).toBe("3600");
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("fails softly when Supabase is not configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");

    const response = await POST(request({ email: "reader@example.com" }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "not_configured",
    });
    expect(db.rpc).not.toHaveBeenCalled();
  });

  it("requires JSON and a small body", async () => {
    const wrongType = await POST(
      request(
        { email: "reader@example.com" },
        { headers: { "content-type": "text/plain" } },
      ),
    );
    expect(wrongType.status).toBe(415);

    const tooLarge = await POST(
      request(
        { email: "reader@example.com" },
        { headers: { "content-length": "5000" } },
      ),
    );
    expect(tooLarge.status).toBe(413);
  });

  it("returns a generic error when the database write fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    db.insert.mockResolvedValue({ error: { code: "XX000" } });

    const response = await POST(request({ email: "reader@example.com" }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "server_error",
    });
    expect(consoleError).toHaveBeenCalled();
  });
});
