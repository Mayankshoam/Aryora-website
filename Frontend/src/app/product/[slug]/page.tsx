"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

interface ProductDetail {
  id: string;
  name: string;
  price: string;
  description: string;
  metalType: string;
  certification?: string;
  images: { url: string; altText?: string }[];
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [ringSize, setRingSize] = useState("");
  const [status, setStatus] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<{ product: ProductDetail }>(`/products/${slug}`)
      .then((res) => setProduct(res.product))
      .catch(() => setError("This piece could not be found."));
  }, [slug]);

  async function addToBag() {
    if (!product) return;
    setStatus("adding");
    try {
      await api.post("/cart", { productId: product.id, quantity: 1, ringSize: ringSize || undefined });
      setStatus("added");
    } catch (e: any) {
      setStatus("error");
      setError(e.message.includes("Authentication") ? "Please log in to add items to your bag." : e.message);
    }
  }

  if (error && !product) return <p className="max-w-7xl mx-auto px-6 py-16 text-sm text-red-600">{error}</p>;
  if (!product) return <p className="max-w-7xl mx-auto px-6 py-16 text-sm text-ink/50">Loading…</p>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-16">
      <div className="relative aspect-square bg-black/5">
        {product.images?.[0] && (
          <Image src={product.images[0].url} alt={product.images[0].altText || product.name} fill className="object-cover" />
        )}
      </div>

      <div>
        <h1 className="font-display text-3xl mb-3">{product.name}</h1>
        <p className="text-2xl mb-6">₹{Number(product.price).toLocaleString("en-IN")}</p>
        <p className="text-ink/70 leading-relaxed mb-8">{product.description}</p>

        <label className="block text-sm mb-2">Ring Size (optional)</label>
        <input
          value={ringSize}
          onChange={(e) => setRingSize(e.target.value)}
          placeholder="e.g. US 6"
          className="border border-black/10 px-3 py-2 mb-6 w-full max-w-xs bg-transparent text-sm"
        />

        <button onClick={addToBag} disabled={status === "adding"} className="btn-primary w-full max-w-xs">
          {status === "adding" ? "Adding…" : "Add to Bag"}
        </button>

        {status === "added" && <p className="text-sm text-emerald mt-3">Added to your bag.</p>}
        {status === "error" && <p className="text-sm text-red-600 mt-3">{error}</p>}

        {product.certification && (
          <p className="text-xs text-ink/50 mt-8 uppercase tracking-widest2">{product.certification}</p>
        )}
      </div>
    </div>
  );
}
