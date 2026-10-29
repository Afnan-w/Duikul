import type { MetadataRoute } from "next";
import { SECTION_LIST } from "@/config/sections";
import { SITE_DESCRIPTION_BN, SITE_NAME, SITE_NAME_BN } from "@/config/site";

/**
 * Installable web app manifest. The two section shortcuts mirror the only
 * two editorial sections so an installed app opens straight into them.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${SITE_NAME_BN} — ${SITE_NAME}`,
    short_name: SITE_NAME_BN,
    description: SITE_DESCRIPTION_BN,
    lang: "bn",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#faf8f5",
    theme_color: "#faf8f5",
    categories: ["news", "magazines"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      ...SECTION_LIST.map((section) => ({
        name: `${section.labelBn} — ${section.labelEn}`,
        short_name: section.shortBn,
        url: section.href,
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      })),
      {
        name: "খুঁজুন — Search",
        short_name: "খুঁজুন",
        url: "/search",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
  };
}
