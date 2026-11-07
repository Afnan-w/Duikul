import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";
import { staticPages } from "@/lib/static-pages";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  path: "/about",
  kicker: "আমাদের সম্পর্কে — কেন দুইকূল",
  title: "আমাদের সম্পর্কে — কেন দুইকূল | About Duikul",
  ogTitle: "কেন দুইকূল — বিশ্বস্ত সূত্রের সংবাদ",
  description:
    "দুইকূল (Duikul) কীভাবে কাজ করে: বিশ্বস্ত সংবাদমাধ্যম থেকে সংগৃহীত দেশি ও বিদেশি সংবাদ এক জায়গায়, সূত্রসংখ্যার ব্যাজসহ। কেন দুইকূল — জেনে নিন।",
});

export default function AboutPage() {
  return <StaticPage id="about" />;
}
