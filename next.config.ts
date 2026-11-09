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
  /* The OG route reads the Bangla fonts from disk and HarfBuzz
     loads its own .wasm next to the module - make sure both
     survive into the Vercel serverless bundle. */
  outputFileTracingIncludes: {
    "/api/og": [
      "./assets/fonts/**",
      "./node_modules/harfbuzzjs/dist/*.wasm",
    ],
  },
  async headers() {
    return [
      {
        // Every page except /search: generous indexing permissions -
        // large image previews (Google Discover) and unlimited
        // snippets. The lookahead keeps /search out of this rule so
        // the two directives never mix on one response.
        source: "/((?!search).*)",
        headers: [
          {
            key: "X-Robots-Tag",
            value:
              "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
          },
        ],
      },
      {
        // Internal search results: keep them out of the index.
        source: "/search",
        headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
      },
    ];
  },
};

export default nextConfig;
