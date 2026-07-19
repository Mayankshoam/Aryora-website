"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api, Product } from "@/lib/api";

const METALS = [
  { value: "", label: "All Metals" },
  { value: "YELLOW_GOLD", label: "Yellow Gold" },
  { value: "WHITE_GOLD", label: "White Gold" },
  { value: "ROSE_GOLD", label: "Rose Gold" },
  { value: "CHAMPAGNE_GOLD", label: "Champagne Gold" },
  { value: "SILVER_925", label: "92.5 Silver" },
];

export default function ShopPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [metal, setMetal] = useState("");
  const [sort, setSort] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (metal) params.set("metal", metal);
    if (sort) params.set("sort", sort);

    api
      .get<{ items: Product[] }>(`/products?${params.toString()}`)
      .then((res) => setItems(res.items))
      .catch(() => setError("Could not load products right now."))
      .finally(() => setLoading(false));
  }, [metal, sort]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex justify-between items-end mb-10 flex-wrap gap-4">
        <div>
          <p className="eyebrow mb-2">Shop</p>
          <h1 className="font-display text-3xl">All Jewellery</h1>
        </div>
        <div className="flex gap-4 text-sm">
          <select value={metal} onChange={(e) => setMetal(e.target.value)} className="border border-black/10 px-3 py-2 bg-transparent">
            {METALS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-black/10 px-3 py-2 bg-transparent">
            <option value="">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading && <p className="text-sm text-ink/50">Loading pieces…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && items.length === 0 && !error && (
        <p className="text-sm text-ink/50">No pieces match these filters yet — try a different metal or check back soon.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
        {items.map((p) => (
          <Link key={p.id} href={`/product/${p.slug}`} className="group">
            <div className="relative aspect-square bg-black/5 mb-3 overflow-hidden">
              {p.images?.[0] && (
                <Image src={p.images[0].url} alt={p.images[0].altText || p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              )}
            </div>
            <h3 className="font-display text-sm">{p.name}</h3>
            <p className="text-sm text-ink/70">₹{Number(p.price).toLocaleString("en-IN")}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
