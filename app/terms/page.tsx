import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  path: "/terms",
  kicker: "শর্তাবলি",
  title: "শর্তাবলি — ব্যবহারের শর্ত | Terms of Use",
  ogTitle: "শর্তাবলি — দুইকূল",
  description:
    "দুইকূল ব্যবহারের শর্ত: সব সংবাদ ও ছবির স্বত্ব মূল সংবাদমাধ্যমের। আমরা কেবল শিরোনাম, সংক্ষিপ্ত সারসংক্ষেপ ও মূল লিংক দেখাই। শর্ত পড়ুন।",
});

export default function TermsPage() {
  return <StaticPage id="terms" />;
}
