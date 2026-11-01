import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo/metadata";
import CorrectionsPage from "../../(bn)/corrections/page";

export const metadata: Metadata = createPageMetadata({
  path: "/en/corrections",
  locale: "en",
  title: "Corrections",
  description:
    "How to report an error, what we check against the publisher, how corrections and removals are applied, and the log of published corrections.",
  ogTitle: "Corrections — Duikul",
  ogType: "website",
  languages: { bn: "/corrections", en: "/en/corrections" },
});

export default function EnglishCorrectionsPage() {
  return <CorrectionsPage locale="en" />;
}
