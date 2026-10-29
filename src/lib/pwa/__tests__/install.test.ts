import { describe, expect, it } from "vitest";
import {
  INSTALL_DISMISS_MS,
  isInstallDismissedRecently,
} from "@/lib/pwa/install";

const NOW = new Date("2026-10-28T12:00:00Z").getTime();

describe("isInstallDismissedRecently", () => {
  it("treats a missing value as not dismissed", () => {
    expect(isInstallDismissedRecently(null, NOW)).toBe(false);
  });

  it("treats a dismissal inside the window as recent", () => {
    expect(isInstallDismissedRecently(String(NOW - 86_400_000), NOW)).toBe(true);
  });

  it("lets the prompt return after the window", () => {
    expect(isInstallDismissedRecently(String(NOW - INSTALL_DISMISS_MS), NOW)).toBe(
      false,
    );
    expect(
      isInstallDismissedRecently(String(NOW - INSTALL_DISMISS_MS - 1), NOW),
    ).toBe(false);
  });

  it("ignores malformed or non-positive timestamps", () => {
    expect(isInstallDismissedRecently("not-a-number", NOW)).toBe(false);
    expect(isInstallDismissedRecently("0", NOW)).toBe(false);
    expect(isInstallDismissedRecently("-100", NOW)).toBe(false);
  });

  it("does not hide the prompt forever after a backwards clock change", () => {
    expect(isInstallDismissedRecently(String(NOW + 86_400_000), NOW)).toBe(false);
  });
});
