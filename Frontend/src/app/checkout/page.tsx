"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Address {
  id: string;
  line1: string;
  city: string;
  state: string;
  pinCode: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState("");
  const [newAddress, setNewAddress] = useState({ line1: "", city: "", state: "", pinCode: "" });
  const [couponCode, setCouponCode] = useState("");
  const [summary, setSummary] = useState<{ subtotal: number; discount: number; shippingFee: number; total: number; couponId: string | null } | null>(null);
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    api.get<{ addresses: Address[] }>("/addresses").then((r) => {
      setAddresses(r.addresses);
      if (r.addresses[0]) setAddressId(r.addresses[0].id);
    }).catch(() => setError("Please log in to check out."));
  }, []);

  async function recalc() {
    try {
      const res = await api.post<typeof summary>("/orders/checkout-start", { addressId, couponCode: couponCode || undefined });
      setSummary(res);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function useNewAddress() {
    const addr = await api.post<{ address: Address }>("/addresses", newAddress);
    setAddresses((prev) => [...prev, addr.address]);
    setAddressId(addr.address.id);
  }

  async function placeOrder(paymentMethod: string) {
    setPlacing(true);
    setError("");
    try {
      const res = await api.post<{ order: { orderNumber: string } }>("/orders", {
        addressId,
        couponId: summary?.couponId,
        paymentMethod,
      });
      router.push(`/account/orders/${res.order.orderNumber}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setPlacing(false);
    }
  }

  if (error && addresses.length === 0) return <p className="max-w-3xl mx-auto px-6 py-24 text-sm text-red-600">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl mb-10">Checkout</h1>

      <h2 className="font-display text-lg mb-4">Delivery Address</h2>
      {addresses.map((a) => (
        <label key={a.id} className="flex items-start gap-3 border border-black/10 p-4 mb-3 cursor-pointer">
          <input type="radio" name="address" checked={addressId === a.id} onChange={() => setAddressId(a.id)} className="mt-1" />
          <span className="text-sm">{a.line1}, {a.city}, {a.state} — {a.pinCode}</span>
        </label>
      ))}

      <details className="mb-8">
        <summary className="text-sm underline cursor-pointer">Add a new address</summary>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <input placeholder="Address Line" className="col-span-2 border border-black/10 px-3 py-2 bg-transparent text-sm" onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })} />
          <input placeholder="City" className="border border-black/10 px-3 py-2 bg-transparent text-sm" onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
          <input placeholder="State" className="border border-black/10 px-3 py-2 bg-transparent text-sm" onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} />
          <input placeholder="PIN Code" className="border border-black/10 px-3 py-2 bg-transparent text-sm" onChange={(e) => setNewAddress({ ...newAddress, pinCode: e.target.value })} />
          <button onClick={useNewAddress} className="btn-outline text-xs">Save Address</button>
        </div>
      </details>

      <div className="flex gap-3 mb-8">
        <input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="border border-black/10 px-3 py-2 bg-transparent text-sm flex-1" />
        <button onClick={recalc} className="btn-outline text-xs">Apply</button>
      </div>

      {summary && (
        <div className="border-t border-black/10 pt-6 mb-8 text-sm space-y-1">
          <p className="flex justify-between"><span>Subtotal</span><span>₹{summary.subtotal.toLocaleString("en-IN")}</span></p>
          {summary.discount > 0 && <p className="flex justify-between text-emerald"><span>Discount</span><span>−₹{summary.discount.toLocaleString("en-IN")}</span></p>}
          <p className="flex justify-between"><span>Shipping</span><span>{summary.shippingFee === 0 ? "Free" : `₹${summary.shippingFee}`}</span></p>
          <p className="flex justify-between font-display text-lg pt-2 border-t border-black/10"><span>Total</span><span>₹{summary.total.toLocaleString("en-IN")}</span></p>
        </div>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <button onClick={() => placeOrder("razorpay")} disabled={!addressId || placing} className="btn-primary w-full">
        {placing ? "Placing Order…" : "Place Order"}
      </button>
      <p className="text-xs text-ink/40 mt-3 text-center">Payment gateway integration (Razorpay/Stripe) plugs in here — see README.</p>
    </div>
  );
}
