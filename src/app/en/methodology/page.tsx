import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo/metadata";
import MethodologyPage from "../../(bn)/methodology/page";

export const metadata: Metadata = createPageMetadata({
  path: "/en/methodology",
  locale: "en",
  title: "Methodology",
  description:
    "How Duikul gathers reports, groups coverage of the same event, marks confirmation, and retires stories after 14 days — with the number behind each rule.",
  ogTitle: "Methodology — Duikul",
  ogType: "website",
  languages: { bn: "/methodology", en: "/en/methodology" },
});

export default function EnglishMethodologyPage() {
  return <MethodologyPage locale="en" />;
}
