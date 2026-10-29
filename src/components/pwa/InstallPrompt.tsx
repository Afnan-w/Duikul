"use client";

import { useState, useSyncExternalStore } from "react";
import { Download, X } from "lucide-react";
import { Bi } from "@/components/ui/Bi";
import { SITE_NAME, SITE_NAME_BN } from "@/config/site";
import {
  INSTALL_DISMISS_STORAGE_KEY,
  isInstallDismissedRecently,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa/install";

function subscribeToInstallPrompt(onChange: () => void) {
  const onPrompt = (event: Event) => {
    // Chromium fires a mini-infobar by default; preventing it lets the site
    // offer install at a calmer moment, in its own visual language.
    event.preventDefault();
    window.__kdInstallPrompt = event as BeforeInstallPromptEvent;
    onChange();
  };

  const onInstalled = () => {
    window.__kdInstallPrompt = null;
    onChange();
  };

  window.addEventListener("beforeinstallprompt", onPrompt);
  window.addEventListener("appinstalled", onInstalled);

  return () => {
    window.removeEventListener("beforeinstallprompt", onPrompt);
    window.removeEventListener("appinstalled", onInstalled);
  };
}

function getInstallPromptSnapshot(): BeforeInstallPromptEvent | null {
  const prompt = window.__kdInstallPrompt ?? null;
  if (!prompt) return null;

  try {
    if (
      isInstallDismissedRecently(
        localStorage.getItem(INSTALL_DISMISS_STORAGE_KEY),
      )
    ) {
      return null;
    }
  } catch {
    // Storage can be blocked; still allow the install offer.
  }

  return prompt;
}

function getServerSnapshot(): BeforeInstallPromptEvent | null {
  return null;
}

/**
 * A small, dismissible install card. It only appears once the browser says
 * the app is installable, so unsupported browsers and already-installed
 * readers never see it. No modal, no auto-popup.
 */
export function InstallPrompt() {
  const promptEvent = useSyncExternalStore(
    subscribeToInstallPrompt,
    getInstallPromptSnapshot,
    getServerSnapshot,
  );
  const [dismissed, setDismissed] = useState(false);

  if (!promptEvent || dismissed) return null;

  function dismiss() {
    try {
      localStorage.setItem(INSTALL_DISMISS_STORAGE_KEY, String(Date.now()));
    } catch {
      // The prompt still closes for this visit.
    }
    setDismissed(true);
  }

  async function install() {
    const event = promptEvent;
    if (!event) return;

    try {
      await event.prompt();
      await event.userChoice;
    } catch {
      // The browser cancelled the sheet; keep the current page as is.
    }

    window.__kdInstallPrompt = null;
    setDismissed(true);
  }

  return (
    <div
      role="region"
      aria-label={`Install ${SITE_NAME} / ${SITE_NAME_BN} ইনস্টল করুন`}
      className="no-print fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[22rem]"
    >
      <div className="flex items-start gap-3 rounded-2xl border border-rule bg-bg p-3.5 shadow-[0_14px_40px_rgb(31_29_26_/_0.16)]">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent font-bangla-ui text-lg font-semibold text-accent-contrast"
        >
          খ
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-ui text-[13px] font-semibold leading-snug text-ink">
            <Bi bn="অ্যাপ হিসেবে ইনস্টল করুন" en="Install the app" />
          </p>
          <p className="meta mt-1">
            <Bi
              bn="দ্রুত খুলুন, অফলাইনেও পড়ুন।"
              en="Open faster and read offline."
            />
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={install}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-4 font-ui text-[12px] font-semibold text-accent-contrast transition-opacity hover:opacity-90"
            >
              <Download size={15} strokeWidth={1.8} aria-hidden="true" />
              <Bi bn="ইনস্টল" en="Install" />
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex min-h-11 items-center rounded-full px-3 font-ui text-[12px] font-medium text-muted transition-colors hover:text-ink"
            >
              <Bi bn="এখন নয়" en="Not now" />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt / ইনস্টল প্রস্তাব বন্ধ করুন"
          className="tap-target -mr-1 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
        >
          <X size={16} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
