import { describe, expect, it } from "vitest";
import { getSourceProfile, SOURCES, SOURCE_PROFILES } from "../sources";

describe("source profiles", () => {
  it("gives every whitelisted publisher a profile", () => {
    const missing = SOURCES.filter(
      (source) =>
        !SOURCE_PROFILES[source.id]?.bn?.trim() ||
        !SOURCE_PROFILES[source.id]?.en?.trim(),
    );

    expect(missing.map((source) => source.id)).toEqual([]);
  });

  it("keeps each profile factual, substantial, and unique", () => {
    const english = new Set<string>();

    for (const source of SOURCES) {
      const profile = SOURCE_PROFILES[source.id];
      expect(profile?.en.length).toBeGreaterThan(90);
      expect(profile?.bn.length).toBeGreaterThan(80);
      expect(english.has(profile.en)).toBe(false);
      english.add(profile.en);

      const domain = new URL(source.siteUrl).hostname.replace(/^www\./, "");
      expect(profile.en.toLowerCase()).toContain(domain);
    }
  });

  it("resolves a profile through the getter", () => {
    expect(getSourceProfile("prothom-alo")?.en).toContain("Prothom Alo");
    expect(getSourceProfile("unknown-outlet")).toBeUndefined();
  });
});
