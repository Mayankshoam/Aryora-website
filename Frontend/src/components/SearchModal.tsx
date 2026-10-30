"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ArrowRight } from "lucide-react";
import { useAryoraStore } from "@/lib/store";
import { PRODUCTS, ProductItem } from "@/lib/products";

const POPULAR_SEARCHES = ["Solitaire Ring", "Emerald Necklace", "Pear Drop Earrings", "Tennis Necklace", "Bridal"];

export default function SearchModal() {
  const { isSearchOpen, closeSearch } = useAryoraStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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

  const results: ProductItem[] = query.trim()
    ? PRODUCTS.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.collection.toLowerCase().includes(q) ||
          p.specs.metal.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q)
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
        className="fixed inset-0 bg-ink/60 backdrop-blur-md transition-opacity"
        onClick={closeSearch}
      />

      {/* Modal Surface */}
      <div className="relative w-full bg-ivory text-ink shadow-2xl z-10 border-b border-border-subtle animate-slideDown max-h-[85vh] flex flex-col">
        <div className="max-w-4xl mx-auto w-full px-6 py-6 md:py-8 flex flex-col flex-1 overflow-hidden">
          {/* Top Search Input */}
          <div className="flex items-center gap-4 border-b border-ink/20 pb-4">
            <Search size={22} className="text-ink-subtle flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by gemstone, ring style, category, or collection..."
              className="w-full text-base md:text-xl font-serif bg-transparent focus:outline-none placeholder:text-ink-faint text-ink"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-xs text-ink-subtle hover:text-ink px-2 py-1"
              >
                Clear
              </button>
            )}
            <button
              onClick={closeSearch}
              className="p-2 -mr-2 text-ink hover:opacity-75 transition-opacity"
              aria-label="Close search overlay"
            >
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>

          {/* Quick Suggestions / Results */}
          <div className="flex-1 overflow-y-auto py-6">
            {!query ? (
              <div className="space-y-6">
                <div>
                  <p className="eyebrow mb-3">Popular Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-3.5 py-1.5 text-xs border border-border-subtle bg-ivory-pure hover:border-ink transition-colors text-ink-muted hover:text-ink"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="eyebrow mb-3">Curated Highlights</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {PRODUCTS.slice(0, 4).map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.slug}`}
                        onClick={closeSearch}
                        className="group block"
                      >
                        <div className="relative aspect-square bg-ivory-muted overflow-hidden border border-border-subtle mb-2">
                          <Image
                            src={p.images[0]?.url || "/images/hero-emerald.jpg"}
                            alt={p.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="180px"
                          />
                        </div>
                        <p className="font-serif text-xs text-ink truncate group-hover:text-champagne-accessible">
                          {p.name}
                        </p>
                        <p className="text-xs text-ink-subtle">
                          ₹{p.price.toLocaleString("en-IN")}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : results.length > 0 ? (
              <div>
                <p className="eyebrow mb-4">
                  {results.length} {results.length === 1 ? "Piece Found" : "Pieces Found"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {results.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug}`}
                      onClick={closeSearch}
                      className="group flex gap-3 p-2 hover:bg-ivory-muted transition-colors border border-transparent hover:border-border-subtle"
                    >
                      <div className="relative w-16 h-20 bg-ivory-muted flex-shrink-0 overflow-hidden">
                        <Image
                          src={p.images[0]?.url || "/images/hero-emerald.jpg"}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <p className="font-serif text-sm text-ink group-hover:text-champagne-accessible">
                          {p.name}
                        </p>
                        <p className="text-xs text-ink-subtle">{p.specs.metal}</p>
                        <p className="text-xs font-medium text-ink mt-1">
                          ₹{p.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <p className="font-serif text-lg text-ink">
                  No heirlooms matched &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-ink-muted">
                  Try checking for spelling, searching for generic categories like &ldquo;Ring&rdquo; or &ldquo;Necklace&rdquo;, or design a custom piece.
                </p>
                <Link
                  href="/customize"
                  onClick={closeSearch}
                  className="btn-outline text-xs inline-block mt-2"
                >
                  Design Your Own
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
