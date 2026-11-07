"use client";

import { useState, useEffect, useMemo } from "react";
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
import { calculateDynamicPrice, getDailyMetalRates, MetalRates } from "@/lib/metalRates";
import { getActiveCustomer, toggleCustomerWishlist } from "@/lib/customerStore";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const allProducts = getAllProducts();
  const product = (slug ? getProductBySlug(slug) : undefined) || allProducts[0];

  const relatedProducts = getProductsByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const isSilver =
    (product.metal && product.metal.toLowerCase().includes("silver")) ||
    (product.purity && (product.purity.toLowerCase().includes("silver") || product.purity.includes("925"))) ||
    (product.category && (product.category.toLowerCase().includes("silver") || product.category.toLowerCase().includes("anklet") || product.category.toLowerCase().includes("payal"))) ||
    (product.subcategory && (product.subcategory.toLowerCase().includes("silver") || product.subcategory.toLowerCase().includes("payal"))) ||
    (product.name && (product.name.toLowerCase().includes("silver") || product.name.toLowerCase().includes("payal"))) ||
    Boolean(product.isAntiTarnish) ||
    (Array.isArray(product.tags) && product.tags.some(t => typeof t === "string" && (t.toLowerCase().includes("silver") || t.toLowerCase().includes("payal"))));

  const isAntiTarnish = Boolean(
    product.isAntiTarnish ||
    product.waterproof ||
    (product.category && product.category.toLowerCase().includes("anti-tarnish")) ||
    (product.subcategory && product.subcategory.toLowerCase().includes("anti-tarnish")) ||
    (product.purity && product.purity.toLowerCase().includes("pvd")) ||
    (product.metal && (product.metal.toLowerCase().includes("stainless") || product.metal.toLowerCase().includes("steel"))) ||
    (Array.isArray(product.tags) && product.tags.some(t => typeof t === "string" && (t.toLowerCase().includes("anti-tarnish") || t.toLowerCase().includes("waterproof"))))
  );

  // Multi-image list (guaranteed 4 images)
  const productImages = useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    return [
      "/products/ring-01-a.jpg",
      "/products/ring-01-b.jpg",
      "/products/ring-01-c.jpg",
      "/products/ring-01-d.jpg",
    ];
  }, [product.images]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Platings options (Only for Gold / Fine Jewellery; completely omitted for Silver/Payal/Anti-Tarnish)
  const platings = useMemo(() => {
    if (isSilver) return [];
    if (product.platings && product.platings.length > 0) {
      return product.platings;
    }
    return ["18K YELLOW GOLD", "18K ROSE GOLD", "18K WHITE GOLD"];
  }, [product.platings, isSilver]);

  const [selectedPlating, setSelectedPlating] = useState<string>(platings[0] || "");

  // Carat size options (Only for Gold / Diamond Solitaires with multiple carat options; completely omitted for Silver)
  const caratOptions = useMemo(() => {
    if (isSilver) return [];
    if (product.caratOptions && product.caratOptions.length > 1) {
      return product.caratOptions;
    }
    return [];
  }, [product.caratOptions, isSilver]);

  const [selectedCarat, setSelectedCarat] = useState<number>(
    caratOptions[0] || product.carat || 0
  );

  const [rates, setRates] = useState<MetalRates>(getDailyMetalRates());

  useEffect(() => {
    setRates(getDailyMetalRates());
    const handleRatesUpdate = () => setRates(getDailyMetalRates());
    window.addEventListener("ayor_metal_rates_updated", handleRatesUpdate);
    return () => window.removeEventListener("ayor_metal_rates_updated", handleRatesUpdate);
  }, []);

  const dynamicPricing = useMemo(() => {
    return calculateDynamicPrice(product, rates);
  }, [product, rates]);

  // Dynamic pricing based on daily metal rates and carat selection
  const currentPrice = useMemo(() => {
    const basePrice = dynamicPricing.finalPrice;
    const baseCarat = product.carat || 1;
    if (selectedCarat && baseCarat && selectedCarat !== baseCarat) {
      const scaled = Math.round(
        (basePrice * Math.pow(selectedCarat / baseCarat, 0.72)) / 100
      ) * 100 - 1;
      return Math.max(2499, scaled);
    }
    return basePrice;
  }, [dynamicPricing.finalPrice, product.carat, selectedCarat]);

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes?.[0] || "12"
  );
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<
    "idle" | "checking" | "valid" | "invalid"
  >("idle");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [activeAccordion, setActiveAccordion] = useState<string | null>(
    "price-breakup"
  );
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const {
    addToCart,
    openCart,
    toggleWishlist,
    isInWishlist,
    openSizeGuide,
    recentlyViewed,
    addRecentlyViewed,
  } = useAryoraStore();

  const inWishlist = isInWishlist(product.slug);

  // Reset selected options when product slug changes
  useEffect(() => {
    setActiveImageIndex(0);
    if (platings.length > 0) setSelectedPlating(platings[0]);
    if (caratOptions.length > 0) setSelectedCarat(caratOptions[0]);
    setQuantity(1);
  }, [product.slug, platings, caratOptions]);

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

  const priceBreakup = calculatePriceBreakup(product, currentPrice);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
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
      `Hello AYOR team, I would like to enquire about ${product.name} (SKU: ${product.sku || product.id}, Plating: ${selectedPlating}, Carat: ${selectedCarat}ct). Please share details and customization options.`
    );
    window.open(`https://wa.me/918808828646?text=${text}`, "_blank");
  };

  const handleVideoConsultation = () => {
    const text = encodeURIComponent(
      `Hello AYOR team, I would like to book a WhatsApp Video Call to view ${product.name} (SKU: ${product.sku || product.id}) live.`
    );
    window.open(`https://wa.me/918808828646?text=${text}`, "_blank");
  };

  const handleAddToCart = () => {
    const customizedProduct = {
      ...product,
      price: currentPrice,
      carat: selectedCarat,
    };
    addToCart(customizedProduct, quantity, selectedSize, selectedPlating);
    openCart();
  };

  const currentImage = productImages[activeImageIndex] || productImages[0];

  const originalPrice =
    product.discountPercent > 0
      ? Math.round(currentPrice / (1 - product.discountPercent / 100))
      : null;

  // JSON-LD structured data
  const productJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: productImages.map(
      (img) => `https://aryora-website-d3sv.vercel.app${img}`
    ),
    description: product.description,
    sku: product.sku || product.id,
    mpn: product.sku || product.id,
    brand: {
      "@type": "Brand",
      name: "Ayor",
    },
    offers: {
      "@type": "Offer",
      url: `https://aryora-website-d3sv.vercel.app/product/${product.slug}`,
      priceCurrency: "INR",
      price: currentPrice,
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Ayor Fine Jewellery",
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
        {/* Miss Jo Style Breadcrumbs */}
        <div className="text-xs text-[#7A7A7A] mb-6 font-light">
          <Link href="/" className="hover:text-[#1A1A1A] transition-colors">
            Home
          </Link>
          <span className="mx-2 text-[#DDD8D0]">&gt;</span>
          <Link
            href={`/shop?category=${encodeURIComponent(product.category)}`}
            className="hover:text-[#1A1A1A] transition-colors"
          >
            {product.category}
          </Link>
          <span className="mx-2 text-[#DDD8D0]">&gt;</span>
          <span className="text-[#1A1A1A] font-normal">{product.name}</span>
        </div>

        {/* Main Product Grid */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 my-4">
          {/* ========================================================= */}
          {/* LEFT: 4-IMAGE VERTICAL THUMBNAIL RAIL & INTERACTIVE ZOOM  */}
          {/* ========================================================= */}
          <div className="lg:col-span-7">
            <div className="flex flex-col-reverse md:flex-row gap-4 items-start">
              {/* Vertical Thumbnail Rail (Miss Jo Style) */}
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 w-full md:w-20 flex-shrink-0">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 md:w-20 md:h-20 bg-white border flex-shrink-0 overflow-hidden transition-all ${
                      activeImageIndex === idx
                        ? "border-[#1A1A1A] ring-1 ring-[#1A1A1A]"
                        : "border-[#DDD8D0] opacity-80 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Main Interactive Zoom Stage */}
              <div
                className="relative flex-1 aspect-square bg-[#FDFBF9] border border-[#DDD8D0] overflow-hidden cursor-crosshair group shadow-sm w-full"
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
                  {product.isComingSoon ? (
                    <span className="bg-[#B8860B] text-white text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 shadow-sm flex items-center gap-1">
                      <Clock size={12} />
                      <span>Coming Soon · Launching Shortly</span>
                    </span>
                  ) : (
                    <>
                      {product.isBestseller && (
                        <span className="bg-[#1A1A1A] text-white text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 shadow-sm">
                          Bestseller
                        </span>
                      )}
                      <span className="bg-[#108474] text-white text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 shadow-sm">
                        In Stock · Ready to Ship
                      </span>
                    </>
                  )}
                  {product.discountPercent > 0 && !product.isComingSoon && (
                    <span className="bg-[#A32D2D] text-white text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 shadow-sm">
                      {product.discountPercent}% OFF
                    </span>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 pointer-events-none">
                  <span className="bg-white/95 backdrop-blur-sm px-3 py-1 text-xs uppercase tracking-wider text-[#1A1A1A] font-medium border border-[#DDD8D0] flex items-center gap-1.5 shadow-sm">
                    <Award size={14} className="text-[#108474]" />
                    <span>{product.certificate}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: BUYING PANEL (Miss Jo Luxury Editorial Layout)     */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header info matching Miss Jo */}
            <div className="space-y-2 border-b border-[#DDD8D0] pb-5">
              <span className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#C09981]">
                {product.category} · {product.subcategory}
              </span>

              <h1 className="font-serif text-2xl md:text-3xl text-[#1A1A1A] font-light leading-snug">
                {product.name ? product.name.replace(/\bPRAO\b/gi, "AYOR") : "AYOR Jewellery"}
              </h1>

              <div className="text-xs text-[#7A7A7A] tracking-wider pt-0.5">
                SKU: {product.sku || product.id.toUpperCase()}
              </div>

              {/* Price Block */}
              <div className="pt-3 space-y-1">
                <div className="flex items-baseline space-x-3 flex-wrap">
                  <span className="font-serif text-2xl md:text-3xl font-normal text-[#111111]">
                    {formatPriceINR(currentPrice)}
                  </span>
                  {product.mrp && product.mrp > currentPrice ? (
                    <>
                      <span className="line-through text-base text-[#888888]">
                        ₹{product.mrp.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs font-semibold text-[#B93826] bg-red-50 px-2 py-0.5 rounded">
                        {Math.round(((product.mrp - currentPrice) / product.mrp) * 100)}% OFF
                      </span>
                    </>
                  ) : null}
                </div>
                <p className="text-xs text-[#7A7A7A] font-light">
                  Price inclusive of all taxes · Complimentary insured delivery
                </p>
              </div>

              {/* Stone & Purity Badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF7F2] border border-[#E5E0D8] text-[11px] font-medium text-[#111111] rounded-full">
                  <Gem size={12} className="text-[#C09981]" />
                  <span>{product.stone}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E5E0D8] text-[11px] font-medium text-[#0E382B] rounded-full">
                  <Award size={12} />
                  <span>{product.purity}</span>
                </span>
              </div>
            </div>

            {/* PLATING Selection (Only for Gold / Non-Silver items with multiple platings defined) */}
            {!isSilver && product.platings && product.platings.length > 1 && (
              <div className="space-y-2.5">
                <div className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
                  PLATING:
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {platings.map((plating) => {
                    const isSelected = selectedPlating === plating;
                    return (
                      <button
                        key={plating}
                        type="button"
                        onClick={() => setSelectedPlating(plating)}
                        className={`px-5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#0E382B] text-white border border-[#0E382B] shadow-sm"
                            : "bg-white text-[#111111] border border-[#DDD8D0] hover:border-[#0E382B]"
                        }`}
                      >
                        {plating}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CARAT SIZE Selection (Only for Gold / Diamond Solitaires with multiple carat options) */}
            {!isSilver && product.caratOptions && product.caratOptions.length > 1 && (
              <div className="space-y-2.5">
                <div className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
                  CARAT SIZE:
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {caratOptions.map((ct) => {
                    const isSelected = selectedCarat === ct;
                    return (
                      <button
                        key={ct}
                        type="button"
                        onClick={() => setSelectedCarat(ct)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#0E382B] text-white border border-[#0E382B] shadow-sm"
                            : "bg-white text-[#111111] border border-[#DDD8D0] hover:border-[#0E382B]"
                        }`}
                      >
                        {ct} CT
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection (for rings) */}
            {product.sizes && product.sizes.length > 0 && product.sizes[0] !== "One Size" && (
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="uppercase tracking-wider font-semibold text-[#111111]">
                    RING SIZE: <strong>{selectedSize}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={openSizeGuide}
                    className="text-[#C09981] font-semibold hover:underline text-[11px] cursor-pointer"
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
                      className={`px-4 py-2 text-xs border rounded-xl transition-all cursor-pointer ${
                        selectedSize === size
                          ? "border-[#0E382B] bg-[#0E382B] text-white font-semibold shadow-xs"
                          : "border-[#DDD8D0] bg-white text-[#111111] hover:border-[#0E382B]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper + ADD TO BAG + WISHLIST */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-[#DDD8D0] bg-white h-12 w-32 justify-between px-3 rounded-xl flex-shrink-0 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                    className="text-lg text-[#111111] px-2 hover:opacity-70 font-light select-none cursor-pointer"
                  >
                    –
                  </button>
                  <span className="text-xs font-semibold text-[#111111]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Increase quantity"
                    className="text-lg text-[#111111] px-2 hover:opacity-70 font-light select-none cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* ADD TO BAG / COMING SOON Button */}
                {product.isComingSoon ? (
                  <button
                    type="button"
                    onClick={handleWhatsAppEnquiry}
                    className="flex-1 h-12 bg-[#0E382B]/85 hover:bg-[#0E382B] text-white font-semibold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <Clock size={16} />
                    <span>Coming Soon · Enquire on WhatsApp</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 h-12 bg-[#0E382B] hover:bg-[#144636] text-white font-semibold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center transition-all shadow-md hover:shadow-lg cursor-pointer"
                  >
                    ADD TO BAG · {formatPriceINR(currentPrice * quantity)}
                  </button>
                )}

                {/* WISHLIST Button */}
                <button
                  type="button"
                  onClick={() => {
                    const customer = getActiveCustomer();
                    if (!customer) {
                      if (typeof window !== "undefined") {
                        localStorage.setItem("ayor_pending_wishlist_slug", product.slug);
                        window.dispatchEvent(new Event("ayor_replay_welcome"));
                      }
                      return;
                    }
                    toggleWishlist(product.slug);
                    toggleCustomerWishlist(customer.customerId, product.slug);
                  }}
                  aria-label={
                    inWishlist ? "Remove from wishlist" : "Add to wishlist"
                  }
                  className={`h-12 px-6 border font-semibold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 transition-all flex-shrink-0 cursor-pointer ${
                    inWishlist
                      ? "border-[#C09981] bg-[#C09981] text-white shadow-sm"
                      : "border-[#DDD8D0] bg-white text-[#111111] hover:bg-[#FAF7F2] hover:border-[#0E382B]"
                  }`}
                >
                  <Heart
                    size={16}
                    fill={inWishlist ? "currentColor" : "none"}
                    strokeWidth={1.5}
                  />
                  <span>WISHLIST</span>
                </button>
              </div>

              {/* WhatsApp & Video Call Triggers */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleWhatsAppEnquiry}
                  className="w-full flex items-center justify-center gap-2 py-3 px-3 border border-[#DDD8D0] bg-white text-[#111111] hover:bg-[#FAF7F2] rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
                >
                  <MessageCircle size={15} className="text-[#25D366]" />
                  <span>Order on WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleVideoConsultation}
                  className="w-full flex items-center justify-center gap-2 py-3 px-3 border border-[#DDD8D0] bg-[#FAF7F2] text-[#111111] hover:border-[#0E382B] rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
                >
                  <Video size={15} className="text-[#C09981]" />
                  <span>Live Video Call</span>
                </button>
              </div>
            </div>

            {/* Pincode Delivery Estimator */}
            <div className="space-y-2 pt-2 border-t border-[#DDD8D0]">
              <label
                htmlFor="pincode-input"
                className="block text-xs uppercase tracking-wider font-semibold text-[#111111]"
              >
                Check Delivery Date &amp; Services
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
                  className="flex-1 px-3.5 py-2.5 text-xs border border-[#DDD8D0] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#0E382B]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0E382B] hover:bg-[#144636] text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  {pincodeStatus === "checking" ? "Checking..." : "Check"}
                </button>
              </form>
              {pincodeStatus === "valid" && (
                <div className="flex items-center gap-1.5 text-xs text-[#0E382B] pt-1">
                  <Check size={14} className="text-[#0E382B]" />
                  <span>
                    Complimentary insured transit to {pincode}. Estimated delivery:{" "}
                    <strong>{deliveryDate}</strong>.
                  </span>
                </div>
              )}
              {pincodeStatus === "invalid" && (
                <p className="text-xs text-red-600">
                  Please enter a valid 6-digit Indian PIN code.
                </p>
              )}
            </div>

            {/* Miss Jo / Ayor 4-Pillar Trust Strip */}
            <div className="grid grid-cols-4 gap-2 py-4 border-y border-[#DDD8D0] text-center text-[10px] text-[#7A7A7A]">
              <div className="space-y-1">
                <Award size={18} className="mx-auto text-[#108474]" />
                <p className="font-semibold text-[#1A1A1A]">
                  {isSilver ? "925 BIS" : "100% IGI"}
                </p>
                <p className="text-[9px]">Certified</p>
              </div>
              <div className="space-y-1">
                <RotateCcw size={18} className="mx-auto text-[#108474]" />
                <p className="font-semibold text-[#1A1A1A]">15-Day</p>
                <p className="text-[9px]">Easy Return</p>
              </div>
              <div className="space-y-1">
                <ShieldCheck size={18} className="mx-auto text-[#108474]" />
                <p className="font-semibold text-[#1A1A1A]">Lifetime</p>
                <p className="text-[9px]">
                  {isSilver ? "Plating Warranty" : "Buyback"}
                </p>
              </div>
              <div className="space-y-1">
                <Truck size={18} className="mx-auto text-[#108474]" />
                <p className="font-semibold text-[#1A1A1A]">Insured</p>
                <p className="text-[9px]">Pan-India Transit</p>
              </div>
            </div>

            {/* Collapsible Accordions */}
            <div className="divide-y divide-[#DDD8D0] border-b border-[#DDD8D0]">
              {/* Accordion 1: Transparent Price Breakup */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setActiveAccordion(
                      activeAccordion === "price-breakup"
                        ? null
                        : "price-breakup"
                    )
                  }
                  className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-wider font-semibold text-[#1A1A1A]"
                >
                  <span>Transparent Price Breakup</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      activeAccordion === "price-breakup" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeAccordion === "price-breakup" && (
                  <div className="pb-4 space-y-2 text-xs text-[#7A7A7A]">
                    {isAntiTarnish ? (
                      <table className="w-full text-xs">
                        <tbody className="divide-y divide-[#DDD8D0]/50">
                          <tr>
                            <td className="py-2 text-[#7A7A7A]">Base Product Value (316L Surgical Steel &amp; PVD)</td>
                            <td className="py-2 text-right font-medium text-[#1A1A1A]">
                              {formatPriceINR(Math.round(currentPrice / 1.03))}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-[#7A7A7A]">Applicable GST (3% Included)</td>
                            <td className="py-2 text-right font-medium text-[#1A1A1A]">
                              {formatPriceINR(currentPrice - Math.round(currentPrice / 1.03))}
                            </td>
                          </tr>
                          <tr className="border-t border-[#1A1A1A]/20 font-semibold text-[#1A1A1A]">
                            <td className="py-2.5">Total Amount Payable</td>
                            <td className="py-2.5 text-right font-serif text-sm">
                              {formatPriceINR(currentPrice)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    ) : (
                      <table className="w-full text-xs">
                        <tbody className="divide-y divide-[#DDD8D0]/50">
                          <tr>
                            <td className="py-2 text-[#7A7A7A]">
                              {priceBreakup.metalLabel} ({product.purity} · {priceBreakup.metalWeight}g)
                            </td>
                            <td className="py-2 text-right font-medium text-[#1A1A1A]">
                              {formatPriceINR(priceBreakup.metalValue)}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-[#7A7A7A]">
                              {priceBreakup.stoneLabel} ({selectedCarat} CT)
                            </td>
                            <td className="py-2 text-right font-medium text-[#1A1A1A]">
                              {formatPriceINR(priceBreakup.stoneValue)}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-[#7A7A7A]">
                              Artisan Crafting &amp; Finish Charges
                            </td>
                            <td className="py-2 text-right font-medium text-[#1A1A1A]">
                              {formatPriceINR(priceBreakup.makingCharges)}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-[#7A7A7A]">
                              Applicable GST (3%)
                            </td>
                            <td className="py-2 text-right font-medium text-[#1A1A1A]">
                              {formatPriceINR(priceBreakup.gst)}
                            </td>
                          </tr>
                          <tr className="border-t border-[#1A1A1A]/20 font-semibold text-[#1A1A1A]">
                            <td className="py-2.5">Total Amount Payable</td>
                            <td className="py-2.5 text-right font-serif text-sm">
                              {formatPriceINR(priceBreakup.total)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion 2: Product Specifications */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setActiveAccordion(
                      activeAccordion === "specs" ? null : "specs"
                    )
                  }
                  className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-wider font-semibold text-[#1A1A1A]"
                >
                  <span>Product Details & Specifications</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      activeAccordion === "specs" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeAccordion === "specs" && (
                  <div className="pb-4 space-y-3 text-xs text-[#7A7A7A]">
                    <table className="w-full text-xs">
                      <tbody className="divide-y divide-[#DDD8D0]/50">
                        <tr>
                          <td className="py-2 text-[#7A7A7A]">SKU Reference</td>
                          <td className="py-2 text-right font-mono font-medium text-[#1A1A1A]">
                            {product.sku || product.id.toUpperCase()}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#7A7A7A]">Base Metal</td>
                          <td className="py-2 text-right font-medium text-[#1A1A1A]">
                            {product.metal} ({product.purity})
                          </td>
                        </tr>
                        {!isSilver && selectedPlating && (
                          <tr>
                            <td className="py-2 text-[#7A7A7A]">Selected Plating</td>
                            <td className="py-2 text-right font-medium text-[#111111]">
                              {selectedPlating}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td className="py-2 text-[#7A7A7A]">Stone Variety</td>
                          <td className="py-2 text-right font-medium text-[#111111]">
                            {product.stone}
                          </td>
                        </tr>
                        {!isSilver && selectedCarat > 0 && (
                          <tr>
                            <td className="py-2 text-[#7A7A7A]">Carat Weight</td>
                            <td className="py-2 text-right font-medium text-[#111111]">
                              {selectedCarat} CT
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td className="py-2 text-[#7A7A7A]">Stone Shape</td>
                          <td className="py-2 text-right font-medium text-[#111111]">
                            {product.shape} Brilliant Cut
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#7A7A7A]">Certification</td>
                          <td className="py-2 text-right font-medium text-[#111111]">
                            {product.certificate}
                          </td>
                        </tr>
                        {product.weightGrams && product.weightGrams > 0 ? (
                          <tr>
                            <td className="py-2 text-[#7A7A7A]">Approx Weight</td>
                            <td className="py-2 text-right font-medium text-[#111111]">
                              {product.weightGrams}g
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Accordion 3: Shipping & Returns */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setActiveAccordion(
                      activeAccordion === "shipping" ? null : "shipping"
                    )
                  }
                  className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-wider font-semibold text-[#111111]"
                >
                  <span>Shipping &amp; 7-Day Returns</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      activeAccordion === "shipping" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeAccordion === "shipping" && (
                  <div className="pb-4 space-y-2 text-xs text-[#666666] leading-relaxed">
                    <p>
                      • <strong>24–48 Hours Dispatch:</strong> Quality checked, authenticated and securely dispatched with live tracking.
                    </p>
                    <p>
                      • <strong>Complimentary Insured Courier:</strong> 100% transit-insured domestic delivery via BlueDart Apex and BVC Logistics.
                    </p>
                    <p>
                      • <strong>7-Day Easy Returns:</strong> Hassle-free return policy for unused, unworn pieces in original tamper-evident presentation box.
                    </p>
                    <p>
                      • <strong>Fast 48h Refund:</strong> Direct refunds initiated within 48 hours of inspection to original payment source.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Designs Row */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-10 border-t border-[#DDD8D0] space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#C09981]">
                  Complementary Radiance
                </p>
                <h2 className="font-serif text-2xl md:text-3xl text-[#1A1A1A] font-light">
                  Similar Designs
                </h2>
              </div>
              <Link
                href={`/shop?category=${encodeURIComponent(product.category)}`}
                className="text-xs uppercase tracking-widest text-[#C09981] font-semibold hover:underline flex items-center gap-1"
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
          <section className="mt-16 pt-10 border-t border-[#DDD8D0] space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#C09981]">
                Your Exploration History
              </p>
              <h2 className="font-serif text-2xl text-[#1A1A1A] font-light">
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
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#DDD8D0] p-3 flex items-center justify-between gap-3 shadow-lg">
        <div>
          <p className="text-[11px] text-[#7A7A7A] leading-tight line-clamp-1">
            {product.name}
          </p>
          <p className="text-sm font-semibold text-[#1A1A1A]">
            {formatPriceINR(currentPrice * quantity)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleWhatsAppEnquiry}
            className="p-3 border border-[#DDD8D0] text-[#111111] bg-white rounded-xl shadow-2xs"
            aria-label="WhatsApp Enquiry"
          >
            <MessageCircle size={18} className="text-[#25D366]" />
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            className="bg-[#0E382B] hover:bg-[#144636] text-white py-3 px-5 text-xs font-semibold rounded-xl shadow-md uppercase tracking-wider transition-all"
          >
            Add to Bag
          </button>
        </div>
      </div>
    </>
  );
}
