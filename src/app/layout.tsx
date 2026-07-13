import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import CookieConsent from "./components/CookieConsent";
import SiteWideJsonLd from "@/components/seo/SiteWideJsonLd";
import { SITE_META_DESCRIPTION, SITE_TAGLINE } from "@/content/siteSeo";
import { SITE_LEGAL_NAME, SITE_NAME, SITE_URL } from "@/lib/brand";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3b82f6",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | UK Van Fleet & DVSA Compliance Software`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_META_DESCRIPTION,
  authors: [{ name: SITE_NAME }],
  generator: "Next.js",
  applicationName: SITE_NAME,
  referrer: "origin-when-cross-origin",
  creator: SITE_LEGAL_NAME,
  publisher: SITE_LEGAL_NAME,
  category: "business",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `${SITE_NAME} | UK Van Fleet & DVSA Compliance Software`,
    description: SITE_META_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — UK van fleet DVSA walkaround checks and defect reporting`,
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | UK Van Fleet & DVSA Compliance Software`,
    description: SITE_TAGLINE,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
  other: {
    "geo.region": "GB",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" className="scroll-smooth">
      <head>
        {/* iOS Smart App Banner */}
        <meta name="apple-itunes-app" content={`app-id=6744621973, app-argument=${SITE_URL}`} />
        
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="application-name" content={SITE_NAME} />
        <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
        <meta name="msapplication-tooltip" content={`${SITE_NAME} — UK van fleet DVSA compliance (not inventory software)`} />
        <meta name="language" content="en-GB" />
        <meta name="copyright" content={`© ${new Date().getFullYear()} ${SITE_LEGAL_NAME}`} />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="alternate" type="text/plain" title="LLMs" href="/llms.txt" />
        <SiteWideJsonLd />
      </head>
      <body className={`${inter.className} antialiased bg-black min-h-screen flex flex-col`}>
        {children}
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
