import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import CookieConsent from "./components/CookieConsent";
import SiteWideJsonLd from "@/components/seo/SiteWideJsonLd";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3b82f6",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.stocktrackpro.co.uk'),
  title: {
    default: "Stock Track PRO | UK Fleet Management Software",
    template: "%s | Stock Track PRO",
  },
  description:
    "UK fleet management software for SMEs. Track MOTs, vehicle tax, daily inspections and defect resolution in one platform. Free 7-day trial.",
  keywords:
    "fleet inspection software UK, vehicle defect reporting app, O-licence compliance software, MOT tracking software for fleets, fleet management app for vans, DVLA fleet checks, fleet compliance UK",
  authors: [{ name: "Stock Track PRO" }],
  generator: "Next.js",
  applicationName: "Stock Track PRO",
  referrer: "origin-when-cross-origin",
  creator: "Stock Track PRO Ltd",
  publisher: "Stock Track PRO Ltd",
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
    title: "Stock Track PRO | UK Fleet Management Software",
    description:
      "UK fleet management software for SMEs. Track MOTs, vehicle tax, daily inspections and defect resolution in one platform. Free 7-day trial.",
    url: "https://www.stocktrackpro.co.uk",
    siteName: "Stock Track PRO",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Stock Track PRO — UK fleet management, inspections, and defect reporting",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stock Track PRO | UK Fleet Management Software",
    description:
      "UK fleet management software for SMEs — MOTs, tax, inspections, defect resolution. Free 7-day trial.",
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
    title: "Stock Track PRO",
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
        <meta name="apple-itunes-app" content="app-id=6744621973, app-argument=https://www.stocktrackpro.co.uk" />
        
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="application-name" content="Stock Track PRO" />
        <meta name="apple-mobile-web-app-title" content="Stock Track PRO" />
        <meta name="msapplication-tooltip" content="Stock Track PRO — UK fleet compliance software" />
        <meta name="language" content="en-GB" />
        <meta name="copyright" content={`© ${new Date().getFullYear()} Stock Track PRO Ltd`} />
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
