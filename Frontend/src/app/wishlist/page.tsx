"use client";

import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import { Heart } from "lucide-react";
import { useAryoraStore } from "@/lib/store";
import { getAllProducts } from "@/lib/data";

export default function WishlistPage() {
  const { wishlist } = useAryoraStore();
  const allProducts = getAllProducts();
  const savedProducts = allProducts.filter((p) => wishlist.includes(p.slug));

  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-6 md:py-12 space-y-6">
      <Breadcrumbs items={[{ label: "Wishlist" }]} />

      <div className="max-w-xl my-4 space-y-2">
        <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-champagne">
          Your Curated Selections
        </p>
        <h1 className="font-serif text-3xl md:text-5xl text-ink font-light">Saved Heirlooms</h1>
        <p className="text-xs text-ink-muted">
          Creations you&apos;ve favorited while exploring our fine lab diamond catalogue.
        </p>
      </div>

      {savedProducts.length === 0 ? (
        <div className="text-center py-20 border border-border-subtle bg-ivory-pure p-8 my-8 space-y-4">
          <div className="w-14 h-14 rounded-full border border-border-subtle flex items-center justify-center mx-auto text-ink-subtle">
            <Heart size={22} strokeWidth={1.5} />
          </div>
          <p className="font-serif text-2xl text-ink">You haven&apos;t saved any pieces yet</p>
          <p className="text-xs text-ink-muted max-w-sm mx-auto leading-relaxed">
            Tap the heart icon on any solitaire ring, necklace, or earring to save it to your personal lookbook.
          </p>
          <div className="pt-2">
            <Link href="/shop" className="btn-primary text-xs">
              Explore The Collection
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 pt-4">
          {savedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
