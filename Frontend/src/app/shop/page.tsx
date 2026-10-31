"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Check,
  RotateCcw,
  Sparkles,
  Award,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import { getAllProducts, Product, formatPriceINR } from "@/lib/data";

const CATEGORY_OPTIONS = [
  "All",
  "Rings",
  "Earrings",
  "Pendants",
  "Necklaces",
  "Bracelets",
  "Solitaires",
  "Bridal",
];

const PRICE_RANGES = [
  { id: "all", label: "All Prices", min: 0, max: Infinity },
  { id: "under-35k", label: "Under ₹35,000", min: 0, max: 35000 },
  { id: "35k-75k", label: "₹35,000 – ₹75,000", min: 35000, max: 75000 },
  { id: "75k-150k", label: "₹75,000 – ₹1,50,000", min: 75000, max: 150000 },
  { id: "above-150k", label: "Above ₹1,50,000", min: 150000, max: Infinity },
];

const METAL_OPTIONS = ["All", "Yellow Gold", "Rose Gold", "White Gold"];
const PURITY_OPTIONS = ["All", "18kt", "14kt", "925 Silver"];
const SHAPE_OPTIONS = ["All", "Round", "Oval", "Emerald", "Princess", "Pear", "Cushion"];
const OCCASION_OPTIONS = ["All", "Daily Wear", "Engagement", "Wedding", "Festive", "Gifting"];
const GENDER_OPTIONS = ["All", "Women", "Men", "Unisex"];
const STYLE_OPTIONS = ["All", "Solitaire", "Halo", "Classic", "Modern", "Vintage", "Tennis"];

function ShopCatalogueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const allProducts = useMemo(() => getAllProducts(), []);

  // Filter states initialized from URL params
  const categoryParam = searchParams.get("category") || "All";
  const priceParam = searchParams.get("price") || "all";
  const metalParam = searchParams.get("metal") || "All";
  const purityParam = searchParams.get("purity") || "All";
  const shapeParam = searchParams.get("shape") || "All";
  const occasionParam = searchParams.get("occasion") || "All";
  const genderParam = searchParams.get("gender") || "All";
  const styleParam = searchParams.get("style") || "All";
  const searchKeyword = searchParams.get("search") || "";
  const sortParam = searchParams.get("sort") || "featured";

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state to URL helper
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All" || value === "all" || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    router.replace("/shop", { scroll: false });
  };

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // 1. Category
      if (categoryParam !== "All" && product.category.toLowerCase() !== categoryParam.toLowerCase()) {
        return false;
      }
      // 2. Price
      if (priceParam !== "all") {
        const range = PRICE_RANGES.find((r) => r.id === priceParam);
        if (range && (product.price < range.min || product.price > range.max)) {
          return false;
        }
      }
      // 3. Metal
      if (metalParam !== "All" && product.metal.toLowerCase() !== metalParam.toLowerCase()) {
        return false;
      }
      // 4. Purity
      if (purityParam !== "All" && product.purity.toLowerCase() !== purityParam.toLowerCase()) {
        return false;
      }
      // 5. Shape
      if (shapeParam !== "All" && product.shape.toLowerCase() !== shapeParam.toLowerCase()) {
        return false;
      }
      // 6. Occasion
      if (occasionParam !== "All" && product.occasion.toLowerCase() !== occasionParam.toLowerCase()) {
        return false;
      }
      // 7. Gender
      if (genderParam !== "All" && product.gender.toLowerCase() !== genderParam.toLowerCase()) {
        return false;
      }
      // 8. Style
      if (styleParam !== "All" && product.style.toLowerCase() !== styleParam.toLowerCase()) {
        return false;
      }
      // 9. Search keyword
      if (searchKeyword) {
        const q = searchKeyword.toLowerCase();
        const match =
          product.name.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q) ||
          product.tags?.some((t) => t.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [
    allProducts,
    categoryParam,
    priceParam,
    metalParam,
    purityParam,
    shapeParam,
    occasionParam,
    genderParam,
    styleParam,
    searchKeyword,
  ]);

  // Sorting
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortParam === "price-low") {
      return list.sort((a, b) => a.price - b.price);
    }
    if (sortParam === "price-high") {
      return list.sort((a, b) => b.price - a.price);
    }
    if (sortParam === "newest") {
      return list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }
    if (sortParam === "bestseller") {
      return list.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }
    return list; // featured (default)
  }, [filteredProducts, sortParam]);

  // Active filter chips
  const activeChips = [
    categoryParam !== "All" && { key: "category", label: `Category: ${categoryParam}` },
    priceParam !== "all" && {
      key: "price",
      label: `Price: ${PRICE_RANGES.find((r) => r.id === priceParam)?.label}`,
    },
    metalParam !== "All" && { key: "metal", label: `Metal: ${metalParam}` },
    purityParam !== "All" && { key: "purity", label: `Purity: ${purityParam}` },
    shapeParam !== "All" && { key: "shape", label: `Shape: ${shapeParam}` },
    occasionParam !== "All" && { key: "occasion", label: `Occasion: ${occasionParam}` },
    genderParam !== "All" && { key: "gender", label: `Gender: ${genderParam}` },
    styleParam !== "All" && { key: "style", label: `Style: ${styleParam}` },
    searchKeyword && { key: "search", label: `Search: "${searchKeyword}"` },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6">
      {/* 1. Breadcrumbs */}
      <Breadcrumbs items={[{ label: "Shop Catalogue" }]} />

      {/* 2. Hero Header Banner */}
      <div className="bg-[#FAF8F4] border border-border-subtle p-6 md:p-10 space-y-3">
        <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-champagne">
          Fine Lab-Grown Joaillerie · Lucknow Atelier
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-ink font-light">
          All Fine Jewellery Creations
        </h1>
        <p className="text-xs md:text-sm text-ink-muted max-w-2xl leading-relaxed font-light">
          Explore {allProducts.length} certified solitaires, graduated necklaces, daily bands, and bridal suites handcrafted in 18K solid gold.
        </p>
      </div>

      {/* 3. Filter Bar & Sorting Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-y border-border-subtle">
        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 border border-border-subtle bg-ivory text-xs uppercase tracking-wider font-semibold text-ink"
          >
            <SlidersHorizontal size={14} />
            <span>Filters ({activeChips.length})</span>
          </button>

          <span className="text-xs text-ink-muted">
            Showing <strong>{sortedProducts.length}</strong> of {allProducts.length} creations
          </span>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 text-xs">
          <label htmlFor="sort-select" className="text-ink-muted font-medium">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sortParam}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="px-3 py-1.5 border border-border-subtle bg-ivory text-ink text-xs focus:outline-none focus:border-ink font-medium"
          >
            <option value="featured">Featured & Recommended</option>
            <option value="bestseller">Customer Bestsellers</option>
            <option value="newest">New Arrivals</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* 4. Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-ink-muted font-medium">Active Filters:</span>
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => updateFilter(chip.key, "All")}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-ivory-warm border border-border-subtle text-xs text-ink rounded-full hover:border-ink transition-colors"
            >
              <span>{chip.label}</span>
              <X size={12} className="text-ink-muted hover:text-ink" />
            </button>
          ))}
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs text-[#B93826] hover:underline font-semibold ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* 5. Main Content Grid (Sidebar + Products) */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* DESKTOP FILTER SIDEBAR */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 bg-ivory-pure border border-border-subtle p-5 sticky top-24 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <span className="font-serif text-lg text-ink font-medium">Filter By</span>
            {activeChips.length > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-champagne-accessible hover:underline font-medium"
              >
                Reset
              </button>
            )}
          </div>

          {/* Filter Group: Category */}
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-ink">Category</p>
            <div className="space-y-1 text-xs">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => updateFilter("category", cat)}
                  className={`w-full text-left py-1 flex items-center justify-between transition-colors ${
                    categoryParam.toLowerCase() === cat.toLowerCase()
                      ? "font-semibold text-champagne-accessible"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <span>{cat}</span>
                  {categoryParam.toLowerCase() === cat.toLowerCase() && <Check size={13} />}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Group: Price */}
          <div className="space-y-2 pt-3 border-t border-border-subtle">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-ink">Price Range</p>
            <div className="space-y-1 text-xs">
              {PRICE_RANGES.map((range) => (
                <button
                  key={range.id}
                  type="button"
                  onClick={() => updateFilter("price", range.id)}
                  className={`w-full text-left py-1 flex items-center justify-between transition-colors ${
                    priceParam === range.id
                      ? "font-semibold text-champagne-accessible"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <span>{range.label}</span>
                  {priceParam === range.id && <Check size={13} />}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Group: Metal */}
          <div className="space-y-2 pt-3 border-t border-border-subtle">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-ink">Precious Metal</p>
            <div className="space-y-1 text-xs">
              {METAL_OPTIONS.map((metal) => (
                <button
                  key={metal}
                  type="button"
                  onClick={() => updateFilter("metal", metal)}
                  className={`w-full text-left py-1 flex items-center justify-between transition-colors ${
                    metalParam.toLowerCase() === metal.toLowerCase()
                      ? "font-semibold text-champagne-accessible"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <span>{metal}</span>
                  {metalParam.toLowerCase() === metal.toLowerCase() && <Check size={13} />}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Group: Stone Shape */}
          <div className="space-y-2 pt-3 border-t border-border-subtle">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-ink">Diamond Shape</p>
            <div className="space-y-1 text-xs">
              {SHAPE_OPTIONS.map((shape) => (
                <button
                  key={shape}
                  type="button"
                  onClick={() => updateFilter("shape", shape)}
                  className={`w-full text-left py-1 flex items-center justify-between transition-colors ${
                    shapeParam.toLowerCase() === shape.toLowerCase()
                      ? "font-semibold text-champagne-accessible"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <span>{shape}</span>
                  {shapeParam.toLowerCase() === shape.toLowerCase() && <Check size={13} />}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Group: Occasion */}
          <div className="space-y-2 pt-3 border-t border-border-subtle">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-ink">Occasion</p>
            <div className="space-y-1 text-xs">
              {OCCASION_OPTIONS.map((occ) => (
                <button
                  key={occ}
                  type="button"
                  onClick={() => updateFilter("occasion", occ)}
                  className={`w-full text-left py-1 flex items-center justify-between transition-colors ${
                    occasionParam.toLowerCase() === occ.toLowerCase()
                      ? "font-semibold text-champagne-accessible"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <span>{occ}</span>
                  {occasionParam.toLowerCase() === occ.toLowerCase() && <Check size={13} />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* PRODUCT CATALOGUE GRID */}
        <div className="lg:col-span-9 space-y-6">
          {sortedProducts.length === 0 ? (
            <div className="bg-ivory-pure border border-border-subtle p-12 text-center space-y-4">
              <p className="font-serif text-2xl text-ink">No creations match the selected filters</p>
              <p className="text-xs text-ink-muted max-w-sm mx-auto">
                Try clearing one or more filters, or reset to explore all 24 fine lab diamond creations.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="btn-primary text-xs font-semibold px-6 py-3"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FILTER MODAL DRAWER */}
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm lg:hidden flex justify-end animate-fadeIn"
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            className="w-4/5 max-w-xs h-full bg-ivory-pure p-6 overflow-y-auto space-y-6 animate-slideLeft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <span className="font-serif text-xl font-medium text-ink">Filters</span>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-ink-muted hover:text-ink"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Categories */}
            <div className="space-y-2">
              <p className="text-xs uppercase font-semibold text-ink">Category</p>
              <div className="space-y-1 text-xs">
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      updateFilter("category", cat);
                      setMobileFilterOpen(false);
                    }}
                    className="w-full text-left py-1 text-ink-muted hover:text-ink"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Price */}
            <div className="space-y-2 pt-3 border-t border-border-subtle">
              <p className="text-xs uppercase font-semibold text-ink">Price</p>
              <div className="space-y-1 text-xs">
                {PRICE_RANGES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      updateFilter("price", r.id);
                      setMobileFilterOpen(false);
                    }}
                    className="w-full text-left py-1 text-ink-muted hover:text-ink"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border-subtle space-y-2">
              <button
                type="button"
                onClick={() => {
                  clearAllFilters();
                  setMobileFilterOpen(false);
                }}
                className="w-full py-2.5 text-xs text-[#B93826] font-semibold border border-[#B93826]"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="btn-primary w-full py-2.5 text-xs font-semibold text-center"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-ink-muted">Loading catalogue...</div>}>
      <ShopCatalogueContent />
    </Suspense>
  );
}
