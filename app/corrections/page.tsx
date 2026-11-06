import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";
import { staticPages } from "@/lib/static-pages";

export const metadata: Metadata = {
  title: staticPages.corrections.title.en,
  description: staticPages.corrections.intro.en,
};

export default function CorrectionsPage() {
  return <StaticPage id="corrections" />;
}
