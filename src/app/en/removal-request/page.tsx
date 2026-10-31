import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo/metadata";
import RemovalRequestPage from "../../(bn)/removal-request/page";

export const metadata: Metadata = createPageMetadata({
  path: "/en/removal-request",
  locale: "en",
  title: "Removal request",
  description:
    "How publishers, lawyers, or concerned citizens can request removal or correction of a headline or snippet — the process, requirements, and timeline.",
  ogTitle: "Removal request — Duikul",
  ogType: "website",
  languages: { bn: "/removal-request", en: "/en/removal-request" },
});

export default function EnglishRemovalRequestPage() {
  return <RemovalRequestPage />;
}
