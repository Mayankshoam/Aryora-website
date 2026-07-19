"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";

interface WishlistItem {
  id: string;
  product: { slug: string; name: string; price: string; images: { url: string }[] };
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<{ items: WishlistItem[] }>("/wishlist").then((r) => setItems(r.items)).catch(() => setError("Please log in to view your wishlist."));
  }, []);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-sm text-ink/60 mb-4">{error}</p>
        <Link href="/login" className="btn-primary inline-block">Log In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl mb-10">Your Wishlist</h1>
      {items.length === 0 ? (
        <p className="text-sm text-ink/50">Nothing saved yet. <Link href="/shop" className="underline">Browse the collection</Link>.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((i) => (
            <Link key={i.id} href={`/product/${i.product.slug}`}>
              <div className="relative aspect-square bg-black/5 mb-3">
                {i.product.images?.[0] && <Image src={i.product.images[0].url} alt={i.product.name} fill className="object-cover" />}
              </div>
              <h3 className="font-display text-sm">{i.product.name}</h3>
              <p className="text-sm text-ink/70">₹{Number(i.product.price).toLocaleString("en-IN")}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
