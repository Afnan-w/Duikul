import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo/metadata";
import TermsPage from "../../(bn)/terms/page";

export const metadata: Metadata = createPageMetadata({
  path: "/en/terms",
  locale: "en",
  title: "Terms of use",
  description:
    "Terms for using Duikul: ownership of headlines and excerpts, the advertising-free model, liability limits, and how the terms change.",
  ogTitle: "Terms of use — Duikul",
  ogType: "website",
  languages: { bn: "/terms", en: "/en/terms" },
});

export default function EnglishTermsPage() {
  return <TermsPage />;
}
