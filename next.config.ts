import type { NextConfig } from "next";

/*
  Next.js configuration for Duikul.

  We deliberately keep the SIMPLE ("classic") caching model:
    - No Cache Components / partial prefetching.
    - Pages refresh themselves every 5-10 minutes using ISR
      (export const revalidate = ... in the page files).
  This avoids extra Suspense wrappers and is easier to reason about.
*/
const nextConfig: NextConfig = {
  turbopack: {
    // Makes sure Next resolves packages from THIS folder only.
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.prothomalo.com" },
      { protocol: "https", hostname: "www.thedailystar.net" },
      { protocol: "https", hostname: "www.dhakatribune.com" },
      { protocol: "https", hostname: "tbsnews.net" },
      { protocol: "https", hostname: "samakal.com" },
      { protocol: "https", hostname: "www.banglatribune.com" },
      { protocol: "https", hostname: "channelionline.com" },
      { protocol: "https", hostname: "observerbd.com" },
      { protocol: "https", hostname: "thedhakatimes.com" },
      { protocol: "https", hostname: "feeds.bbci.co.uk" },
      { protocol: "https", hostname: "www.aljazeera.com" },
      { protocol: "https", hostname: "www.theguardian.com" },
      { protocol: "https", hostname: "feeds.npr.org" },
      { protocol: "https", hostname: "rss.dw.com" },
      { protocol: "https", hostname: "www.france24.com" },
    ],
  },
};

export default nextConfig;
