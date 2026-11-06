import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";
import { staticPages } from "@/lib/static-pages";

export const metadata: Metadata = {
  title: staticPages.about.title.en,
  description: staticPages.about.intro.en,
};

export default function AboutPage() {
  return <StaticPage id="about" />;
}
