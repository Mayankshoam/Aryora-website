import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account", "/admin", "/checkout", "/api/"],
      },
      {
        userAgent: ["GPTBot", "CCBot", "ChatGPT-User", "Scrapy", "Bytespider", "anthropic-ai"],
        disallow: ["/"],
      },
    ],
    sitemap: "https://aryora-website-d3sv.vercel.app/sitemap.xml",
  };
}
