"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Heart, ChevronDown, Check, ArrowRight } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PRODUCTS, ProductItem, METAL_NAMES } from "@/lib/products";
import { useAryoraStore } from "@/lib/store";

const CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "rings", label: "Rings" },
  { id: "earrings", label: "Earrings" },
  { id: "pendants", label: "Pendants" },
  { id: "necklaces", label: "Necklaces" },
  { id: "bridal", label: "Bridal Suite" },
];

const METALS = [
  { id: "all", label: "All Metals" },
  { id: "YELLOW_GOLD", label: "18K Yellow Gold" },
  { id: "WHITE_GOLD", label: "18K White Gold" },
  { id: "ROSE_GOLD", label: "18K Rose Gold" },
  { id: "CHAMPAGNE_GOLD", label: "18K Champagne Gold" },
  { id: "SILVER_925", label: "92.5 Sterling Silver" },
];

const PRICE_RANGES = [
  { id: "all", label: "All Prices", min: 0, max: Infinity },
  { id: "under-50k", label: "Under ₹50,000", min: 0, max: 50000 },
  { id: "50k-100k", label: "₹50,000 – ₹1,00,000", min: 50000, max: 100000 },
  { id: "above-100k", label: "Above ₹1,00,000", min: 100000, max: Infinity },
];

const OCCASIONS = [
  { id: "all", label: "All Occasions" },
  { id: "Everyday Luxury", label: "Everyday Luxury" },
  { id: "Engagement", label: "Engagement" },
  { id: "Bridal", label: "Bridal & Wedding" },
  { id: "Anniversary", label: "Anniversary" },
];

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { toggleWishlist, isInWishlist } = useAryoraStore();

  // URL query params
  const activeCategory = searchParams.get("category") || "all";
  const activeMetal = searchParams.get("metal") || "all";
  const activePrice = searchParams.get("price") || "all";
  const activeOccasion = searchParams.get("occasion") || "all";
  const activeSort = searchParams.get("sort") || "featured";

  const updateParam = (key: string, value: string) => {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/shop?${params.toString()}`, { scroll: false });
    setTimeout(() => setLoading(false), 150);
  };

  const clearAllFilters = () => {
    router.push("/shop", { scroll: false });
  };

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((item) => {
      // Category
      if (activeCategory !== "all" && item.category !== activeCategory) {
        return false;
      }
      // Metal
      if (activeMetal !== "all" && item.metalType !== activeMetal) {
        return false;
      }
      // Price
      if (activePrice !== "all") {
        const range = PRICE_RANGES.find((r) => r.id === activePrice);
        if (range && (item.price < range.min || item.price > range.max)) {
          return false;
        }
      }
      // Occasion
      if (
        activeOccasion !== "all" &&
        !item.occasions.some((o) => o.toLowerCase() === activeOccasion.toLowerCase())
      ) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (activeSort === "price-asc") return a.price - b.price;
      if (activeSort === "price-desc") return b.price - a.price;
      return 0; // default order
    });
  }, [activeCategory, activeMetal, activePrice, activeOccasion, activeSort]);

  const hasActiveFilters =
    activeCategory !== "all" ||
    activeMetal !== "all" ||
    activePrice !== "all" ||
    activeOccasion !== "all";

  return (
    <div className="max-w-content mx-auto px-6 md:px-8 py-8 md:py-12">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: "Shop", href: "/shop" }]} />

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pt-4 pb-8 border-b border-border-subtle gap-6">
        <div>
          <p className="eyebrow">The Atelier Collection</p>
          <h1 className="font-serif text-3xl md:text-5xl text-ink mt-1">
            Fine Jewellery
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-2 max-w-xl">
            Ethically grown diamonds, 18K recycled gold, and hallmarked 92.5 silver hewn with ancestral Awadhi finesse.
          </p>
        </div>

        {/* Controls: Filter Button (Mobile) + Sort Dropdown */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2.5 border border-border-subtle text-xs uppercase tracking-wider font-medium text-ink bg-ivory-pure"
            aria-label="Open filter sidebar"
          >
            <SlidersHorizontal size={15} />
            Filters {hasActiveFilters && "•"}
          </button>

          <div className="relative">
            <label htmlFor="sort-dropdown" className="sr-only">
              Sort products
            </label>
            <select
              id="sort-dropdown"
              value={activeSort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="appearance-none bg-ivory-pure border border-border-subtle px-4 py-2.5 pr-8 text-xs uppercase tracking-wider text-ink font-medium focus:outline-none focus:border-ink cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-ink-subtle"
            />
          </div>
        </div>
      </div>

      {/* Main Layout: Desktop Sidebar + Product Grid */}
      <div className="grid md:grid-cols-12 gap-8 lg:gap-12 pt-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block md:col-span-3 space-y-8 pr-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <span className="text-xs uppercase tracking-widest font-medium text-ink">
              Filters
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-champagne-accessible hover:underline"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <h2 className="text-xs uppercase tracking-wider font-medium text-ink">Category</h2>
            <div className="space-y-2 text-xs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateParam("category", cat.id)}
                  className={`w-full text-left py-1 flex items-center justify-between transition-colors ${
                    activeCategory === cat.id
                      ? "text-ink font-semibold"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <span>{cat.label}</span>
                  {activeCategory === cat.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-champagne" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Metal Filter */}
          <div className="space-y-3 pt-4 border-t border-border-subtle">
            <h2 className="text-xs uppercase tracking-wider font-medium text-ink">Metal & Purity</h2>
            <div className="space-y-2 text-xs">
              {METALS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => updateParam("metal", m.id)}
                  className={`w-full text-left py-1 flex items-center justify-between transition-colors ${
                    activeMetal === m.id
                      ? "text-ink font-semibold"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <span>{m.label}</span>
                  {activeMetal === m.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-champagne" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3 pt-4 border-t border-border-subtle">
            <h2 className="text-xs uppercase tracking-wider font-medium text-ink">Price Range</h2>
            <div className="space-y-2 text-xs">
              {PRICE_RANGES.map((pr) => (
                <button
                  key={pr.id}
                  onClick={() => updateParam("price", pr.id)}
                  className={`w-full text-left py-1 flex items-center justify-between transition-colors ${
                    activePrice === pr.id
                      ? "text-ink font-semibold"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <span>{pr.label}</span>
                  {activePrice === pr.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-champagne" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Occasion Filter */}
          <div className="space-y-3 pt-4 border-t border-border-subtle">
            <h2 className="text-xs uppercase tracking-wider font-medium text-ink">Occasion</h2>
            <div className="space-y-2 text-xs">
              {OCCASIONS.map((occ) => (
                <button
                  key={occ.id}
                  onClick={() => updateParam("occasion", occ.id)}
                  className={`w-full text-left py-1 flex items-center justify-between transition-colors ${
                    activeOccasion === occ.id
                      ? "text-ink font-semibold"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <span>{occ.label}</span>
                  {activeOccasion === occ.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-champagne" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <section className="md:col-span-9" aria-label="Products">
          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
              <span className="text-ink-subtle">Active filters:</span>
              {activeCategory !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-ivory-pure border border-border-subtle text-ink">
                  {CATEGORIES.find((c) => c.id === activeCategory)?.label}
                  <button onClick={() => updateParam("category", "all")}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {activeMetal !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-ivory-pure border border-border-subtle text-ink">
                  {METALS.find((m) => m.id === activeMetal)?.label}
                  <button onClick={() => updateParam("metal", "all")}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {activePrice !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-ivory-pure border border-border-subtle text-ink">
                  {PRICE_RANGES.find((p) => p.id === activePrice)?.label}
                  <button onClick={() => updateParam("price", "all")}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {activeOccasion !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-ivory-pure border border-border-subtle text-ink">
                  {OCCASIONS.find((o) => o.id === activeOccasion)?.label}
                  <button onClick={() => updateParam("occasion", "all")}>
                    <X size={12} />
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs text-champagne-accessible hover:underline ml-2"
              >
                Reset All
              </button>
            </div>
          )}

          {/* Skeleton Loaders */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="animate-pulse space-y-3">
                  <div className="aspect-square bg-ivory-muted" />
                  <div className="h-4 bg-ivory-muted w-3/4" />
                  <div className="h-3 bg-ivory-muted w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            /* Friendly Empty State */
            <div className="text-center py-20 px-6 border border-border-subtle bg-ivory-pure space-y-4">
              <p className="font-serif text-2xl text-ink">No heirlooms match these selections</p>
              <p className="text-xs text-ink-muted max-w-md mx-auto leading-relaxed">
                Try widening your price range, choosing a different metal, or request a bespoke custom design crafted to your exact specifications.
              </p>
              <div className="flex justify-center gap-4 pt-2">
                <button onClick={clearAllFilters} className="btn-outline text-xs">
                  Clear All Filters
                </button>
                <Link href="/customize" className="btn-primary text-xs">
                  Design Your Own
                </Link>
              </div>
            </div>
          ) : (
            /* Product Cards with Hover Secondary Image */
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredProducts.map((product) => {
                const inWish = isInWishlist(product.slug);
                return (
                  <div
                    key={product.id}
                    className="group relative flex flex-col justify-between border border-border-subtle bg-ivory-pure hover:border-border-medium transition-colors"
                  >
                    {/* Image Tile with Hover Flip */}
                    <div className="relative aspect-square overflow-hidden bg-ivory-muted">
                      <Link href={`/product/${product.slug}`} className="block w-full h-full">
                        <Image
                          src={product.images[0]?.url || "/images/hero-emerald.jpg"}
                          alt={product.images[0]?.altText || product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover img-zoom transition-opacity duration-500 group-hover:opacity-0"
                        />
                        {product.images[1] && (
                          <Image
                            src={product.images[1].url}
                            alt={product.images[1].altText || product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className="object-cover img-zoom absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                          />
                        )}
                      </Link>

                      {/* Wishlist Button */}
                      <button
                        onClick={() => toggleWishlist(product.slug)}
                        aria-label={inWish ? "Remove from wishlist" : "Save to wishlist"}
                        className="absolute top-3 right-3 p-2 bg-ivory/80 backdrop-blur-sm rounded-full text-ink hover:text-champagne-accessible transition-all"
                      >
                        <Heart
                          size={16}
                          strokeWidth={1.5}
                          className={inWish ? "fill-champagne text-champagne" : ""}
                        />
                      </button>

                      {product.specs.diamondCarat && (
                        <span className="absolute bottom-3 left-3 bg-ivory/90 backdrop-blur-sm px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink font-medium">
                          {product.specs.diamondCarat}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-4 flex flex-col flex-1 justify-between">
                      <div>
                        <p className="text-[11px] text-ink-subtle uppercase tracking-wider">
                          {product.specs.metal}
                        </p>
                        <Link
                          href={`/product/${product.slug}`}
                          className="block font-serif text-base text-ink group-hover:text-champagne-accessible transition-colors leading-snug mt-1"
                        >
                          {product.name}
                        </Link>
                      </div>

                      <div className="pt-3 flex items-baseline justify-between border-t border-border-subtle/50 mt-3">
                        <span className="text-sm font-medium text-ink">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-ink-subtle line-through">
                            ₹{product.originalPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Mobile Filter Bottom Sheet / Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-full max-w-md ml-auto bg-ivory h-full shadow-2xl flex flex-col z-10 animate-slideLeft overflow-y-auto">
            <div className="p-5 border-b border-border-subtle flex items-center justify-between">
              <h2 className="font-serif text-xl text-ink">Filters</h2>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-2 text-ink hover:opacity-75"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* Category */}
              <div>
                <h3 className="text-xs uppercase tracking-wider font-medium text-ink mb-3">
                  Category
                </h3>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateParam("category", cat.id)}
                      className={`px-3 py-1.5 text-xs border ${
                        activeCategory === cat.id
                          ? "bg-ink text-ivory border-ink"
                          : "border-border-subtle text-ink-muted"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metal */}
              <div>
                <h3 className="text-xs uppercase tracking-wider font-medium text-ink mb-3">
                  Metal & Purity
                </h3>
                <div className="flex flex-wrap gap-2">
                  {METALS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => updateParam("metal", m.id)}
                      className={`px-3 py-1.5 text-xs border ${
                        activeMetal === m.id
                          ? "bg-ink text-ivory border-ink"
                          : "border-border-subtle text-ink-muted"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-xs uppercase tracking-wider font-medium text-ink mb-3">
                  Price Range
                </h3>
                <div className="flex flex-wrap gap-2">
                  {PRICE_RANGES.map((pr) => (
                    <button
                      key={pr.id}
                      onClick={() => updateParam("price", pr.id)}
                      className={`px-3 py-1.5 text-xs border ${
                        activePrice === pr.id
                          ? "bg-ink text-ivory border-ink"
                          : "border-border-subtle text-ink-muted"
                      }`}
                    >
                      {pr.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-border-subtle bg-ivory-pure flex gap-3">
              <button
                onClick={() => {
                  clearAllFilters();
                  setMobileFilterOpen(false);
                }}
                className="btn-outline flex-1 text-xs text-center"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="btn-primary flex-1 text-xs text-center"
              >
                View Results ({filteredProducts.length})
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
    <Suspense fallback={<div className="max-w-content mx-auto px-6 py-24 text-sm text-ink-muted">Loading collection...</div>}>
      <ShopContent />
    </Suspense>
  );
}
