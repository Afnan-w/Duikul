/*
  ============================================================
  NEWS SOURCES  <<<  THIS IS THE ONLY FILE YOU EDIT TO
  ADD OR REMOVE A NEWS OUTLET  >>>
  ============================================================
  One line = one news outlet. To remove an outlet, delete its
  block. To add one, copy a block and change the values.

  Fields:
    id       short English name (no spaces, used in code)
    name     the name shown to readers
    url      the outlet's real RSS feed address (must work!)
    section  "deshi" (Bangladesh) or "bideshi" (world)
    trust    3 = top-tier, widely trusted
             2 = solid, well-known
             1 = smaller / newer outlet
             (higher trust = its stories rank a little higher)
    enabled  true = we fetch it. false = temporarily off.

  TIP: test any feed address with:  node scripts/check-feeds.mjs
  ============================================================
*/

import type { Section } from "@/lib/rss";

export type Source = {
  id: string;
  name: string;
  url: string;
  section: Section;
  trust: 1 | 2 | 3;
  enabled: boolean;
};

export const sources: Source[] = [
  /* ---------------- দেশি / Bangladesh (9) ---------------- */

  {
    id: "prothom-alo",
    name: "Prothom Alo",
    url: "https://www.prothomalo.com/feed",
    section: "deshi",
    trust: 3,
    enabled: true,
  },
  {
    id: "daily-star",
    name: "The Daily Star",
    url: "https://www.thedailystar.net/rss.xml",
    section: "deshi",
    trust: 3,
    enabled: true,
  },
  {
    id: "dhaka-tribune",
    name: "Dhaka Tribune",
    url: "https://www.dhakatribune.com/feed/",
    section: "deshi",
    trust: 2,
    enabled: true,
  },
  {
    id: "business-standard",
    name: "The Business Standard",
    url: "https://tbsnews.net/rss.xml",
    section: "deshi",
    trust: 2,
    enabled: true,
  },
  {
    id: "samakal",
    name: "Samakal",
    url: "https://samakal.com/rss",
    section: "deshi",
    trust: 2,
    enabled: true,
  },
  {
    id: "bangla-tribune",
    name: "Bangla Tribune",
    url: "https://www.banglatribune.com/feed/",
    section: "deshi",
    trust: 2,
    enabled: true,
  },
  {
    id: "channel-i",
    name: "Channel i",
    url: "https://channelionline.com/feed",
    section: "deshi",
    trust: 1,
    enabled: true,
  },
  {
    id: "observer-bd",
    name: "The Daily Observer",
    url: "https://observerbd.com/rss",
    section: "deshi",
    trust: 1,
    enabled: true,
  },
  {
    id: "dhaka-times",
    name: "The Dhaka Times",
    url: "https://thedhakatimes.com/feed",
    section: "deshi",
    trust: 1,
    enabled: true,
  },

  /* ---------------- বিদেশি / World (6) ---------------- */

  {
    id: "bbc",
    name: "BBC News",
    url: "https://feeds.bbci.co.uk/news/rss.xml",
    section: "bideshi",
    trust: 3,
    enabled: true,
  },
  {
    id: "al-jazeera",
    name: "Al Jazeera",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    section: "bideshi",
    trust: 3,
    enabled: true,
  },
  {
    id: "guardian",
    name: "The Guardian",
    url: "https://www.theguardian.com/world/rss",
    section: "bideshi",
    trust: 3,
    enabled: true,
  },
  {
    id: "npr",
    name: "NPR",
    url: "https://feeds.npr.org/1001/rss.xml",
    section: "bideshi",
    trust: 3,
    enabled: true,
  },
  {
    id: "dw",
    name: "DW",
    url: "https://rss.dw.com/rdf/rss-en-all",
    section: "bideshi",
    trust: 3,
    enabled: true,
  },
  {
    id: "france24",
    name: "France 24",
    url: "https://www.france24.com/en/rss",
    section: "bideshi",
    trust: 3,
    enabled: true,
  },
];

/* Only the enabled ones are actually fetched. */
export const activeSources = sources.filter((source) => source.enabled);
