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
  HelpCircle,
  ArrowRight,
  Info,
  Clock,
  Layers,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import {
  PRODUCTS,
  ProductItem,
  MetalType,
  METAL_NAMES,
  CATEGORY_LABELS,
  getProductBySlug,
  getRelatedProducts,
  formatPriceINR,
} from "@/lib/products";
import { useAryoraStore } from "@/lib/store";

const RING_SIZES = ["6", "8", "10", "12", "14", "16", "18", "20", "22", "24"];

const METAL_SWATCHES: Record<MetalType, { bg: string; label: string }> = {
  YELLOW_GOLD: { bg: "#D4AF37", label: "18K Yellow Gold" },
  ROSE_GOLD: { bg: "#C98A7D", label: "18K Rose Gold" },
  WHITE_GOLD: { bg: "#D9D9D9", label: "18K White Gold" },
  CHAMPAGNE_GOLD: { bg: "#C5A059", label: "18K Champagne Gold" },
  SILVER_925: { bg: "#B0B0B0", label: "92.5 Sterling Silver" },
};

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const product = getProductBySlug(slug) || PRODUCTS[0];
  const relatedProducts = getRelatedProducts(product.slug, 4);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedMetal, setSelectedMetal] = useState<MetalType>(product.metalType);
  const [selectedSize, setSelectedSize] = useState<string>("12");
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
    .map((s) => PRODUCTS.find((p) => p.slug === s))
    .filter((p): p is ProductItem => Boolean(p))
    .slice(0, 4);

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
    }, 350);
  };

  const handleWhatsAppEnquiry = () => {
    const text = encodeURIComponent(
      `Hello Aryora Concierge, I would like to enquire about the ${product.name} (Code: ${product.productCode}, Metal: ${METAL_NAMES[selectedMetal] || selectedMetal}). Please share availability and customization options.`
    );
    window.open(`https://wa.me/918808828646?text=${text}`, "_blank");
  };

  const handleVideoConsultation = () => {
    const text = encodeURIComponent(
      `Hello Aryora Concierge, I would like to book a WhatsApp Video Consultation to view the ${product.name} (Code: ${product.productCode}) live.`
    );
    window.open(`https://wa.me/918808828646?text=${text}`, "_blank");
  };

  const productJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images.map((img) => `https://aryora-website-d3sv.vercel.app${img.url}`),
    description: product.description,
    sku: product.productCode,
    mpn: product.productCode,
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
      availability: "https://schema.org/InStock",
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

      <div className="bg-ivory min-h-screen">
        <div className="max-w-content mx-auto px-4 md:px-8 py-6 md:py-10">
          {/* Breadcrumb Navigation */}
          <Breadcrumbs
            items={[
              { label: "Shop", href: "/shop" },
              {
                label: CATEGORY_LABELS[product.category] || product.category,
                href: `/shop?category=${product.category}`,
              },
              { label: product.name },
            ]}
          />

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 pt-6">
            {/* ========================================================= */}
            {/* LEFT: Image Gallery & Interactive Zoom                     */}
            {/* ========================================================= */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Thumbnail strip on desktop */}
                {product.images.length > 1 && (
                  <div className="hidden md:flex md:col-span-2 flex-col space-y-3">
                    {product.images.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImageIndex(i)}
                        aria-label={`View photo ${i + 1} of ${product.name}`}
                        className={`relative aspect-square border overflow-hidden transition-all ${
                          activeImageIndex === i
                            ? "border-ink shadow-sm ring-1 ring-ink"
                            : "border-border-subtle opacity-70 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={img.url}
                          alt={img.altText || `${product.name} view ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="100px"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Main Image Stage with Zoom */}
                <div
                  className={`relative aspect-square bg-ivory-pure border border-border-subtle overflow-hidden ${
                    product.images.length > 1 ? "md:col-span-10" : "md:col-span-12"
                  }`}
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                  onMouseMove={handleMouseMove}
                >
                  <Image
                    src={product.images[activeImageIndex]?.url || "/images/hero-emerald.jpg"}
                    alt={product.images[activeImageIndex]?.altText || product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className={`object-cover transition-transform duration-200 ${
                      isZoomed ? "scale-150 cursor-crosshair" : "scale-100"
                    }`}
                    style={
                      isZoomed
                        ? {
                            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                          }
                        : undefined
                    }
                  />

                  {/* Floating Wishlist Button */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.slug)}
                    aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                    className="absolute top-4 right-4 p-3 bg-ivory-pure/90 backdrop-blur-sm rounded-full text-ink hover:text-champagne-accessible shadow-sm transition-all"
                  >
                    <Heart
                      size={20}
                      strokeWidth={1.5}
                      className={inWishlist ? "fill-champagne text-champagne" : "text-ink"}
                    />
                  </button>

                  {/* Certified Badges */}
                  <div className="absolute bottom-4 left-4 flex flex-col gap-1 items-start">
                    <span className="bg-ivory-pure/95 backdrop-blur-sm px-3 py-1 text-xs uppercase tracking-wider text-ink font-medium border border-border-subtle flex items-center gap-1.5 shadow-sm">
                      <Award size={14} className="text-champagne-accessible" />
                      IGI Certified · #LG-VERIFIED
                    </span>
                    {product.readyToShip && (
                      <span className="bg-ivory-pure/95 backdrop-blur-sm px-3 py-1 text-xs uppercase tracking-wider text-ink font-medium border border-border-subtle flex items-center gap-1.5 shadow-sm">
                        <Truck size={14} className="text-champagne-accessible" />
                        Ready to Ship
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile thumbnail slider */}
              {product.images.length > 1 && (
                <div className="flex md:hidden gap-3 overflow-x-auto pb-2">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImageIndex(i)}
                      className={`relative w-16 h-16 border flex-shrink-0 ${
                        activeImageIndex === i ? "border-ink ring-1 ring-ink" : "border-border-subtle opacity-70"
                      }`}
                    >
                      <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ========================================================= */}
            {/* RIGHT: Product Details, Pricing & Purchase Actions        */}
            {/* ========================================================= */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-champagne">
                  {product.productCode} · {product.specs.certification}
                </p>
                <h1 className="font-serif text-3xl md:text-4xl text-ink mt-1 font-light">
                  {product.name}
                </h1>

                {/* Price Display */}
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="font-serif text-2xl md:text-3xl text-ink font-medium">
                    {formatPriceINR(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-ink-light line-through">
                      {formatPriceINR(product.originalPrice)}
                    </span>
                  )}
                  <span className="text-xs text-ink-muted">(Inclusive of all taxes & 3% GST)</span>
                </div>
              </div>

              <p className="text-xs text-ink-muted leading-relaxed">
                {product.description}
              </p>

              {/* Metal & Purity Selector */}
              <div className="space-y-2 pt-3 border-t border-border-subtle">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-semibold text-ink">
                    Select Metal: <strong className="font-bold">{METAL_NAMES[selectedMetal]}</strong>
                  </span>
                  <span className="text-xs text-ink-muted">18K (750 Hallmark)</span>
                </div>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {product.availableMetals.map((metal) => {
                    const swatch = METAL_SWATCHES[metal];
                    const isSelected = selectedMetal === metal;
                    return (
                      <button
                        key={metal}
                        type="button"
                        onClick={() => setSelectedMetal(metal)}
                        className={`flex items-center space-x-2 px-3.5 py-2 border text-xs transition-all ${
                          isSelected
                            ? "border-ink bg-ivory-warm font-semibold shadow-sm"
                            : "border-border-subtle bg-ivory-pure text-ink-muted hover:border-border"
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block"
                          style={{ backgroundColor: swatch.bg }}
                        />
                        <span>{swatch.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ring Size Selector (if applicable) */}
              {product.category === "rings" && (
                <div className="space-y-2 pt-3 border-t border-border-subtle">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider font-semibold text-ink">
                      Ring Size (Indian standard): <strong className="font-bold">{selectedSize}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={openSizeGuide}
                      className="text-xs text-champagne-accessible hover:underline flex items-center gap-1 font-medium"
                    >
                      <HelpCircle size={13} /> Size Guide
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {RING_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`w-10 h-10 text-xs border flex items-center justify-center font-medium transition-all ${
                          selectedSize === size
                            ? "bg-ink text-ivory border-ink"
                            : "border-border-subtle bg-ivory-pure text-ink hover:border-ink"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons: Add to Bag, Video Consultation, WhatsApp */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => addToCart(product, 1, product.category === "rings" ? selectedSize : undefined)}
                  className="btn-primary w-full text-xs uppercase tracking-widest font-semibold py-4 shadow-sm"
                >
                  Add to Shopping Bag
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleVideoConsultation}
                    className="btn-outline text-xs font-medium py-3 flex items-center justify-center gap-1.5 border-champagne/60 text-champagne-accessible hover:border-champagne bg-ivory-warm/40"
                  >
                    <Video size={14} />
                    <span>Video Consultation</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppEnquiry}
                    className="btn-outline text-xs font-medium py-3 flex items-center justify-center gap-1.5 border-border-subtle hover:border-ink"
                  >
                    <MessageCircle size={14} className="text-[#1B3B30]" />
                    <span>WhatsApp Enquiry</span>
                  </button>
                </div>
              </div>

              {/* Delivery Estimator by Pincode */}
              <div className="p-4 bg-ivory-pure border border-border-subtle space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-medium text-ink">
                  <Truck size={16} className="text-champagne-accessible" />
                  <span>Check Delivery Date by Pincode</span>
                </div>
                <form onSubmit={handleCheckPincode} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit Indian Pincode"
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value);
                      if (pincodeStatus !== "idle") setPincodeStatus("idle");
                    }}
                    className="flex-1 px-3 py-2 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-champagne"
                  />
                  <button
                    type="submit"
                    disabled={pincodeStatus === "checking"}
                    className="px-4 py-2 border border-ink text-xs uppercase tracking-wider font-semibold text-ink hover:bg-ink hover:text-ivory transition-colors"
                  >
                    {pincodeStatus === "checking" ? "Checking..." : "Verify"}
                  </button>
                </form>

                {pincodeStatus === "valid" && (
                  <div className="text-xs text-[#2A6E4E] flex items-center gap-1.5 pt-1">
                    <Check size={14} />
                    <span>
                      Delivery available by <strong>{deliveryDate}</strong>. Free Insured Courier.
                    </span>
                  </div>
                )}
                {pincodeStatus === "invalid" && (
                  <p className="text-xs text-[#B93826]">
                    Please enter a valid 6-digit Indian PIN code.
                  </p>
                )}
              </div>

              {/* BlueStone Trust Badges Strip */}
              <div className="grid grid-cols-4 gap-2 py-4 border-y border-border-subtle text-center text-[10px] text-ink-muted">
                <div className="space-y-1">
                  <Award size={18} className="mx-auto text-champagne-accessible" />
                  <p className="font-semibold text-ink">100% IGI</p>
                  <p className="text-[9px]">Certified</p>
                </div>
                <div className="space-y-1">
                  <RotateCcw size={18} className="mx-auto text-champagne-accessible" />
                  <p className="font-semibold text-ink">7-Day</p>
                  <p className="text-[9px]">Easy Returns</p>
                </div>
                <div className="space-y-1">
                  <ShieldCheck size={18} className="mx-auto text-champagne-accessible" />
                  <p className="font-semibold text-ink">Lifetime</p>
                  <p className="text-[9px]">Buyback</p>
                </div>
                <div className="space-y-1">
                  <Truck size={18} className="mx-auto text-champagne-accessible" />
                  <p className="font-semibold text-ink">Free</p>
                  <p className="text-[9px]">Insured Shipping</p>
                </div>
              </div>

              {/* ========================================================= */}
              {/* ACCORDION: Transparent Price Breakup (Indian Standard)   */}
              {/* ========================================================= */}
              <div className="divide-y divide-border-subtle border-b border-border-subtle">
                {/* 1. Transparent Price Breakup */}
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveAccordion(
                        activeAccordion === "price-breakup" ? null : "price-breakup"
                      )
                    }
                    className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-wider font-semibold text-ink"
                    aria-expanded={activeAccordion === "price-breakup"}
                  >
                    <span className="flex items-center space-x-1.5">
                      <Layers size={14} className="text-champagne-accessible" />
                      <span>Transparent Price Breakup</span>
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        activeAccordion === "price-breakup" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {activeAccordion === "price-breakup" && (
                    <div className="pb-4 space-y-3 text-xs bg-ivory-warm/40 p-4 border border-border-subtle">
                      <table className="w-full text-xs">
                        <tbody className="divide-y divide-border-subtle/50">
                          <tr>
                            <td className="py-2 text-ink-muted">
                              Gold Component ({product.priceBreakup.goldWeightGrams}g @ ₹{product.priceBreakup.goldRatePerGram}/g)
                            </td>
                            <td className="py-2 text-right font-medium text-ink">
                              {formatPriceINR(product.priceBreakup.goldValue)}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-ink-muted">
                              Lab Diamond ({product.priceBreakup.diamondCarats}ct IGI Certified)
                            </td>
                            <td className="py-2 text-right font-medium text-ink">
                              {formatPriceINR(product.priceBreakup.diamondValue)}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-ink-muted">Making & Atelier Crafting Charges</td>
                            <td className="py-2 text-right font-medium text-ink">
                              {formatPriceINR(product.priceBreakup.makingCharges)}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-ink-muted">Applicable GST (3%)</td>
                            <td className="py-2 text-right font-medium text-ink">
                              {formatPriceINR(product.priceBreakup.gst)}
                            </td>
                          </tr>
                          <tr className="border-t-2 border-border font-semibold text-ink">
                            <td className="py-2.5">Total Transparent Price</td>
                            <td className="py-2.5 text-right font-serif text-base text-champagne-accessible">
                              {formatPriceINR(product.priceBreakup.total)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <p className="text-[10px] text-ink-light pt-1">
                        *Rates benchmarked daily against verified bullion standards. Zero hidden costs.
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. Gemological Specifications */}
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveAccordion(activeAccordion === "specs" ? null : "specs")
                    }
                    className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-wider font-semibold text-ink"
                    aria-expanded={activeAccordion === "specs"}
                  >
                    <span>Gemological & Metal Specifications</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        activeAccordion === "specs" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {activeAccordion === "specs" && (
                    <div className="pb-4 space-y-2 text-xs text-ink-muted leading-relaxed">
                      <table className="w-full text-xs">
                        <tbody className="divide-y divide-border-subtle/50">
                          <tr>
                            <td className="py-2 text-ink-muted">Metal & Purity</td>
                            <td className="py-2 text-right font-medium text-ink">
                              {METAL_NAMES[selectedMetal]} ({product.specs.purity})
                            </td>
                          </tr>
                          {product.specs.diamondCarat && (
                            <tr>
                              <td className="py-2 text-ink-muted">Total Diamond Carat</td>
                              <td className="py-2 text-right font-medium text-ink">
                                {product.specs.diamondCarat}
                              </td>
                            </tr>
                          )}
                          {product.specs.diamondColor && (
                            <tr>
                              <td className="py-2 text-ink-muted">Diamond Color Grade</td>
                              <td className="py-2 text-right font-medium text-ink">
                                {product.specs.diamondColor}
                              </td>
                            </tr>
                          )}
                          {product.specs.diamondClarity && (
                            <tr>
                              <td className="py-2 text-ink-muted">Diamond Clarity</td>
                              <td className="py-2 text-right font-medium text-ink">
                                {product.specs.diamondClarity}
                              </td>
                            </tr>
                          )}
                          <tr>
                            <td className="py-2 text-ink-muted">Independent Grading Dossier</td>
                            <td className="py-2 text-right font-medium text-ink">
                              {product.specs.certification}
                            </td>
                          </tr>
                          {product.specs.grossWeight && (
                            <tr>
                              <td className="py-2 text-ink-muted">Approx. Gross Weight</td>
                              <td className="py-2 text-right font-medium text-ink">
                                {product.specs.grossWeight}
                              </td>
                            </tr>
                          )}
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
                            <p className="text-[10px] text-ink-muted leading-tight">Physical report & laser inscribed serial</p>
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
                            <p className="text-[10px] text-ink-muted leading-tight">18K gold purity with govt HUID</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Shipping & Warranty */}
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveAccordion(activeAccordion === "shipping" ? null : "shipping")
                    }
                    className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-wider font-semibold text-ink"
                    aria-expanded={activeAccordion === "shipping"}
                  >
                    <span>Complimentary Shipping & Returns</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        activeAccordion === "shipping" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {activeAccordion === "shipping" && (
                    <div className="pb-4 space-y-2 text-xs text-ink-muted leading-relaxed">
                      <p>• Complimentary insured courier transit across India via BlueDart Apex and BVC Logistics.</p>
                      <p>• Housed in tamper-evident sealed packaging accompanied by physical IGI certificate.</p>
                      <p>• 7-day hassle-free returns on unworn pieces. 30-day complimentary ring resizing.</p>
                      <p>• Lifetime transparent buyback and upgrade options based on prevailing market valuations.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SIMILAR DESIGNS SECTION (BlueStone Feature)                */}
          {/* ========================================================= */}
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
                href={`/shop?category=${product.category}`}
                className="text-xs uppercase tracking-widest text-champagne-accessible font-semibold hover:underline flex items-center gap-1"
              >
                <span>View All {CATEGORY_LABELS[product.category]}</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>

          {/* ========================================================= */}
          {/* RECENTLY VIEWED ROW (BlueStone Feature)                   */}
          {/* ========================================================= */}
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
      </div>

      {/* ========================================================= */}
      {/* MOBILE STICKY ADD TO CART BAR                             */}
      {/* ========================================================= */}
      <div className="fixed bottom-12 left-0 right-0 z-40 bg-ivory-pure/95 backdrop-blur-md border-t border-border-subtle p-3 lg:hidden flex items-center justify-between gap-3 shadow-lg">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-serif text-ink truncate">
            {product.name}
          </p>
          <p className="text-xs font-semibold text-ink">
            {formatPriceINR(product.price)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => addToCart(product, 1, product.category === "rings" ? selectedSize : undefined)}
          className="btn-primary text-xs px-5 py-2.5 whitespace-nowrap"
        >
          Add to Bag
        </button>
      </div>
    </>
  );
}
