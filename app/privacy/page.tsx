import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";
import { staticPages } from "@/lib/static-pages";

export const metadata: Metadata = {
  title: staticPages.privacy.title.en,
  description: staticPages.privacy.intro.en,
};

export default function PrivacyPage() {
  return <StaticPage id="privacy" />;
}
