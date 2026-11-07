import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { CategoriesView } from "@/components/categories-view";
import { breadcrumbJsonLd, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  path: "/categories",
  kicker: "বিভাগ অনুযায়ী সংবাদ",
  title: "সব বিভাগ — রাজনীতি, খেলাধুলা, প্রযুক্তি | Duikul Categories",
  ogTitle: "সব বিভাগ — বাংলাদেশ ও বিশ্বের খবর",
  description:
    "বিভাগভিত্তিক সংবাদ দেখুন: রাজনীতি, বাণিজ্য, খেলাধুলা, প্রযুক্তি, বিনোদন ও স্বাস্থ্য — বিশ্বস্ত সংবাদমাধ্যম থেকে সংগৃহীত দেশি ও বিদেশি খবর, এক জায়গায়।",
});

export default function CategoriesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "দুইকূল", path: "/" },
          { name: "সব বিভাগ", path: "/categories" },
        ])}
      />
      <CategoriesView />
    </>
  );
}
