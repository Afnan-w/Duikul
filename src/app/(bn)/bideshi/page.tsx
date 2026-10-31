import type { Metadata } from "next";
import { SectionPageView } from "@/components/story/SectionPageView";
import { SECTIONS } from "@/config/sections";
import { listClusters } from "@/lib/data/clusters";
import { isSupabaseConfigured } from "@/lib/supabase/public";

export const revalidate = 300;

const section = SECTIONS.bideshi;

export const metadata: Metadata = {
  title: `${section.labelBn} — ${section.labelEn}`,
  description: section.descriptionBn,
  alternates: { canonical: section.href },
  openGraph: {
    title: `${section.labelBn} — ${section.labelEn}`,
    description: section.descriptionEn,
    url: section.href,
  },
};

export default async function BideshiPage() {
  const clusters = await listClusters({ category: "bideshi", limit: 30 });

  return (
    <SectionPageView
      category="bideshi"
      clusters={clusters}
      configured={isSupabaseConfigured()}
    />
  );
}
