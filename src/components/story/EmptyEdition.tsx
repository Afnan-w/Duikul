import Link from "next/link";
import { ArrowUpRight, Radio } from "lucide-react";
import { Bi } from "@/components/ui/Bi";

type EmptyEditionProps = {
  level?: "h1" | "h2";
  showSetupHint?: boolean;
};

/**
 * Calm empty state. A reader should never see a stack trace or a fake story
 * when the edition has not been fished yet.
 */
export function EmptyEdition({
  level = "h1",
  showSetupHint = false,
}: EmptyEditionProps) {
  const Heading = level;

  return (
    <section className="double-rule my-10 bg-surface/40 px-6 py-14 text-center sm:my-14 sm:px-10 sm:py-20">
      <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-rule bg-bg text-accent">
        <Radio size={22} strokeWidth={1.4} aria-hidden="true" />
      </span>

      <Heading className="headline mt-6 text-[28px] text-ink sm:text-[36px]">
        <Bi
          bn="এই সংস্করণ এখনো প্রস্তুত হচ্ছে"
          en="This edition is being prepared"
        />
      </Heading>

      <p className="mx-auto mt-4 max-w-[52ch] text-[16px] leading-relaxed text-muted sm:text-[17px]">
        <Bi
          bn="আমরা প্রতি ৩০ মিনিটে নির্ভরযোগ্য সূত্র থেকে খবর সংগ্রহ করি, একই ঘটনার প্রতিবেদন একত্র করি, তারপর এই সংস্করণ প্রকাশ করি। কিছুক্ষণ পরে আবার দেখুন।"
          en="We gather stories from trusted outlets every 30 minutes, group reports about the same event, and publish this edition. Please check back shortly."
        />
      </p>

      <Link
        href="/about"
        className="mt-7 inline-flex min-h-11 items-center gap-1.5 font-ui text-sm font-medium text-accent underline decoration-accent/35 underline-offset-4"
      >
        <Bi bn="আমাদের পদ্ধতি পড়ুন" en="Read our methodology" />
        <ArrowUpRight size={15} strokeWidth={1.7} aria-hidden="true" />
      </Link>

      {showSetupHint ? (
        <div className="mx-auto mt-10 max-w-[58ch] border-t border-rule pt-6 text-left">
          <p className="ui-label text-muted">Local setup</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Run <code className="font-ui">supabase/schema.sql</code> in your
            Supabase project, copy the three Supabase values into{" "}
            <code className="font-ui">.env.local</code>, then run{" "}
            <code className="font-ui">npm run ingest</code>.
          </p>
        </div>
      ) : null}
    </section>
  );
}
