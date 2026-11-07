import Link from "next/link";
import type { Metadata } from "next";

/* 404 page - shown whenever a link does not exist. */

export const metadata: Metadata = {
  title: "পাতাটি পাওয়া যায়নি | Page not found — Duikul",
  description:
    "ঠিকানাটি নেই বা সরানো হয়েছে। এখান থেকে আজকের দেশি ও বিদেশি সংবাদে ফিরে যান — হোম, দেশি, বিদেশি, বিভাগ বা খোঁজার পাতা।",
  robots: { index: false, follow: true },
  alternates: { canonical: "/" },
};

export default function NotFound() {
  const links = [
    { href: "/", bn: "হোম — আজকের শীর্ষ সংবাদ", en: "Home — today's top news" },
    { href: "/deshi", bn: "দেশি সংবাদ (Deshi news)", en: "Deshi news" },
    { href: "/bideshi", bn: "বিদেশি সংবাদ (Bideshi news)", en: "Bideshi news" },
    { href: "/categories", bn: "সব বিভাগ", en: "All categories" },
    { href: "/search", bn: "সংবাদ খুঁজুন", en: "Search news" },
  ];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="serif text-7xl font-bold text-line">404</p>

      <h1 className="serif mt-4 text-3xl font-bold tracking-tight text-fg">
        পাতাটি পাওয়া যায়নি / Page not found
      </h1>

      <p className="article-body mt-3 max-w-md text-muted">
        আপনার খোঁজা ঠিকানাটি নেই অথবা সরিয়ে ফেলা হয়েছে। / The address you
        are looking for does not exist or has been moved.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex min-h-11 items-center rounded-full border border-line bg-card px-5 text-sm text-fg/85 transition-colors hover:border-accent hover:text-accent"
          >
            {link.bn}
          </Link>
        ))}
      </div>

      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center rounded-full bg-accent-strong px-7 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90"
      >
        হোমে ফিরে যান / Back home
      </Link>
    </main>
  );
}
