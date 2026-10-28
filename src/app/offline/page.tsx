import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, WifiOff } from "lucide-react";
import { RetryButton } from "@/components/site/RetryButton";
import { Bi } from "@/components/ui/Bi";

export const metadata: Metadata = {
  title: "সংযোগ নেই",
  description: "You are offline. Reconnect to read the latest KhoborDaily edition.",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="container-editorial">
      <div className="double-rule my-10 px-6 py-16 text-center sm:my-16 sm:py-24">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-rule bg-surface text-signal">
          <WifiOff size={24} strokeWidth={1.5} aria-hidden="true" />
        </span>

        <p className="ui-label mt-6 text-muted">
          <Bi bn="অফলাইন" en="Offline" />
        </p>
        <h1 className="headline mt-2 text-[32px] text-ink sm:text-[42px]">
          <Bi bn="এই মুহূর্তে সংযোগ নেই" en="You are offline right now" />
        </h1>
        <p className="mx-auto mt-4 max-w-[52ch] text-[16px] leading-relaxed text-muted">
          <Bi
            bn="এই পৃষ্ঠাটি আপনার ডিভাইসে সংরক্ষিত আছে। সর্বশেষ সংস্করণ দেখতে ইন্টারনেটে আবার যুক্ত হন। সংযোগ ফিরলে নিচের বোতামটি চাপুন।"
            en="This page is saved on your device. Reconnect to load the latest edition, then use the button below."
          />
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <RetryButton />
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-rule px-5 font-ui text-[13px] font-medium text-ink"
          >
            <Bi bn="প্রথম পাতা" en="Home" />
            <ArrowRight size={15} strokeWidth={1.7} aria-hidden="true" />
          </Link>
        </div>

        <p className="meta mx-auto mt-8 max-w-[48ch]">
          <Bi
            bn="ইতিমধ্যে পড়া সংবাদগুলো আপনার ব্রাউজারে থেকে যেতে পারে; নতুন সংবাদ লোড করতে সংযোগ দরকার।"
            en="Stories you already opened may remain in your browser; a connection is needed for new ones."
          />
        </p>
      </div>
    </div>
  );
}
