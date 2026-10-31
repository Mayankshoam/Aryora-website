"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Heart,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Award,
  Truck,
  Check,
  ChevronDown,
  MessageCircle,
  Video,
  ArrowRight,
  Info,
  Clock,
  Gem,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import {
  getAllProducts,
  getProductBySlug,
  getProductsByCategory,
  calculatePriceBreakup,
  formatPriceINR,
  Product,
} from "@/lib/data";
import { useAryoraStore } from "@/lib/store";

const METAL_SWATCHES: Record<string, { bg: string; label: string }> = {
  "Yellow Gold": { bg: "#D4AF37", label: "18K Yellow Gold" },
  "Rose Gold": { bg: "#C98A7D", label: "18K Rose Gold" },
  "White Gold": { bg: "#D9D9D9", label: "18K White Gold" },
};

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const allProducts = getAllProducts();
  const product = (slug ? getProductBySlug(slug) : undefined) || allProducts[0];

  const relatedProducts = getProductsByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedMetal, setSelectedMetal] = useState<string>(product.metal || "Yellow Gold");
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || "12");
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [activeAccordion, setActiveAccordion] = useState<string | null>("price-breakup");
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    openSizeGuide,
    recentlyViewed,
    addRecentlyViewed,
  } = useAryoraStore();

  const inWishlist = isInWishlist(product.slug);

  // Track recently viewed
  useEffect(() => {
    if (product?.slug) {
      addRecentlyViewed(product.slug);
    }
  }, [product?.slug, addRecentlyViewed]);

  const recentProducts = recentlyViewed
    .filter((s) => s !== product.slug)
    .map((s) => allProducts.find((p) => p.slug === s))
    .filter((p): p is Product => Boolean(p))
    .slice(0, 4);

  const priceBreakup = calculatePriceBreakup(product);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      setPincodeStatus("invalid");
      return;
    }
    setPincodeStatus("checking");
    setTimeout(() => {
      const date = new Date();
      date.setDate(date.getDate() + 4);
      const formatted = date.toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      setDeliveryDate(formatted);
      setPincodeStatus("valid");
    }, 300);
  };

  const handleWhatsAppEnquiry = () => {
    const text = encodeURIComponent(
      `Hello Aryora Concierge, I would like to enquire about ${product.name} (ID: ${product.id}, Metal: ${selectedMetal}). Please share details and customization options.`
    );
    window.open(`https://wa.me/918808828646?text=${text}`, "_blank");
  };

  const handleVideoConsultation = () => {
    const text = encodeURIComponent(
      `Hello Aryora Concierge, I would like to book a WhatsApp Video Consultation to view ${product.name} (ID: ${product.id}) live.`
    );
    window.open(`https://wa.me/918808828646?text=${text}`, "_blank");
  };

  const productImages = product.images && product.images.length > 0
    ? product.images
    : ["/products/ring-01-a.svg", "/products/ring-01-b.svg"];

  const currentImage = productImages[activeImageIndex] || productImages[0];

  const originalPrice = product.discountPercent > 0
    ? Math.round(product.price / (1 - product.discountPercent / 100))
    : null;

  // JSON-LD structured data
  const productJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: productImages.map((img) => `https://aryora-website-d3sv.vercel.app${img}`),
    description: product.description,
    sku: product.id,
    mpn: product.id,
    brand: {
      "@type": "Brand",
      name: "Aryora",
    },
    offers: {
      "@type": "Offer",
      url: `https://aryora-website-d3sv.vercel.app/product/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      itemCondition: "https://schema.org/NewCondition",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Aryora Fine Jewellery",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <div className="max-w-content mx-auto px-4 md:px-8 py-6 md:py-10">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Shop", href: "/shop" },
            { label: product.category, href: `/shop?category=${encodeURIComponent(product.category)}` },
            { label: product.name },
          ]}
        />

        {/* Main Product Grid */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 my-6">
          {/* ========================================================= */}
          {/* LEFT: GALLERY SECTION (Sticky Desktop, Thumbnails, Zoom) */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-col-reverse md:flex-row gap-4">
              {/* Thumbnail Strip */}
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 md:w-20 md:h-20 bg-ivory-warm border flex-shrink-0 overflow-hidden transition-all p-1 ${
                      activeImageIndex === idx
                        ? "border-ink ring-1 ring-ink"
                        : "border-border-subtle opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      fill
                      className="object-contain"
                    />
                  </button>
                ))}
              </div>

              {/* Main Interactive Zoom Stage */}
              <div
                className="relative flex-1 aspect-square bg-ivory border border-border-subtle overflow-hidden cursor-crosshair group shadow-sm"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <Image
                  src={currentImage}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className={`object-contain transition-transform duration-200 ${
                    isZoomed ? "scale-150" : "scale-100"
                  }`}
                  style={
                    isZoomed
                      ? {
                          transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                        }
                      : undefined
                  }
                />

                {/* Overlaid Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start pointer-events-none">
                  {product.isBestseller && (
                    <span className="bg-[#1B3B30] text-ivory text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 shadow-sm">
                      Bestseller
                    </span>
                  )}
                  {product.discountPercent > 0 && (
                    <span className="bg-[#B93826] text-ivory text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 shadow-sm">
                      {product.discountPercent}% OFF
                    </span>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 pointer-events-none">
                  <span className="bg-ivory-pure/95 backdrop-blur-sm px-3 py-1 text-xs uppercase tracking-wider text-ink font-medium border border-border-subtle flex items-center gap-1.5 shadow-sm">
                    <Award size={14} className="text-champagne-accessible" />
                    <span>{product.certificate}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: BUYING PANEL (Ethera reference layout)             */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header info */}
            <div className="space-y-2 border-b border-border-subtle pb-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-champagne">
                  {product.category} · {product.subcategory}
                </span>
                <span className="text-xs text-ink-subtle">SKU: {product.id}</span>
              </div>

              <h1 className="font-serif text-2xl md:text-3xl text-ink font-light leading-snug">
                {product.name}
              </h1>

              <p className="text-xs text-ink-muted leading-relaxed font-light">
                {product.description}
              </p>
            </div>

            {/* Price Block */}
            <div className="space-y-2 bg-[#FAF8F4] p-4 border border-border-subtle">
              <div className="flex items-baseline space-x-3">
                <span className="font-serif text-3xl font-medium text-ink">
                  {formatPriceINR(product.price)}
                </span>
                {originalPrice && (
                  <span className="text-sm text-ink-light line-through">
                    {formatPriceINR(originalPrice)}
                  </span>
                )}
                {product.discountPercent > 0 && (
                  <span className="text-xs text-[#2A6E4E] font-semibold">
                    Save {formatPriceINR(originalPrice! - product.price)} ({product.discountPercent}% OFF)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-ink-subtle">
                Price inclusive of all taxes (3% GST) · Transparent making charges
              </p>
            </div>

            {/* Metal Selection */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="uppercase tracking-wider font-medium text-ink">
                  Selected Metal: <strong className="font-semibold text-champagne-accessible">{selectedMetal} ({product.purity})</strong>
                </span>
              </div>
              <div className="flex items-center gap-3">
                {["Yellow Gold", "Rose Gold", "White Gold"].map((metal) => {
                  const meta = METAL_SWATCHES[metal] || { bg: "#D4AF37", label: metal };
                  const isSelected = selectedMetal === metal;
                  return (
                    <button
                      key={metal}
                      type="button"
                      onClick={() => setSelectedMetal(metal)}
                      className={`flex items-center gap-2 px-3 py-2 border text-xs transition-all ${
                        isSelected
                          ? "border-ink bg-ivory-pure font-semibold shadow-sm"
                          : "border-border-subtle hover:border-ink/60 bg-ivory"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: meta.bg }}
                      />
                      <span>{metal}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selection (if sizes available) */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="uppercase tracking-wider font-medium text-ink">
                    Select Size: <strong>{selectedSize}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={openSizeGuide}
                    className="text-champagne-accessible font-semibold hover:underline text-[11px]"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-3.5 py-1.5 text-xs border transition-colors ${
                        selectedSize === size
                          ? "border-ink bg-ink text-ivory font-semibold"
                          : "border-border-subtle bg-ivory text-ink hover:border-ink"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pincode Delivery Estimator */}
            <div className="space-y-2 pt-2 border-t border-border-subtle">
              <label htmlFor="pincode-input" className="block text-xs uppercase tracking-wider font-medium text-ink">
                Check Delivery Date & Services
              </label>
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  id="pincode-input"
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value);
                    if (pincodeStatus !== "idle") setPincodeStatus("idle");
                  }}
                  placeholder="Enter 6-digit PIN code"
                  className="flex-1 px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-ink text-ivory text-xs uppercase tracking-wider font-semibold hover:bg-ink/80 transition-colors"
                >
                  {pincodeStatus === "checking" ? "Checking..." : "Check"}
                </button>
              </form>
              {pincodeStatus === "valid" && (
                <div className="flex items-center gap-1.5 text-xs text-[#2A6E4E] pt-1">
                  <Check size={14} />
                  <span>Complimentary insured transit to {pincode}. Estimated delivery: <strong>{deliveryDate}</strong>.</span>
                </div>
              )}
              {pincodeStatus === "invalid" && (
                <p className="text-xs text-[#B93826]">
                  Please enter a valid 6-digit Indian PIN code.
                </p>
              )}
            </div>

            {/* Primary Action CTAs */}
            <div className="space-y-3 pt-3">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => addToCart(product, 1, selectedSize, selectedMetal)}
                  className="btn-primary flex-1 py-4 text-xs font-semibold uppercase tracking-wider text-center"
                >
                  Add to Bag · {formatPriceINR(product.price)}
                </button>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.slug)}
                  aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                  className={`p-4 border transition-colors ${
                    inWishlist
                      ? "border-[#B93826] bg-[#B93826] text-ivory"
                      : "border-border-subtle bg-ivory text-ink hover:border-ink"
                  }`}
                >
                  <Heart size={18} fill={inWishlist ? "currentColor" : "none"} strokeWidth={1.5} />
                </button>
              </div>

              {/* Concierge & Video Call Triggers */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleWhatsAppEnquiry}
                  className="w-full flex items-center justify-center gap-2 py-3 px-3 border border-[#1B3B30] text-[#1B3B30] hover:bg-[#1B3B30] hover:text-ivory text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp Concierge</span>
                </button>

                <button
                  type="button"
                  onClick={handleVideoConsultation}
                  className="w-full flex items-center justify-center gap-2 py-3 px-3 border border-border-subtle bg-ivory-warm/40 text-ink hover:border-ink text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  <Video size={15} className="text-champagne-accessible" />
                  <span>Live Video Call</span>
                </button>
              </div>
            </div>

            {/* BlueStone / Ethera Trust Strip */}
            <div className="grid grid-cols-4 gap-2 py-4 border-y border-border-subtle text-center text-[10px] text-ink-muted">
              <div className="space-y-1">
                <Award size={18} className="mx-auto text-champagne-accessible" />
                <p className="font-semibold text-ink">100% IGI</p>
                <p className="text-[9px]">Certified</p>
              </div>
              <div className="space-y-1">
                <RotateCcw size={18} className="mx-auto text-champagne-accessible" />
                <p className="font-semibold text-ink">15-Day</p>
                <p className="text-[9px]">Easy Return</p>
              </div>
              <div className="space-y-1">
                <ShieldCheck size={18} className="mx-auto text-champagne-accessible" />
                <p className="font-semibold text-ink">Lifetime</p>
                <p className="text-[9px]">Buyback</p>
              </div>
              <div className="space-y-1">
                <Truck size={18} className="mx-auto text-champagne-accessible" />
                <p className="font-semibold text-ink">Insured</p>
                <p className="text-[9px]">Pan-India Transit</p>
              </div>
            </div>

            {/* Accordions */}
            <div className="divide-y divide-border-subtle border-b border-border-subtle">
              {/* Accordion 1: Transparent Price Breakup */}
              <div>
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === "price-breakup" ? null : "price-breakup")}
                  className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-wider font-semibold text-ink"
                >
                  <span>Transparent Price Breakup</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${activeAccordion === "price-breakup" ? "rotate-180" : ""}`}
                  />
                </button>
                {activeAccordion === "price-breakup" && (
                  <div className="pb-4 space-y-2 text-xs text-ink-muted">
                    <table className="w-full text-xs">
                      <tbody className="divide-y divide-border-subtle/50">
                        <tr>
                          <td className="py-2 text-ink-muted">
                            Gold Component ({product.purity} · {priceBreakup.goldWeight}g)
                          </td>
                          <td className="py-2 text-right font-medium text-ink">
                            {formatPriceINR(priceBreakup.goldValue)}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 text-ink-muted">
                            Diamond Component ({priceBreakup.diamondCarat}ct {product.stone})
                          </td>
                          <td className="py-2 text-right font-medium text-ink">
                            {formatPriceINR(priceBreakup.diamondValue)}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 text-ink-muted">Making & Crafting Charges</td>
                          <td className="py-2 text-right font-medium text-ink">
                            {formatPriceINR(priceBreakup.makingCharges)}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 text-ink-muted">Applicable GST (3%)</td>
                          <td className="py-2 text-right font-medium text-ink">
                            {formatPriceINR(priceBreakup.gst)}
                          </td>
                        </tr>
                        <tr className="border-t border-ink/20 font-semibold text-ink">
                          <td className="py-2.5">Total Amount Payable</td>
                          <td className="py-2.5 text-right font-serif text-sm">
                            {formatPriceINR(priceBreakup.total)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Accordion 2: Product Specifications */}
              <div>
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === "specs" ? null : "specs")}
                  className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-wider font-semibold text-ink"
                >
                  <span>Product Details & Specifications</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${activeAccordion === "specs" ? "rotate-180" : ""}`}
                  />
                </button>
                {activeAccordion === "specs" && (
                  <div className="pb-4 space-y-3 text-xs text-ink-muted">
                    <table className="w-full text-xs">
                      <tbody className="divide-y divide-border-subtle/50">
                        <tr>
                          <td className="py-2 text-ink-muted">Precious Metal</td>
                          <td className="py-2 text-right font-medium text-ink">
                            {selectedMetal} ({product.purity})
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 text-ink-muted">Stone Variety</td>
                          <td className="py-2 text-right font-medium text-ink">{product.stone}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-ink-muted">Stone Shape</td>
                          <td className="py-2 text-right font-medium text-ink">{product.shape}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-ink-muted">Diamond Color & Clarity</td>
                          <td className="py-2 text-right font-medium text-ink">
                            Color {product.color} · Clarity {product.clarity}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 text-ink-muted">Laboratory Certification</td>
                          <td className="py-2 text-right font-medium text-ink">{product.certificate}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-ink-muted">Gross Approx. Weight</td>
                          <td className="py-2 text-right font-medium text-ink">{product.weightGrams}g</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Official Certification Seals */}
                    <div className="mt-4 pt-3 border-t border-border-subtle grid sm:grid-cols-2 gap-3 p-3 bg-ivory-warm/40 border border-border-subtle/60">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-white p-1 flex items-center justify-center border border-border-subtle flex-shrink-0">
                          <Image
                            src="/images/certifications/igi-certified.png"
                            alt="IGI Certified Lab Grown Diamonds"
                            width={24}
                            height={24}
                            className="object-contain"
                          />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-ink leading-tight">IGI Certified Diamond</p>
                          <p className="text-[10px] text-ink-muted leading-tight">Laser inscribed serial</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 sm:border-l sm:border-border-subtle sm:pl-3">
                        <div className="w-8 h-8 rounded-full bg-white p-1 flex items-center justify-center border border-border-subtle flex-shrink-0">
                          <Image
                            src="/images/certifications/bis-hallmark.png"
                            alt="BIS Hallmark 750 (18K) Gold Hallmark"
                            width={28}
                            height={16}
                            className="object-contain"
                          />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-ink leading-tight">BIS Hallmark 750</p>
                          <p className="text-[10px] text-ink-muted leading-tight">Govt authenticated HUID</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 3: Shipping & Returns */}
              <div>
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === "shipping" ? null : "shipping")}
                  className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-wider font-semibold text-ink"
                >
                  <span>Complimentary Shipping, 15-Day Returns & Buyback</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${activeAccordion === "shipping" ? "rotate-180" : ""}`}
                  />
                </button>
                {activeAccordion === "shipping" && (
                  <div className="pb-4 space-y-2 text-xs text-ink-muted leading-relaxed">
                    <p>• Complimentary insured transit across India via BlueDart Apex and BVC Logistics.</p>
                    <p>• Tamper-proof security seal packaging accompanied by physical IGI certificate.</p>
                    <p>• 15-day easy returns on unworn pieces. 30-day complimentary ring resizing.</p>
                    <p>• Lifetime transparent exchange and buyback policy at prevailing market valuations.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Designs Row */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-10 border-t border-border-subtle space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-champagne">
                  Complementary Radiance
                </p>
                <h2 className="font-serif text-2xl md:text-3xl text-ink font-light">
                  Similar Designs
                </h2>
              </div>
              <Link
                href={`/shop?category=${encodeURIComponent(product.category)}`}
                className="text-xs uppercase tracking-widest text-champagne-accessible font-semibold hover:underline flex items-center gap-1"
              >
                <span>View All {product.category}</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed Row */}
        {recentProducts.length > 0 && (
          <section className="mt-16 pt-10 border-t border-border-subtle space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-champagne">
                Your Exploration History
              </p>
              <h2 className="font-serif text-2xl text-ink font-light">
                Recently Viewed Designs
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {recentProducts.map((rec) => (
                <ProductCard key={rec.id} product={rec} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Bottom Bar on Mobile for Instant Checkout */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-ivory-pure border-t border-border-subtle p-3 flex items-center justify-between gap-3 shadow-lg">
        <div>
          <p className="text-[11px] text-ink-muted leading-tight line-clamp-1">{product.name}</p>
          <p className="text-sm font-semibold text-ink">{formatPriceINR(product.price)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleWhatsAppEnquiry}
            className="p-3 border border-[#1B3B30] text-[#1B3B30] bg-ivory"
            aria-label="WhatsApp Enquiry"
          >
            <MessageCircle size={18} />
          </button>
          <button
            type="button"
            onClick={() => addToCart(product, 1, selectedSize, selectedMetal)}
            className="btn-primary py-3 px-5 text-xs font-semibold"
          >
            Add to Bag
          </button>
        </div>
      </div>
    </>
  );
}
