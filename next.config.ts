import type { NextConfig } from "next";

/** Social/PWA shell files are not fingerprinted, so revalidate them always. */
const revalidateShell = [
  { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Article thumbnails are plain <img> elements by design: Vercel's free
    // image-optimization quota is not part of this project's budget.
    unoptimized: true,
  },
  async headers() {
    return [
      {
        // HSTS first: after the first HTTPS visit, browsers refuse plain HTTP
        // for two years (no `preload` — that commitment is made deliberately,
        // later, in SEO_CHECKLIST.md). The rest are defence-in-depth headers
        // neither Next nor Vercel sets for us.
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // Fingerprinted build assets are immutable upstream (Next sets
        // `public, max-age=31536000, immutable` and it cannot be overridden);
        // these rules cover the un-fingerprinted files in /public.
        source: "/manifest.webmanifest",
        headers: revalidateShell,
      },
      {
        source: "/icons/:path*",
        headers: revalidateShell,
      },
      {
        source: "/og-default.png",
        headers: revalidateShell,
      },
    ];
  },
  turbopack: {
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
