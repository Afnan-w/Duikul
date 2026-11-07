import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  path: "/corrections",
  kicker: "সংশোধনী নীতি",
  title: "সংশোধনী নীতি — স্বচ্ছ সংশোধন | Corrections Policy",
  ogTitle: "সংশোধনী নীতি — দুইকূল",
  description:
    "ভুল পেলে দুইকূল সংশোধন করে স্বচ্ছভাবে জানায়। মূল সংবাদমাধ্যমের তথ্যের ভুল সেখানেই ঠিক হয়, আমাদের নিজের ভুলে সংশোধনী যোগ হয়।",
});

export default function CorrectionsPage() {
  return <StaticPage id="corrections" />;
}
