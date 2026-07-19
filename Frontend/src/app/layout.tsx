import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "@/styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Aryora — Light. Legacy. You. | Lab-Grown Diamond, Gold & Silver Jewellery",
    template: "%s | Aryora",
  },
  description:
    "Aryora is a Lucknow-based fine jewellery house crafting ethical lab-grown diamond, gold, and 92.5 silver pieces for modern India — light, legacy, you.",
  metadataBase: new URL("https://www.aryora.com"),
  openGraph: {
    title: "Aryora — Light. Legacy. You.",
    description: "Ethical brilliance crafted for modern India.",
    siteName: "Aryora",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
