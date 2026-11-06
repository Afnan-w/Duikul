import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";
import { staticPages } from "@/lib/static-pages";

export const metadata: Metadata = {
  title: staticPages.terms.title.en,
  description: staticPages.terms.intro.en,
};

export default function TermsPage() {
  return <StaticPage id="terms" />;
}
