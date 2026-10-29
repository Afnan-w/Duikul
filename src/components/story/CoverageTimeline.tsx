import { Bi } from "@/components/ui/Bi";
import type { StorySource } from "@/lib/data/clusters";
import { formatDateTime, toBanglaDigits } from "@/lib/utils/date";

type CoverageTimelineProps = {
  sources: StorySource[];
};

/**
 * Data-derived value: the order in which independent outlets carried the
 * event. No interpretation is added; the timestamps come from the publishers'
 * own feeds and are shown in Dhaka time.
 */
export function CoverageTimeline({ sources }: CoverageTimelineProps) {
  if (sources.length === 0) return null;

  const ordered = [...sources].sort(
    (a, b) => a.publishedAt.getTime() - b.publishedAt.getTime(),
  );

  return (
    <section
      aria-labelledby="coverage-heading"
      className="mt-8 border-t border-rule pt-7"
    >
      <h2 id="coverage-heading" className="headline text-[22px] text-ink">
        <Bi bn="কভারেজের ধারা" en="Coverage timeline" />
      </h2>
      <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-muted">
        <Bi
          bn="কোন প্রকাশক প্রথম রিপোর্ট করেছেন এবং কে কখন যোগ দিয়েছেন। সময় ঢাকা সময় অনুযায়ী।"
          en="Which outlet reported first, and when the others followed. Times are shown in Dhaka time."
        />
      </p>

      <ol className="mt-6">
        {ordered.map((source, index) => (
          <li
            key={source.id}
            className="grid grid-cols-[auto_1fr] gap-3.5 pb-6 last:pb-0"
          >
            <div className="flex flex-col items-center">
              <span
                aria-hidden="true"
                className={`flex h-7 w-7 items-center justify-center rounded-full border font-ui text-[11px] font-semibold tabular-nums ${
                  index === 0
                    ? "border-accent bg-accent text-accent-contrast"
                    : "border-rule bg-surface text-muted"
                }`}
              >
                {toBanglaDigits(index + 1)}
              </span>
              {index < ordered.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="mt-1 w-px flex-1 bg-rule"
                />
              ) : null}
            </div>

            <div className="min-w-0 pt-0.5">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <p className="font-ui text-[14px] font-semibold text-ink">
                  <Bi bn={source.sourceNameBn} en={source.sourceName} />
                </p>
                {index === 0 ? (
                  <span className="chip border border-accent/20 bg-accent-soft text-[10px] text-accent">
                    <Bi bn="প্রথম রিপোর্ট" en="First report" />
                  </span>
                ) : null}
              </div>
              <p className="meta mt-1">
                <time dateTime={source.publishedAt.toISOString()}>
                  <Bi
                    bn={formatDateTime(source.publishedAt, "bn")}
                    en={formatDateTime(source.publishedAt, "en")}
                  />
                </time>
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
