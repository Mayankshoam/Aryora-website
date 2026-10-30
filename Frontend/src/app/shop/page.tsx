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
  ShieldCheck,
  Truck,
  Award,
  RefreshCw,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import {
  PRODUCTS,
  ProductItem,
  ProductCategory,
  MetalType,
  CATEGORY_LABELS,
  METAL_NAMES,
  formatPriceINR,
} from "@/lib/products";

// Filter definitions matching BlueStone concept
const CATEGORY_FILTERS: { id: string; label: string }[] = [
  { id: "all", label: "All Jewellery" },
  { id: "rings", label: "Rings" },
  { id: "earrings", label: "Earrings" },
  { id: "pendants", label: "Pendants" },
  { id: "necklaces", label: "Necklaces" },
  { id: "bracelets", label: "Bracelets & Bangles" },
  { id: "mangalsutras", label: "Mangalsutras" },
  { id: "solitaires", label: "Solitaires" },
  { id: "bridal", label: "Bridal Suite" },
  { id: "mens", label: "Men's Collection" },
];

const PRICE_FILTERS = [
  { id: "all", label: "All Prices", min: 0, max: Infinity },
  { id: "under-25k", label: "Under ₹25,000", min: 0, max: 25000 },
  { id: "25k-50k", label: "₹25,000 – ₹50,000", min: 25000, max: 50000 },
  { id: "50k-100k", label: "₹50,000 – ₹1,00,000", min: 50000, max: 100000 },
  { id: "above-100k", label: "Above ₹1,00,000", min: 100000, max: Infinity },
];

const METAL_FILTERS: { id: string; label: string }[] = [
  { id: "all", label: "All Metals" },
  { id: "YELLOW_GOLD", label: "18K Yellow Gold" },
  { id: "ROSE_GOLD", label: "18K Rose Gold" },
  { id: "WHITE_GOLD", label: "18K White Gold" },
  { id: "CHAMPAGNE_GOLD", label: "18K Champagne Gold" },
  { id: "SILVER_925", label: "92.5 Sterling Silver" },
];

const PURITY_FILTERS = [
  { id: "all", label: "All Purities" },
  { id: "18kt", label: "18kt Gold" },
  { id: "14kt", label: "14kt Gold" },
  { id: "925 Silver", label: "92.5 Silver" },
];

const STONE_FILTERS = [
  { id: "all", label: "All Stones" },
  { id: "lab-grown-diamond", label: "Lab-Grown Diamond" },
  { id: "gemstone", label: "Emerald / Gemstone" },
];

const SHAPE_FILTERS = [
  { id: "all", label: "All Shapes" },
  { id: "Round", label: "Round Brilliant" },
  { id: "Emerald", label: "Emerald Cut" },
  { id: "Pear", label: "Pear Cut" },
  { id: "Princess", label: "Princess Cut" },
];

const OCCASION_FILTERS = [
  { id: "all", label: "All Occasions" },
  { id: "Everyday", label: "Everyday Wear" },
  { id: "Workwear", label: "Office & Workwear" },
  { id: "Wedding", label: "Wedding & Festive" },
  { id: "Gifting", label: "Meaningful Gifting" },
  { id: "Engagement", label: "Engagement" },
  { id: "Anniversary", label: "Anniversary" },
];

const GENDER_FILTERS = [
  { id: "all", label: "All Recipients" },
  { id: "Women", label: "Women" },
  { id: "Men", label: "Men" },
];

const STYLE_FILTERS = [
  { id: "all", label: "All Styles" },
  { id: "Solitaire", label: "Solitaire" },
  { id: "Studs", label: "Studs" },
  { id: "Drops", label: "Drops" },
  { id: "Tennis", label: "Tennis Line" },
  { id: "Choker", label: "Choker" },
  { id: "Lightweight", label: "Lightweight Daily" },
  { id: "Band", label: "Band" },
  { id: "Cocktail", label: "Cocktail & Statement" },
];

const POPULAR_SEARCH_LINKS = [
  { label: "Solitaire Engagement Rings", href: "/shop?category=rings&style=Solitaire" },
  { label: "Diamond Tennis Bracelets", href: "/shop?category=bracelets&style=Tennis" },
  { label: "Solitaire Stud Earrings", href: "/shop?category=earrings&style=Studs" },
  { label: "Modern Diamond Mangalsutra", href: "/shop?category=mangalsutras" },
  { label: "Graduated Tennis Necklaces", href: "/shop?category=necklaces&style=Tennis" },
  { label: "Men's 18K Diamond Bands", href: "/shop?category=mens" },
  { label: "92.5 Silver Diamond Rings", href: "/shop?category=rings&metal=SILVER_925" },
  { label: "Lucknow Heritage Bridal Sets", href: "/bridal" },
];

function ShopCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mobile drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Accordion collapsed state for desktop sidebar
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    category: true,
    metal: true,
    purity: false,
    stone: false,
    shape: false,
    occasion: true,
    gender: false,
    style: false,
    delivery: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Extract query parameters
  const activeCategory = searchParams.get("category") || "all";
  const activePrice = searchParams.get("price") || "all";
  const activeMetal = searchParams.get("metal") || "all";
  const activePurity = searchParams.get("purity") || "all";
  const activeStone = searchParams.get("stone") || "all";
  const activeShape = searchParams.get("shape") || "all";
  const activeOccasion = searchParams.get("occasion") || "all";
  const activeGender = searchParams.get("gender") || "all";
  const activeStyle = searchParams.get("style") || "all";
  const activeDelivery = searchParams.get("delivery") || "all";
  const activeSort = searchParams.get("sort") || "featured";
  const searchQuery = searchParams.get("q") || "";

  // Helper to update query parameters in URL
  const setFilterParam = (key: string, value: string) => {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/shop?${params.toString()}`, { scroll: false });
    setTimeout(() => setLoading(false), 120);
  };

  const clearAllFilters = () => {
    router.push("/shop", { scroll: false });
  };

  // Count active filters
  const activeFilterCount = [
    activeCategory !== "all",
    activePrice !== "all",
    activeMetal !== "all",
    activePurity !== "all",
    activeStone !== "all",
    activeShape !== "all",
    activeOccasion !== "all",
    activeGender !== "all",
    activeStyle !== "all",
    activeDelivery !== "all",
    Boolean(searchQuery),
  ].filter(Boolean).length;

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((item) => {
      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesMetal = item.specs.metal.toLowerCase().includes(q);
        const matchesStyle = item.style.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory && !matchesMetal && !matchesStyle) {
          return false;
        }
      }

      // Category
      if (activeCategory !== "all") {
        if (activeCategory === "solitaires") {
          if (item.collection !== "solitaire" && item.style !== "Solitaire") {
            return false;
          }
        } else if (item.category !== activeCategory) {
          return false;
        }
      }

      // Price
      if (activePrice !== "all") {
        const range = PRICE_FILTERS.find((p) => p.id === activePrice);
        if (range && (item.price < range.min || item.price > range.max)) {
          return false;
        }
      }

      // Metal
      if (activeMetal !== "all") {
        if (
          item.metalType !== activeMetal &&
          !item.availableMetals.includes(activeMetal as MetalType)
        ) {
          return false;
        }
      }

      // Purity
      if (activePurity !== "all" && item.purity !== activePurity) {
        return false;
      }

      // Stone
      if (activeStone !== "all" && item.stone !== activeStone) {
        return false;
      }

      // Shape
      if (activeShape !== "all" && item.stoneShape !== activeShape) {
        return false;
      }

      // Occasion
      if (
        activeOccasion !== "all" &&
        !item.occasions.some(
          (o) => o.toLowerCase() === activeOccasion.toLowerCase()
        )
      ) {
        return false;
      }

      // Gender
      if (activeGender !== "all" && item.gender !== activeGender) {
        return false;
      }

      // Style
      if (
        activeStyle !== "all" &&
        item.style.toLowerCase() !== activeStyle.toLowerCase()
      ) {
        return false;
      }

      // Delivery (Ready to Ship)
      if (activeDelivery === "ready-to-ship" && !item.readyToShip) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (activeSort === "price-low") return a.price - b.price;
      if (activeSort === "price-high") return b.price - a.price;
      if (activeSort === "newest") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      // Default: featured / bestseller
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [
    searchQuery,
    activeCategory,
    activePrice,
    activeMetal,
    activePurity,
    activeStone,
    activeShape,
    activeOccasion,
    activeGender,
    activeStyle,
    activeDelivery,
    activeSort,
  ]);

  // Dynamic Page Title
  const pageTitle =
    activeCategory !== "all"
      ? `${CATEGORY_LABELS[activeCategory as ProductCategory] || activeCategory}`
      : searchQuery
      ? `Search results for "${searchQuery}"`
      : "Fine Jewellery Catalogue";

  return (
    <div className="bg-ivory min-h-screen">
      {/* ========================================================= */}
      {/* 1. BREADCRUMBS & TOP HEADER                               */}
      {/* ========================================================= */}
      <div className="border-b border-border-subtle bg-ivory-warm/40">
        <div className="max-w-content mx-auto px-4 md:px-8 py-4">
          <Breadcrumbs
            items={[
              { label: "Shop", href: "/shop" },
              ...(activeCategory !== "all"
                ? [{ label: CATEGORY_LABELS[activeCategory as ProductCategory] || activeCategory }]
                : []),
            ]}
          />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-3 pb-2">
            <div>
              <h1 className="font-serif text-2xl md:text-4xl text-ink font-light">
                {pageTitle}{" "}
                <span className="text-base md:text-lg text-ink-muted font-normal">
                  | {filteredProducts.length} {filteredProducts.length === 1 ? "design" : "designs"}
                </span>
              </h1>
              <p className="text-xs text-ink-muted mt-1 max-w-2xl leading-relaxed">
                Handcrafted in Lucknow with 100% IGI-certified lab-grown diamonds, hallmarked 18K gold and 92.5 sterling silver.
              </p>
            </div>

            {/* Desktop Sort Dropdown */}
            <div className="flex items-center space-x-2 self-end">
              <span className="text-xs text-ink-light">Sort by:</span>
              <select
                value={activeSort}
                onChange={(e) => setFilterParam("sort", e.target.value)}
                className="bg-ivory-pure border border-border-subtle px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-champagne"
                aria-label="Sort designs"
              >
                <option value="featured">Featured Designs</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* ========================================================= */}
          {/* Horizontal Category Quick-Pills (BlueStone signature)     */}
          {/* ========================================================= */}
          <div className="flex items-center space-x-2 overflow-x-auto py-3 no-scrollbar border-t border-border-subtle/60 mt-3">
            {CATEGORY_FILTERS.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFilterParam("category", cat.id)}
                  className={`flex-shrink-0 text-xs px-3.5 py-1.5 transition-all ${
                    isSelected
                      ? "bg-ink text-ivory font-medium shadow-sm"
                      : "bg-ivory-pure border border-border-subtle text-ink hover:border-champagne"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN LAYOUT: LEFT SIDEBAR FILTERS + PRODUCT GRID       */}
      {/* ========================================================= */}
      <div className="max-w-content mx-auto px-4 md:px-8 py-8">
        {/* Mobile Filter Button */}
        <div className="lg:hidden flex items-center justify-between mb-4 pb-3 border-b border-border-subtle">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-ivory-pure border border-border-subtle text-xs font-medium text-ink"
          >
            <SlidersHorizontal size={14} />
            <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          </button>

          <span className="text-xs text-ink-muted">
            {filteredProducts.length} {filteredProducts.length === 1 ? "design" : "designs"}
          </span>
        </div>

        {/* Active Filter Chips Strip */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-ivory-warm/60 border border-border-subtle">
            <span className="text-[11px] font-semibold text-ink uppercase tracking-wider">
              Applied Filters:
            </span>

            {activeCategory !== "all" && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-ivory-pure border border-border-subtle text-xs text-ink">
                <span>Category: {CATEGORY_LABELS[activeCategory as ProductCategory] || activeCategory}</span>
                <button
                  type="button"
                  onClick={() => setFilterParam("category", "all")}
                  className="hover:text-champagne-accessible p-0.5"
                  aria-label="Remove category filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {activePrice !== "all" && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-ivory-pure border border-border-subtle text-xs text-ink">
                <span>Price: {PRICE_FILTERS.find((p) => p.id === activePrice)?.label}</span>
                <button
                  type="button"
                  onClick={() => setFilterParam("price", "all")}
                  className="hover:text-champagne-accessible p-0.5"
                  aria-label="Remove price filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {activeMetal !== "all" && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-ivory-pure border border-border-subtle text-xs text-ink">
                <span>Metal: {METAL_NAMES[activeMetal as MetalType] || activeMetal}</span>
                <button
                  type="button"
                  onClick={() => setFilterParam("metal", "all")}
                  className="hover:text-champagne-accessible p-0.5"
                  aria-label="Remove metal filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {activeOccasion !== "all" && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-ivory-pure border border-border-subtle text-xs text-ink">
                <span>Occasion: {activeOccasion}</span>
                <button
                  type="button"
                  onClick={() => setFilterParam("occasion", "all")}
                  className="hover:text-champagne-accessible p-0.5"
                  aria-label="Remove occasion filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {activeStyle !== "all" && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-ivory-pure border border-border-subtle text-xs text-ink">
                <span>Style: {activeStyle}</span>
                <button
                  type="button"
                  onClick={() => setFilterParam("style", "all")}
                  className="hover:text-champagne-accessible p-0.5"
                  aria-label="Remove style filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {activeDelivery === "ready-to-ship" && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-ivory-pure border border-border-subtle text-xs text-ink">
                <span>Ready to Ship</span>
                <button
                  type="button"
                  onClick={() => setFilterParam("delivery", "all")}
                  className="hover:text-champagne-accessible p-0.5"
                  aria-label="Remove delivery filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-ivory-pure border border-border-subtle text-xs text-ink">
                <span>Query: &quot;{searchQuery}&quot;</span>
                <button
                  type="button"
                  onClick={() => setFilterParam("q", "")}
                  className="hover:text-champagne-accessible p-0.5"
                  aria-label="Remove search query"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-champagne-accessible font-medium hover:underline ml-2"
            >
              Clear all ({activeFilterCount})
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================= */}
          {/* Desktop Left Filter Sidebar                               */}
          {/* ========================================================= */}
          <aside className="hidden lg:block lg:col-span-3 bg-ivory-pure border border-border-subtle p-5 sticky top-28">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-4">
              <span className="text-xs uppercase tracking-widest font-semibold text-ink">
                Filter By
              </span>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-[11px] text-champagne-accessible hover:underline"
                >
                  Reset all
                </button>
              )}
            </div>

            <div className="space-y-4 divide-y divide-border-subtle text-xs">
              {/* 1. Price Filter Group */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => toggleSection("price")}
                  className="w-full flex items-center justify-between font-semibold text-ink py-1 text-left"
                >
                  <span>Price</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${openSections.price ? "rotate-180" : ""}`}
                  />
                </button>
                {openSections.price && (
                  <div className="space-y-1.5 pt-2">
                    {PRICE_FILTERS.map((p) => (
                      <label
                        key={p.id}
                        className="flex items-center space-x-2 text-ink-muted hover:text-ink cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="price-filter"
                          checked={activePrice === p.id}
                          onChange={() => setFilterParam("price", p.id)}
                          className="accent-champagne"
                        />
                        <span>{p.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Metal Group */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => toggleSection("metal")}
                  className="w-full flex items-center justify-between font-semibold text-ink py-1 text-left"
                >
                  <span>Metal & Color</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${openSections.metal ? "rotate-180" : ""}`}
                  />
                </button>
                {openSections.metal && (
                  <div className="space-y-1.5 pt-2">
                    {METAL_FILTERS.map((m) => (
                      <label
                        key={m.id}
                        className="flex items-center space-x-2 text-ink-muted hover:text-ink cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="metal-filter"
                          checked={activeMetal === m.id}
                          onChange={() => setFilterParam("metal", m.id)}
                          className="accent-champagne"
                        />
                        <span>{m.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Occasion Group */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => toggleSection("occasion")}
                  className="w-full flex items-center justify-between font-semibold text-ink py-1 text-left"
                >
                  <span>Occasion</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${openSections.occasion ? "rotate-180" : ""}`}
                  />
                </button>
                {openSections.occasion && (
                  <div className="space-y-1.5 pt-2">
                    {OCCASION_FILTERS.map((o) => (
                      <label
                        key={o.id}
                        className="flex items-center space-x-2 text-ink-muted hover:text-ink cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="occasion-filter"
                          checked={activeOccasion === o.id}
                          onChange={() => setFilterParam("occasion", o.id)}
                          className="accent-champagne"
                        />
                        <span>{o.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Style Group */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => toggleSection("style")}
                  className="w-full flex items-center justify-between font-semibold text-ink py-1 text-left"
                >
                  <span>Design Style</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${openSections.style ? "rotate-180" : ""}`}
                  />
                </button>
                {openSections.style && (
                  <div className="space-y-1.5 pt-2">
                    {STYLE_FILTERS.map((s) => (
                      <label
                        key={s.id}
                        className="flex items-center space-x-2 text-ink-muted hover:text-ink cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="style-filter"
                          checked={activeStyle === s.id}
                          onChange={() => setFilterParam("style", s.id)}
                          className="accent-champagne"
                        />
                        <span>{s.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Stone Shape */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => toggleSection("shape")}
                  className="w-full flex items-center justify-between font-semibold text-ink py-1 text-left"
                >
                  <span>Diamond Shape</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${openSections.shape ? "rotate-180" : ""}`}
                  />
                </button>
                {openSections.shape && (
                  <div className="space-y-1.5 pt-2">
                    {SHAPE_FILTERS.map((sh) => (
                      <label
                        key={sh.id}
                        className="flex items-center space-x-2 text-ink-muted hover:text-ink cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="shape-filter"
                          checked={activeShape === sh.id}
                          onChange={() => setFilterParam("shape", sh.id)}
                          className="accent-champagne"
                        />
                        <span>{sh.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 6. Ready to Ship Toggle */}
              <div className="pt-4">
                <label className="flex items-center space-x-2 text-ink font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeDelivery === "ready-to-ship"}
                    onChange={(e) =>
                      setFilterParam("delivery", e.target.checked ? "ready-to-ship" : "all")
                    }
                    className="accent-champagne"
                  />
                  <span>Ready to Ship Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* ========================================================= */}
          {/* Product Grid (4 columns desktop, 2 columns mobile)        */}
          {/* ========================================================= */}
          <main className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-ivory-warm animate-pulse border border-border-subtle"
                  />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product, idx) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={idx < 3}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-ivory-pure border border-border-subtle p-8 space-y-4">
                <p className="font-serif text-2xl text-ink">No designs match your selection</p>
                <p className="text-xs text-ink-muted max-w-md mx-auto leading-relaxed">
                  We could not find any fine jewellery pieces matching your active filter criteria. Try resetting your filters or exploring our complete collection.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="btn-primary inline-flex items-center space-x-2 text-xs px-6 py-2.5 mt-2"
                >
                  <RotateCcw size={14} />
                  <span>View All Jewellery</span>
                </button>
              </div>
            )}

            {/* ========================================================= */}
            {/* 3. BLUESTONE TRUST BANNER WITHIN CATALOGUE                */}
            {/* ========================================================= */}
            <div className="mt-12 p-6 md:p-8 bg-ivory-pure border border-border-subtle grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-2 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-champagne-accessible border border-champagne/40">
                  <ShieldCheck size={20} strokeWidth={1.5} />
                </div>
                <h4 className="font-serif text-sm text-ink">100% IGI Certified</h4>
                <p className="text-[11px] text-ink-muted leading-relaxed">
                  Every diamond laser-inscribed with its unique lab cert.
                </p>
              </div>

              <div className="space-y-2 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-champagne-accessible border border-champagne/40">
                  <RotateCcw size={20} strokeWidth={1.5} />
                </div>
                <h4 className="font-serif text-sm text-ink">7-Day Easy Returns</h4>
                <p className="text-[11px] text-ink-muted leading-relaxed">
                  Complimentary 30-day ring resizing on all bands.
                </p>
              </div>

              <div className="space-y-2 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-champagne-accessible border border-champagne/40">
                  <Award size={20} strokeWidth={1.5} />
                </div>
                <h4 className="font-serif text-sm text-ink">Lifetime Buyback</h4>
                <p className="text-[11px] text-ink-muted leading-relaxed">
                  Transparent metal and stone exchange policies.
                </p>
              </div>

              <div className="space-y-2 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-champagne-accessible border border-champagne/40">
                  <Truck size={20} strokeWidth={1.5} />
                </div>
                <h4 className="font-serif text-sm text-ink">Free Insured Courier</h4>
                <p className="text-[11px] text-ink-muted leading-relaxed">
                  Tamper-evident transit across 19,000+ Indian pincodes.
                </p>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 4. SEO TEXT BLOCK: STYLES OF FINE JEWELLERY               */}
            {/* ========================================================= */}
            <div className="mt-12 p-6 md:p-8 bg-ivory-warm/40 border border-border-subtle space-y-4">
              <h2 className="font-serif text-xl md:text-2xl text-ink">
                Understanding Fine Jewellery Aesthetics & Craftsmanship
              </h2>
              <div className="grid md:grid-cols-2 gap-6 text-xs text-ink-muted leading-relaxed">
                <div>
                  <h3 className="font-medium text-ink mb-1">Classic & Solitaire Silhouettes</h3>
                  <p>
                    Classic jewellery emphasizes purity of form and enduring geometry. Solitaire engagement rings, round brilliant stud earrings, and four-prong graduated tennis necklaces embody this aesthetic. By minimizing extraneous metalwork, the lab-grown diamond captures ambient light with maximum atomic dispersion.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-ink mb-1">Contemporary Minimalist Lines</h3>
                  <p>
                    Modern luxury is designed for daily movement. Featuring low-profile bezel mountings, flush channel-set bands, and geometric bar mangalsutras, contemporary designs seamlessly shift from corporate meetings to evening celebrations without snagging or high maintenance.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-ink mb-1">Awadhi Traditional Royalty</h3>
                  <p>
                    Rooted in Lucknow&apos;s nawabi atelier traditions, our heritage suites combine certified hydrothermal emeralds and brilliant solitaires set in warm 18K champagne gold. Each bridal choker and maang tikka pays homage to northern India&apos;s storied regal heirlooms.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-ink mb-1">Fusion & Sculptural Artistry</h3>
                  <p>
                    Bridging traditional Indian symbolic motifs with Western architectural contours, fusion jewellery pairs 92.5 sterling silver with brilliant lab diamonds, offering accessible, conflict-free conscious indulgence for the modern Indian wardrobe.
                  </p>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 5. POPULAR SEARCHES STRIP (BlueStone SEO Concept)         */}
            {/* ========================================================= */}
            <div className="mt-8 pt-6 border-t border-border-subtle">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-ink-light mb-3">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                {POPULAR_SEARCH_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="px-3 py-1 bg-ivory-pure border border-border-subtle text-ink-muted hover:text-ink hover:border-champagne transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6. MOBILE FILTER BOTTOM SHEET (BlueStone Concept)         */}
      {/* ========================================================= */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-ivory-pure shadow-2xl rounded-t-2xl flex flex-col z-50 animate-slideInUp">
            {/* Header */}
            <div className="p-4 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal size={16} />
                <span className="font-serif text-lg text-ink">Filter Designs</span>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 bg-champagne text-ivory text-[10px] font-bold rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-2 text-ink hover:opacity-75"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs divide-y divide-border-subtle">
              {/* Price Filter */}
              <div className="pt-2">
                <p className="font-semibold text-ink uppercase tracking-wider mb-2">Price Range</p>
                <div className="grid grid-cols-2 gap-2">
                  {PRICE_FILTERS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFilterParam("price", p.id)}
                      className={`p-2 text-left border text-xs ${
                        activePrice === p.id
                          ? "border-champagne bg-ivory-warm font-medium"
                          : "border-border-subtle bg-ivory"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metal Filter */}
              <div className="pt-4">
                <p className="font-semibold text-ink uppercase tracking-wider mb-2">Metal</p>
                <div className="grid grid-cols-2 gap-2">
                  {METAL_FILTERS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setFilterParam("metal", m.id)}
                      className={`p-2 text-left border text-xs ${
                        activeMetal === m.id
                          ? "border-champagne bg-ivory-warm font-medium"
                          : "border-border-subtle bg-ivory"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occasion Filter */}
              <div className="pt-4">
                <p className="font-semibold text-ink uppercase tracking-wider mb-2">Occasion</p>
                <div className="grid grid-cols-2 gap-2">
                  {OCCASION_FILTERS.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setFilterParam("occasion", o.id)}
                      className={`p-2 text-left border text-xs ${
                        activeOccasion === o.id
                          ? "border-champagne bg-ivory-warm font-medium"
                          : "border-border-subtle bg-ivory"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-border-subtle bg-ivory-warm flex items-center space-x-3">
              <button
                type="button"
                onClick={clearAllFilters}
                className="w-1/3 py-2.5 border border-border-subtle text-ink text-xs font-semibold uppercase tracking-wider bg-ivory-pure"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-2/3 py-2.5 bg-ink text-ivory text-xs font-semibold uppercase tracking-wider"
              >
                Apply ({filteredProducts.length} Designs)
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-ivory flex items-center justify-center p-8">
          <p className="font-serif text-lg text-ink animate-pulse">Loading fine jewellery catalogue...</p>
        </div>
      }
    >
      <ShopCatalog />
    </Suspense>
  );
}
