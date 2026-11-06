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
};

export default nextConfig;
