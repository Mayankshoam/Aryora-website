"use client";

import { useState } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ShieldCheck, Lock, Check, Truck, ArrowRight } from "lucide-react";
import { useAryoraStore } from "@/lib/store";

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useAryoraStore();
  const total = getCartTotal();
  const gst = Math.round(total * 0.03);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "Uttar Pradesh",
    pincode: "",
    paymentMethod: "razorpay",
  });

  const [isPlacing, setIsPlacing] = useState(false);
  const [orderComplete, setOrderComplete] = useState<string | null>(null);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlacing(true);

    setTimeout(() => {
      const orderNum = `ARY-${Date.now().toString().slice(-6)}`;
      setOrderComplete(orderNum);
      clearCart();
      setIsPlacing(false);
    }, 1200);
  };

  if (orderComplete) {
    return (
      <div className="max-w-content mx-auto px-6 md:px-8 py-20 text-center">
        <div className="max-w-lg mx-auto border border-border-subtle bg-ivory-pure p-8 md:p-12 space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#1B3B30] text-ivory flex items-center justify-center mx-auto">
            <Check size={28} />
          </div>
          <p className="eyebrow">Order Confirmed</p>
          <h1 className="font-serif text-3xl md:text-4xl text-ink">
            Thank You for Choosing Aryora
          </h1>
          <p className="text-xs text-ink-muted leading-relaxed">
            Order Reference: <strong className="text-ink font-semibold">{orderComplete}</strong>. We have dispatched a confirmation receipt with tamper-proof tracking to <span className="text-ink">{form.email || "your email"}</span>.
          </p>
          <div className="pt-4 border-t border-border-subtle">
            <Link href="/shop" className="btn-primary text-xs">
              Return to Atelier
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto px-6 md:px-8 py-8 md:py-16">
      <Breadcrumbs items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />

      <div className="max-w-xl my-6 space-y-2">
        <p className="eyebrow">Secure Transaction</p>
        <h1 className="font-serif text-3xl md:text-5xl text-ink">Express Checkout</h1>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 pt-4">
        {/* Form */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-8">
          {/* Contact Details */}
          <div className="border border-border-subtle bg-ivory-pure p-6 md:p-8 space-y-4">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-ink pb-2 border-b border-border-subtle">
              1. Contact Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1">
                  Full Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Ananya Roy"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1">
                  Mobile Number (for Courier SMS) *
                </label>
                <input
                  required
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1">
                  Email Address (for IGI Dossier Certificate) *
                </label>
                <input
                  required
                  type="email"
                  placeholder="ananya@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="border border-border-subtle bg-ivory-pure p-6 md:p-8 space-y-4">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-ink pb-2 border-b border-border-subtle">
              2. Delivery Address in India
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1">
                  Street Address & House / Flat No. *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Flat 4B, Heritage Enclave, Hazratganj"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1">
                    City *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Lucknow"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1">
                    State *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1">
                    PIN Code *
                  </label>
                  <input
                    required
                    type="text"
                    maxLength={6}
                    placeholder="226001"
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="border border-border-subtle bg-ivory-pure p-6 md:p-8 space-y-4">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-ink pb-2 border-b border-border-subtle flex items-center justify-between">
              <span>3. Payment Gateway</span>
              <span className="text-[11px] text-ink-subtle flex items-center gap-1">
                <Lock size={12} /> 256-Bit SSL Encrypted
              </span>
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3.5 border border-ink bg-ivory cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={form.paymentMethod === "razorpay"}
                  onChange={() => setForm({ ...form, paymentMethod: "razorpay" })}
                  className="accent-ink"
                />
                <span className="text-xs font-medium text-ink">
                  Online Payment (UPI, Credit/Debit Cards, NetBanking, EMI via Razorpay)
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPlacing || cart.length === 0}
            className="btn-primary w-full text-xs font-semibold py-4 flex items-center justify-center gap-2"
          >
            {isPlacing ? (
              "Securing Your Order..."
            ) : (
              <>
                <span>Complete Order (₹{total.toLocaleString("en-IN")})</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Right Summary */}
        <div className="lg:col-span-5">
          <div className="border border-border-subtle bg-ivory-pure p-6 md:p-8 space-y-6 lg:sticky lg:top-28 shadow-sm">
            <h2 className="font-serif text-2xl text-ink pb-3 border-b border-border-subtle">
              Items in Order ({cart.length})
            </h2>

            <div className="divide-y divide-border-subtle/60 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-serif text-sm font-medium text-ink">{item.product.name}</p>
                    <p className="text-[11px] text-ink-subtle">
                      {item.selectedMetal || item.product.metal} ({item.product.purity})
                      {item.size ? ` • Size: ${item.size}` : ""} • Qty {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium text-ink">
                    ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-border-subtle text-xs text-ink-muted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{(total - gst).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Applicable GST (3%)</span>
                <span>₹{gst.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Insured Courier Delivery</span>
                <span className="text-champagne-accessible font-medium">Free</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border-subtle text-sm font-serif font-semibold text-ink">
                <span>Total Amount</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="p-4 bg-ivory border border-border-subtle space-y-2 text-[11px] text-ink-subtle">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-champagne-accessible" />
                <span>IGI Certificate and hallmark guarantees enclosed.</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={14} className="text-champagne-accessible" />
                <span>Dispatched within 3-5 days in tamper-proof security box.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
