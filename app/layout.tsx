import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Inter, Noto_Serif_Bengali, Source_Serif_4 } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { LanguageProvider } from "@/components/language";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SwRegister } from "@/components/sw-register";
import { siteConfig } from "@/lib/site";

/*
  FONTS - downloaded once at build time and served from this site,
  so visitors get no layout shift and no request to Google.
  Bangla body text -> Noto Serif Bengali   Bangla UI -> Hind Siliguri
  English body text -> Source Serif 4      English UI -> Inter
*/
const bnBody = Noto_Serif_Bengali({
  subsets: ["bengali", "latin"],
  variable: "--font-bn-body",
  display: "swap",
});

const bnUi = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bn-ui",
  display: "swap",
});

const enBody = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-en-body",
  display: "swap",
});

const enUi = Inter({
  subsets: ["latin"],
  variable: "--font-en-ui",
  display: "swap",
});

/*
  Runs before the page paints so visitors never see a white flash
  when they prefer dark mode. It reads:
    duikul-theme     -> "dark" / "light" / (empty = follow the device)
    duikul-textsize  -> "small" / "large"
*/
const earlyThemeScript = `
(function () {
  try {
    var root = document.documentElement;
    var saved = window.localStorage.getItem("duikul-theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark = saved ? saved === "dark" : prefersDark;
    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";

    var size = window.localStorage.getItem("duikul-textsize");
    if (size && size !== "normal") root.setAttribute("data-textsize", size);
  } catch (e) {}
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.tagline,
    template: "%s | Duikul",
  },
  description: siteConfig.descriptionBn,
  applicationName: "Duikul",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Duikul",
    locale: "bn_BD",
    url: "/",
    title: siteConfig.tagline,
    description: siteConfig.descriptionBn,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.tagline,
    description: siteConfig.descriptionBn,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F5" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="bn"
      className={`${bnBody.variable} ${bnUi.variable} ${enBody.variable} ${enUi.variable}`}
    >
      <body className="flex min-h-screen flex-col antialiased">
        <Script
          id="duikul-early-theme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: earlyThemeScript }}
        />
        <LanguageProvider>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
          <SwRegister />
        </LanguageProvider>
      </body>
    </html>
  );
}
