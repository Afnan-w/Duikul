"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import {
  Check,
  Download,
  ExternalLink,
  Link2,
  Mail,
  Share2,
  X,
} from "lucide-react";
import { Bi } from "@/components/ui/Bi";

type ShareMenuProps = {
  url: string;
  title: string;
  squareImageUrl: string;
};

type ShareTarget = {
  labelBn: string;
  labelEn: string;
  href: string;
  icon: ReactNode;
};

// Web Share is a browser capability, not React state. useSyncExternalStore
// reads it without a setState-in-effect or a hydration mismatch.
const subscribeToNothing = () => () => {};
const getNativeShareSnapshot = () =>
  typeof navigator !== "undefined" && typeof navigator.share === "function";
const getNativeShareServerSnapshot = () => false;

/**
 * Small, accessible share disclosure. Native sharing is used when the
 * browser offers it; every other option is a plain link or an explicit copy
 * action, so nothing depends on a third-party SDK.
 */
export function ShareMenu({ url, title, squareImageUrl }: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const canNativeShare = useSyncExternalStore(
    subscribeToNothing,
    getNativeShareSnapshot,
    getNativeShareServerSnapshot,
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }

      // role="menu" implies arrow-key navigation. Only intercept when focus
      // is inside the menu so page scrolling stays normal everywhere else.
      const menu = menuRef.current;
      if (!menu?.contains(document.activeElement)) return;

      const items = Array.from(
        menu.querySelectorAll<HTMLElement>("[role='menuitem']"),
      );
      if (items.length === 0) return;
      const current = items.indexOf(document.activeElement as HTMLElement);

      let next: number | null = null;
      if (event.key === "ArrowDown") next = (current + 1) % items.length;
      if (event.key === "ArrowUp")
        next = (current - 1 + items.length) % items.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = items.length - 1;
      if (next === null) return;

      event.preventDefault();
      items[next]?.focus({ preventScroll: true });
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    const first = menuRef.current?.querySelector<HTMLElement>(
      "a[role='menuitem'], button[role='menuitem']",
    );
    first?.focus({ preventScroll: true });

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Older browsers or denied clipboard permission: use the selection
      // fallback rather than showing a dead button.
      const field = document.createElement("textarea");
      field.value = url;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 2_000);
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, url });
      setOpen(false);
    } catch {
      // The reader cancelled the system sheet; leave the menu open.
    }
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(title);

  const targets: ShareTarget[] = [
    {
      labelBn: "হোয়াটসঅ্যাপ",
      labelEn: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      icon: <span className="font-ui text-[11px] font-bold">WA</span>,
    },
    {
      labelBn: "ফেসবুক",
      labelEn: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <span className="font-ui text-[11px] font-bold">FB</span>,
    },
    {
      labelBn: "এক্স",
      labelEn: "X",
      href: `https://x.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      icon: <span className="font-ui text-[12px] font-bold">X</span>,
    },
    {
      labelBn: "টেলিগ্রাম",
      labelEn: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      icon: <span className="font-ui text-[11px] font-bold">TG</span>,
    },
  ];

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Share this story / এই খবর শেয়ার করুন"
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-rule bg-bg px-3.5 font-ui text-[12px] font-medium text-ink transition-colors hover:border-accent/40 hover:text-accent"
      >
        <Share2 size={15} strokeWidth={1.7} aria-hidden="true" />
        <Bi bn="শেয়ার" en="Share" />
      </button>

      <div aria-live="polite" className="sr-only">
        {copied ? "Link copied / লিংক কপি হয়েছে" : ""}
      </div>

      {open ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Share options"
          className="absolute right-0 z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border border-rule bg-bg p-2 shadow-[0_16px_40px_rgb(31_29_26_/_0.14)]"
          style={{ maxHeight: "min(70vh, 30rem)" }}
        >
          {canNativeShare ? (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={nativeShare}
                className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left font-ui text-[13px] text-ink transition-colors hover:bg-surface"
              >
                <Share2
                  size={16}
                  strokeWidth={1.7}
                  aria-hidden="true"
                  className="text-accent"
                />
                <Bi bn="সিস্টেমে শেয়ার" en="Share via device" />
              </button>
              <div className="my-1 border-t border-rule" />
            </>
          ) : null}

          <button
            type="button"
            role="menuitem"
            onClick={copyLink}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left font-ui text-[13px] text-ink transition-colors hover:bg-surface"
          >
            {copied ? (
              <Check
                size={16}
                strokeWidth={2}
                aria-hidden="true"
                className="text-accent"
              />
            ) : (
              <Link2
                size={16}
                strokeWidth={1.7}
                aria-hidden="true"
                className="text-accent"
              />
            )}
            <Bi
              bn={copied ? "লিংক কপি হয়েছে" : "লিংক কপি করুন"}
              en={copied ? "Link copied" : "Copy link"}
            />
          </button>

          <div className="my-1 border-t border-rule" />

          {targets.map((target) => (
            <a
              key={target.labelEn}
              role="menuitem"
              href={target.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center gap-3 rounded-xl px-3 font-ui text-[13px] text-ink transition-colors hover:bg-surface"
            >
              <span
                aria-hidden="true"
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-rule text-muted"
              >
                {target.icon}
              </span>
              <Bi bn={target.labelBn} en={target.labelEn} />
              <ExternalLink
                size={12}
                strokeWidth={1.6}
                aria-hidden="true"
                className="ml-auto text-muted"
              />
            </a>
          ))}

          <a
            role="menuitem"
            href={`mailto:?subject=${encodedText}&body=${encodeURIComponent(`${title}\n\n${url}`)}`}
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 font-ui text-[13px] text-ink transition-colors hover:bg-surface"
          >
            <Mail
              size={16}
              strokeWidth={1.7}
              aria-hidden="true"
              className="text-accent"
            />
            <Bi bn="ইমেইলে পাঠান" en="Send by email" />
          </a>

          <div className="my-1 border-t border-rule" />

          <a
            role="menuitem"
            href={squareImageUrl}
            download
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 font-ui text-[13px] text-ink transition-colors hover:bg-surface"
          >
            <Download
              size={16}
              strokeWidth={1.7}
              aria-hidden="true"
              className="text-accent"
            />
            <Bi bn="স্কোয়ার ছবি ডাউনলোড" en="Download square image" />
          </a>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              buttonRef.current?.focus();
            }}
            className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left font-ui text-[13px] text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <X size={16} strokeWidth={1.7} aria-hidden="true" />
            <Bi bn="বন্ধ করুন" en="Close" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
