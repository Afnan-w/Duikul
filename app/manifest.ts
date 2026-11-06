/*
  INSTALLABLE APP MANIFEST (PWA)  - served at /manifest.webmanifest
  -----------------------------------------------------------------
  This is what lets visitors "Add Duikul to Home Screen" and run it
  without a browser bar, like an app - on Android, iPhone and
  desktop. Also what search engines read as the app identity.

  Free everywhere, no store account needed.
*/

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Duikul - দেশি ও বিদেশি সংবাদ",
    short_name: "Duikul",
    description:
      "বিশ্বস্ত সংবাদমাধ্যম থেকে সংগ্রহ করা দেশি ও বিদেশি সংবাদ, এক জায়গায়। Top Bangladesh and world news, gathered from trusted outlets in one place.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FAF8F5",
    theme_color: "#0B6B4F",
    lang: "bn",
    dir: "ltr",
    categories: ["news"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        // Full-bleed version for Android's round/squircle masks.
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
