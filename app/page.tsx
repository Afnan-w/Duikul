import type { Metadata } from "next";
import { HomeView } from "@/components/home-view";
import { getAllStories } from "@/lib/news";

/*
  HOME PAGE (server component)
  ----------------------------
  This runs on the server, downloads all 15 feeds ONCE every
  10 minutes (Vercel caches them) and passes the stories to the
  client view below. The visitor's browser never talks to the
  news sites directly.
*/

/* The page HTML itself is refreshed every 10 minutes too. */
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Duikul - Top Bangladesh & World News, Verified from Trusted Sources",
  description:
    "Top Bangladesh (Deshi) and world (Bideshi) news gathered from trusted outlets, grouped by story so you can see how many sources are reporting it.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const stories = await getAllStories();
  return <HomeView stories={stories} />;
}
