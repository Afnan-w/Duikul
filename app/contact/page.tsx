import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";
import { staticPages } from "@/lib/static-pages";

export const metadata: Metadata = {
  title: staticPages.contact.title.en,
  description: staticPages.contact.intro.en,
};

export default function ContactPage() {
  return <StaticPage id="contact" />;
}
