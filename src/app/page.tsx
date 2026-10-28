import { ArrowUpRight } from "lucide-react";
import { LogoLockup } from "@/components/brand/LogoLockup";
import { SectionGlyph } from "@/components/brand/SectionGlyph";
import { formatMastheadDate } from "@/lib/utils/date";

export default function HomePage() {
  const today = new Date();

  return (
    <>
      <header className="border-b border-rule bg-bg/85 backdrop-blur-[12px]">
        <div className="container-editorial flex h-16 items-center justify-between">
          <LogoLockup wordmarkClassName="h-6 w-auto text-ink" />
          <p className="hidden font-ui text-xs font-medium tracking-[0.08em] text-muted sm:block">
            A calmer way to read the news
          </p>
        </div>
      </header>

      <main>
        <div className="container-editorial">
          <div className="double-rule mt-8 flex items-center justify-between py-2.5">
            <p className="font-bangla-ui text-sm text-ink" lang="bn">
              {formatMastheadDate(today, "bn")}
            </p>
            <p className="meta">ঢাকা · Bangladesh</p>
          </div>

          <section className="grid gap-10 py-14 md:grid-cols-12 md:py-20">
            <div className="md:col-span-7">
              <p className="ui-label mb-5 flex items-center gap-2 text-accent">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal" />
                Verified, attributed, calm
              </p>
              <h1
                className="headline headline-lead max-w-[18ch] text-ink"
                lang="bn"
              >
                দেশ ও বিশ্বের জরুরি খবর, এক জায়গায়
              </h1>
              <p className="mt-6 max-w-[56ch] text-xl text-muted">
                The news that matters, in one place.
              </p>

              <p
                className="body-copy mt-8 max-w-[62ch] text-ink/90"
                lang="bn"
              >
                বাংলাদেশ ও বিশ্বের শীর্ষ সংবাদ, একাধিক নির্ভরযোগ্য সূত্রে
                নিশ্চিত হলে স্পষ্ট চিহ্নসহ। কোনো ক্লিকবেইট নয়, কোনো অপ্রয়োজনীয়
                শব্দ নয় — শুধু যা জানা দরকার।
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                <span className="inline-flex items-center gap-2.5 font-bangla-ui text-[15px] font-medium text-ink">
                  <SectionGlyph section="deshi" className="h-5 w-5 text-accent" />
                  দেশি খবর
                </span>
                <span className="inline-flex items-center gap-2.5 font-bangla-ui text-[15px] font-medium text-ink">
                  <SectionGlyph
                    section="bideshi"
                    className="h-5 w-5 text-accent"
                  />
                  বিদেশি খবর
                </span>
              </div>
            </div>

            <aside className="md:col-span-5 md:border-l md:border-rule md:pl-10">
              <p className="ui-label text-muted">Our promise</p>
              <ol className="mt-6 space-y-6">
                {[
                  {
                    bn: "আমরা নিজেরা সংবাদ লিখি না।",
                    en: "We do not rewrite the news.",
                  },
                  {
                    bn: "শিরোনাম, সংক্ষিপ্ত সারমর্ম ও মূল সূত্রে সরাসরি লিংক।",
                    en: "Headline, short summary, and a direct link to the source.",
                  },
                  {
                    bn: "একাধিক সূত্র মিললে তবেই ‘নিশ্চিত’ চিহ্ন।",
                    en: "A confirmation badge only when independent sources agree.",
                  },
                ].map((item, index) => (
                  <li
                    key={item.en}
                    className="flex gap-4 border-b border-rule pb-6 last:border-0 last:pb-0"
                  >
                    <span className="mt-1 font-ui text-[11px] font-semibold tabular-nums text-accent">
                      0{index + 1}
                    </span>
                    <div>
                      <p className="font-bangla text-[17px] leading-[1.75] text-ink">
                        {item.bn}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        {item.en}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </aside>
          </section>

          <section className="border-t border-rule py-12">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="ui-label text-muted">Next</p>
                <h2 className="headline headline-section mt-3 max-w-[26ch]">
                  Bangladesh&apos;s essential news, without the noise.
                </h2>
              </div>
              <a
                className="tap-target inline-flex items-center gap-2 self-start font-ui text-sm font-medium text-accent underline decoration-accent/40 underline-offset-4 sm:self-auto"
                href="/about"
              >
                Read our approach
                <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
              </a>
            </div>
          </section>
        </div>
      </main>

      <footer className="mt-8 border-t border-rule">
        <div className="container-editorial flex flex-col gap-3 py-8 sm:flex-row sm:items-center sm:justify-between">
          <LogoLockup
            markClassName="h-6 w-6 text-accent"
            wordmarkClassName="h-5 w-auto text-ink"
          />
          <p className="meta">© {today.getFullYear()} KhoborDaily</p>
        </div>
      </footer>
    </>
  );
}
