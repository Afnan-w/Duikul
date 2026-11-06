import Link from "next/link";

/* 404 page - shown whenever a link does not exist. */

export default function NotFound() {
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

      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center rounded-full bg-accent-strong px-7 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90"
      >
        হোমে ফিরে যান / Back home
      </Link>
    </main>
  );
}
