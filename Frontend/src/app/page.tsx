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
} from "lucide-react";
import InstagramIcon from "@/components/InstagramIcon";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS, getBestsellers, formatPriceINR } from "@/lib/products";

// 1. Categories
const CATEGORY_TILES = [
  {
    name: "Rings",
    href: "/shop?category=rings",
    image: "/images/products/emerald-solitaire-1.jpg",
    count: "Solitaires & Bands",
  },
  {
    name: "Earrings",
    href: "/shop?category=earrings",
    image: "/images/products/solitaire-studs.jpg",
    count: "Studs & Luminary Drops",
  },
  {
    name: "Pendants",
    href: "/shop?category=pendants",
    image: "/images/essence-necklace.jpg",
    count: "Solitaire Bezels",
  },
  {
    name: "Necklaces",
    href: "/shop?category=necklaces",
    image: "/images/collection-everyday.jpg",
    count: "Graduated Tennis & Chokers",
  },
  {
    name: "Bracelets & Bangles",
    href: "/shop?category=bracelets",
    image: "/images/products/tennis-bracelet.jpg",
    count: "Tennis Lines & Cuffs",
  },
  {
    name: "Modern Mangalsutras",
    href: "/shop?category=mangalsutras",
    image: "/images/products/modern-mangalsutra.jpg",
    count: "Geometric Diamond Bars",
  },
  {
    name: "Solitaires",
    href: "/collections/solitaire",
    image: "/images/collection-solitaire.jpg",
    count: "IGI Certified 0.5ct to 3ct",
  },
  {
    name: "Men's Collection",
    href: "/shop?category=mens",
    image: "/images/products/mens-diamond-band.jpg",
    count: "Bands & Signets",
  },
];

// 2. Shop by Occasion
const OCCASIONS = [
  {
    title: "Everyday Luxury",
    desc: "Lightweight, snag-free silhouettes crafted for continuous daily radiance.",
    href: "/shop?occasion=Everyday",
    image: "/images/collection-everyday.jpg",
    tag: "Daily Wear",
  },
  {
    title: "Workwear & Boardroom",
    desc: "Refined geometric studs and low-profile bezels tailored for professional elegance.",
    href: "/shop?occasion=Workwear",
    image: "/images/essence-earrings.jpg",
    tag: "Office Wear",
  },
  {
    title: "Wedding & Festive",
    desc: "Regal Awadhi choker suites and brilliant diamond strands for milestone joy.",
    href: "/shop?occasion=Wedding",
    image: "/images/collection-bridal.jpg",
    tag: "Royal Festive",
  },
  {
    title: "Meaningful Gifting",
    desc: "Arrives in our bespoke keepsake velvet box, accompanied by personal note cards.",
    href: "/shop?occasion=Gifting",
    image: "/images/craft-hands.jpg",
    tag: "Keepsake Gifts",
  },
];

// 3. Shop by Price Buckets
const PRICE_BUCKETS = [
  { label: "Under ₹20,000", range: "under-25k", note: "Accessible conscious silver & gold" },
  { label: "₹20,000 – ₹40,000", range: "25k-50k", note: "Daily solitaire pendants & studs" },
  { label: "₹40,000 – ₹70,000", range: "50k-100k", note: "Signature engagement bands" },
  { label: "₹70,000 – ₹1.5 Lakh", range: "above-100k", note: "Tennis bracelets & solitaires" },
  { label: "Luxury Heirlooms", range: "above-100k", note: "Grand bridal & royal suites" },
];

// 4. Featured Collections
const FEATURED_COLLECTIONS = [
  {
    title: "The Solitaire Suite",
    subtitle: "Pure Type IIa Lab Diamonds",
    desc: "Laser-inscribed IGI certified diamonds set in architectural 18K gold prongs.",
    href: "/collections/solitaire",
    image: "/images/collection-solitaire.jpg",
  },
  {
    title: "Noor-e-Awadh Bridal",
    subtitle: "Regal Lucknow Grandeur",
    desc: "Inspired by the royal courts of Awadh, combining certified emeralds and brilliant diamonds.",
    href: "/bridal",
    image: "/images/collection-bridal.jpg",
  },
  {
    title: "Modern Minimalist",
    subtitle: "Everyday Conscious Shine",
    desc: "Designed to be worn effortlessly from morning espresso to evening celebrations.",
    href: "/collections/everyday",
    image: "/images/collection-everyday.jpg",
  },
];

// 5. Why Aryora Pillars
const WHY_ARYORA_PILLARS = [
  {
    icon: Award,
    title: "100% IGI Certified",
    desc: "Every single diamond is laser-inscribed with a unique serial number and accompanied by an independent IGI laboratory certificate.",
  },
  {
    icon: Sparkles,
    title: "Zero Earth Mining",
    desc: "Cultivated above ground with renewable solar energy. Chemically, physically, and optically identical to mined diamonds, without ecological disruption.",
  },
  {
    icon: Gem,
    title: "Transparent Indian Pricing",
    desc: "Complete component breakdown: clear gold weight, diamond carat value, making charges, and 3% GST. Direct from our Lucknow atelier with no middleman markups.",
  },
  {
    icon: ShieldCheck,
    title: "Enduring Lifetime Care",
    desc: "Enjoy 7-day hassle-free returns, complimentary 30-day ring resizing, free lifetime cleaning and inspection, plus transparent buyback policies.",
  },
];

// 6. Instagram Grid
const INSTAGRAM_POSTS = [
  { image: "/images/hero-emerald.jpg", alt: "Emerald choker necklace on model" },
  { image: "/images/products/tennis-bracelet.jpg", alt: "Diamond tennis bracelet on wrist" },
  { image: "/images/products/solitaire-studs.jpg", alt: "Solitaire stud earrings in travertine setting" },
  { image: "/images/products/modern-mangalsutra.jpg", alt: "Modern bar mangalsutra on raw silk" },
  { image: "/images/products/emerald-solitaire-1.jpg", alt: "Emerald cut solitaire diamond ring" },
  { image: "/images/craft-hands.jpg", alt: "Artisan setting diamonds at Lucknow atelier" },
];

export default function HomePage() {
  const [bestsellerTab, setBestsellerTab] = useState<string>("all");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const bestsellers = getBestsellers();

  const filteredBestsellers =
    bestsellerTab === "all"
      ? bestsellers.slice(0, 4)
      : bestsellers.filter((p) => p.category === bestsellerTab).slice(0, 4);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.includes("@")) {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
    }
  };

  return (
    <div className="space-y-16 md:space-y-24 bg-ivory">
      {/* ========================================================= */}
      {/* 1. HERO BANNER (One message, two buttons)                 */}
      {/* ========================================================= */}
      <section className="relative h-[85vh] min-h-[560px] max-h-[800px] w-full flex items-center overflow-hidden">
        <Image
          src="/images/hero-emerald.jpg"
          alt="Aryora Heritage Lab-Grown Emerald and Diamond High Jewellery"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-transparent" />

        <div className="relative max-w-content mx-auto px-6 md:px-12 w-full text-ivory space-y-6">
          <div className="space-y-3 max-w-xl">
            <span className="inline-block text-[11px] uppercase tracking-[0.26em] text-champagne font-semibold">
              Light. Legacy. You.
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light tracking-wide text-ivory leading-[1.15]">
              Modern Lab-Grown Fine Jewellery for India
            </h1>
            <p className="text-sm md:text-base text-ivory/80 font-light leading-relaxed">
              Ethically cultivated diamonds of exceptional chemical purity, hand-set in hallmarked 18K gold and 92.5 sterling silver in our Lucknow atelier.
            </p>
          </div>

          {/* Two Prominent Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <Link
              href="/shop"
              className="px-8 py-3.5 bg-ivory text-ink text-xs uppercase tracking-widest font-semibold hover:bg-champagne hover:text-ivory transition-all text-center shadow-lg"
            >
              Explore Catalogue
            </Link>
            <Link
              href="/customize"
              className="px-8 py-3.5 border border-ivory/80 text-ivory text-xs uppercase tracking-widest font-semibold hover:bg-ivory/10 hover:border-ivory transition-all text-center backdrop-blur-sm"
            >
              Custom Atelier Studio
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. SITE-WIDE TRUST STRIP (BlueStone Concept, Aryora Terms)*/}
      {/* ========================================================= */}
      <section className="max-w-content mx-auto px-4 md:px-8 -mt-6 relative z-10">
        <div className="bg-ivory-pure border border-border-subtle shadow-md grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border-subtle p-4 md:p-6">
          <div className="flex items-center space-x-3.5 p-3">
            <div className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-champagne-accessible border border-champagne/40 flex-shrink-0">
              <Award size={20} strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-serif text-sm font-medium text-ink">100% IGI Certified</p>
              <p className="text-[11px] text-ink-muted leading-tight">Laser inscribed lab diamonds</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 p-3">
            <div className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-champagne-accessible border border-champagne/40 flex-shrink-0">
              <RotateCcw size={20} strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-serif text-sm font-medium text-ink">7-Day Easy Returns</p>
              <p className="text-[11px] text-ink-muted leading-tight">30-day complimentary resizing</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 p-3">
            <div className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-champagne-accessible border border-champagne/40 flex-shrink-0">
              <ShieldCheck size={20} strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-serif text-sm font-medium text-ink">Lifetime Buyback</p>
              <p className="text-[11px] text-ink-muted leading-tight">Transparent exchange values</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 p-3">
            <div className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-champagne-accessible border border-champagne/40 flex-shrink-0">
              <Truck size={20} strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-serif text-sm font-medium text-ink">Free Insured Courier</p>
              <p className="text-[11px] text-ink-muted leading-tight">Pan-India doorstep delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. SHOP BY CATEGORY TILES                                 */}
      {/* ========================================================= */}
      <section className="max-w-content mx-auto px-4 md:px-8 space-y-6">
        <div className="flex items-end justify-between border-b border-border-subtle pb-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-champagne">
              Curated Taxonomy
            </p>
            <h2 className="font-serif text-2xl md:text-3xl text-ink font-light">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-widest text-champagne-accessible font-semibold hover:underline flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
          {CATEGORY_TILES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group block bg-ivory-pure border border-border-subtle hover:border-champagne/60 transition-all overflow-hidden"
            >
              <div className="relative aspect-square w-full bg-ivory overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3 text-center border-t border-border-subtle/60">
                <h3 className="font-serif text-sm md:text-base text-ink group-hover:text-champagne-accessible transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[10px] text-ink-light mt-0.5">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. SHOP BY OCCASION                                       */}
      {/* ========================================================= */}
      <section className="max-w-content mx-auto px-4 md:px-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-champagne">
            Moments That Matter
          </p>
          <h2 className="font-serif text-2xl md:text-4xl text-ink font-light">
            Shop by Occasion
          </h2>
          <p className="text-xs text-ink-muted leading-relaxed">
            From everyday wardrobe staples to grand Awadhi bridal celebrations, discover jewellery tuned to every milestone.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {OCCASIONS.map((occ) => (
            <Link
              key={occ.title}
              href={occ.href}
              className="group block bg-ivory-pure border border-border-subtle hover:shadow-md transition-all overflow-hidden"
            >
              <div className="relative aspect-[4/3] w-full bg-ivory overflow-hidden">
                <Image
                  src={occ.image}
                  alt={occ.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-ivory-pure/90 text-ink text-[9px] uppercase tracking-wider font-semibold backdrop-blur-sm">
                  {occ.tag}
                </span>
              </div>
              <div className="p-4 space-y-1.5">
                <h3 className="font-serif text-base text-ink group-hover:text-champagne-accessible transition-colors">
                  {occ.title}
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">{occ.desc}</p>
                <span className="inline-flex items-center space-x-1 text-xs text-champagne-accessible font-medium pt-1">
                  <span>Explore Designs</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. SHOP BY PRICE                                          */}
      {/* ========================================================= */}
      <section className="bg-ivory-warm/60 border-y border-border-subtle py-12 md:py-16">
        <div className="max-w-content mx-auto px-4 md:px-8 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-champagne">
              Transparent Budgeting
            </p>
            <h2 className="font-serif text-2xl md:text-3xl text-ink font-light">
              Shop by Price Range
            </h2>
            <p className="text-xs text-ink-muted">
              Filter high-calibre fine jewellery curated precisely within your desired investment bracket.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            {PRICE_BUCKETS.map((bucket) => (
              <Link
                key={bucket.label}
                href={`/shop?price=${bucket.range}`}
                className="group p-5 bg-ivory-pure border border-border-subtle hover:border-champagne hover:shadow-sm transition-all text-center flex flex-col justify-between space-y-2"
              >
                <div>
                  <h3 className="font-serif text-base md:text-lg text-ink font-normal group-hover:text-champagne-accessible transition-colors">
                    {bucket.label}
                  </h3>
                  <p className="text-[11px] text-ink-muted mt-1 leading-snug">
                    {bucket.note}
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-champagne-accessible font-semibold inline-block pt-1">
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. BESTSELLERS (With Filter Tabs)                         */}
      {/* ========================================================= */}
      <section className="max-w-content mx-auto px-4 md:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-subtle pb-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-champagne">
              Atelier Favorites
            </p>
            <h2 className="font-serif text-2xl md:text-3xl text-ink font-light">
              Bestsellers of Aryora
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
            {[
              { id: "all", label: "All Bestsellers" },
              { id: "rings", label: "Rings" },
              { id: "earrings", label: "Earrings" },
              { id: "bracelets", label: "Bracelets" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setBestsellerTab(tab.id)}
                className={`text-xs px-3 py-1.5 transition-all whitespace-nowrap ${
                  bestsellerTab === tab.id
                    ? "bg-ink text-ivory font-medium"
                    : "bg-ivory-pure border border-border-subtle text-ink hover:border-champagne"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {filteredBestsellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. FEATURED COLLECTIONS                                   */}
      {/* ========================================================= */}
      <section className="max-w-content mx-auto px-4 md:px-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-champagne">
            Signature Suites
          </p>
          <h2 className="font-serif text-2xl md:text-4xl text-ink font-light">
            Featured Collections
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURED_COLLECTIONS.map((col) => (
            <Link
              key={col.title}
              href={col.href}
              className="group block bg-ivory-pure border border-border-subtle overflow-hidden hover:shadow-md transition-all"
            >
              <div className="relative aspect-[4/3] w-full bg-ivory overflow-hidden">
                <Image
                  src={col.image}
                  alt={col.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-champagne font-semibold">
                  {col.subtitle}
                </p>
                <h3 className="font-serif text-xl text-ink group-hover:text-champagne-accessible transition-colors">
                  {col.title}
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">{col.desc}</p>
                <span className="inline-flex items-center space-x-1 text-xs text-champagne-accessible font-medium pt-2">
                  <span>Explore Collection</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. CUSTOMIZE / VIDEO CONSULTATION BANNER                  */}
      {/* ========================================================= */}
      <section className="max-w-content mx-auto px-4 md:px-8">
        <div className="bg-ivory-pure border border-border-subtle p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center shadow-sm">
          {/* Left Custom Studio */}
          <div className="space-y-4 pr-0 md:pr-6 md:border-r border-border-subtle">
            <span className="px-2.5 py-1 bg-champagne/15 text-champagne-accessible text-[10px] uppercase tracking-wider font-semibold">
              Bespoke Atelier Studio
            </span>
            <h2 className="font-serif text-2xl md:text-3xl text-ink font-light leading-snug">
              Design Your Custom Engagement Ring
            </h2>
            <p className="text-xs text-ink-muted leading-relaxed">
              Select your certified lab-grown diamond shape, band architecture, and gold purity in our interactive 3D customizer. Delivered in 14 business days.
            </p>
            <div className="pt-2">
              <Link
                href="/customize"
                className="btn-primary inline-flex items-center space-x-2 text-xs px-6 py-3"
              >
                <span>Launch 3D Customizer</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Right Video Call Concierge */}
          <div className="space-y-4 pl-0 md:pl-6">
            <span className="px-2.5 py-1 bg-ivory-warm border border-champagne/40 text-champagne-accessible text-[10px] uppercase tracking-wider font-semibold">
              Live Video Concierge
            </span>
            <h2 className="font-serif text-2xl md:text-3xl text-ink font-light leading-snug">
              Consult with Lucknow Master Artisans
            </h2>
            <p className="text-xs text-ink-muted leading-relaxed">
              Inspect gemstones under high magnification, evaluate claw settings, and get tailored sizing advice live over WhatsApp Video Call.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/918808828646?text=Hi%20Aryora,%20I%20would%20like%20to%20book%20a%20virtual%20video%20consultation"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline inline-flex items-center space-x-2 text-xs px-6 py-3"
              >
                <Video size={14} />
                <span>Book Free Video Consultation</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. WHY ARYORA: THE CONSCIOUS LUXURY ADVANTAGE             */}
      {/* ========================================================= */}
      <section className="bg-ivory-warm/40 border-y border-border-subtle py-16 md:py-20">
        <div className="max-w-content mx-auto px-4 md:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-champagne">
              The Conscious Revolution
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-ink font-light">
              Why Choose Aryora Lab-Grown Fine Jewellery
            </h2>
            <p className="text-xs text-ink-muted leading-relaxed">
              We eliminate earth disruption and middleman markups without sacrificing an ounce of regal Awadhi grandeur.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_ARYORA_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="bg-ivory-pure border border-border-subtle p-6 space-y-3 flex flex-col justify-between"
                >
                  <div className="w-12 h-12 rounded-full bg-ivory flex items-center justify-center text-champagne-accessible border border-champagne/40">
                    <Icon size={22} strokeWidth={1.5} />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h3 className="font-serif text-lg text-ink font-normal">{pillar.title}</h3>
                    <p className="text-xs text-ink-muted leading-relaxed">{pillar.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Educational Comparison Card */}
          <div className="bg-ivory-pure border border-border-subtle p-6 md:p-8 max-w-3xl mx-auto">
            <h3 className="font-serif text-lg text-ink text-center mb-4">
              Aryora Lab Diamond vs. Mined Diamond: Scientific Equivalence
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs divide-x divide-border-subtle">
              <div className="p-2 space-y-1">
                <p className="font-medium text-ink">Atomic Lattice</p>
                <p className="text-[11px] text-ink-muted">100% Pure Carbon (C)</p>
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
        </div>
      </section>

      {/* ========================================================= */}
      {/* 10. INSTAGRAM COMMUNITY STRIP                             */}
      {/* ========================================================= */}
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
            Tag us to be featured in our Lucknow atelier editorial showcase.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {INSTAGRAM_POSTS.map((post, idx) => (
            <a
              key={idx}
              href="https://instagram.com/aryora.legacy"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square bg-ivory overflow-hidden border border-border-subtle block"
            >
              <Image
                src={post.image}
                alt={post.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-ivory">
                <InstagramIcon size={20} />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 11. NEWSLETTER SIGNUP                                     */}
      {/* ========================================================= */}
      <section className="max-w-content mx-auto px-4 md:px-8 pb-8">
        <div className="bg-ivory-pure border border-border-subtle p-8 md:p-12 text-center max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-champagne">
            The Atelier Gazette
          </span>
          <h2 className="font-serif text-2xl md:text-3xl text-ink font-light">
            Receive Private Invitations & First Access
          </h2>
          <p className="text-xs text-ink-muted leading-relaxed">
            Subscribe for private preview access to rare diamond drops, bespoke trunk shows, and editorial reflections on conscious Indian luxury.
          </p>

          {newsletterSubscribed ? (
            <div className="p-4 bg-ivory-warm border border-champagne/40 text-xs text-ink space-y-1">
              <p className="font-medium">Thank you for welcoming Aryora into your world.</p>
              <p className="text-[11px] text-ink-muted">You will receive our upcoming quarterly gazette shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 bg-ivory border border-border-subtle px-4 py-2.5 text-xs text-ink placeholder:text-ink-light focus:outline-none focus:border-champagne"
              />
              <button
                type="submit"
                className="btn-primary text-xs px-6 py-2.5 whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          )}

          <p className="text-[10px] text-ink-light">
            We respect your tranquility. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </div>
  );
}
