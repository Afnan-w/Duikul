"use client";

import { RotateCcw } from "lucide-react";
import { Bi } from "@/components/ui/Bi";

/** Reload is the only action that can recover a connection lost mid-session. */
export function RetryButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 font-ui text-[13px] font-semibold text-accent-contrast transition-opacity hover:opacity-90"
    >
      <RotateCcw size={15} strokeWidth={1.8} aria-hidden="true" />
      <Bi bn="আবার চেষ্টা করুন" en="Try again" />
    </button>
  );
}
