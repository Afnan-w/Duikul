import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo/metadata";
import AboutPage from "../../(bn)/about/page";

export const metadata: Metadata = createPageMetadata({
  path: "/en/about",
  locale: "en",
  title: "About & methodology",
  description:
    "How Duikul brings Bangladesh and world news into one calm place, groups coverage of the same event, marks confirmation, and states its limits.",
  ogTitle: "About & methodology — Duikul",
  ogType: "website",
  languages: { bn: "/about", en: "/en/about" },
});

export default function EnglishAboutPage() {
  return <AboutPage locale="en" />;
}
