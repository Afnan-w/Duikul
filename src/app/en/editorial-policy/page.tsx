import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo/metadata";
import EditorialPolicyPage from "../../(bn)/editorial-policy/page";

export const metadata: Metadata = createPageMetadata({
  path: "/en/editorial-policy",
  locale: "en",
  title: "Editorial policy",
  description:
    "What Duikul publishes (headline, snippet, source link), what it never does, how sources are chosen, and the automation disclosure.",
  ogTitle: "Editorial policy — Duikul",
  ogType: "website",
  languages: { bn: "/editorial-policy", en: "/en/editorial-policy" },
});

export default function EnglishEditorialPolicyPage() {
  return <EditorialPolicyPage locale="en" />;
}
