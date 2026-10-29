import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const ENDPOINT = "https://duikul.test/api/cron/ingest";

function request(authorization?: string): Request {
  return new Request(ENDPOINT, {
    headers: authorization ? { Authorization: authorization } : undefined,
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("cron ingest route", () => {
  it("fails closed when CRON_SECRET is not configured", async () => {
    vi.stubEnv("CRON_SECRET", "");
    const response = await GET(request("Bearer anything"));
    expect(response.status).toBe(500);
    const body = (await response.json()) as { ok: boolean; error: string };
    expect(body.ok).toBe(false);
    expect(body.error).toMatch(/CRON_SECRET/i);
  });

  it("rejects a missing or wrong bearer token before ingesting", async () => {
    vi.stubEnv("CRON_SECRET", "correct-secret");

    const missing = await GET(request());
    expect(missing.status).toBe(401);

    const wrong = await GET(request("Bearer wrong-secret"));
    expect(wrong.status).toBe(401);

    const malformed = await GET(request("Basic correct-secret"));
    expect(malformed.status).toBe(401);
  });
});
