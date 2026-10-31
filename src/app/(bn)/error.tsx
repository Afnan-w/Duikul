"use client";

import { useEffect } from "react";
import { CircleAlert, RotateCcw } from "lucide-react";
import { Bi } from "@/components/ui/Bi";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-editorial">
      <div className="double-rule my-12 px-6 py-16 text-center sm:my-20 sm:py-24">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-rule bg-surface text-signal">
          <CircleAlert size={22} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <h1 className="headline mt-6 text-[30px] text-ink sm:text-[38px]">
          <Bi
            bn="সংস্করণটি এই মুহূর্তে লোড হচ্ছে না"
            en="The edition could not load"
          />
        </h1>
        <p className="mx-auto mt-4 max-w-[48ch] text-[16px] leading-relaxed text-muted">
          <Bi
            bn="একটি সাময়িক সমস্যা হয়েছে। আবার চেষ্টা করুন; সমস্যা থাকলে আমাদের লিখুন।"
            en="Something went wrong temporarily. Try again; if it persists, please contact us."
          />
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 font-ui text-[13px] font-semibold text-accent-contrast"
        >
          <RotateCcw size={15} strokeWidth={1.8} aria-hidden="true" />
          <Bi bn="আবার চেষ্টা করুন" en="Try again" />
        </button>
      </div>
    </div>
  );
}
