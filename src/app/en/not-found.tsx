import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleAlert } from "lucide-react";
import { Bi } from "@/components/ui/Bi";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function EnglishNotFound() {
  return (
    <div className="container-editorial">
      <div className="double-rule my-12 px-6 py-16 text-center sm:my-20 sm:py-24">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-rule bg-surface text-signal">
          <CircleAlert size={22} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <p className="ui-label mt-6 text-muted">404</p>
        <h1 className="headline mt-2 text-[32px] text-ink sm:text-[42px]">
          <Bi bn="পাতাটি পাওয়া যায়নি" en="This page was not found" />
        </h1>
        <p className="mx-auto mt-4 max-w-[48ch] text-[16px] leading-relaxed text-muted">
          <Bi
            bn="লিংকটি ভুল হতে পারে, অথবা সংবাদটি ১৪ দিনের পর সংস্করণ থেকে সরে গেছে।"
            en="The link may be wrong, or the story may have left the edition after 14 days."
          />
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/en"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 font-ui text-[13px] font-semibold text-accent-contrast"
          >
            <Bi bn="প্রথম পাতায় যান" en="Go to the homepage" />
            <ArrowRight size={15} strokeWidth={1.8} aria-hidden="true" />
          </Link>
          <Link
            href="/deshi"
            className="inline-flex min-h-11 items-center rounded-full border border-rule px-5 font-ui text-[13px] font-medium text-ink"
          >
            <Bi bn="দেশি খবর" en="Bangladesh" />
          </Link>
          <Link
            href="/bideshi"
            className="inline-flex min-h-11 items-center rounded-full border border-rule px-5 font-ui text-[13px] font-medium text-ink"
          >
            <Bi bn="বিদেশি খবর" en="World" />
          </Link>
        </div>
      </div>
    </div>
  );
}
