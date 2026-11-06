import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";
import { staticPages } from "@/lib/static-pages";

export const metadata: Metadata = {
  title: staticPages["editorial-policy"].title.en,
  description: staticPages["editorial-policy"].intro.en,
};

export default function EditorialPolicyPage() {
  return <StaticPage id="editorial-policy" />;
}
