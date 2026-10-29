"use client";

import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Bi } from "@/components/ui/Bi";
import type { NewsletterLocale } from "@/lib/newsletter/validation";

type FeedbackCode =
  | "subscribed"
  | "rate_limited"
  | "invalid_email"
  | "not_configured"
  | "generic";

const FEEDBACK: Record<
  FeedbackCode,
  { bn: string; en: string; tone: "success" | "error" }
> = {
  subscribed: {
    bn: "ধন্যবাদ — আপনি তালিকায় আছেন। পরের সংস্করণ থেকে ইমেইল পাবেন।",
    en: "Thank you — you’re on the list. Look out for the next edition.",
    tone: "success",
  },
  rate_limited: {
    bn: "একটু বেশি চেষ্টা হয়েছে। এক ঘণ্টা পর আবার চেষ্টা করুন।",
    en: "Too many attempts. Please try again in an hour.",
    tone: "error",
  },
  invalid_email: {
    bn: "ইমেইল ঠিকানাটি ঠিক মনে হচ্ছে না। আবার দেখুন।",
    en: "That email address doesn’t look right. Please check it.",
    tone: "error",
  },
  not_configured: {
    bn: "সাইনআপ এখনো চালু হয়নি। একটু পরে আবার চেষ্টা করুন।",
    en: "Signup isn’t live yet. Please try again later.",
    tone: "error",
  },
  generic: {
    bn: "এখন সাইনআপ করা গেল না। একটু পরে আবার চেষ্টা করুন।",
    en: "We couldn’t sign you up just now. Please try again.",
    tone: "error",
  },
};

type NewsletterSignupProps = {
  source: "homepage" | "footer";
  /** Distinguishes the two possible instances on a page. */
  idPrefix?: string;
};

/**
 * Bilingual newsletter form. The hidden `website` field is a honeypot; the
 * server also rate-limits by hashed IP. The form only stores an address —
 * sending mail is intentionally outside this stage.
 */
export function NewsletterSignup({
  source,
  idPrefix = source,
}: NewsletterSignupProps) {
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackCode | null>(null);

  const emailId = `newsletter-email-${idPrefix}`;
  const honeypotId = `newsletter-website-${idPrefix}`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "");
    const website = String(data.get("website") ?? "");
    const locale: NewsletterLocale =
      document.documentElement.getAttribute("data-lang") === "en" ? "en" : "bn";

    setPending(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale, source, website }),
      });

      let result: { ok?: boolean; error?: string } | null = null;
      try {
        result = (await response.json()) as { ok?: boolean; error?: string };
      } catch {
        // Non-JSON responses fall through to the generic message.
      }

      if (response.ok && result?.ok) {
        form.reset();
        setFeedback("subscribed");
      } else if (response.status === 429 || result?.error === "rate_limited") {
        setFeedback("rate_limited");
      } else if (result?.error === "invalid_email") {
        setFeedback("invalid_email");
      } else if (result?.error === "not_configured") {
        setFeedback("not_configured");
      } else {
        setFeedback("generic");
      }
    } catch {
      setFeedback("generic");
    } finally {
      setPending(false);
    }
  }

  const feedbackCopy = feedback ? FEEDBACK[feedback] : null;

  return (
    <form onSubmit={handleSubmit} className="relative">
      <label htmlFor={emailId} className="ui-label block text-muted">
        <Bi bn="ইমেইল ঠিকানা" en="Email address" />
      </label>

      <div className="mt-2 flex flex-col gap-2.5 sm:flex-row">
        <input
          id={emailId}
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          inputMode="email"
          enterKeyHint="send"
          placeholder="you@example.com"
          aria-invalid={feedback === "invalid_email"}
          className="min-h-12 w-full min-w-0 flex-1 rounded-full border border-rule bg-bg px-5 font-ui text-[15px] text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/20 aria-invalid:border-signal"
        />
        <button
          type="submit"
          disabled={pending}
          className="tap-target inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-accent px-6 font-ui text-[13px] font-semibold text-accent-contrast transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? (
            <Loader2
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
              className="animate-spin"
            />
          ) : (
            <Mail size={16} strokeWidth={1.8} aria-hidden="true" />
          )}
          <Bi
            bn={pending ? "সাবস্ক্রাইব হচ্ছে" : "সাবস্ক্রাইব"}
            en={pending ? "Subscribing" : "Subscribe"}
          />
        </button>
      </div>

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="mt-3 min-h-5 text-[13px] leading-relaxed"
      >
        {feedbackCopy ? (
          <p
            className={
              feedbackCopy.tone === "success" ? "text-accent" : "text-signal"
            }
          >
            <Bi bn={feedbackCopy.bn} en={feedbackCopy.en} />
          </p>
        ) : null}
      </div>

      <p className="meta mt-1">
        <Bi
          bn="সাইনআপ করলে আপনি আমাদের "
          en="By subscribing you agree to our "
        />
        <Link
          href="/privacy"
          className="underline decoration-rule underline-offset-2 transition-colors hover:text-ink"
        >
          <Bi bn="গোপনীয়তা নীতি" en="privacy policy" />
        </Link>
        <Bi
          bn=" মেনে নিচ্ছেন। যেকোনো সময় বন্ধ করতে পারবেন।"
          en=". You can stop any time."
        />
      </p>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
      >
        <label htmlFor={honeypotId}>Website</label>
        <input
          id={honeypotId}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
    </form>
  );
}
