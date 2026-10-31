"use client";

import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Trash2, ArrowRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { useAryoraStore } from "@/lib/store";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useAryoraStore();

  const total = getCartTotal();
  const gst = Math.round(total * 0.03);
  const subtotalBeforeGst = total - gst;

  return (
    <div className="max-w-content mx-auto px-6 md:px-8 py-8 md:py-16">
      <Breadcrumbs items={[{ label: "Shopping Bag" }]} />

      <div className="max-w-xl my-6 space-y-2">
        <p className="eyebrow">Order Review</p>
        <h1 className="font-serif text-3xl md:text-5xl text-ink">Your Shopping Bag</h1>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-24 border border-border-subtle bg-ivory-pure p-8 my-8 space-y-4">
          <p className="font-serif text-2xl text-ink">Your bag is currently empty</p>
          <p className="text-xs text-ink-muted max-w-sm mx-auto leading-relaxed">
            Discover our collection of IGI-certified lab-grown diamond rings, earrings, pendants, and heirloom bridal sets.
          </p>
          <div className="pt-2">
            <Link href="/shop" className="btn-primary text-xs">
              Explore Collection
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-12 pt-6">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="divide-y divide-border-subtle border-y border-border-subtle">
              {cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.size || "std"}`}
                  className="py-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between"
                >
                  <div className="flex gap-4 items-center">
                    <div className="relative w-24 h-28 bg-ivory-muted border border-border-subtle flex-shrink-0 overflow-hidden">
                      <Image
                        src={
                          typeof item.product.images?.[0] === "string"
                            ? item.product.images[0]
                            : "/products/ring-01-a.svg"
                        }
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    <div>
                      <span className="eyebrow text-[10px]">{item.product.id}</span>
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="block font-serif text-lg text-ink hover:text-champagne-accessible transition-colors leading-snug"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-ink-subtle mt-1">
                        {item.selectedMetal || item.product.metal} ({item.product.purity})
                        {item.size ? ` • Size: ${item.size}` : ""}
                      </p>
                      <p className="text-xs font-semibold text-ink mt-2">
                        ₹{item.product.price.toLocaleString("en-IN")} each
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-8 pt-2 sm:pt-0">
                    {/* Stepper */}
                    <div className="inline-flex items-center border border-border-subtle bg-ivory-pure">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1, item.size)
                        }
                        className="w-8 h-8 flex items-center justify-center text-xs hover:bg-ivory-muted transition-colors"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-xs font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1, item.size)
                        }
                        className="w-8 h-8 flex items-center justify-center text-xs hover:bg-ivory-muted transition-colors"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-base font-serif font-medium text-ink">
                        ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.size)}
                        className="text-xs text-ink-subtle hover:text-[#B93826] mt-1 inline-flex items-center gap-1 transition-colors"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4">
              <Link href="/shop" className="text-xs uppercase tracking-wider text-ink hover:text-champagne-accessible underline font-medium">
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary Box */}
          <div className="lg:col-span-4">
            <div className="border border-border-subtle bg-ivory-pure p-6 md:p-8 space-y-6 shadow-sm">
              <h2 className="font-serif text-2xl text-ink pb-4 border-b border-border-subtle">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs text-ink-muted">
                <div className="flex justify-between">
                  <span>Price before GST</span>
                  <span>₹{subtotalBeforeGst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (3%)</span>
                  <span>₹{gst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Insured Shipping Across India</span>
                  <span className="text-champagne-accessible font-medium">Complimentary</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border-subtle flex justify-between items-baseline">
                <span className="text-xs uppercase tracking-widest font-semibold text-ink">
                  Total (INR)
                </span>
                <span className="font-serif text-3xl text-ink font-medium">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href="/checkout"
                  className="btn-primary w-full text-xs text-center flex items-center justify-center gap-2 py-4"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* Trust assurances */}
              <div className="space-y-2.5 pt-4 border-t border-border-subtle text-[11px] text-ink-muted">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-champagne-accessible flex-shrink-0" />
                  <span>Independent IGI certificate with every diamond</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={15} className="text-champagne-accessible flex-shrink-0" />
                  <span>Tamper-proof sealed & fully insured courier</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw size={15} className="text-champagne-accessible flex-shrink-0" />
                  <span>7-Day Hassle-Free Returns & 30-Day Free Resizing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
