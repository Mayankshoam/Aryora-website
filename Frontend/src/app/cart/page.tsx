"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";

interface CartItem {
  id: string;
  quantity: number;
  product: { name: string; price: string; images: { url: string }[] };
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [error, setError] = useState("");

  function load() {
    api
      .get<{ items: CartItem[] }>("/cart")
      .then((res) => setItems(res.items))
      .catch(() => setError("Please log in to view your bag."));
  }

  useEffect(load, []);

  async function updateQty(id: string, quantity: number) {
    if (quantity < 1) return;
    await api.patch(`/cart/${id}`, { quantity });
    load();
  }

  async function remove(id: string) {
    await api.delete(`/cart/${id}`);
    load();
  }

  const total = items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-sm text-ink/60 mb-4">{error}</p>
        <Link href="/login" className="btn-primary inline-block">Log In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl mb-10">Your Bag</h1>

      {items.length === 0 ? (
        <p className="text-sm text-ink/50">Your bag is empty. <Link href="/shop" className="underline">Continue shopping</Link>.</p>
      ) : (
        <>
          <div className="divide-y divide-black/10">
            {items.map((item) => (
              <div key={item.id} className="flex gap-6 py-6 items-center">
                <div className="relative w-24 h-24 bg-black/5 flex-shrink-0">
                  {item.product.images?.[0] && (
                    <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-display">{item.product.name}</h3>
                  <p className="text-sm text-ink/60">₹{Number(item.product.price).toLocaleString("en-IN")}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-7 h-7 border border-black/20">−</button>
                    <span className="text-sm">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-7 h-7 border border-black/20">+</button>
                  </div>
                </div>
                <button onClick={() => remove(item.id)} className="text-xs underline text-ink/50">Remove</button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-10 pt-6 border-t border-black/10">
            <p className="font-display text-xl">Subtotal: ₹{total.toLocaleString("en-IN")}</p>
            <Link href="/checkout" className="btn-primary">Proceed to Checkout</Link>
          </div>
        </>
      )}
    </div>
  );
}
