"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Sparkles,
  CheckCircle2,
  Clock,
  UserCheck,
} from "lucide-react";
import { useAryoraStore } from "@/lib/store";
import { getAllProducts, formatPriceINR, Product } from "@/lib/data";
import {
  getActiveCustomer,
  getCustomerWishlist,
  toggleCustomerWishlist,
  loginWithMobile,
  isValidIndianMobile,
  CustomerProfile,
} from "@/lib/customerStore";
import { calculateDynamicPrice, getDailyMetalRates } from "@/lib/metalRates";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useAryoraStore();
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [mobileInput, setMobileInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const allProducts = getAllProducts();

  // Load customer state & sync customer wishlist on mount
  useEffect(() => {
    const syncCustomer = () => {
      const active = getActiveCustomer();
      setCustomer(active);

      if (active) {
        const remoteWishlist = getCustomerWishlist(active.customerId);
        // Merge customer database wishlist with local store without duplicates
        remoteWishlist.forEach((slug) => {
          if (!useAryoraStore.getState().wishlist.includes(slug)) {
            useAryoraStore.getState().toggleWishlist(slug);
          }
        });
      }
    };

    syncCustomer();
    window.addEventListener("ayor_customer_changed", syncCustomer);
    window.addEventListener("ayor_wishlist_changed", syncCustomer);
    return () => {
      window.removeEventListener("ayor_customer_changed", syncCustomer);
      window.removeEventListener("ayor_wishlist_changed", syncCustomer);
    };
  }, []);

  // Unique list of saved products (prevent duplicates)
  const uniqueWishlistSlugs = useMemo(() => {
    return Array.from(new Set(wishlist));
  }, [wishlist]);

  const savedProducts = useMemo(() => {
    return uniqueWishlistSlugs
      .map((slug) => allProducts.find((p) => p.slug === slug))
      .filter((p): p is Product => Boolean(p));
  }, [uniqueWishlistSlugs, allProducts]);

  // Handle Quick Mobile Login without OTP on Wishlist page
  const handleInlineLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const clean = mobileInput.replace(/\D/g, "");
    if (!isValidIndianMobile(clean)) {
      setLoginError("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      const res = loginWithMobile(clean);
      setCustomer(res.customer);
      setJustLoggedIn(true);

      // Persist all current wishlist items to customer database record
      uniqueWishlistSlugs.forEach((slug) => {
        const existing = getCustomerWishlist(res.customer.customerId);
        if (!existing.includes(slug)) {
          toggleCustomerWishlist(res.customer.customerId, slug);
        }
      });
    } catch (err: any) {
      setLoginError(err.message || "Failed to login.");
    }
  };

  // Move single item to Cart & remove from Wishlist
  const handleMoveToCart = (product: Product) => {
    const metal = product.metal || "925 Sterling Silver";
    const size = product.sizes?.[0] || "One Size";
    addToCart(product, 1, size, metal);

    toggleWishlist(product.slug);
    if (customer) {
      toggleCustomerWishlist(customer.customerId, product.slug);
    }
  };

  // Move all in-stock items to bag
  const handleMoveAllToBag = () => {
    savedProducts.forEach((p) => {
      if (!p.isComingSoon) {
        addToCart(p, 1, p.sizes?.[0] || "One Size", p.metal || "925 Sterling Silver");
        toggleWishlist(p.slug);
        if (customer) {
          toggleCustomerWishlist(customer.customerId, p.slug);
        }
      }
    });
  };

  // Remove single item from Wishlist
  const handleRemove = (slug: string) => {
    toggleWishlist(slug);
    if (customer) {
      toggleCustomerWishlist(customer.customerId, slug);
    }
  };

  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-6 md:py-12 space-y-6">
      <Breadcrumbs items={[{ label: "My Wishlist" }]} />

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#DDD8D0] pb-6">
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[#C5A880]">
            Your Curated Selections
          </p>
          <h1 className="font-serif text-3xl md:text-5xl text-[#111111] font-light">
            My Wishlist &amp; Saved Jewellery
          </h1>
          <p className="text-xs text-[#666666]">
            Every masterpiece saved to your personal lookbook, synced across all your sessions.
          </p>
        </div>

        {/* Customer Badge / Sync Status */}
        {customer ? (
          <div className="flex items-center gap-2 bg-[#EAF3DE] border border-[#C5DDA8] px-3.5 py-2 rounded-xl text-xs text-[#0E382B]">
            <UserCheck size={16} />
            <div>
              <p className="font-bold">Customer ID: {customer.customerId}</p>
              <p className="text-[11px] text-[#2D5A47]">
                Synced with +91 {customer.mobile} · {savedProducts.length} items saved
              </p>
            </div>
          </div>
        ) : (
          <div className="text-right">
            <span className="text-[11px] text-[#888888] italic">
              Browsing as Guest · Log in below to sync across all devices
            </span>
          </div>
        )}
      </div>

      {/* GUEST BANNER: Clean minimalist sync panel */}
      {!customer && (
        <div className="bg-[#FAF7F2] border border-[#E5E0D8] p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-serif text-base md:text-lg text-[#111111] font-medium">
              Save your curated pieces across all devices
            </h3>
            <p className="text-xs text-[#666666]">
              Enter your mobile number to securely sync your wishlist with your customer account.
            </p>
          </div>

          <form onSubmit={handleInlineLogin} className="w-full md:w-auto flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-[#E5E0D8] px-3 py-2 rounded-xl text-xs">
              <span className="font-medium text-[#111111]">🇮🇳 +91</span>
              <input
                type="tel"
                maxLength={10}
                placeholder="10-digit mobile"
                value={mobileInput}
                onChange={(e) => {
                  setMobileInput(e.target.value);
                  if (loginError) setLoginError("");
                }}
                className="w-32 sm:w-36 outline-none text-xs text-[#111111]"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-[#0E382B] hover:bg-[#144636] text-white px-5 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>Sync Wishlist</span>
              <ArrowRight size={13} />
            </button>
            {loginError && <p className="text-[11px] text-red-600 block sm:hidden">{loginError}</p>}
          </form>
        </div>
      )}

      {justLoggedIn && customer && (
        <div className="bg-[#FAF7F2] border border-[#E5E0D8] p-3.5 rounded-xl flex items-center gap-2.5 text-xs text-[#0E382B] animate-fadeIn">
          <CheckCircle2 size={16} />
          <span>
            Wishlist synced to customer account <strong>{customer.customerId}</strong> · Welcome privilege unlocked.
          </span>
        </div>
      )}

      {/* Action bar when items exist */}
      {savedProducts.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-[#666666] font-medium">
            Showing {savedProducts.length} {savedProducts.length === 1 ? "piece" : "pieces"}
          </p>
          <button
            type="button"
            onClick={handleMoveAllToBag}
            className="text-xs font-semibold text-[#0E382B] hover:text-[#144636] flex items-center gap-1.5 underline decoration-[#C5A880] cursor-pointer"
          >
            <ShoppingBag size={14} />
            <span>Move In-Stock Items to Bag</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {savedProducts.length === 0 ? (
        <div className="text-center py-20 border border-[#DDD8D0] bg-[#FAF7F2] p-8 my-8 space-y-4 rounded-2xl">
          <div className="w-16 h-16 rounded-full border-2 border-[#C5A880]/50 flex items-center justify-center mx-auto text-[#C5A880] bg-white shadow-xs">
            <Heart size={26} strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <h2 className="font-serif text-2xl text-[#111111]">Your lookbook is currently empty</h2>
            <p className="text-xs text-[#666666] max-w-md mx-auto leading-relaxed">
              Tap the heart icon on any solitaire ring, earrings, or necklace in our collection to save it here for later.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/shop"
              className="bg-[#0E382B] hover:bg-[#144636] text-white px-6 py-2.5 text-xs uppercase tracking-wider font-semibold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
            >
              <span>Explore The Collection</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      ) : (
        /* Wishlist Item Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pt-2">
          {savedProducts.map((product) => {
            const rates = getDailyMetalRates();
            const calculated = calculateDynamicPrice(product, rates);
            const isComingSoon = Boolean(product.isComingSoon);

            return (
              <div
                key={product.id}
                className="bg-white border border-[#DDD8D0] hover:border-[#C5A880] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* Product Image */}
                <div className="relative aspect-square w-full bg-[#FAF7F2] overflow-hidden">
                  <Link href={`/product/${product.slug}`} className="block w-full h-full relative">
                    <Image
                      src={product.images?.[0] || "/products/ring-01-a.svg"}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                    {isComingSoon ? (
                      <span className="bg-[#B8860B] text-white text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                        <Clock size={10} />
                        <span>Coming Soon</span>
                      </span>
                    ) : (
                      <span className="bg-[#0E382B] text-white text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded shadow-xs">
                        Ready to Ship
                      </span>
                    )}
                    {product.discountPercent > 0 && !isComingSoon && (
                      <span className="bg-[#A32D2D] text-white text-[9px] font-semibold px-2 py-0.5 rounded shadow-xs">
                        {product.discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(product.slug)}
                    aria-label={`Remove ${product.name} from wishlist`}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#888888] hover:text-red-600 border border-[#DDD8D0] flex items-center justify-center transition-colors shadow-xs"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Details & Actions */}
                <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-[#C5A880] font-semibold">
                      {product.metal} · {product.purity}
                    </p>
                    <Link
                      href={`/product/${product.slug}`}
                      className="font-serif text-sm font-medium text-[#111111] hover:text-[#0E382B] transition-colors line-clamp-1"
                    >
                      {product.name ? product.name.replace(/\bPRAO\b/gi, "AYOR") : "AYOR Jewellery"}
                    </Link>
                    <div className="flex items-baseline gap-2 pt-0.5">
                      <span className="text-sm font-bold text-[#111111]">
                        {formatPriceINR(calculated.finalPrice)}
                      </span>
                      {product.discountPercent > 0 && (
                        <span className="text-xs text-[#888888] line-through">
                          {formatPriceINR(Math.round(calculated.finalPrice / (1 - product.discountPercent / 100)))}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-[#F0ECE6] space-y-2">
                    {isComingSoon ? (
                      <Link
                        href={`/product/${product.slug}`}
                        className="w-full py-2 bg-[#FAF7F2] hover:bg-[#F5EFEB] text-[#B8860B] border border-[#B8860B]/40 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Clock size={13} />
                        <span>View Piece Details</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleMoveToCart(product)}
                        className="w-full py-2.5 bg-[#0E382B] hover:bg-[#144636] text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <ShoppingBag size={14} />
                        <span>Move to Bag</span>
                      </button>
                    )}

                    <Link
                      href={`/product/${product.slug}`}
                      className="block text-center text-[11px] text-[#666666] hover:text-[#111111] underline transition-colors"
                    >
                      View Full Specifications →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trust Markers */}
      <div className="border-t border-[#DDD8D0] pt-8 mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE5DC] space-y-1">
          <p className="font-semibold text-xs text-[#0E382B]">100% Certified Lab Solitaires</p>
          <p className="text-[11px] text-[#666666]">Every solitaire is accompanied by an authentic IGI certificate.</p>
        </div>
        <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE5DC] space-y-1">
          <p className="font-semibold text-xs text-[#0E382B]">BIS Hallmarked 18K / 925</p>
          <p className="text-[11px] text-[#666666]">Purity stamped and verified by Govt. of India approved hallmarking centers.</p>
        </div>
        <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE5DC] space-y-1">
          <p className="font-semibold text-xs text-[#0E382B]">15-Day Complimentary Resizing</p>
          <p className="text-[11px] text-[#666666]">Complimentary door-to-door insured transit across all Indian pin codes.</p>
        </div>
      </div>
    </div>
  );
}
