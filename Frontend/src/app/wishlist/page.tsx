"use client";

import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { useAryoraStore } from "@/lib/store";
import { PRODUCTS } from "@/lib/products";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useAryoraStore();

  const savedProducts = PRODUCTS.filter((p) => wishlist.includes(p.slug));

  return (
    <div className="max-w-content mx-auto px-6 md:px-8 py-8 md:py-16">
      <Breadcrumbs items={[{ label: "Wishlist" }]} />

      <div className="max-w-xl my-6 space-y-2">
        <p className="eyebrow">Your Curated Selections</p>
        <h1 className="font-serif text-3xl md:text-5xl text-ink">Saved Heirlooms</h1>
      </div>

      {savedProducts.length === 0 ? (
        <div className="text-center py-24 border border-border-subtle bg-ivory-pure p-8 my-8 space-y-4">
          <div className="w-12 h-12 rounded-full border border-border-subtle flex items-center justify-center mx-auto text-ink-subtle">
            <Heart size={20} strokeWidth={1.5} />
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-6">
          {savedProducts.map((product) => (
            <div
              key={product.id}
              className="group relative flex flex-col justify-between border border-border-subtle bg-ivory-pure hover:border-border-medium transition-colors"
            >
              <div className="relative aspect-square bg-ivory-muted overflow-hidden">
                <Link href={`/product/${product.slug}`} className="block w-full h-full">
                  <Image
                    src={product.images[0]?.url || "/images/hero-emerald.jpg"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover img-zoom"
                  />
                </Link>

                <button
                  onClick={() => toggleWishlist(product.slug)}
                  aria-label="Remove from saved pieces"
                  className="absolute top-3 right-3 p-2 bg-ivory/80 backdrop-blur-sm rounded-full text-[#B93826] hover:scale-110 transition-all shadow-sm"
                >
                  <Trash2 size={15} strokeWidth={1.5} />
                </button>
              </div>

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
                  <p className="text-sm font-medium text-ink mt-2">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="pt-4 mt-2 border-t border-border-subtle">
                  <button
                    onClick={() => addToCart(product, 1)}
                    className="w-full btn-outline text-[11px] py-2.5 flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag size={13} /> Add to Bag
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
