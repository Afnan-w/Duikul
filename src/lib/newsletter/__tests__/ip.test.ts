import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getClientIp,
  hashClientIp,
  newsletterIpSalt,
} from "@/lib/newsletter/ip";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getClientIp", () => {
  it("prefers the platform-provided real IP", () => {
    const headers = new Headers({
      "x-real-ip": "203.0.113.8",
      "cf-connecting-ip": "203.0.113.9",
      "x-forwarded-for": "203.0.113.10, 10.0.0.1",
    });
    expect(getClientIp(headers)).toBe("203.0.113.8");
  });

  it("falls back to Cloudflare, then the first forwarded hop", () => {
    expect(
      getClientIp(new Headers({ "cf-connecting-ip": "203.0.113.9" })),
    ).toBe("203.0.113.9");
    expect(
      getClientIp(
        new Headers({ "x-forwarded-for": " 203.0.113.10 , 10.0.0.1" }),
      ),
    ).toBe("203.0.113.10");
  });

  it("uses a shared fallback when no proxy header exists", () => {
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});

describe("hashClientIp", () => {
  it("is deterministic, keyed, and does not contain the raw IP", () => {
    const first = hashClientIp("203.0.113.7", "salt-a");
    expect(first).toHaveLength(64);
    expect(first).toBe(hashClientIp("203.0.113.7", "salt-a"));
    expect(first).not.toBe(hashClientIp("203.0.113.7", "salt-b"));
    expect(first).not.toBe(hashClientIp("203.0.113.8", "salt-a"));
    expect(first).not.toContain("203.0.113.7");
  });
});

describe("newsletterIpSalt", () => {
  it("uses the dedicated salt when set", () => {
    vi.stubEnv("NEWSLETTER_IP_SALT", "dedicated-salt");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role");
    expect(newsletterIpSalt()).toBe("dedicated-salt");
  });

  it("falls back to the service-role key", () => {
    vi.stubEnv("NEWSLETTER_IP_SALT", "  ");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role");
    expect(newsletterIpSalt()).toBe("service-role");
  });

  it("has a development fallback", () => {
    vi.stubEnv("NEWSLETTER_IP_SALT", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    expect(newsletterIpSalt()).toBe("duikul-development-salt");
  });
});
