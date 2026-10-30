import { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://aryora-website-d3sv.vercel.app";

  const staticRoutes = [
    "",
    "/shop",
    "/collections",
    "/bridal",
    "/customize",
    "/size-guide",
    "/faq",
    "/about",
    "/world-of-lgd",
    "/sustainability",
    "/contact",
    "/cart",
    "/wishlist",
    "/shipping",
    "/returns",
    "/terms",
    "/privacy",
  ];

  const staticEntries = staticRoutes.map((r) => ({
    url: `${base}${r}`,
    lastModified: new Date(),
    changeFrequency: (r === "" || r === "/shop" ? "daily" : "weekly") as "daily" | "weekly",
    priority: r === "" ? 1.0 : r === "/shop" || r === "/bridal" ? 0.9 : 0.7,
  }));

  const productEntries = PRODUCTS.map((p) => ({
    url: `${base}/product/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...productEntries];
}
