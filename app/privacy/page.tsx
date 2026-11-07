import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  path: "/privacy",
  kicker: "গোপনীয়তা নীতি",
  title: "গোপনীয়তা নীতি — কোনো ট্র্যাকিং নেই | Privacy Policy",
  ogTitle: "গোপনীয়তা নীতি — দুইকূল",
  description:
    "দুইকূল ব্যক্তিগত তথ্য সংগ্রহ করে না — কুকি নেই, বিজ্ঞাপন নেই, ট্র্যাকার নেই। থিম ও ভাষার পছন্দ শুধু আপনার ব্রাউজারে থাকে। পুরো নীতি পড়ুন।",
});

export default function PrivacyPage() {
  return <StaticPage id="privacy" />;
}
