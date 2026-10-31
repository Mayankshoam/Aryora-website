"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ArrowRight, Gem } from "lucide-react";
import { useAryoraStore } from "@/lib/store";
import { getAllProducts, Product, formatPriceINR } from "@/lib/data";

const TRENDING_SEARCHES = [
  "Solitaire Rings",
  "Tennis Bracelets",
  "18kt Yellow Gold",
  "Bridal Chokers",
  "Diamond Studs",
  "Mangalsutras",
];

export default function SearchModal() {
  const { isSearchOpen, closeSearch } = useAryoraStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const products = getAllProducts();

  // Auto focus input when opened
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      setQuery("");
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSearchOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchOpen) closeSearch();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, closeSearch]);

  if (!isSearchOpen) return null;

  const results: Product[] = query.trim()
    ? products.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q) ||
          p.metal.toLowerCase().includes(q) ||
          p.shape.toLowerCase().includes(q) ||
          p.style.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
        );
      })
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-start"
      role="dialog"
      aria-modal="true"
      aria-label="Search Aryora Collection"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity"
        onClick={closeSearch}
      />

      {/* Search container */}
      <div className="relative w-full bg-ivory-pure border-b border-border-subtle shadow-2xl z-10 animate-slideDown">
        <div className="max-w-content mx-auto px-6 md:px-8 py-6 space-y-6">
          {/* Search Input Bar */}
          <div className="flex items-center gap-4 border-b border-ink/40 pb-3">
            <Search size={22} className="text-champagne-accessible flex-shrink-0" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for solitaires, tennis bracelets, earrings, or 18K gold..."
              className="w-full bg-transparent text-base md:text-xl text-ink placeholder:text-ink-subtle focus:outline-none font-serif"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear query"
                className="text-ink-subtle hover:text-ink p-1"
              >
                <X size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={closeSearch}
              aria-label="Close search"
              className="p-1.5 text-ink hover:text-champagne-accessible"
            >
              <X size={22} />
            </button>
          </div>

          {/* Trending Searches Pills */}
          {!query && (
            <div className="space-y-2.5">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-ink-muted">
                Trending Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setQuery(item)}
                    className="px-3.5 py-1.5 bg-ivory-warm border border-border-subtle text-xs text-ink hover:border-ink transition-colors rounded-full"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results Display */}
          {query.trim() && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="flex justify-between items-center text-xs text-ink-muted">
                <span>
                  Found <strong>{results.length}</strong> creations matching &ldquo;{query}&rdquo;
                </span>
                {results.length > 0 && (
                  <Link
                    href={`/shop?search=${encodeURIComponent(query)}`}
                    onClick={closeSearch}
                    className="text-champagne-accessible font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>View all in shop</span>
                    <ArrowRight size={13} />
                  </Link>
                )}
              </div>

              {results.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <p className="font-serif text-lg text-ink">No creations found</p>
                  <p className="text-xs text-ink-muted">
                    Try searching by metal (e.g. Yellow Gold), category (e.g. Rings), or shape (e.g. Oval).
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-4">
                  {results.slice(0, 8).map((product) => {
                    const img = product.images?.[0] || "/products/ring-01-a.svg";
                    return (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={closeSearch}
                        className="group bg-ivory p-3 border border-border-subtle hover:border-champagne/60 transition-all flex flex-col justify-between"
                      >
                        <div className="relative aspect-square w-full bg-ivory-pure overflow-hidden mb-2">
                          <Image
                            src={img}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="font-serif text-xs text-ink font-medium line-clamp-1 group-hover:text-champagne-accessible transition-colors">
                            {product.name}
                          </p>
                          <p className="text-[11px] text-ink-muted">
                            {product.metal} · {product.purity}
                          </p>
                          <p className="text-xs font-semibold text-ink pt-0.5">
                            {formatPriceINR(product.price)}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
