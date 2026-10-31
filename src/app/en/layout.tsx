import type { Metadata, Viewport } from "next";
import {
  Hind_Siliguri,
  Inter,
  Noto_Serif_Bengali,
  Source_Serif_4,
} from "next/font/google";
import "../globals.css";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import {
  SITE_DESCRIPTION_EN,
  SITE_NAME,
  SITE_TAGLINE_EN,
  SITE_URL,
  GOOGLE_SITE_VERIFICATION,
  BING_SITE_VERIFICATION,
} from "@/config/site";

const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-noto-serif-bengali",
  preload: true,
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-hind-siliguri",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-source-serif",
});

const inter = Inter({
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
  variable: "--font-inter",
});

// On the English tree the URL is the source of truth: force `en` and persist
// it so navigation into shared (bilingual) pages keeps the English interface.
const themeInitScript = `(function(){try{var m=localStorage.getItem('kd-theme')||'system';var d=m==='dark'||(m!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light';document.documentElement.setAttribute('data-lang','en');document.documentElement.lang='en';try{localStorage.setItem('kd-lang','en');}catch(e){}}catch(e){}window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__kdInstallPrompt=e;});})();`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE_EN}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION_EN,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { telephone: false, email: false, address: false },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["bn_BD"],
    url: `${SITE_URL}/en`,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE_EN}`,
    description: SITE_DESCRIPTION_EN,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE_EN}`,
    description: SITE_DESCRIPTION_EN,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    ...(GOOGLE_SITE_VERIFICATION
      ? { google: GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(BING_SITE_VERIFICATION
      ? { other: { "msvalidate.01": BING_SITE_VERIFICATION } }
      : {}),
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F5" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
};

export default function EnglishRootLayout({
  children,
}: LayoutProps<"/en">) {
  return (
    <html
      lang="en"
      data-lang="en"
      suppressHydrationWarning
      className={`${notoSerifBengali.variable} ${hindSiliguri.variable} ${sourceSerif.variable} ${inter.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
          // Runs synchronously before first paint to avoid theme/lang flash.
        />
      </head>
      <body className="flex min-h-dvh flex-col bg-bg text-ink antialiased">
        <a href="#main" className="skip-link">
          <span className="lang-bn" lang="bn">
            মূল বিষয়বস্তুতে যান
          </span>
          <span className="lang-en" lang="en">
            Skip to content
          </span>
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="min-h-[60vh] flex-1">
          {children}
        </main>
        <SiteFooter />
        <ServiceWorkerRegistrar />
        <InstallPrompt />
      </body>
    </html>
  );
}
