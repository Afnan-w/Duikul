import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo/metadata";
import PrivacyPage from "../../(bn)/privacy/page";

export const metadata: Metadata = createPageMetadata({
  path: "/en/privacy",
  locale: "en",
  title: "Privacy policy",
  description:
    "What Duikul stores, what it does not collect, and the choices you have over your data — in plain language.",
  ogTitle: "Privacy policy — Duikul",
  ogType: "website",
  languages: { bn: "/privacy", en: "/en/privacy" },
});

export default function EnglishPrivacyPage() {
  return <PrivacyPage locale="en" />;
}
