"use client";

import { useState, useRef, useEffect } from "react";
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
  ChevronLeft,
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
    image: "/products/solitaire-01-a.jpg",
    badge: "Certified Solitaires",
  },
  {
    title: "Heritage Bridal Studio",
    subtitle: "Awadhi Royal Grandeur",
    desc: "Handcrafted wedding suites uniting certified emeralds and brilliant diamonds.",
    href: "/bridal",
    image: "/products/bridal-01-a.jpg",
    badge: "Bridal Jewellery",
  },
  {
    title: "Modern Everyday Radiance",
    subtitle: "Bands, Huggies & Tennis Cuffs",
    desc: "Engineered to be worn effortlessly from morning coffee to evening celebrations.",
    href: "/shop?occasion=Daily+Wear",
    image: "/products/bracelet-01-a.jpg",
    badge: "Everyday Luxury",
  },
];

const REVIEWS = [
  {
    name: "Dr. Ananya Srivastava",
    city: "Lucknow",
    text: "Ordered a 1.5ct solitaire ring for my engagement. The IGI certificate was immediately verifiable, the gold finish is impeccable, and the customer care team was wonderfully attentive on WhatsApp.",
    jewel: "Brilliant Round Shaped Solitaire Engagement Ring",
    rating: 5,
  },
  {
    name: "Pooja & Rohan Mehra",
    city: "Delhi NCR",
    text: "We wanted a sustainable wedding set without compromising on size or cut. Ayor’s lab diamonds possess incredible fire, and the transparent price breakup gave us complete confidence.",
    jewel: "Brilliant Round Shaped Solitaire Tennis Necklace",
    rating: 5,
  },
  {
    name: "Vikram Singhania",
    city: "Mumbai",
    text: "The men’s diamond signet ring arrived in 3 days in a beautiful velvet chest. 100% authentic BIS hallmark and very comfortable weight for daily wear.",
    jewel: "Oval Shaped Solitaire Wedding Bands",
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
  const prodScrollRef = useRef<HTMLDivElement>(null);
  const [isProdPaused, setIsProdPaused] = useState(false);

  // Auto-scroll for Curated Products Carousel
  useEffect(() => {
    const el = prodScrollRef.current;
    if (!el) return;

    let lastTime = performance.now();
    let animId: number;

    const step = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      if (!isProdPaused && el) {
        el.scrollLeft += (40 * delta) / 1000;
        const singleSetWidth = el.scrollWidth / 3;
        if (el.scrollLeft >= singleSetWidth * 2) {
          el.scrollLeft -= singleSetWidth;
        } else if (el.scrollLeft <= 5) {
          el.scrollLeft += singleSetWidth;
        }
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isProdPaused]);

  const handleProdManualScroll = (direction: "left" | "right") => {
    if (prodScrollRef.current) {
      const cardWidth = 300;
      prodScrollRef.current.scrollBy({
        left: direction === "left" ? -cardWidth : cardWidth,
        behavior: "smooth",
      });
    }
  };

  const repeatedProducts = [...displayProducts, ...displayProducts, ...displayProducts];

  return (
    <div className="space-y-16 md:space-y-24">
      {/* 1. HERO BANNER (Miss Jo luxury video hero with terracotta CTA) */}
      <Hero />

      {/* 2. TRUST STRIP (Miss Jo Cream #F5F0EA with Teal-Emerald seals) */}
      <TrustStrip />

      {/* 3. CATEGORY STRIP ("Your favorites, by category.") */}
      <CategorySection />

      {/* 4. CURATED SHOWCASE (Bestsellers & New Arrivals) */}
      <section className="max-w-content mx-auto px-4 md:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DDD8D0] pb-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#C09981]">
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
                  ? "bg-ink text-white"
                  : "bg-[#F5F0EA] border border-[#DDD8D0] text-[#4A4A4A] hover:text-ink"
              }`}
            >
              Bestsellers
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("new")}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-medium transition-colors ${
                activeTab === "new"
                  ? "bg-ink text-white"
                  : "bg-[#F5F0EA] border border-[#DDD8D0] text-[#4A4A4A] hover:text-ink"
              }`}
            >
              New Arrivals
            </button>
          </div>
        </div>

        {/* Product Carousel with Auto-Movement and Controls */}
        <div
          className="relative group/prod-slider"
          onMouseEnter={() => setIsProdPaused(true)}
          onMouseLeave={() => setIsProdPaused(false)}
          onTouchStart={() => setIsProdPaused(true)}
          onTouchEnd={() => setIsProdPaused(false)}
        >
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => handleProdManualScroll("left")}
            aria-label="Previous creations"
            className="absolute -left-2 sm:left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 text-[#111111] shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[#E5E0D8] flex items-center justify-center hover:bg-[#111111] hover:text-white transition-all duration-300 cursor-pointer"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>

          <div
            ref={prodScrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth pb-4 pt-1 px-1 no-scrollbar select-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {repeatedProducts.map((product, idx) => (
              <div key={`${product.id}-${idx}`} className="w-[230px] sm:w-[260px] md:w-[285px] flex-shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => handleProdManualScroll("right")}
            aria-label="Next creations"
            className="absolute -right-2 sm:right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 text-[#111111] shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[#E5E0D8] flex items-center justify-center hover:bg-[#111111] hover:text-white transition-all duration-300 cursor-pointer"
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>
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
          <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#C09981]">
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
              className="group relative bg-white border border-[#DDD8D0] p-6 flex flex-col justify-between hover:border-[#C09981] hover:shadow-lg transition-all space-y-6"
            >
              <div className="space-y-3">
                <span className="text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 bg-[#F9F4F0] text-[#C09981] border border-[#D1B9A7]/50 inline-block">
                  {col.badge}
                </span>
                <h3 className="font-serif text-2xl text-ink font-normal group-hover:text-[#C09981] transition-colors">
                  {col.title}
                </h3>
                <p className="text-xs font-medium text-ink-muted">{col.subtitle}</p>
                <p className="text-xs text-ink-subtle leading-relaxed">{col.desc}</p>
              </div>

              <div className="relative aspect-square w-full bg-[#F5F0EA] rounded-sm overflow-hidden flex items-center justify-center p-6 border border-[#DDD8D0]/50">
                <Image
                  src={col.image}
                  alt={col.title}
                  width={220}
                  height={220}
                  className="object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-ink group-hover:text-[#C09981] transition-colors">
                <span>Discover Collection</span>
                <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. WHY AYOR LAB-GROWN FINE JEWELLERY */}
      <section className="bg-[#F5F0EA] border-y border-[#DDD8D0] py-16 md:py-20">
        <div className="max-w-content mx-auto px-4 md:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#C09981]">
              The Conscious Revolution
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-ink font-light">
              Why Choose Ayor Fine Lab Diamonds
            </h2>
            <p className="text-xs text-ink-muted leading-relaxed">
              We eliminate earth mining disruption and excessive middleman markups without sacrificing an ounce of Awadhi royal grandeur.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {siteConfig.whyAyor.map((pillar) => (
              <div
                key={pillar.title}
                className="bg-white border border-[#DDD8D0] p-6 space-y-3 flex flex-col justify-between shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-[#F5F0EA] flex items-center justify-center text-[#108474] border border-[#DDD8D0]">
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
          <div className="bg-white border border-[#DDD8D0] p-6 md:p-8 max-w-3xl mx-auto shadow-sm">
            <h3 className="font-serif text-lg text-ink text-center mb-4 font-normal">
              Ayor Lab Diamond vs. Mined Diamond: Scientific Equivalence
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs divide-x divide-[#DDD8D0]">
              <div className="p-2 space-y-1">
                <p className="font-medium text-ink">Atomic Lattice</p>
                <p className="text-[11px] text-ink-muted">100% Carbon Crystal (C)</p>
                <span className="text-[10px] text-[#108474] font-semibold">Identical</span>
              </div>
              <div className="p-2 space-y-1">
                <p className="font-medium text-ink">Hardness (Mohs)</p>
                <p className="text-[11px] text-ink-muted">10/10 Hardest Material</p>
                <span className="text-[10px] text-[#108474] font-semibold">Identical</span>
              </div>
              <div className="p-2 space-y-1">
                <p className="font-medium text-ink">Ecological Footprint</p>
                <p className="text-[11px] text-ink-muted">Zero Earth Dredging</p>
                <span className="text-[10px] text-[#108474] font-semibold">Conscious Luxury</span>
              </div>
            </div>
          </div>

          {/* Official Accreditation Badges */}
          <div className="bg-white border border-[#DDD8D0] p-6 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white p-2 border border-[#DDD8D0] shadow-sm flex items-center justify-center flex-shrink-0">
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

            <div className="hidden sm:block h-10 w-px bg-[#DDD8D0]" />

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white p-2 border border-[#DDD8D0] shadow-sm flex items-center justify-center flex-shrink-0">
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

      {/* 7. CUSTOM DESIGN STUDIO BANNER (Eye-Comfort Luxury Cream & Dark Green Aesthetic) */}
      <section className="max-w-content mx-auto px-4 md:px-8">
        <div className="bg-[#FAF7F2] border border-[#DDD8D0] shadow-md rounded-2xl p-8 md:p-14 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#0E382B] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0E382B]" />
              Custom Jewellery & Bridal Craft
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-[#111111] leading-tight">
              Design Your Dream Custom Ring
            </h2>
            <p className="text-sm md:text-base text-[#3A3A3A] leading-relaxed max-w-xl font-normal">
              Select your diamond shape (Round, Oval, Emerald, Pear), metal purity (18K Gold & 925 Sterling Silver), and custom setting. Our master karigars handcraft your bespoke design with 100% certified diamonds.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/customize"
                className="bg-[#0E382B] hover:bg-[#144636] text-white transition-colors text-xs uppercase tracking-wider font-semibold px-7 py-3.5 rounded-xl inline-flex items-center gap-2 shadow-sm"
              >
                <span>Customize Your Ring Now</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/bridal"
                className="border border-[#0E382B] text-[#0E382B] hover:bg-[#0E382B] hover:text-white transition-colors text-xs uppercase tracking-wider font-semibold px-6 py-3.5 rounded-xl inline-flex items-center gap-2"
              >
                <span>Book Free Video Consultation</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 flex items-center justify-center">
            <div className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full border border-[#E5E0D8] p-8 flex items-center justify-center bg-white shadow-md hover:shadow-lg transition-all">
              <Image
                src="/site/ayor-symbol.svg"
                alt="AYOR Stylized Monogram"
                width={130}
                height={130}
                className="object-contain hover:scale-105 transition-transform duration-500 drop-shadow-xs"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 8. CLIENT REVIEWS & TRUST STORIES */}
      <section className="max-w-content mx-auto px-4 md:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#C09981]">
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
              className="bg-white border border-[#DDD8D0] p-6 space-y-4 flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-[#C09981]">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-xs text-ink-muted leading-relaxed italic">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-[#DDD8D0]/70 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-ink">{rev.name}</p>
                  <p className="text-[11px] text-ink-subtle">{rev.city}</p>
                </div>
                <span className="text-[10px] text-[#108474] font-medium">
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
          <div className="inline-flex items-center space-x-1.5 text-xs text-[#C09981] font-medium">
            <InstagramIcon size={14} />
            <a
              href="https://instagram.com/ayorjewellery"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline font-semibold"
            >
              @ayorjewellery
            </a>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl text-ink font-light">
            Styled by Our Community
          </h2>
          <p className="text-xs text-ink-muted">
            Tag #AyorLegacy to be featured in our Lucknow studio editorial showcase.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { img: "/products/ring-01-a.jpg", title: "Solitaire Band" },
            { img: "/products/earring-01-a.jpg", title: "Luminary Studs" },
            { img: "/products/necklace-01-a.jpg", title: "Tennis Line" },
            { img: "/products/bracelet-01-a.jpg", title: "Tennis Bracelet" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="group relative aspect-square bg-[#F5F0EA] border border-[#DDD8D0] overflow-hidden flex items-center justify-center p-4"
            >
              <Image
                src={item.img}
                alt={item.title}
                width={180}
                height={180}
                className="object-contain group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-serif tracking-wider font-light">
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
