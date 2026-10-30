"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Mail, Phone, MapPin, Award, RotateCcw, ShieldCheck, Truck, CreditCard } from "lucide-react";
import InstagramIcon from "@/components/InstagramIcon";

const POPULAR_SEARCHES = [
  { label: "Solitaire Engagement Rings", href: "/shop?category=rings&style=Solitaire" },
  { label: "Diamond Tennis Bracelets", href: "/shop?category=bracelets&style=Tennis" },
  { label: "Solitaire Stud Earrings", href: "/shop?category=earrings&style=Studs" },
  { label: "Modern Diamond Mangalsutra", href: "/shop?category=mangalsutras" },
  { label: "Graduated Tennis Necklaces", href: "/shop?category=necklaces&style=Tennis" },
  { label: "Men's 18K Diamond Bands", href: "/shop?category=mens" },
  { label: "92.5 Silver Diamond Rings", href: "/shop?category=rings&metal=SILVER_925" },
  { label: "Lucknow Heritage Bridal Sets", href: "/bridal" },
];

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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/leads/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId: email }),
      }).catch(() => null);

      setStatus("done");
      setEmail("");
    } catch {
      setStatus("done");
      setEmail("");
    }
  };

  return (
    <footer className="bg-ivory border-t border-border-subtle mt-20 text-ink" role="contentinfo">
      {/* 1. Trust Badges Strip (BlueStone Concept) */}
      <div className="border-b border-border-subtle bg-ivory-warm/40">
        <div className="max-w-content mx-auto px-4 md:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1.5 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-champagne-accessible border border-champagne/40">
              <Award size={18} strokeWidth={1.5} />
            </div>
            <p className="font-serif text-sm font-medium text-ink">100% IGI Certified</p>
            <p className="text-[11px] text-ink-muted">Independent dossier with every jewel</p>
          </div>

          <div className="space-y-1.5 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-champagne-accessible border border-champagne/40">
              <RotateCcw size={18} strokeWidth={1.5} />
            </div>
            <p className="font-serif text-sm font-medium text-ink">7-Day Easy Returns</p>
            <p className="text-[11px] text-ink-muted">30-day free ring resizing</p>
          </div>

          <div className="space-y-1.5 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-champagne-accessible border border-champagne/40">
              <ShieldCheck size={18} strokeWidth={1.5} />
            </div>
            <p className="font-serif text-sm font-medium text-ink">Lifetime Buyback</p>
            <p className="text-[11px] text-ink-muted">Guaranteed exchange policy</p>
          </div>

          <div className="space-y-1.5 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-champagne-accessible border border-champagne/40">
              <Truck size={18} strokeWidth={1.5} />
            </div>
            <p className="font-serif text-sm font-medium text-ink">Free Insured Transit</p>
            <p className="text-[11px] text-ink-muted">Pan-India doorstep delivery</p>
          </div>
        </div>
      </div>

      {/* 2. Newsletter Banner */}
      <div className="border-b border-border-subtle">
        <div className="max-w-content mx-auto px-6 md:px-8 py-12 md:py-16 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-2">
            <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-champagne">
              The Aryora Circle
            </p>
            <h2 className="font-serif text-2xl md:text-3xl text-ink leading-tight font-light">
              Invitations to private previews and editorial stories.
            </h2>
            <p className="text-ink-muted text-xs max-w-md leading-relaxed">
              Join our private journal for thoughtful writing on conscious lab-grown brilliance and rare design launches.
            </p>
          </div>

          <div className="lg:col-span-6">
            <form onSubmit={handleSubscribe} className="max-w-md w-full space-y-2" noValidate>
              <div className="relative flex items-center">
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "error") setStatus("idle");
                  }}
                  placeholder="Enter your email address"
                  className="w-full h-11 bg-transparent border-b border-ink/30 px-1 py-2 text-xs text-ink placeholder:text-ink-light focus:outline-none focus:border-champagne transition-colors pr-10"
                  disabled={status === "sending" || status === "done"}
                />
                <button
                  type="submit"
                  disabled={status === "sending" || status === "done"}
                  aria-label="Subscribe to newsletter"
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-ink hover:text-champagne-accessible transition-colors disabled:opacity-50"
                >
                  <ArrowRight size={16} strokeWidth={1.5} />
                </button>
              </div>

              {status === "done" && (
                <p className="text-xs text-[#2A6E4E] flex items-center gap-1.5 pt-1" role="status">
                  <Check size={14} /> Welcome to the circle. We look forward to sharing our journey.
                </p>
              )}
              {status === "error" && (
                <p className="text-xs text-[#B93826] pt-1" role="alert">
                  {errorMsg}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* 3. Main 4-Column Directory */}
      <div className="max-w-content mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-8">
          {/* Column 1: Shop */}
          <div>
            <h3 className="text-xs uppercase tracking-widest font-semibold text-ink mb-4">
              Shop Heirlooms
            </h3>
            <ul className="space-y-2.5 text-xs text-ink-muted">
              <li>
                <Link href="/shop" className="hover:text-ink transition-colors">
                  All Fine Jewellery
                </Link>
              </li>
              <li>
                <Link href="/shop?category=rings" className="hover:text-ink transition-colors">
                  Solitaire Rings
                </Link>
              </li>
              <li>
                <Link href="/shop?category=earrings" className="hover:text-ink transition-colors">
                  Earrings & Studs
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
                <Link href="/shop?category=bracelets" className="hover:text-ink transition-colors">
                  Bracelets & Mangalsutras
                </Link>
              </li>
              <li>
                <Link href="/bridal" className="hover:text-ink transition-colors">
                  Heritage Bridal Suite
                </Link>
              </li>
              <li>
                <Link href="/customize" className="hover:text-ink transition-colors">
                  Design Your Own Ring
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Discover & Help */}
          <div>
            <h3 className="text-xs uppercase tracking-widest font-semibold text-ink mb-4">
              Discover & Care
            </h3>
            <ul className="space-y-2.5 text-xs text-ink-muted">
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
                  Ring Size & Fitting Guide
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-ink transition-colors">
                  Client FAQ & Dossiers
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Policies & Assurance */}
          <div>
            <h3 className="text-xs uppercase tracking-widest font-semibold text-ink mb-4">
              Client Assurance
            </h3>
            <ul className="space-y-2.5 text-xs text-ink-muted">
              <li>
                <Link href="/shipping" className="hover:text-ink transition-colors">
                  Shipping & Courier Policy
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
              <li className="pt-2 text-[11px] text-ink-light leading-relaxed">
                Every diamond is independently graded by IGI and laser-inscribed for lifelong security.
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Atelier */}
          <div>
            <h3 className="text-xs uppercase tracking-widest font-semibold text-ink mb-4">
              Concierge & Atelier
            </h3>
            <div className="space-y-3 text-xs text-ink-muted">
              <p className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 text-champagne-accessible flex-shrink-0" />
                <span>Lucknow, Uttar Pradesh, India</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={14} className="text-champagne-accessible flex-shrink-0" />
                <a href="tel:+918808828646" className="hover:text-ink transition-colors">
                  +91 8808828646
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={14} className="text-champagne-accessible flex-shrink-0" />
                <a href="mailto:aryora.legacy@hotmail.com" className="hover:text-ink transition-colors">
                  aryora.legacy@hotmail.com
                </a>
              </p>
              <div className="pt-2">
                <a
                  href="https://instagram.com/aryora.legacy"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wider text-ink hover:text-champagne-accessible transition-colors font-medium"
                >
                  <InstagramIcon size={14} />
                  <span>@aryora.legacy</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Popular Searches Strip (BlueStone Concept) */}
        <div className="mt-12 pt-6 border-t border-border-subtle">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-ink-light mb-2">
            Popular Fine Jewellery Searches
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {POPULAR_SEARCHES.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-ink-muted hover:text-ink hover:underline text-[11px] mr-3"
              >
                {link.label} ·
              </Link>
            ))}
          </div>
        </div>

        {/* 5. Payment Methods & Copyright */}
        <div className="mt-10 pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between text-xs text-ink-light gap-4">
          <p>© {new Date().getFullYear()} Aryora Fine Jewellery. All rights reserved.</p>
          <p className="font-serif italic tracking-wider text-sm text-ink-muted">
            Light. Legacy. You.
          </p>
          <div className="flex items-center gap-3 text-[11px]">
            <span>UPI</span>
            <span>•</span>
            <span>Visa</span>
            <span>•</span>
            <span>MasterCard</span>
            <span>•</span>
            <span>NetBanking</span>
            <span>•</span>
            <span>EMI Available</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
