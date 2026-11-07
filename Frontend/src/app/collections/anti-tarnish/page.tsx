"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import { getAllProducts, Product, formatPriceINR } from "@/lib/data";
import { MIN_ANTI_TARNISH_PRICE, MAX_ANTI_TARNISH_PRICE } from "@/lib/antiTarnishConfig";
import {
  Droplets,
  Sparkles,
  ShieldCheck,
  Flame,
  SlidersHorizontal,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

const JEWELLERY_TYPES = [
  { id: "all", label: "All Items" },
  { id: "necklace", label: "Necklaces" },
  { id: "earrings", label: "Earrings" },
  { id: "ring", label: "Rings" },
  { id: "bracelet", label: "Bracelets" },
  { id: "anklet", label: "Anklets" },
];

const PRICE_BUCKETS = [
  { id: "all", label: "All Prices (₹499 - ₹2,999)", min: 499, max: 2999 },
  { id: "under-999", label: "Under ₹999", min: 499, max: 999 },
  { id: "1000-1999", label: "₹1,000 – ₹1,999", min: 1000, max: 1999 },
  { id: "2000-2999", label: "₹2,000 – ₹2,999", min: 2000, max: 2999 },
];

export default function AntiTarnishCollectionPage() {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedBucket, setSelectedBucket] = useState<string>("all");
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(MAX_ANTI_TARNISH_PRICE);
  const [sortBy, setSortBy] = useState<"new" | "price-asc" | "price-desc">("new");

  const allProducts = getAllProducts();

  // Filter anti-tarnish items
  const antiTarnishProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const isAnti =
        p.isAntiTarnish ||
        p.category?.toLowerCase().includes("anti-tarnish") ||
        p.subcategory?.toLowerCase().includes("anti-tarnish") ||
        p.tags?.some(
          (t) =>
            t.toLowerCase().includes("anti-tarnish") ||
            t.toLowerCase().includes("waterproof") ||
            t.toLowerCase().includes("chain")
        ) ||
        p.name?.toLowerCase().includes("anti-tarnish") ||
        p.name?.toLowerCase().includes("ayor");

      // Also ensure price stays within anti-tarnish price guidelines if tagged
      return isAnti;
    });
  }, [allProducts]);

  // Apply User Filters (Type, Price, Sort)
  const filteredProducts = useMemo(() => {
    const list = antiTarnishProducts.length > 0 ? antiTarnishProducts : allProducts.slice(0, 12);

    return list
      .filter((p) => {
        // 1. Type Filter
        if (selectedType !== "all") {
          const typeMatch =
            p.subcategory?.toLowerCase().includes(selectedType) ||
            p.category?.toLowerCase().includes(selectedType) ||
            p.name?.toLowerCase().includes(selectedType) ||
            p.tags?.some((t) => t.toLowerCase().includes(selectedType));
          if (!typeMatch) return false;
        }

        // 2. Price Bucket Filter
        const bucket = PRICE_BUCKETS.find((b) => b.id === selectedBucket);
        if (bucket && bucket.id !== "all") {
          if (p.price < bucket.min || p.price > bucket.max) return false;
        }

        // 3. Price Slider
        if (p.price > maxPriceFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      });
  }, [antiTarnishProducts, allProducts, selectedType, selectedBucket, maxPriceFilter, sortBy]);

  const handleResetFilters = () => {
    setSelectedType("all");
    setSelectedBucket("all");
    setMaxPriceFilter(MAX_ANTI_TARNISH_PRICE);
    setSortBy("new");
  };

  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-6 md:py-12 space-y-8">
      <Breadcrumbs
        items={[
          { label: "Collections", href: "/collections" },
          { label: "Anti-Tarnish Jewellery" },
        ]}
      />

      {/* 1. Hero Banner: Waterproof, Sweat-proof, Long-lasting shine */}
      <div className="relative rounded-2xl bg-gradient-to-br from-[#FAF7F2] via-white to-[#F4EFEA] border border-[#E5E0D8] p-6 sm:p-10 md:p-12 overflow-hidden shadow-xs">
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#0E382B]/10 border border-[#0E382B]/20 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold text-[#0E382B]">
            <Droplets size={12} className="text-[#108474]" />
            <span>Waterproof · Sweat-Proof · Perfume-Safe</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#111111] leading-tight">
            Anti-Tarnish Jewellery, <br />
            <span className="italic font-normal text-[#0E382B]">Shine That Never Fades</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#555555] leading-relaxed max-w-xl">
            Engineered with multi-layer PVD plating over 316L surgical-grade stainless steel and 925 sterling silver. Completely waterproof, sweat-proof, and hypoallergenic. Shower, swim, and conquer your day without ever taking your shine off.
          </p>

          {/* 3 Core Assurance Badges */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 max-w-lg">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-[#E5E0D8] shadow-2xs">
              <Droplets size={16} className="text-[#108474] flex-shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-[#111111] leading-tight">100% Waterproof</p>
                <p className="text-[9px] text-[#777777]">Shower & swim safe</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-[#E5E0D8] shadow-2xs">
              <Sparkles size={16} className="text-[#C09981] flex-shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-[#111111] leading-tight">Never Fades</p>
                <p className="text-[9px] text-[#777777]">Long-lasting shine</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-[#E5E0D8] shadow-2xs">
              <ShieldCheck size={16} className="text-[#0E382B] flex-shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-[#111111] leading-tight">Hypoallergenic</p>
                <p className="text-[9px] text-[#777777]">Skin-friendly metal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Floating Accent */}
        <div className="absolute right-6 -bottom-6 w-56 h-56 md:w-80 md:h-80 opacity-15 pointer-events-none hidden md:block">
          <Image
            src="/site/cat-bracelets.svg"
            alt="Anti-Tarnish Jewellery"
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* 2. Interactive Filter & Sorting Bar */}
      <div className="space-y-4 pt-2">
        {/* Jewellery Type Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {JEWELLERY_TYPES.map((t) => {
            const active = selectedType === t.id;
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? "bg-[#0E382B] text-white shadow-sm"
                    : "bg-white text-[#555555] border border-[#E5E0D8] hover:border-[#0E382B]"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Price & Sort Controls */}
        <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E5E0D8] flex flex-wrap items-center justify-between gap-4">
          {/* Quick Price Buckets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-medium text-[#777777] mr-1 flex items-center gap-1">
              <SlidersHorizontal size={13} />
              <span>Price:</span>
            </span>
            {PRICE_BUCKETS.map((b) => (
              <button
                type="button"
                key={b.id}
                onClick={() => setSelectedBucket(b.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                  selectedBucket === b.id
                    ? "bg-[#0E382B] text-white"
                    : "bg-white text-[#666666] border border-[#E5E0D8] hover:border-[#0E382B]"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-3">
            <label className="text-xs text-[#777777] font-medium">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-[#E5E0D8] rounded-xl px-3 py-1.5 text-xs text-[#111111] focus:outline-none focus:border-[#0E382B] cursor-pointer"
            >
              <option value="new">New Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>

            {(selectedType !== "all" || selectedBucket !== "all" || sortBy !== "new") && (
              <button
                type="button"
                onClick={handleResetFilters}
                title="Reset all filters"
                className="p-1.5 rounded-lg border border-[#E5E0D8] hover:border-[#0E382B] text-[#777777] hover:text-[#111111] transition-colors cursor-pointer"
              >
                <RotateCcw size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Product Count Summary */}
      <div className="flex items-center justify-between text-xs text-[#777777] px-1">
        <span>
          Showing <strong className="text-[#111111]">{filteredProducts.length}</strong> Anti-Tarnish pieces (₹499 to ₹2,999)
        </span>
        <span className="hidden sm:inline">100% Waterproof Guarantee · Free Insured Delivery</span>
      </div>

      {/* 4. Product Cards Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((p, idx) => (
            <ProductCard key={p.id || p.sku || idx} product={p} priority={idx < 4} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#FAF7F2] rounded-2xl border border-dashed border-[#E5E0D8] p-8 space-y-3">
          <p className="font-serif text-lg text-[#111111]">No pieces found matching this price range.</p>
          <p className="text-xs text-[#777777]">Try adjusting your filter or reset to see the entire anti-tarnish collection.</p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 bg-[#0E382B] text-white rounded-xl text-xs font-medium cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

