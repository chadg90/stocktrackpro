import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import CookieConsent from "./components/CookieConsent";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#fea917",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://stocktrackpro.com'),
  title: "Stock Track PRO | Professional Tool & Equipment Management System",
  description: "Transform your equipment management with Stock Track PRO. Our QR-based tracking system helps construction companies, workshops, and industrial facilities manage tools efficiently. Trusted by UK businesses.",
  keywords: "tool tracking, equipment management, QR code tracking, construction tools, workshop management, industrial equipment tracking, UK tool management, asset tracking software",
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
    title: "Stock Track PRO | Professional Tool & Equipment Management System",
    description: "Transform your equipment management with Stock Track PRO. Our QR-based tracking system helps construction companies, workshops, and industrial facilities manage tools efficiently. Trusted by UK businesses.",
    url: "https://stocktrackpro.com",
    siteName: "Stock Track PRO",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Stock Track PRO - Professional Tool Management System",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stock Track PRO | Professional Tool & Equipment Management System",
    description: "Transform your equipment management with Stock Track PRO. Our QR-based tracking system helps construction companies, workshops, and industrial facilities manage tools efficiently. Trusted by UK businesses.",
    images: ["/og-image.jpg"],
    creator: "@stocktrackpro",
    site: "@stocktrackpro",
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
  verification: {
    google: "your-google-verification-code",
    yandex: "yandex-verification-code",
    yahoo: "yahoo-verification-code",
    other: {
      "msvalidate.01": "microsoft-verification-code",
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
    "geo.position": "51.509865;-0.118092", // London coordinates as default
    "ICBM": "51.509865, -0.118092",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* iOS Smart App Banner */}
        <meta name="apple-itunes-app" content="app-id=6744621973, app-argument=https://stocktrackpro.com" />
        
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#fea917" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#fea917" />
        <meta name="application-name" content="Stock Track PRO" />
        <meta name="apple-mobile-web-app-title" content="Stock Track PRO" />
        <meta name="msapplication-tooltip" content="Professional Tool & Equipment Management System" />
        <meta name="language" content="en-GB" />
        <meta name="copyright" content={`© ${new Date().getFullYear()} Stock Track PRO Ltd`} />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Stock Track PRO",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "All",
              "description": "Professional tool and equipment management system with QR-based tracking",
              "offers": {
                "@type": "Offer",
                "price": "7.99",
                "priceCurrency": "GBP",
                "priceValidUntil": new Date(
                  new Date().setFullYear(new Date().getFullYear() + 1)
                ).toISOString().split('T')[0],
                "availability": "https://schema.org/InStock",
                "seller": {
                  "@type": "Organization",
                  "name": "Stock Track PRO Ltd",
                  "url": "https://stocktrackpro.com"
                }
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "127",
                "bestRating": "5",
                "worstRating": "1"
              },
              "provider": {
                "@type": "Organization",
                "name": "Stock Track PRO Ltd",
                "url": "https://stocktrackpro.com",
                "logo": "https://stocktrackpro.com/logo.png",
                "address": {
                  "@type": "PostalAddress",
                  "addressCountry": "GB"
                },
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "customer support",
                  "email": "support@stocktrackpro.com"
                }
              },
              "featureList": [
                "QR code tracking system",
                "Real-time location tracking",
                "Mobile access",
                "Cost control",
                "Maintenance tracking",
                "Team management"
              ],
              "screenshot": "https://stocktrackpro.com/screenshot.jpg",
              "softwareVersion": "1.0"
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-black min-h-screen flex flex-col`}>
        {children}
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
