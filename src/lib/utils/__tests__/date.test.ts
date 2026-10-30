import { describe, expect, it } from "vitest";
import {
  daysBetweenDateKeys,
  dhakaDateKey,
  dhakaDateRange,
  formatDateKey,
  isValidDateKey,
  parseDhakaDateKey,
  shiftDateKey,
} from "../date";

describe("Dhaka calendar dates", () => {
  it("derives the Dhaka date across the UTC midnight boundary", () => {
    expect(dhakaDateKey(new Date("2026-10-28T17:59:59.000Z"))).toBe(
      "2026-10-28",
    );
    expect(dhakaDateKey(new Date("2026-10-28T18:00:00.000Z"))).toBe(
      "2026-10-29",
    );
  });

  it("accepts real dates and rejects impossible ones", () => {
    expect(isValidDateKey("2026-10-29")).toBe(true);
    expect(isValidDateKey("2028-02-29")).toBe(true);
    expect(isValidDateKey("2027-02-29")).toBe(false);
    expect(isValidDateKey("2026-13-01")).toBe(false);
    expect(isValidDateKey("29-10-2026")).toBe(false);
  });

  it("maps a date key to the correct UTC bounds", () => {
    const range = dhakaDateRange("2026-10-29");
    expect(range?.start.toISOString()).toBe("2026-10-28T18:00:00.000Z");
    expect(range?.end.toISOString()).toBe("2026-10-29T18:00:00.000Z");
    expect(parseDhakaDateKey("nope")).toBeNull();
  });

  it("shifts and measures calendar days", () => {
    expect(shiftDateKey("2026-10-31", 1)).toBe("2026-11-01");
    expect(shiftDateKey("2026-03-01", -1)).toBe("2026-02-28");
    expect(daysBetweenDateKeys("2026-10-29", "2026-11-02")).toBe(4);
  });

  it("formats the key without shifting the day", () => {
    expect(formatDateKey("2026-10-29", "en")).toBe("29 October 2026");
    expect(formatDateKey("2026-10-29", "bn")).toContain("২৯");
  });
});
