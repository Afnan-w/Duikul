import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo/metadata";
import ContactPage from "../../(bn)/contact/page";

export const metadata: Metadata = createPageMetadata({
  path: "/en/contact",
  locale: "en",
  title: "Contact",
  description:
    "Duikul's only official contact address, what to include in your message, the expected reply time, and who operates the site.",
  ogTitle: "Contact — Duikul",
  ogType: "website",
  languages: { bn: "/contact", en: "/en/contact" },
});

export default function EnglishContactPage() {
  return <ContactPage />;
}
