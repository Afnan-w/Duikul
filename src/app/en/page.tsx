import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo/metadata";
import {
  SITE_DESCRIPTION_EN,
  SITE_NAME,
  SITE_TAGLINE_EN,
} from "@/config/site";
import HomePage from "../(bn)/page";

export const revalidate = 300;

export const metadata: Metadata = {
  title: `${SITE_NAME} — ${SITE_TAGLINE_EN}`,
  description: SITE_DESCRIPTION_EN,
  alternates: {
    canonical: absoluteUrl("/en"),
    languages: {
      bn: absoluteUrl("/"),
      en: absoluteUrl("/en"),
      "x-default": absoluteUrl("/"),
    },
  },
  openGraph: {
    title: `${SITE_NAME} — ${SITE_TAGLINE_EN}`,
    description: SITE_DESCRIPTION_EN,
    url: absoluteUrl("/en"),
    locale: "en_US",
    alternateLocale: ["bn_BD"],
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE_EN}`,
    description: SITE_DESCRIPTION_EN,
  },
};

export default function EnglishHomePage() {
  return <HomePage />;
}
