"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Truck,
  Video,
  Clock,
  Check,
  ChevronRight,
  Gem,
  Palette,
  Heart,
} from "lucide-react";
import Hero from "@/components/Hero";
import TrustStrip from "@/components/TrustStrip";
import CategorySection from "@/components/CategorySection";
import ProductCard from "@/components/ProductCard";
import InstagramIcon from "@/components/InstagramIcon";
import { getAllProducts, getBestsellers, getNewArrivals, getSiteConfig, Product } from "@/lib/data";

const FEATURED_COLLECTIONS = [
  {
    title: "The Solitaire Suite",
    subtitle: "Type IIa Lab Diamonds · 1ct to 3ct",
    desc: "Laser-inscribed IGI-certified diamonds set in architectural 18K gold prongs.",
    href: "/shop?category=Solitaires",
    image: "/site/cat-solitaires.svg",
    badge: "Certified Solitaires",
  },
  {
    title: "Heritage Bridal Atelier",
    subtitle: "Awadhi Royal Grandeur",
    desc: "Handcrafted wedding suites uniting certified emeralds and brilliant diamonds.",
    href: "/bridal",
    image: "/site/cat-bridal.svg",
    badge: "Haute Joaillerie",
  },
  {
    title: "Modern Everyday Radiance",
    subtitle: "Bands, Huggies & Tennis Cuffs",
    desc: "Engineered to be worn effortlessly from morning coffee to evening celebrations.",
    href: "/shop?occasion=Daily+Wear",
    image: "/site/cat-bracelets.svg",
    badge: "Everyday Luxury",
  },
];

const REVIEWS = [
  {
    name: "Dr. Ananya Srivastava",
    city: "Lucknow",
    text: "Ordered a 1.5ct solitaire ring for my engagement. The IGI certificate was immediately verifiable, the gold finish is impeccable, and the concierge was wonderfully attentive on WhatsApp.",
    jewel: "Sample Solitaire Ring 01",
    rating: 5,
  },
  {
    name: "Pooja & Rohan Mehra",
    city: "Delhi NCR",
    text: "We wanted a sustainable wedding set without compromising on size or cut. Aryora’s lab diamonds possess incredible fire, and the transparent price breakup gave us complete confidence.",
    jewel: "Sample Graduated Tennis Necklace 01",
    rating: 5,
  },
  {
    name: "Vikram Singhania",
    city: "Mumbai",
    text: "The men’s diamond signet ring arrived in 3 days in a beautiful velvet chest. 100% authentic BIS hallmark and very comfortable weight for daily wear.",
    jewel: "Sample Men's Signet Ring 05",
    rating: 5,
  },
];

export default function HomePage() {
  const siteConfig = getSiteConfig();
  const allProducts = getAllProducts();
  const bestsellers = getBestsellers(8);
  const newArrivals = getNewArrivals(8);

  const [activeTab, setActiveTab] = useState<"bestsellers" | "new">("bestsellers");
  const displayProducts = activeTab === "bestsellers" ? bestsellers : newArrivals;

  return (
    <div className="space-y-16 md:space-y-24">
      {/* 1. HERO BANNER (Ethera reference layout with video/poster fallback) */}
      <Hero />

      {/* 2. TRUST STRIP (4 key assurances directly below hero) */}
      <TrustStrip />

      {/* 3. CATEGORY STRIP ("Your favorites, by category.") */}
      <CategorySection />

      {/* 4. CURATED SHOWCASE (Bestsellers & New Arrivals) */}
      <section className="max-w-content mx-auto px-4 md:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-subtle pb-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-champagne">
              Curated Masterpieces
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink font-light">
              Iconic Designs For Modern Royalty
            </h2>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab("bestsellers")}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-medium transition-colors ${
                activeTab === "bestsellers"
                  ? "bg-ink text-ivory"
                  : "bg-ivory border border-border-subtle text-ink-muted hover:text-ink"
              }`}
            >
              Bestsellers
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("new")}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-medium transition-colors ${
                activeTab === "new"
                  ? "bg-ink text-ivory"
                  : "bg-ivory border border-border-subtle text-ink-muted hover:text-ink"
              }`}
            >
              New Arrivals
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center pt-4">
          <Link
            href="/shop"
            className="btn-primary inline-flex items-center gap-2 text-xs font-semibold px-8 py-3.5 shadow-sm"
          >
            <span>Explore All 24 Creations in Shop</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* 5. FEATURED COLLECTIONS EDITORIAL BANNERS */}
      <section className="max-w-content mx-auto px-4 md:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-champagne">
            Signature Suites
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-ink font-light">
            Collections Born to Transcend Time
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURED_COLLECTIONS.map((col) => (
            <Link
              key={col.title}
              href={col.href}
              className="group relative bg-ivory-pure border border-border-subtle p-6 flex flex-col justify-between hover:border-champagne/80 hover:shadow-lg transition-all space-y-6"
            >
              <div className="space-y-3">
                <span className="text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 bg-champagne-subtle text-champagne-accessible border border-champagne-light inline-block">
                  {col.badge}
                </span>
                <h3 className="font-serif text-2xl text-ink font-normal group-hover:text-champagne-accessible transition-colors">
                  {col.title}
                </h3>
                <p className="text-xs font-medium text-ink-muted">{col.subtitle}</p>
                <p className="text-xs text-ink-subtle leading-relaxed">{col.desc}</p>
              </div>

              <div className="relative aspect-square w-full bg-ivory-warm rounded-sm overflow-hidden flex items-center justify-center p-6 border border-border-subtle/50">
                <Image
                  src={col.image}
                  alt={col.title}
                  width={220}
                  height={220}
                  className="object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-ink group-hover:text-champagne-accessible transition-colors">
                <span>Discover Collection</span>
                <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. WHY ARYORA LAB-GROWN FINE JEWELLERY */}
      <section className="bg-ivory-warm/40 border-y border-border-subtle py-16 md:py-20">
        <div className="max-w-content mx-auto px-4 md:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-champagne">
              The Conscious Revolution
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-ink font-light">
              Why Choose Aryora Fine Lab Diamonds
            </h2>
            <p className="text-xs text-ink-muted leading-relaxed">
              We eliminate earth mining disruption and excessive middleman markups without sacrificing an ounce of Awadhi royal grandeur.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {siteConfig.whyAryora.map((pillar) => (
              <div
                key={pillar.title}
                className="bg-ivory-pure border border-border-subtle p-6 space-y-3 flex flex-col justify-between shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-champagne-accessible border border-champagne/40">
                  <Gem size={18} strokeWidth={1.5} />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-serif text-lg text-ink font-normal">{pillar.title}</h3>
                  <p className="text-xs text-ink-muted leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Educational Comparison Card */}
          <div className="bg-ivory-pure border border-border-subtle p-6 md:p-8 max-w-3xl mx-auto shadow-sm">
            <h3 className="font-serif text-lg text-ink text-center mb-4 font-normal">
              Aryora Lab Diamond vs. Mined Diamond: Scientific Equivalence
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs divide-x divide-border-subtle">
              <div className="p-2 space-y-1">
                <p className="font-medium text-ink">Atomic Lattice</p>
                <p className="text-[11px] text-ink-muted">100% Carbon Crystal (C)</p>
                <span className="text-[10px] text-champagne-accessible font-semibold">Identical</span>
              </div>
              <div className="p-2 space-y-1">
                <p className="font-medium text-ink">Hardness (Mohs)</p>
                <p className="text-[11px] text-ink-muted">10/10 Hardest Material</p>
                <span className="text-[10px] text-champagne-accessible font-semibold">Identical</span>
              </div>
              <div className="p-2 space-y-1">
                <p className="font-medium text-ink">Ecological Footprint</p>
                <p className="text-[11px] text-ink-muted">Zero Earth Dredging</p>
                <span className="text-[10px] text-champagne-accessible font-semibold">Conscious Luxury</span>
              </div>
            </div>
          </div>

          {/* Official Accreditation Badges */}
          <div className="bg-ivory-pure border border-border-subtle p-6 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white p-2 border border-border-subtle shadow-sm flex items-center justify-center flex-shrink-0">
                <Image
                  src="/images/certifications/igi-certified.png"
                  alt="100% IGI Certified Lab Grown Diamonds"
                  width={44}
                  height={44}
                  className="object-contain"
                />
              </div>
              <div className="space-y-0.5">
                <p className="font-serif text-sm font-semibold text-ink">100% IGI Certified</p>
                <p className="text-xs text-ink-muted leading-tight">Every diamond laser-inscribed with verifiable report ID</p>
              </div>
            </div>

            <div className="hidden sm:block h-10 w-px bg-border-subtle" />

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white p-2 border border-border-subtle shadow-sm flex items-center justify-center flex-shrink-0">
                <Image
                  src="/images/certifications/bis-hallmark.png"
                  alt="BIS Hallmark 750 (18K) Gold Purity"
                  width={48}
                  height={28}
                  className="object-contain"
                />
              </div>
              <div className="space-y-0.5">
                <p className="font-serif text-sm font-semibold text-ink">Govt BIS Hallmark 750</p>
                <p className="text-xs text-ink-muted leading-tight">Authentic 18K gold hallmarked with 6-digit HUID</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CUSTOM ATELIER BANNER */}
      <section className="max-w-content mx-auto px-4 md:px-8">
        <div className="bg-[#1B3B30] text-ivory p-8 md:p-14 grid lg:grid-cols-12 gap-8 items-center border border-champagne/30 shadow-xl">
          <div className="lg:col-span-8 space-y-4">
            <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-champagne-light">
              Bespoke Joaillerie Service
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light leading-tight">
              Design Your Custom Ring or Heirloom
            </h2>
            <p className="text-xs md:text-sm text-ivory-muted leading-relaxed max-w-xl font-light">
              Choose your diamond shape (Round, Oval, Emerald, Pear), metal karatage (18K Yellow, Rose, White Gold), and band prongs. Our master karigars craft your vision in 3D CAD before casting.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/customize"
                className="bg-[#B89B5E] text-ink hover:bg-[#A3864A] transition-colors text-xs uppercase tracking-wider font-semibold px-7 py-3.5 inline-flex items-center gap-2"
              >
                <span>Launch Custom Ring Builder</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/bridal"
                className="border border-ivory text-ivory hover:bg-ivory hover:text-ink transition-colors text-xs uppercase tracking-wider font-semibold px-6 py-3.5 inline-flex items-center gap-2"
              >
                <span>Book Bridal Consultation</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 flex items-center justify-center">
            <div className="relative w-56 h-56 rounded-full border border-champagne/40 p-4 flex items-center justify-center">
              <Image
                src="/site/brand-emblem.svg"
                alt="Aryora Custom Emblem"
                width={140}
                height={140}
                className="object-contain animate-spin-slow opacity-85"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 8. CLIENT REVIEWS & TRUST STORIES */}
      <section className="max-w-content mx-auto px-4 md:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-champagne">
            Client Testimonials
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-ink font-light">
            Loved Across India
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {REVIEWS.map((rev) => (
            <div
              key={rev.name}
              className="bg-ivory-pure border border-border-subtle p-6 space-y-4 flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-[#D4AF37]">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-xs text-ink-muted leading-relaxed italic">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-border-subtle/60 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-ink">{rev.name}</p>
                  <p className="text-[11px] text-ink-subtle">{rev.city}</p>
                </div>
                <span className="text-[10px] text-champagne-accessible font-medium">
                  Verified Patron
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. INSTAGRAM JOURNAL */}
      <section className="max-w-content mx-auto px-4 md:px-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 text-xs text-champagne-accessible font-medium">
            <InstagramIcon size={14} />
            <a
              href="https://instagram.com/aryora.legacy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              @aryora.legacy
            </a>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl text-ink font-light">
            Styled by Our Community
          </h2>
          <p className="text-xs text-ink-muted">
            Tag #AryoraLegacy to be featured in our Lucknow atelier editorial showcase.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { img: "/products/ring-01-a.svg", title: "Solitaire Band" },
            { img: "/products/earring-01-a.svg", title: "Luminary Studs" },
            { img: "/products/necklace-01-a.svg", title: "Tennis Line" },
            { img: "/products/bracelet-01-a.svg", title: "Tennis Bracelet" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="group relative aspect-square bg-ivory-warm border border-border-subtle overflow-hidden flex items-center justify-center p-4"
            >
              <Image
                src={item.img}
                alt={item.title}
                width={180}
                height={180}
                className="object-contain group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-ivory text-xs font-serif tracking-wider font-light">
                  View Creation
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
