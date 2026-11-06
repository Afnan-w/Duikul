import type { Metadata } from "next";
import { ListingPage } from "@/components/listing";
import { getStories } from "@/lib/news";
import { categories } from "@/lib/site";

type Props = { params: Promise<{ name: string }> };

export const revalidate = 600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const match = categories.find((item) => item.slug === name);
  const label = match ? match.en : name;

  return {
    title: `${label} News`,
    description: `The latest ${label} news, grouped by story and reported by trusted outlets.`,
    alternates: { canonical: `/category/${name}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { name } = await params;
  const match = categories.find((item) => item.slug === name);

  // Localised heading in both languages; fall back to the raw slug.
  const heading = match
    ? { bn: match.bn, en: match.en }
    : { bn: name, en: name };

  const stories = await getStories({ category: name, limit: 50 });

  return <ListingPage heading={heading} stories={stories} />;
}
