"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Mail, Phone, MapPin } from "lucide-react";
import InstagramIcon from "@/components/InstagramIcon";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    try {
      // Graceful newsletter handling
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/leads/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId: email }),
      }).catch(() => null);

      setStatus("done");
      setEmail("");
    } catch {
      setStatus("done"); // Still show gracious success to client
      setEmail("");
    }
  };

  return (
    <footer className="bg-ivory border-t border-border-subtle mt-24 text-ink" role="contentinfo">
      {/* Top Banner: Newsletter and Brand Premise */}
      <div className="border-b border-border-subtle">
        <div className="max-w-content mx-auto px-6 md:px-8 py-16 md:py-20 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-3">
            <p className="eyebrow">The Aryora Circle</p>
            <h2 className="font-serif text-3xl md:text-4xl text-ink leading-tight">
              Invitations to private previews and editorial stories.
            </h2>
            <p className="text-ink-muted text-sm max-w-md leading-relaxed">
              Join our private journal. We share thoughtful writing on conscious brilliance, bespoke craftsmanship, and rare design drops.
            </p>
          </div>

          <div className="lg:col-span-6">
            <form onSubmit={handleSubscribe} className="max-w-md w-full space-y-3" noValidate>
              <div className="relative flex items-center">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "error") setStatus("idle");
                  }}
                  placeholder="Enter your email address"
                  className="w-full h-12 bg-transparent border-b border-ink/30 px-1 py-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink transition-colors pr-10"
                  aria-describedby={status === "error" ? "newsletter-error" : undefined}
                  disabled={status === "sending" || status === "done"}
                />
                <button
                  type="submit"
                  disabled={status === "sending" || status === "done"}
                  aria-label="Subscribe to newsletter"
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-ink hover:text-champagne-accessible transition-colors disabled:opacity-50"
                >
                  <ArrowRight size={18} strokeWidth={1.5} />
                </button>
              </div>

              {status === "done" && (
                <p className="text-xs text-[#2A6E4E] flex items-center gap-1.5 pt-1" role="status">
                  <Check size={14} /> Welcome to the circle. We look forward to sharing our journey.
                </p>
              )}
              {status === "error" && (
                <p id="newsletter-error" className="text-xs text-[#B93826] pt-1" role="alert">
                  {errorMsg}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Main 4-Column Directory */}
      <div className="max-w-content mx-auto px-6 md:px-8 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {/* Column 1: Shop */}
          <div>
            <h3 className="text-xs uppercase tracking-widest2 font-medium text-ink mb-6">
              Shop Heirlooms
            </h3>
            <ul className="space-y-3.5 text-sm text-ink-muted">
              <li>
                <Link href="/shop" className="hover:text-ink transition-colors">
                  All Jewellery
                </Link>
              </li>
              <li>
                <Link href="/shop?category=rings" className="hover:text-ink transition-colors">
                  Solitaire Rings
                </Link>
              </li>
              <li>
                <Link href="/shop?category=earrings" className="hover:text-ink transition-colors">
                  Earrings & Drops
                </Link>
              </li>
              <li>
                <Link href="/shop?category=pendants" className="hover:text-ink transition-colors">
                  Pendants
                </Link>
              </li>
              <li>
                <Link href="/shop?category=necklaces" className="hover:text-ink transition-colors">
                  Tennis Necklaces
                </Link>
              </li>
              <li>
                <Link href="/bridal" className="hover:text-ink transition-colors">
                  Heritage Bridal
                </Link>
              </li>
              <li>
                <Link href="/customize" className="hover:text-ink transition-colors">
                  Design Your Own
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Discover & Help */}
          <div>
            <h3 className="text-xs uppercase tracking-widest2 font-medium text-ink mb-6">
              Discover & Care
            </h3>
            <ul className="space-y-3.5 text-sm text-ink-muted">
              <li>
                <Link href="/about" className="hover:text-ink transition-colors">
                  About Aryora
                </Link>
              </li>
              <li>
                <Link href="/world-of-lgd" className="hover:text-ink transition-colors">
                  The World of LGD
                </Link>
              </li>
              <li>
                <Link href="/sustainability" className="hover:text-ink transition-colors">
                  Ethical & Sustainable Craft
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="hover:text-ink transition-colors">
                  Ring Size Guide
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-ink transition-colors">
                  Client FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Policies & Assurance */}
          <div>
            <h3 className="text-xs uppercase tracking-widest2 font-medium text-ink mb-6">
              Client Assurance
            </h3>
            <ul className="space-y-3.5 text-sm text-ink-muted">
              <li>
                <Link href="/shipping" className="hover:text-ink transition-colors">
                  Shipping & Insurance
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-ink transition-colors">
                  7-Day Returns & Buyback
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-ink transition-colors">
                  Terms & Warranty
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-ink transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li className="pt-2 text-xs text-ink-subtle leading-relaxed">
                Every diamond is independently certified by IGI and laser-inscribed for lifelong authenticity.
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Atelier */}
          <div>
            <h3 className="text-xs uppercase tracking-widest2 font-medium text-ink mb-6">
              Concierge & Atelier
            </h3>
            <div className="space-y-4 text-sm text-ink-muted">
              <p className="flex items-start gap-2.5">
                <MapPin size={16} strokeWidth={1.5} className="mt-0.5 text-champagne-accessible flex-shrink-0" />
                <span>Lucknow, Uttar Pradesh, India</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone size={16} strokeWidth={1.5} className="text-champagne-accessible flex-shrink-0" />
                <a href="tel:+918808828646" className="hover:text-ink transition-colors">
                  +91 8808828646
                </a>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail size={16} strokeWidth={1.5} className="text-champagne-accessible flex-shrink-0" />
                <a href="mailto:aryora.legacy@hotmail.com" className="hover:text-ink transition-colors">
                  aryora.legacy@hotmail.com
                </a>
              </p>
              <div className="pt-3">
                <a
                  href="https://instagram.com/aryora.legacy"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-ink hover:text-champagne-accessible transition-colors"
                >
                  <InstagramIcon size={15} />
                  <span>@aryora.legacy</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-footer Copyright */}
        <div className="mt-16 pt-8 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between text-xs text-ink-subtle gap-4">
          <p>© {new Date().getFullYear()} Aryora Fine Jewellery. All rights reserved.</p>
          <p className="font-serif italic tracking-wider text-sm text-ink-muted">
            Light. Legacy. You.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-ink">Terms</Link>
            <span>•</span>
            <Link href="/shipping" className="hover:text-ink">Shipping</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
