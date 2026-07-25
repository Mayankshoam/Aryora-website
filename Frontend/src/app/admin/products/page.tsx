"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Category { id: string; name: string; }
interface Product {
  id: string; name: string; slug: string; productCode: string; sku: string;
  description: string; shortDescription?: string; price: string; metalType: string;
  categoryId: string; stockQuantity: number; isFeatured: boolean; isActive: boolean;
  images: { url: string }[];
}

const METALS = ["YELLOW_GOLD", "WHITE_GOLD", "ROSE_GOLD", "CHAMPAGNE_GOLD", "SILVER_925"];

const emptyForm = {
  name: "", slug: "", productCode: "", sku: "", description: "", shortDescription: "",
  price: "", metalType: "YELLOW_GOLD", categoryId: "", stockQuantity: "0",
  isFeatured: false, imageUrl: "",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    api.get<{ items: Product[] }>("/admin/products").then((r) => setProducts(r.items)).catch(() => setError("Admin access required. Please log in as admin."));
    api.get<{ categories: Category[] }>("/admin/categories").then((r) => setCategories(r.categories)).catch(() => {});
  }
  useEffect(load, []);

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name, slug: p.slug, productCode: p.productCode, sku: p.sku,
      description: p.description, shortDescription: p.shortDescription || "",
      price: p.price, metalType: p.metalType, categoryId: p.categoryId,
      stockQuantity: String(p.stockQuantity), isFeatured: p.isFeatured,
      imageUrl: p.images?.[0]?.url || "",
    });
    setShowForm(true);
  }

  function startNew() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name, slug: form.slug, productCode: form.productCode, sku: form.sku,
        description: form.description, shortDescription: form.shortDescription || undefined,
        price: Number(form.price), metalType: form.metalType, categoryId: form.categoryId,
        stockQuantity: Number(form.stockQuantity), isFeatured: form.isFeatured,
      };

      let productId = editingId;
      if (editingId) {
        await api.put(`/admin/products/${editingId}`, payload);
      } else {
        const res = await api.post<{ product: Product }>("/admin/products", payload);
        productId = res.product.id;
      }

      if (form.imageUrl && productId) {
        await api.post(`/admin/products/${productId}/images`, { url: form.imageUrl, position: 0 });
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(id: string) {
    if (!confirm("Deactivate this product? It will be hidden from the shop.")) return;
    await api.delete(`/admin/products/${id}`);
    load();
  }

  if (error) return <p className="max-w-3xl mx-auto px-6 py-24 text-sm text-red-600">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex justify-between items-center mb-10">
        <div>
          <Link href="/admin" className="text-xs underline text-ink/50">← Dashboard</Link>
          <h1 className="font-display text-3xl mt-2">Products</h1>
        </div>
        <button onClick={startNew} className="btn-primary">+ Add Product</button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="border border-black/10 p-6 mb-10 grid md:grid-cols-2 gap-4">
          <h2 className="md:col-span-2 font-display text-lg">{editingId ? "Edit Product" : "New Product"}</h2>

          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-black/10 px-3 py-2 text-sm" />
          <input required placeholder="Slug (e.g. emerald-solitaire)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="border border-black/10 px-3 py-2 text-sm" />
          <input required placeholder="Product Code (e.g. ARY-RG-0002)" value={form.productCode} onChange={(e) => setForm({ ...form, productCode: e.target.value })} className="border border-black/10 px-3 py-2 text-sm" />
          <input required placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="border border-black/10 px-3 py-2 text-sm" />

          <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="border border-black/10 px-3 py-2 text-sm">
            <option value="">Select Category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select value={form.metalType} onChange={(e) => setForm({ ...form, metalType: e.target.value })} className="border border-black/10 px-3 py-2 text-sm">
            {METALS.map((m) => <option key={m} value={m}>{m.replaceAll("_", " ")}</option>)}
          </select>

          <input required type="number" placeholder="Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="border border-black/10 px-3 py-2 text-sm" />
          <input required type="number" placeholder="Stock Quantity" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} className="border border-black/10 px-3 py-2 text-sm" />

          <input placeholder="Short Description" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className="md:col-span-2 border border-black/10 px-3 py-2 text-sm" />
          <textarea required placeholder="Full Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="md:col-span-2 border border-black/10 px-3 py-2 text-sm" />

          <input placeholder="Image path (e.g. /images/products/ring-2.jpg)" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="md:col-span-2 border border-black/10 px-3 py-2 text-sm" />
          <p className="md:col-span-2 text-xs text-ink/40 -mt-2">Upload the image file to Frontend/public/images/products/ via GitHub first, then paste its path here.</p>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
            Show on homepage (Featured)
          </label>

          {error && <p className="md:col-span-2 text-sm text-red-600">{error}</p>}

          <div className="md:col-span-2 flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving…" : editingId ? "Update Product" : "Create Product"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-ink/50 border-b border-black/10">
            <th className="py-2">Name</th><th>Code</th><th>Price</th><th>Stock</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {products.map((p) => (
            <tr key={p.id}>
              <td className="py-3">{p.name}</td>
              <td>{p.productCode}</td>
              <td>₹{Number(p.price).toLocaleString("en-IN")}</td>
              <td>{p.stockQuantity}</td>
              <td>{p.isActive ? "Active" : "Inactive"}</td>
              <td className="text-right space-x-3">
                <button onClick={() => startEdit(p)} className="underline text-xs">Edit</button>
                <button onClick={() => deactivate(p.id)} className="underline text-xs text-red-600">Deactivate</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
