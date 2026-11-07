import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  path: "/editorial-policy",
  kicker: "সম্পাদনী নীতি",
  title: "সম্পাদনী নীতি — যাচাইয়ের পদ্ধতি | Editorial Policy",
  ogTitle: "সম্পাদনী নীতি — কীভাবে খবর বাছাই হয়",
  description:
    "কোন সংবাদ কীভাবে বাছাই ও র‍্যাঙ্ক হয়: শুধুমাত্র whitelist-ভুক্ত বিশ্বস্ত সংবাদমাধ্যম, সূত্রসংখ্যা অনুযায়ী র‍্যাঙ্ক, '১০০% যাচাইকৃত' দাবি নয়। পুরো পদ্ধতি পড়ুন।",
});

export default function EditorialPolicyPage() {
  return <StaticPage id="editorial-policy" />;
}
