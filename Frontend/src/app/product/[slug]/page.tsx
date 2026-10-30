"use client";

import { useState } from "react";
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
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PRODUCTS, getProductBySlug, getRelatedProducts, METAL_NAMES } from "@/lib/products";
import { useAryoraStore } from "@/lib/store";

const RING_SIZES = ["6", "8", "10", "12", "14", "16", "18", "20", "22", "24"];

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const product = getProductBySlug(slug) || PRODUCTS[0];
  const relatedProducts = getRelatedProducts(product.slug, 4);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("12");
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [activeAccordion, setActiveAccordion] = useState<string | null>("details");
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const { addToCart, toggleWishlist, isInWishlist, openSizeGuide } = useAryoraStore();

  const inWishlist = isInWishlist(product.slug);

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
      // Calculate 4 days out
      const date = new Date();
      date.setDate(date.getDate() + 4);
      const formatted = date.toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      setDeliveryDate(formatted);
      setPincodeStatus("valid");
    }, 400);
  };

  const handleWhatsAppEnquiry = () => {
    const text = encodeURIComponent(
      `Hello Aryora Concierge, I would like to enquire about the ${product.name} (Code: ${product.productCode}). Please share customization and delivery details.`
    );
    window.open(`https://wa.me/918808828646?text=${text}`, "_blank");
  };

  const gstIncluded = Math.round(product.price * 0.03);
  const priceBeforeGst = product.price - gstIncluded;

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

      <div className="max-w-content mx-auto px-6 md:px-8 py-8 md:py-12">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: "Shop", href: "/shop" },
            {
              label: product.category.charAt(0).toUpperCase() + product.category.slice(1),
              href: `/shop?category=${product.category}`,
            },
            { label: product.name },
          ]}
        />

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 pt-6">
          {/* LEFT: Image Gallery & Zoom */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Thumbnail strip on desktop */}
              {product.images.length > 1 && (
                <div className="hidden md:flex md:col-span-2 flex-col space-y-3">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      aria-label={`View photo ${i + 1} of ${product.name}`}
                      className={`relative aspect-square border overflow-hidden transition-all ${
                        activeImageIndex === i
                          ? "border-ink shadow-sm"
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
                  onClick={() => toggleWishlist(product.slug)}
                  aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                  className="absolute top-4 right-4 p-3 bg-ivory/80 backdrop-blur-sm rounded-full text-ink hover:text-champagne-accessible shadow-sm transition-all"
                >
                  <Heart
                    size={20}
                    strokeWidth={1.5}
                    className={inWishlist ? "fill-champagne text-champagne" : ""}
                  />
                </button>

                {/* IGI Certified Pill */}
                <span className="absolute bottom-4 left-4 bg-ivory/90 backdrop-blur-sm px-3 py-1 text-xs uppercase tracking-wider text-ink font-medium border border-border-subtle flex items-center gap-1.5">
                  <Award size={14} className="text-champagne-accessible" />
                  IGI Certified
                </span>
              </div>
            </div>

            {/* Mobile thumbnail slider */}
            {product.images.length > 1 && (
              <div className="flex md:hidden gap-3 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative w-16 h-16 border flex-shrink-0 ${
                      activeImageIndex === i ? "border-ink" : "border-border-subtle opacity-70"
                    }`}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Details & Purchase Actions */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="eyebrow">{product.productCode}</p>
              <h1 className="font-serif text-3xl md:text-4xl text-ink mt-1">
                {product.name}
              </h1>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-serif text-2xl md:text-3xl text-ink font-medium">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-ink-subtle line-through">
                    ₹{product.originalPrice.toLocaleString("en-IN")}
                  </span>
                )}
                <span className="text-xs text-ink-subtle">(Inclusive of 3% GST)</span>
              </div>
            </div>

            <p className="text-sm text-ink-muted leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Metal Specification Chips */}
            <div className="space-y-2 pt-2 border-t border-border-subtle">
              <span className="text-xs uppercase tracking-wider font-medium text-ink">
                Selected Metal: <strong className="font-semibold">{product.specs.metal}</strong>
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-3 py-1.5 bg-ivory-pure border border-ink text-xs font-medium text-ink">
                  {product.specs.metal}
                </span>
              </div>
            </div>

            {/* Ring Size Selector (if applicable) */}
            {product.category === "rings" && (
              <div className="space-y-2 pt-2 border-t border-border-subtle">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-medium text-ink">
                    Select Ring Size (Indian)
                  </span>
                  <button
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
                      onClick={() => setSelectedSize(size)}
                      className={`w-11 h-11 text-xs border flex items-center justify-center font-medium transition-all ${
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

            {/* Action Buttons: Add to Bag & Enquire on WhatsApp */}
            <div className="space-y-3 pt-4">
              <button
                onClick={() => addToCart(product, 1, product.category === "rings" ? selectedSize : undefined)}
                className="btn-primary w-full text-xs font-semibold py-4"
              >
                Add to Shopping Bag
              </button>

              <button
                onClick={handleWhatsAppEnquiry}
                className="btn-outline w-full text-xs font-medium py-3.5 flex items-center justify-center gap-2 border-border-subtle hover:border-ink"
              >
                <MessageCircle size={16} className="text-[#1B3B30]" />
                <span>Enquire on WhatsApp</span>
              </button>
            </div>

            {/* Pincode Delivery Estimator */}
            <div className="p-4 bg-ivory-pure border border-border-subtle space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium text-ink">
                <Truck size={16} className="text-champagne-accessible" />
                <span>Delivery & Insurance Availability</span>
              </div>
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <label htmlFor="pincode-input" className="sr-only">Enter PIN Code</label>
                <input
                  id="pincode-input"
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit PIN code"
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value);
                    if (pincodeStatus !== "idle") setPincodeStatus("idle");
                  }}
                  className="flex-1 px-3 py-2 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink"
                />
                <button
                  type="submit"
                  disabled={pincodeStatus === "checking"}
                  className="px-4 py-2 border border-ink text-xs uppercase tracking-wider font-medium text-ink hover:bg-ink hover:text-ivory transition-colors"
                >
                  {pincodeStatus === "checking" ? "Checking..." : "Verify"}
                </button>
              </form>

              {pincodeStatus === "valid" && (
                <div className="text-xs text-[#2A6E4E] flex items-center gap-1.5 pt-1">
                  <Check size={14} />
                  <span>
                    Estimated delivery by <strong>{deliveryDate}</strong>. Free Insured Courier.
                  </span>
                </div>
              )}
              {pincodeStatus === "invalid" && (
                <p className="text-xs text-[#B93826]">
                  Please enter a valid 6-digit Indian PIN code.
                </p>
              )}
            </div>

            {/* Trust Badges Strip */}
            <div className="grid grid-cols-3 gap-2 py-4 border-y border-border-subtle text-center text-[11px] text-ink-muted">
              <div className="space-y-1">
                <Award size={18} className="mx-auto text-champagne-accessible" />
                <p className="font-medium text-ink">IGI Certified</p>
                <p className="text-[10px] text-ink-subtle">100% Traceable</p>
              </div>
              <div className="space-y-1">
                <RotateCcw size={18} className="mx-auto text-champagne-accessible" />
                <p className="font-medium text-ink">7-Day Returns</p>
                <p className="text-[10px] text-ink-subtle">Hassle-Free</p>
              </div>
              <div className="space-y-1">
                <ShieldCheck size={18} className="mx-auto text-champagne-accessible" />
                <p className="font-medium text-ink">6-Month Warranty</p>
                <p className="text-[10px] text-ink-subtle">Manufacturing cover</p>
              </div>
            </div>

            {/* Accordions: Product Specs, Shipping, Care */}
            <div className="divide-y divide-border-subtle border-b border-border-subtle">
              {/* Accordion 1: Gemological Details & Specs */}
              <div>
                <button
                  onClick={() =>
                    setActiveAccordion(activeAccordion === "details" ? null : "details")
                  }
                  className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-wider font-medium text-ink"
                  aria-expanded={activeAccordion === "details"}
                >
                  <span>Gemological & Metal Specifications</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      activeAccordion === "details" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeAccordion === "details" && (
                  <div className="pb-4 space-y-3 text-xs text-ink-muted leading-relaxed">
                    <table className="w-full text-xs">
                      <tbody className="divide-y divide-border-subtle/50">
                        <tr>
                          <td className="py-2 text-ink-subtle">Metal & Purity</td>
                          <td className="py-2 text-right font-medium text-ink">{product.specs.metal} ({product.specs.purity})</td>
                        </tr>
                        {product.specs.diamondCarat && (
                          <tr>
                            <td className="py-2 text-ink-subtle">Total Diamond Carat</td>
                            <td className="py-2 text-right font-medium text-ink">{product.specs.diamondCarat}</td>
                          </tr>
                        )}
                        {product.specs.diamondColor && (
                          <tr>
                            <td className="py-2 text-ink-subtle">Diamond Color</td>
                            <td className="py-2 text-right font-medium text-ink">{product.specs.diamondColor}</td>
                          </tr>
                        )}
                        {product.specs.diamondClarity && (
                          <tr>
                            <td className="py-2 text-ink-subtle">Diamond Clarity</td>
                            <td className="py-2 text-right font-medium text-ink">{product.specs.diamondClarity}</td>
                          </tr>
                        )}
                        <tr>
                          <td className="py-2 text-ink-subtle">Certification</td>
                          <td className="py-2 text-right font-medium text-ink">{product.specs.certification}</td>
                        </tr>
                        {product.specs.grossWeight && (
                          <tr>
                            <td className="py-2 text-ink-subtle">Approx. Gross Weight</td>
                            <td className="py-2 text-right font-medium text-ink">{product.specs.grossWeight}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Accordion 2: Shipping & Returns */}
              <div>
                <button
                  onClick={() =>
                    setActiveAccordion(activeAccordion === "shipping" ? null : "shipping")
                  }
                  className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-wider font-medium text-ink"
                  aria-expanded={activeAccordion === "shipping"}
                >
                  <span>Complimentary Shipping & 7-Day Returns</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      activeAccordion === "shipping" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeAccordion === "shipping" && (
                  <div className="pb-4 space-y-2 text-xs text-ink-muted leading-relaxed">
                    <p>• Complimentary insured courier delivery across India via BlueDart/BVC Logistics.</p>
                    <p>• Dispatched in tamper-proof sealed presentation heirlooms with full IGI certificate.</p>
                    <p>• 7-day hassle-free returns on standard unworn items. Custom made-to-order pieces carry exchange or lifetime buyback.</p>
                  </div>
                )}
              </div>

              {/* Accordion 3: Care & Maintenance */}
              <div>
                <button
                  onClick={() =>
                    setActiveAccordion(activeAccordion === "care" ? null : "care")
                  }
                  className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-wider font-medium text-ink"
                  aria-expanded={activeAccordion === "care"}
                >
                  <span>Heirloom Care & Cleaning</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      activeAccordion === "care" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeAccordion === "care" && (
                  <div className="pb-4 space-y-2 text-xs text-ink-muted leading-relaxed">
                    <p>• Clean with warm soapy water and a soft-bristle brush; dry gently with the included microfibre cloth.</p>
                    <p>• Store in your provided Aryora velvet presentation box to prevent metal friction.</p>
                    <p>• Complimentary annual inspection and claw-tightening available at our Lucknow atelier.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like Recommendations */}
        <section className="mt-24 pt-12 border-t border-border-subtle">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="eyebrow">Curated Complements</p>
              <h2 className="font-serif text-2xl md:text-3xl text-ink">You May Also Like</h2>
            </div>
            <Link
              href="/shop"
              className="text-xs uppercase tracking-widest text-ink hover:text-champagne-accessible flex items-center gap-1 font-medium"
            >
              Explore Shop <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((rel) => (
              <Link
                key={rel.id}
                href={`/product/${rel.slug}`}
                className="group block border border-border-subtle bg-ivory-pure hover:border-border-medium transition-colors"
              >
                <div className="relative aspect-square bg-ivory-muted overflow-hidden">
                  <Image
                    src={rel.images[0]?.url || "/images/hero-emerald.jpg"}
                    alt={rel.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover img-zoom"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[11px] text-ink-subtle uppercase tracking-wider">
                    {rel.specs.metal}
                  </p>
                  <h3 className="font-serif text-sm text-ink group-hover:text-champagne-accessible transition-colors truncate mt-1">
                    {rel.name}
                  </h3>
                  <p className="text-xs font-medium text-ink mt-2">
                    ₹{rel.price.toLocaleString("en-IN")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* MOBILE STICKY ADD TO CART BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-ivory/95 backdrop-blur-md border-t border-border-subtle p-3.5 md:hidden flex items-center justify-between gap-4 shadow-lg">
        <div>
          <p className="text-xs font-serif text-ink truncate max-w-[160px]">
            {product.name}
          </p>
          <p className="text-sm font-semibold text-ink">
            ₹{product.price.toLocaleString("en-IN")}
          </p>
        </div>
        <button
          onClick={() => addToCart(product, 1, product.category === "rings" ? selectedSize : undefined)}
          className="btn-primary flex-1 text-xs py-3 text-center"
        >
          Add to Bag
        </button>
      </div>
    </>
  );
}
