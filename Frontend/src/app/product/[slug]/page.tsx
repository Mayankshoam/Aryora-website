"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

interface ProductDetail {
  id: string;
  name: string;
  productCode: string;
  price: string;
  description: string;
  shortDescription?: string;
  metalType: string;
  gramWeight?: string;
  diamondCarat?: string;
  certification?: string;
  images: { url: string; altText?: string }[];
}

const METAL_LABELS: Record<string, string> = {
  YELLOW_GOLD: "Yellow Gold",
  WHITE_GOLD: "White Gold",
  ROSE_GOLD: "Rose Gold",
  CHAMPAGNE_GOLD: "Champagne Gold",
  SILVER_925: "92.5 Silver",
};

const BADGES = [
  { icon: "⟲", label: "7-Day Easy Return" },
  { icon: "✓", label: "IGI Certified" },
  { icon: "♦", label: "Buyback Available*" },
  { icon: "🛡", label: "6-Month Warranty" },
];

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [ringSize, setRingSize] = useState("");
  const [status, setStatus] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [error, setError] = useState("");
  const [openSection, setOpenSection] = useState<string | null>("description");

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

  const metalLabel = METAL_LABELS[product.metalType] || product.metalType;
  const price = Number(product.price);
  const gst = Math.round(price * 0.03);
  const beforeTax = price - gst;

  const sections = [
    {
      key: "description",
      title: "Description",
      content: <p className="text-sm text-ink/70 leading-relaxed">{product.description}</p>,
    },
    {
      key: "certification",
      title: "Certification of Authenticity",
      content: (
        <p className="text-sm text-ink/70 leading-relaxed">
          {product.certification || "This piece is IGI certified"}. Every stone is laser-inscribed
          and fully traceable, with certification documents included at delivery.
        </p>
      ),
    },
    {
      key: "shipping",
      title: "Shipping & Handling",
      content: (
        <ul className="text-sm text-ink/70 leading-relaxed space-y-2 list-disc list-inside">
          <li>Free, fully insured shipping across India</li>
          <li>Dispatched within 3-5 business days, delivered within 15 business days</li>
          <li>Sealed with tamper-proof packaging — inspect carefully before signing off</li>
        </ul>
      ),
    },
    {
      key: "resizing",
      title: "Resizing & Repairs",
      content: (
        <ul className="text-sm text-ink/70 leading-relaxed space-y-2 list-disc list-inside">
          <li>One complimentary resizing within 30 days of delivery, depending on design</li>
          <li>Contact our concierge team to assess repair or resizing needs before shipping the piece back</li>
          <li>Return shipping charges for resizing/repair are borne by the customer</li>
        </ul>
      ),
    },
    {
      key: "returns",
      title: "Returns, Buyback & Warranty",
      content: (
        <ul className="text-sm text-ink/70 leading-relaxed space-y-2 list-disc list-inside">
          <li>Returns accepted within 7 days, only if unused and in original condition. Custom orders are not returnable.</li>
          <li>Refunds are processed after inspection and may take 7-10 working days.</li>
          <li>6-month warranty against manufacturing defects. Damage due to misuse is not covered.</li>
          <li className="text-ink/50">*Buyback terms and percentage are confirmed at the time of purchase — contact our concierge for current rates.</li>
        </ul>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid md:grid-cols-2 gap-16">
        {/* Images */}
        <div>
          <div className="relative aspect-square bg-black/5 mb-3">
            {product.images?.[activeImage] && (
              <Image
                src={product.images[activeImage].url}
                alt={product.images[activeImage].altText || product.name}
                fill
                className="object-cover"
              />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-20 h-20 bg-black/5 flex-shrink-0 border ${
                    activeImage === i ? "border-emerald" : "border-transparent"
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="eyebrow mb-2">{product.productCode}</p>
          <h1 className="font-display text-3xl mb-3">{product.name}</h1>
          <p className="text-2xl mb-1">₹{price.toLocaleString("en-IN")}</p>
          <p className="text-xs text-ink/40 mb-6">Inclusive of all taxes</p>

          {product.shortDescription && (
            <p className="text-ink/70 leading-relaxed mb-6">{product.shortDescription}</p>
          )}

          <div className="flex flex-wrap gap-4 mb-6 text-xs text-ink/60">
            <span className="border border-black/10 px-3 py-1.5">{metalLabel}</span>
            {product.gramWeight && <span className="border border-black/10 px-3 py-1.5">{product.gramWeight}g weight</span>}
            {product.diamondCarat && <span className="border border-black/10 px-3 py-1.5">{product.diamondCarat}ct diamond</span>}
          </div>

          <label className="block text-sm mb-2">Ring Size (optional)</label>
          <input
            value={ringSize}
            onChange={(e) => setRingSize(e.target.value)}
            placeholder="e.g. US 6"
            className="border border-black/10 px-3 py-2 mb-6 w-full max-w-xs bg-transparent text-sm"
          />

          <button onClick={addToBag} disabled={status === "adding"} className="btn-primary w-full max-w-xs mb-8">
            {status === "adding" ? "Adding…" : "Add to Bag"}
          </button>

          {status === "added" && <p className="text-sm text-emerald mb-6">Added to your bag.</p>}
          {status === "error" && <p className="text-sm text-red-600 mb-6">{error}</p>}

          {/* Trust badges */}
          <div className="grid grid-cols-4 gap-2 mb-10 border-y border-black/10 py-5">
            {BADGES.map((b) => (
              <div key={b.label} className="text-center">
                <div className="text-xl mb-1 text-champagne">{b.icon}</div>
                <p className="text-[10px] leading-tight text-ink/60">{b.label}</p>
              </div>
            ))}
          </div>

          {/* Price breakup */}
          <div className="mb-10">
            <h3 className="font-display text-sm uppercase tracking-widest2 text-ink/50 mb-3">Price Breakup</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-black/5">
                <tr>
                  <td className="py-2 text-ink/60">Metal ({metalLabel})</td>
                  <td className="py-2 text-right">Included</td>
                </tr>
                {product.diamondCarat && (
                  <tr>
                    <td className="py-2 text-ink/60">Diamond ({product.diamondCarat}ct)</td>
                    <td className="py-2 text-right">Included</td>
                  </tr>
                )}
                <tr>
                  <td className="py-2 text-ink/60">Price before tax</td>
                  <td className="py-2 text-right">₹{beforeTax.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td className="py-2 text-ink/60">GST (3%)</td>
                  <td className="py-2 text-right">₹{gst.toLocaleString("en-IN")}</td>
                </tr>
                <tr className="font-medium">
                  <td className="py-2">Total</td>
                  <td className="py-2 text-right">₹{price.toLocaleString("en-IN")}</td>
                </tr>
              </tbody>
            </table>
            <p className="text-[11px] text-ink/40 mt-2">
              *Estimated breakup; actual metal/stone weight may vary slightly per piece.
            </p>
          </div>

          {/* Accordion sections */}
          <div className="divide-y divide-black/10 border-t border-b border-black/10">
            {sections.map((s) => (
              <div key={s.key}>
                <button
                  onClick={() => setOpenSection(openSection === s.key ? null : s.key)}
                  className="w-full flex justify-between items-center py-4 text-left"
                >
                  <span className="font-display text-sm">{s.title}</span>
                  <span className="text-ink/40">{openSection === s.key ? "−" : "+"}</span>
                </button>
                {openSection === s.key && <div className="pb-4">{s.content}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
