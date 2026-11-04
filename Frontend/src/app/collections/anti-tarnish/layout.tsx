import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anti-Tarnish Waterproof Jewellery | Everyday Fine Shine | Ayor",
  description:
    "Explore Ayor's Anti-Tarnish Jewellery collection: 100% waterproof, sweat-proof, and perfume-safe with long-lasting mirror shine. Handcrafted necklaces, earrings, bracelets, rings & anklets from Rs. 499 to Rs. 2,999.",
  openGraph: {
    title: "Anti-Tarnish Waterproof Jewellery | Ayor",
    description:
      "100% waterproof, sweat-proof, and long-lasting shine. Shower, swim, and conquer your day without ever taking your shine off. From Rs. 499.",
    images: [{ url: "/site/hero-poster.svg", width: 1200, height: 630 }],
  },
};

export default function AntiTarnishLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
