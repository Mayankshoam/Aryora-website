"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Sparkles, Truck, Check } from "lucide-react";
import { ProductItem, MetalType, METAL_NAMES, formatPriceINR } from "@/lib/products";
import { useAryoraStore } from "@/lib/store";

interface ProductCardProps {
  product: ProductItem;
  priority?: boolean;
}

const METAL_SWATCH_COLORS: Record<MetalType, { bg: string; label: string }> = {
  YELLOW_GOLD: { bg: "#D4AF37", label: "Yellow Gold" },
  ROSE_GOLD: { bg: "#C98A7D", label: "Rose Gold" },
  WHITE_GOLD: { bg: "#D9D9D9", label: "White Gold" },
  CHAMPAGNE_GOLD: { bg: "#C5A059", label: "Champagne Gold" },
  SILVER_925: { bg: "#B0B0B0", label: "92.5 Silver" },
};

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const [selectedMetal, setSelectedMetal] = useState<MetalType>(product.metalType);
  const [isHovered, setIsHovered] = useState(false);
  const { toggleWishlist, isInWishlist } = useAryoraStore();

  const wishlisted = isInWishlist(product.slug);

  const primaryImage = product.images[0] || {
    url: "/images/products/emerald-solitaire-1.jpg",
    altText: product.name,
  };
  const hoverImage = product.images[1] || primaryImage;

  return (
    <div
      className="group relative flex flex-col bg-ivory-pure border border-border-subtle hover:border-champagne/60 hover:shadow-md transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ========================================================= */}
      {/* Image Container with Soft Neutral Background & Hover Swap */}
      {/* ========================================================= */}
      <div className="relative aspect-square w-full bg-ivory overflow-hidden">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          {/* Primary image */}
          <Image
            src={primaryImage.url}
            alt={primaryImage.altText || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className={`object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
              isHovered && hoverImage !== primaryImage ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* Hover swap image */}
          {hoverImage !== primaryImage && (
            <Image
              src={hoverImage.url}
              alt={hoverImage.altText || `${product.name} alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-all duration-500 ease-out group-hover:scale-105 ${
                isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            />
          )}
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10 pointer-events-none">
          {product.offerBadge && (
            <span className="px-2 py-0.5 bg-ink text-ivory text-[9px] uppercase tracking-wider font-medium shadow-sm">
              {product.offerBadge}
            </span>
          )}
          {product.readyToShip && !product.offerBadge?.includes("Ready") && (
            <span className="px-2 py-0.5 bg-ivory-pure/95 border border-border-subtle text-ink text-[9px] uppercase tracking-wider font-medium flex items-center space-x-1 shadow-sm backdrop-blur-sm">
              <Truck size={10} className="text-champagne-accessible" />
              <span>Ready to Ship</span>
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.slug);
          }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-ivory-pure/90 backdrop-blur-sm border border-border-subtle flex items-center justify-center text-ink hover:text-champagne-accessible hover:scale-110 active:scale-95 transition-all z-10 shadow-sm"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={15}
            strokeWidth={1.75}
            className={wishlisted ? "fill-champagne text-champagne" : "text-ink"}
          />
        </button>

        {/* Quick View Strip on Desktop Hover */}
        <div className="hidden md:block absolute bottom-0 inset-x-0 bg-ivory-pure/90 backdrop-blur-sm border-t border-border-subtle py-1.5 text-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Link
            href={`/product/${product.slug}`}
            className="text-[10px] uppercase tracking-widest font-semibold text-ink hover:text-champagne-accessible transition-colors"
          >
            Quick View & Specs →
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* Product Information                                       */}
      {/* ========================================================= */}
      <div className="p-3.5 flex flex-col flex-1 justify-between space-y-2">
        <div>
          {/* Metal Swatches (BlueStone interactive feature) */}
          {product.availableMetals && product.availableMetals.length > 1 && (
            <div className="flex items-center space-x-1.5 mb-1.5">
              {product.availableMetals.map((m) => {
                const swatch = METAL_SWATCH_COLORS[m];
                const isSelected = selectedMetal === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMetal(m)}
                    className={`w-3.5 h-3.5 rounded-full border transition-all ${
                      isSelected
                        ? "ring-1 ring-ink ring-offset-1 scale-110"
                        : "opacity-75 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: swatch.bg }}
                    title={swatch.label}
                    aria-label={`Select ${swatch.label}`}
                  />
                );
              })}
              <span className="text-[10px] text-ink-light ml-1">
                {METAL_SWATCH_COLORS[selectedMetal]?.label || ""}
              </span>
            </div>
          )}

          {/* Product Name */}
          <Link href={`/product/${product.slug}`} className="block group-hover:text-champagne-accessible transition-colors">
            <h3 className="font-serif text-sm md:text-base text-ink line-clamp-1 font-normal">
              {product.name}
            </h3>
          </Link>

          {/* Metal, Purity and Weight Line */}
          <p className="text-[11px] text-ink-muted mt-0.5 line-clamp-1">
            {product.purity} Gold · {product.specs.grossWeight || "3.2 g"}
            {product.specs.diamondCarat ? ` · ${product.specs.diamondCarat}` : ""}
          </p>
        </div>

        <div>
          {/* Price & Savings */}
          <div className="flex items-baseline space-x-2 pt-1 border-t border-border-subtle/60">
            <span className="font-medium text-xs md:text-sm text-ink">
              {formatPriceINR(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[11px] text-ink-light line-through">
                {formatPriceINR(product.originalPrice)}
              </span>
            )}
          </div>

          {/* View Similar Link */}
          <div className="flex items-center justify-between pt-2">
            <Link
              href={`/shop?category=${product.category}`}
              className="text-[10px] text-ink-light hover:text-champagne-accessible transition-colors underline underline-offset-2"
            >
              View similar
            </Link>

            <span className="text-[10px] text-champagne-accessible font-medium">
              IGI Certified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
