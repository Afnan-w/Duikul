import type { Metadata } from "next";
import { CategoriesView } from "@/components/categories-view";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse news by category: politics, business, sports, technology, entertainment and health.",
};

export default function CategoriesPage() {
  return <CategoriesView />;
}
