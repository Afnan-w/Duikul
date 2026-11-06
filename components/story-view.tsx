"use client";

/*
  ONE STORY PAGE (Stage D)
  ------------------------
  Shows the headline, a short excerpt, the credited photo and - most
  important - sends the reader to the ORIGINAL outlet for the full
  article. Duikul never reprints the full text.

  The server decides WHICH story this is (see app/news/[slug]/page.tsx)
  and passes it in as a prop; this component only displays it.
*/

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/components/language";
import {
  OutletBadge,
  categoryOf,
  sourceLabel,
  type StoryLike,
} from "@/components/story";
import { formatDateTime } from "@/lib/format";
import { ui } from "@/lib/site";

export function StoryView({ story }: { story: StoryLike }) {
  const { lang } = useLanguage();
  const text = story[lang];
  const primary = story.outlets[0];

  /* The exact address of THIS page is only known inside the browser,
     so we fill it in right after the page appears (not on the server). */
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const copyLink = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked - the user can still share manually.
    }
  }, [shareUrl]);

  const backHref = story.section === "deshi" ? "/deshi" : "/bideshi";
  const backLabel =
    story.section === "deshi"
      ? lang === "bn"
        ? "দেশির সব সংবাদ"
        : "All Deshi news"
      : lang === "bn"
        ? "বিদেশির সব সংবাদ"
        : "All Bideshi news";

  const sectionLabel =
    story.section === "deshi" ? ui.deshi[lang] : ui.bideshi[lang];

  /* If the feed gave no real body text, the excerpt would repeat the
     headline - showing it again looks broken, so we hide it then. */
  const excerpt = text.excerpt.trim();
  const showExcerpt = excerpt.length > 0 && excerpt !== text.title.trim();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-16 sm:px-6">
      {/* Back to the section the story came from. */}
      <nav aria-label={lang === "bn" ? "ফিরে যান" : "Breadcrumb"}>
        <Link
          href={backHref}
          className="text-sm text-muted transition-colors hover:text-accent"
        >
          ← {backLabel}
        </Link>
      </nav>

      {/* Section + category chips. */}
      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold tracking-widest uppercase">
        <span className="rounded-full border border-line bg-soft px-3 py-1 text-muted">
          {sectionLabel}
        </span>
        <span className="rounded-full border border-accent/25 bg-accent-soft px-3 py-1 text-accent">
          {categoryOf(story.category, lang)}
        </span>
      </div>

      {/* Headline. */}
      <h1 className="serif mt-4 text-3xl leading-[1.2] font-bold tracking-tight text-fg sm:text-4xl">
        {text.title}
      </h1>

      {/* Badge + publication time. */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <OutletBadge outlets={story.outlets} lang={lang} />
        <time dateTime={story.publishedAt} className="text-sm text-muted">
          {formatDateTime(story.publishedAt, lang)}
        </time>
      </div>

      {/* Credited photo, when the feed provided one. A plain <img>
          because photos come from every outlet's own server. */}
      {story.imageUrl && (
        <figure className="mt-6">
          <Image
            src={story.imageUrl}
            alt={text.title}
            referrerPolicy="no-referrer"
            className="aspect-16/9 w-full rounded-xl border border-line bg-soft object-cover"
            width={800}
            height={450}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={90}
          />
          {story.imageCredit && (
            <figcaption className="mt-2 text-xs text-muted">
              {lang === "bn" ? "ছবি" : "Photo"}: {story.imageCredit}
            </figcaption>
          )}
        </figure>
      )}

      {/* The short excerpt - a few sentences, never the full article. */}
      {showExcerpt && (
        <p className="article-body mt-6 text-fg/85">{excerpt}</p>
      )}

      {/* THE main action: read the full report at the original outlet. */}
      {primary && (
        <div className="mt-8">
          <a
            href={primary.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center gap-3 rounded-xl bg-accent px-6 py-3 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            {ui.readFull[lang]}
            <span aria-hidden="true">↗</span>
          </a>
          <p className="mt-2 text-sm text-muted">
            {lang === "bn"
              ? "নতুন ট্যাবে খোলে · সূত্র: "
              : "Opens in a new tab · Source: "}
            {primary.name}
          </p>
        </div>
      )}

      {/* Share row (Stage E): the four big apps in Bangladesh, plus copy.
          No tracker, no share widget service - just plain links. */}
      <section
        aria-label={lang === "bn" ? "শেয়ার" : "Share"}
        className="mt-6 flex flex-wrap items-center gap-2"
      >
        <span className="text-xs font-semibold tracking-widest text-muted uppercase">
          {lang === "bn" ? "শেয়ার" : "Share"}
        </span>
        {shareUrl &&
          (
            [
              {
                name: "WhatsApp",
                href: `https://wa.me/?text=${encodeURIComponent(`${text.title} — ${shareUrl}`)}`,
              },
              {
                name: "Facebook",
                href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
              },
              {
                name: "X",
                href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text.title)}&url=${encodeURIComponent(shareUrl)}`,
              },
              {
                name: "Telegram",
                href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text.title)}`,
              },
            ] as const
          ).map((target) => (
            <a
              key={target.name}
              href={target.href}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-9 rounded-full border border-line bg-card px-4 py-1.5 text-sm text-fg/85 transition-colors hover:border-accent hover:text-accent"
            >
              {target.name}
            </a>
          ))}
        <button
          type="button"
          onClick={copyLink}
          className="min-h-9 rounded-full border border-line bg-card px-4 py-1.5 text-sm text-fg/85 transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
          disabled={!shareUrl}
        >
          {copied
            ? lang === "bn"
              ? "কপি হয়েছে ✓"
              : "Copied ✓"
            : lang === "bn"
              ? "লিংক কপি"
              : "Copy link"}
        </button>
      </section>

      {/* Every outlet reporting the same event, each with its own link. */}
      <aside aria-label={lang === "bn" ? "সূত্রসমূহ" : "Sources"} className="mt-10">
        {story.outlets.length > 1 && (
          <p className="mb-3 text-sm text-fg/70">
            {lang === "bn"
              ? `${story.outlets.length}টি সংবাদমাধ্যম একই ঘটনা নিয়ে প্রতিবেদন করেছে:`
              : `${story.outlets.length} outlets are reporting the same event:`}
          </p>
        )}
        <OutletBadge outlets={story.outlets} lang={lang} showNames />
      </aside>

      {/* Honest note about what this page is. */}
      <p className="mt-6 rounded-lg border border-line bg-soft px-4 py-3 text-sm text-muted">
        {lang === "bn"
          ? "দুইকুল কোনো সংবাদ কপি বা অনুবাদ করে না — শিরোনাম ও সংক্ষিপ্ত অংশ কেবল পরিচয়ের জন্য। পূর্ণ প্রতিবেদন ও ছবির স্বত্ব মূল সংবাদমাধ্যমের।"
          : "Duikul never copies or translates articles — the headline and a short excerpt are shown for identification only. The full report and photo belong to the original outlet."}
      </p>

      {/* Screen-reader-only heading context for the outlet line. */}
      <p className="sr-only">{sourceLabel(story.outlets, lang)}</p>
    </main>
  );
}
