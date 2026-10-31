import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Heritage Bridal Haute Joaillerie — Bespoke Wedding Suites",
  description:
    "Explore bespoke bridal jewellery suites, IGI-certified lab-grown diamond chokers, engagement solitaires, and 18K BIS-hallmarked gold heirlooms handcrafted in Lucknow. Book your private bridal consultation.",
  openGraph: {
    title: "Aryora Heritage Bridal Haute Joaillerie",
    description:
      "Royal Awadhi craftsmanship meets modern conscious brilliance. Bespoke IGI-certified lab-grown diamond wedding suites.",
    images: ["/images/collection-bridal.jpg"],
  },
};

export default function BridalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

