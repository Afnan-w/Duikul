export const INSTALL_DISMISS_STORAGE_KEY = "kd-install-dismissed";
export const INSTALL_DISMISS_DAYS = 30;
export const INSTALL_DISMISS_MS = INSTALL_DISMISS_DAYS * 86_400_000;

/** The Chromium-only event that lets a site show its own install button. */
export type BeforeInstallPromptEvent = Event & {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
  interface Window {
    /** Captured in the pre-paint script so early events are not lost. */
    __kdInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

/**
 * A dismissed install prompt stays quiet for 30 days. A clock change must
 * not hide it forever, so future timestamps are treated as "not dismissed".
 */
export function isInstallDismissedRecently(
  stored: string | null,
  now = Date.now(),
): boolean {
  if (!stored) return false;
  const dismissedAt = Number(stored);
  if (!Number.isFinite(dismissedAt) || dismissedAt <= 0) return false;
  const elapsed = now - dismissedAt;
  return elapsed >= 0 && elapsed < INSTALL_DISMISS_MS;
}
