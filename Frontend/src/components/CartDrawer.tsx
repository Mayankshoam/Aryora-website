"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { useAryoraStore } from "@/lib/store";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
  } = useAryoraStore();

  const total = getCartTotal();

  // Escape key closes drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) closeCart();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, closeCart]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-ivory text-ink h-full shadow-2xl flex flex-col z-10 animate-slideLeft">
        {/* Header */}
        <div className="p-6 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl tracking-wide">Your Bag</h2>
            <span className="text-xs text-ink-subtle">
              ({cart.reduce((t, i) => t + i.quantity, 0)})
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-ink hover:opacity-75 transition-opacity"
            aria-label="Close bag"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Free Insured Shipping Progress Indicator */}
        <div className="px-6 py-3 bg-champagne-subtle/70 border-b border-border-subtle flex items-center gap-2 text-xs text-ink-muted">
          <Truck size={15} className="text-champagne-accessible flex-shrink-0" />
          <span>Complimentary insured shipping included on all orders across India.</span>
        </div>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
              <p className="font-serif text-xl text-ink">Your bag is currently empty</p>
              <p className="text-xs text-ink-muted max-w-xs leading-relaxed">
                Explore our lab-grown diamond heirlooms, certified rings, and bespoke necklaces.
              </p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="btn-primary mt-2 text-xs"
              >
                Explore Heirlooms
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.size || "std"}`}
                  className="py-5 first:pt-0 flex gap-4"
                >
                  <div className="relative w-20 h-24 bg-ivory-muted flex-shrink-0 overflow-hidden border border-border-subtle">
                    <Image
                      src={item.product.images[0]?.url || "/images/hero-emerald.jpg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/product/${item.product.slug}`}
                          onClick={closeCart}
                          className="font-serif text-base text-ink hover:text-champagne-accessible transition-colors leading-snug"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.size)}
                          className="text-ink-subtle hover:text-ink p-1 -mr-1"
                          aria-label={`Remove ${item.product.name} from bag`}
                        >
                          <Trash2 size={15} strokeWidth={1.5} />
                        </button>
                      </div>

                      <p className="text-xs text-ink-subtle mt-0.5">
                        {item.product.specs.metal}
                        {item.size ? ` • Size: ${item.size}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      {/* Quantity stepper */}
                      <div className="inline-flex items-center border border-border-subtle">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1, item.size)
                          }
                          className="w-7 h-7 flex items-center justify-center text-xs hover:bg-ivory-muted transition-colors"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-xs font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1, item.size)
                          }
                          className="w-7 h-7 flex items-center justify-center text-xs hover:bg-ivory-muted transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <p className="text-sm font-medium text-ink">
                        ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Summary */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-border-subtle bg-ivory-pure space-y-4">
            <div className="space-y-1.5 text-xs text-ink-muted">
              <div className="flex justify-between">
                <span>Subtotal (Inclusive of GST)</span>
                <span className="text-sm font-medium text-ink">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-champagne-accessible font-medium">Complimentary</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border-subtle flex justify-between items-baseline">
              <span className="text-xs uppercase tracking-widest text-ink font-medium">
                Estimated Total
              </span>
              <span className="font-serif text-2xl text-ink font-medium">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href="/cart"
                onClick={closeCart}
                className="btn-outline w-full text-xs text-center"
              >
                View Full Bag
              </Link>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="btn-primary w-full text-xs text-center flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-ink-subtle">
              <ShieldCheck size={14} className="text-champagne-accessible" />
              <span>IGI Certified Stones • 100% Insured Delivery</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
