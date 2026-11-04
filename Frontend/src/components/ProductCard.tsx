"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Sparkles, Check, ShoppingBag, Clock } from "lucide-react";
import { Product, formatPriceINR } from "@/lib/data";
import { useAryoraStore } from "@/lib/store";
import { calculateDynamicPrice, getDailyMetalRates } from "@/lib/metalRates";
import { getActiveCustomer, toggleCustomerWishlist } from "@/lib/customerStore";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

const METAL_SWATCH_COLORS: Record<string, { bg: string; label: string }> = {
  "Yellow Gold": { bg: "#D4AF37", label: "Yellow Gold" },
  "Rose Gold": { bg: "#C98A7D", label: "Rose Gold" },
  "White Gold": { bg: "#D9D9D9", label: "White Gold" },
  "925 Sterling Silver": { bg: "#E6E8EA", label: "925 Silver" },
  "Silver": { bg: "#E6E8EA", label: "Silver" },
};

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const [selectedMetal, setSelectedMetal] = useState<string>(product.metal || "925 Sterling Silver");
  const [isHovered, setIsHovered] = useState(false);
  const [dynamicPrice, setDynamicPrice] = useState<number>(product.price);
  const { toggleWishlist, isInWishlist, addToCart } = useAryoraStore();

  const wishlisted = isInWishlist(product.slug);

  // Recalculate dynamic price when daily rates change or mount
  useEffect(() => {
    const rates = getDailyMetalRates();
    const calculated = calculateDynamicPrice(product, rates);
    setDynamicPrice(calculated.finalPrice);

    const handleRatesUpdate = () => {
      const updatedRates = getDailyMetalRates();
      const updatedPrice = calculateDynamicPrice(product, updatedRates);
      setDynamicPrice(updatedPrice.finalPrice);
    };

    window.addEventListener("ayor_metal_rates_updated", handleRatesUpdate);
    return () => window.removeEventListener("ayor_metal_rates_updated", handleRatesUpdate);
  }, [product]);

  const primaryImage = product.images?.[0] || "/products/ring-01-a.svg";
  const hoverImage = product.images?.[1] || primaryImage;

  const isComingSoon = Boolean(product.isComingSoon);

  // Calculate original price if discount exists
  const originalPrice = product.discountPercent > 0
    ? Math.round(dynamicPrice / (1 - product.discountPercent / 100))
    : null;

  return (
    <div
      className="group relative flex flex-col bg-white rounded-2xl border border-[#E5E0D8] hover:border-[#C5A880] hover:shadow-lg transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Image Container with Hover Swap on Miss Jo Cream Backplate */}
      <div className="relative aspect-square w-full bg-[#FAF7F2] overflow-hidden">
        <Link href={`/product/${product.slug}`} className="block w-full h-full relative">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className={`object-cover transition-opacity duration-300 ${
              isHovered && hoverImage !== primaryImage ? "opacity-0" : "opacity-100"
            }`}
          />
          {hoverImage !== primaryImage && (
            <Image
              src={hoverImage}
              alt={`${product.name} alternative perspective`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-opacity duration-300 absolute inset-0 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </Link>

        {/* Top Minimalist Badge (At most 1 quiet luxury pill, no cheap discount tags) */}
        <div className="absolute top-3 left-3 pointer-events-none z-10">
          {isComingSoon ? (
            <span className="bg-[#0E382B]/85 backdrop-blur-md text-[#FAF7F2] text-[9px] uppercase tracking-widest font-medium px-2.5 py-1 rounded-full shadow-2xs flex items-center gap-1 border border-white/20">
              <Clock size={10} />
              <span>Coming Soon</span>
            </span>
          ) : product.isBestseller ? (
            <span className="bg-[#111111]/85 backdrop-blur-md text-[#FAF7F2] text-[9px] uppercase tracking-widest font-medium px-2.5 py-1 rounded-full shadow-2xs border border-white/20">
              Bestseller
            </span>
          ) : product.isNew ? (
            <span className="bg-[#0E382B]/85 backdrop-blur-md text-[#FAF7F2] text-[9px] uppercase tracking-widest font-medium px-2.5 py-1 rounded-full shadow-2xs border border-white/20">
              Ready to Ship
            </span>
          ) : null}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const customer = getActiveCustomer();
            if (!customer) {
              if (typeof window !== "undefined") {
                localStorage.setItem("ayor_pending_wishlist_slug", product.slug);
                window.dispatchEvent(new Event("ayor_replay_welcome"));
              }
              return;
            }
            toggleWishlist(product.slug);
            toggleCustomerWishlist(customer.customerId, product.slug);
          }}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            wishlisted
              ? "bg-[#C09981] text-white shadow-sm"
              : "bg-white/90 text-[#4A4A4A] hover:text-[#111111] hover:bg-white shadow-2xs"
          }`}
        >
          <Heart size={15} fill={wishlisted ? "currentColor" : "none"} strokeWidth={1.5} />
        </button>

        {/* Quick Add To Bag Pill on Hover */}
        <div
          className={`absolute bottom-3 inset-x-3 transition-all duration-200 z-10 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          {isComingSoon ? (
            <Link
              href={`/product/${product.slug}`}
              className="w-full py-2.5 rounded-xl bg-[#0E382B]/90 hover:bg-[#0E382B] text-white text-[10px] uppercase tracking-wider font-medium flex items-center justify-center gap-1.5 backdrop-blur-sm transition-colors shadow-sm"
            >
              <Clock size={13} />
              <span>Coming Soon</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product, 1, product.sizes?.[0] || "One Size", selectedMetal);
              }}
              className="w-full py-2.5 rounded-xl bg-[#0E382B] hover:bg-[#144636] text-white text-[10px] uppercase tracking-wider font-medium flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              <ShoppingBag size={13} />
              <span>Quick Add</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Product Details */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-2.5">
        <div className="space-y-1.5">
          {/* Metal Swatches */}
          <div className="flex items-center space-x-1.5 pb-0.5">
            {["925 Sterling Silver", "Yellow Gold", "Rose Gold"].map((metal) => {
              const meta = METAL_SWATCH_COLORS[metal] || { bg: "#E6E8EA", label: metal };
              const isSelected = selectedMetal === metal;
              return (
                <button
                  key={metal}
                  type="button"
                  onClick={() => setSelectedMetal(metal)}
                  title={meta.label}
                  aria-label={`Select ${meta.label}`}
                  className={`w-3.5 h-3.5 rounded-full transition-transform ${
                    isSelected ? "ring-2 ring-ink ring-offset-1 scale-110" : "opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: meta.bg }}
                />
              );
            })}
            <span className="text-[10px] text-ink-subtle pl-1 font-medium">{product.purity}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-serif text-sm text-[#1A1A1A] leading-snug line-clamp-1 group-hover:text-[#C09981] transition-colors">
            <Link href={`/product/${product.slug}`}>{product.name}</Link>
          </h3>

          {/* Specs Subtitle */}
          <p className="text-[11px] text-[#666666] line-clamp-1">
            {product.weightGrams ? `${product.weightGrams}g ` : ""}
            {product.metal}
            {product.stone && product.stone !== "None" ? ` · ${product.stone}` : ""}
          </p>
        </div>

        {/* Pricing Block */}
        <div className="pt-2 border-t border-[#F0EBE1] flex items-baseline justify-between">
          <span className="font-serif text-sm font-semibold text-[#111111]">
            {formatPriceINR(dynamicPrice)}
          </span>
          <span className="text-[10px] text-[#0E382B] font-medium tracking-wide">
            {isComingSoon ? "Coming Soon" : "925 Pure Silver"}
          </span>
        </div>
      </div>
    </div>
  );
}
