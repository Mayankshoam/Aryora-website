import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SearchModal from "@/components/SearchModal";
import SizeGuideModal from "@/components/SizeGuideModal";
import StoreLocatorModal from "@/components/StoreLocatorModal";
import WhatsAppButton from "@/components/WhatsAppButton";

export const viewport: Viewport = {
  themeColor: "#FAF8F4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "Aryora — Light. Legacy. You. | Fine Lab-Grown Jewellery",
    template: "%s | Aryora",
  },
  description:
    "Aryora is a Lucknow-based fine jewellery brand crafting IGI-certified lab-grown diamond, 18K gold and 92.5 silver pieces for modern India. Light. Legacy. You.",
  metadataBase: new URL("https://aryora-website-d3sv.vercel.app"),
  alternates: {
    canonical: "/",
  },
  keywords: [
    "lab grown diamond jewellery Lucknow",
    "IGI certified lab diamonds",
    "custom engagement rings India",
    "ethical gold jewellery",
    "92.5 sterling silver diamond jewellery",
    "Aryora legacy",
  ],
  authors: [{ name: "Aryora Fine Jewellery" }],
  creator: "Aryora",
  publisher: "Aryora",
  openGraph: {
    title: "Aryora — Light. Legacy. You.",
    description:
      "IGI-certified lab-grown diamonds, 18K gold and 92.5 silver heirlooms crafted for modern India.",
    url: "https://aryora-website-d3sv.vercel.app",
    siteName: "Aryora",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/site/hero-poster.svg",
        width: 1200,
        height: 630,
        alt: "Aryora Fine Jewellery Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aryora — Light. Legacy. You.",
    description:
      "IGI-certified lab-grown diamond & fine gold jewellery for modern India.",
    images: ["/site/hero-poster.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    name: "Aryora",
    url: "https://aryora-website-d3sv.vercel.app",
    logo: "https://aryora-website-d3sv.vercel.app/site/brand-emblem.svg",
    description:
      "Lucknow-based fine jewellery house crafting IGI-certified lab-grown diamond, 18K gold and 92.5 silver pieces.",
    telephone: "+91-8808828646",
    email: "aryora.legacy@hotmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lucknow",
      addressRegion: "Uttar Pradesh",
      addressCountry: "IN",
    },
    sameAs: ["https://instagram.com/aryora.legacy"],
    priceRange: "₹₹₹",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "11:00",
      closes: "20:00",
    },
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </head>
      <body className="bg-ivory text-ink font-body antialiased flex flex-col min-h-screen">
        {/* WCAG 2.2 AA Skip Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-ink focus:text-ivory focus:font-medium focus:text-sm focus:shadow-md focus:outline-none"
        >
          Skip to main content
        </a>

        <Header />
        <main id="main-content" className="flex-1 focus:outline-none">
          {children}
        </main>
        <Footer />

        {/* Global Interactive Elements */}
        <CartDrawer />
        <SearchModal />
        <SizeGuideModal />
        <StoreLocatorModal />
        <WhatsAppButton />
      </body>
    </html>
  );
}
