"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Sparkles, Check, ShoppingBag } from "lucide-react";
import { Product, formatPriceINR } from "@/lib/data";
import { useAryoraStore } from "@/lib/store";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

const METAL_SWATCH_COLORS: Record<string, { bg: string; label: string }> = {
  "Yellow Gold": { bg: "#D4AF37", label: "Yellow Gold" },
  "Rose Gold": { bg: "#C98A7D", label: "Rose Gold" },
  "White Gold": { bg: "#D9D9D9", label: "White Gold" },
};

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const [selectedMetal, setSelectedMetal] = useState<string>(product.metal || "Yellow Gold");
  const [isHovered, setIsHovered] = useState(false);
  const { toggleWishlist, isInWishlist, addToCart } = useAryoraStore();

  const wishlisted = isInWishlist(product.slug);

  const primaryImage = product.images?.[0] || "/products/ring-01-a.svg";
  const hoverImage = product.images?.[1] || primaryImage;

  // Calculate original price if discount exists
  const originalPrice = product.discountPercent > 0
    ? Math.round(product.price / (1 - product.discountPercent / 100))
    : null;

  return (
    <div
      className="group relative flex flex-col bg-white border border-[#DDD8D0] hover:border-[#C09981] hover:shadow-md transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Image Container with Hover Swap on Miss Jo Cream Backplate */}
      <div className="relative aspect-square w-full bg-[#F5F0EA]/60 overflow-hidden">
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

        {/* Top Badges (Miss Jo Color Scheme) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start pointer-events-none z-10">
          {product.isBestseller && (
            <span className="bg-[#1A1A1A] text-white text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 shadow-sm">
              Bestseller
            </span>
          )}
          {product.isNew && (
            <span className="bg-[#C09981] text-white text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 shadow-sm">
              New
            </span>
          )}
          {product.discountPercent > 0 && (
            <span className="bg-[#A32D2D] text-white text-[9px] font-semibold px-2 py-0.5 shadow-sm">
              {product.discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.slug);
          }}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-sm transition-all z-10 ${
            wishlisted
              ? "bg-[#C09981] text-white shadow-sm"
              : "bg-white/90 text-[#4A4A4A] hover:text-[#1A1A1A] hover:bg-white shadow-sm"
          }`}
        >
          <Heart size={15} fill={wishlisted ? "currentColor" : "none"} strokeWidth={1.5} />
        </button>

        {/* Quick Add To Bag Pill on Hover */}
        <div
          className={`absolute bottom-2 inset-x-2 transition-all duration-200 z-10 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product, 1, product.sizes?.[0] || "One Size", selectedMetal);
            }}
            className="w-full py-2 bg-[#1A1A1A]/95 hover:bg-[#1A1A1A] text-white text-[10px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 backdrop-blur-sm transition-colors shadow-sm"
          >
            <ShoppingBag size={13} />
            <span>Add to Bag</span>
          </button>
        </div>
      </div>

      {/* 2. Product Details */}
      <div className="p-3.5 flex flex-col flex-1 justify-between space-y-2">
        <div className="space-y-1">
          {/* Metal Swatches */}
          <div className="flex items-center space-x-1.5 pb-0.5">
            {["Yellow Gold", "Rose Gold", "White Gold"].map((metal) => {
              const meta = METAL_SWATCH_COLORS[metal] || { bg: "#D4AF37", label: metal };
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
          <p className="text-[11px] text-[#4A4A4A] line-clamp-1">
            {product.carat ? `${product.carat}ct ${product.shape} ` : ""}{product.stone}
          </p>
        </div>

        {/* Pricing Block */}
        <div className="pt-1 border-t border-[#DDD8D0]/80 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-sm font-semibold text-[#1A1A1A]">
              {formatPriceINR(product.price)}
            </span>
            {originalPrice && (
              <span className="text-xs text-[#9A9A9A] line-through">
                {formatPriceINR(originalPrice)}
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#108474] font-medium">
            {product.certificate?.includes("IGI") ? "100% IGI" : "925 Silver"}
          </span>
        </div>
      </div>
    </div>
  );
}
