import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/account", "/admin", "/checkout"] },
    sitemap: "https://www.aryora.com/sitemap.xml",
  };
}
