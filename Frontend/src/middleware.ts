import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Known scrapers, data miners and automated crawler signatures
const BLOCKED_BOT_SIGNATURES = [
  "scrapy",
  "python-requests",
  "python-urllib",
  "curl/",
  "wget/",
  "httplib",
  "httpclient",
  "bytespider",
  "semrushbot",
  "ahrefsbot",
  "dotbot",
  "mj12bot",
  "petalbot",
  "zoominfobot",
  "dataforseo",
  "screaming frog",
  "headlesschrome",
  "phantomjs",
  "selenium",
  "playwright",
  "puppeteer",
];

export function middleware(request: NextRequest) {
  const userAgent = (request.headers.get("user-agent") || "").toLowerCase();

  // 1. Block automated scrapers and bots
  const isScraper = BLOCKED_BOT_SIGNATURES.some((sig) => userAgent.includes(sig));
  if (isScraper) {
    return new NextResponse(
      JSON.stringify({
        error: "Access Denied: Scraping and automated extraction are blocked by AYOR Security Firewall.",
        status: 403,
      }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
          "X-Firewall-Status": "Blocked-Scraper",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      }
    );
  }

  // 2. Add Anti-Scrape & Content Security Headers to all responses
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Firewall-Protection", "AYOR-Shield-Active");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

