"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import { getAllProducts, Product } from "@/lib/data";
import {
  ShieldCheck,
  Calendar,
  Phone,
  MessageCircle,
  Award,
  Sparkles,
  Check,
  ChevronDown,
  ArrowRight,
  Clock,
  Gem,
  Palette,
  Truck,
  Layers,
} from "lucide-react";

type BridalTab = "all" | "suites" | "solitaires" | "mangalsutras";

const BRIDAL_STEPS = [
  {
    step: "01",
    title: "Private Consultation",
    desc: "Connect with our head gemologist via virtual HD session or in-person at our Lucknow boutique to discuss wedding themes, necklines, and design preferences.",
    icon: Calendar,
  },
  {
    step: "02",
    title: "3D CAD & Stone Curation",
    desc: "Examine photorealistic 3D CAD renders from every perspective. Hand-select Type IIa D-F VVS lab-grown diamonds and certified royal emeralds.",
    icon: Palette,
  },
  {
    step: "03",
    title: "Awadhi Karigar Crafting",
    desc: "Generational master artisans hand-set each stone in solid 18K gold. Every creation is submitted for rigorous Government BIS hallmarking.",
    icon: Gem,
  },
  {
    step: "04",
    title: "Insured White-Glove Delivery",
    desc: "Presented in heirloom velvet jewel chests, accompanied by individual IGI grading dossiers, tamper-evident seals, and lifetime insurance.",
    icon: Truck,
  },
];

const BRIDAL_FAQS = [
  {
    q: "How far in advance of the wedding should we order bespoke jewellery?",
    a: "We advise initiating your consultation 4 to 6 weeks prior to the wedding or sangeet festivities. This provides ample time for 3D CAD revisions, stone selection, meticulous handcrafting, BIS hallmarking, and complimentary final sizing.",
  },
  {
    q: "Can Aryora customize designs to complement my bridal lehenga or saree?",
    a: "Absolutely. During your consultation, share photos of your wedding attire, neckline, and color palette. Our designers will calibrate stone drop lengths, choker curvature, and metal tones (yellow, rose, or white gold) to create a harmonious silhouette.",
  },
  {
    q: "What certifications accompany Aryora bridal suites?",
    a: "Every diamond centerpiece is accompanied by an authentic physical IGI (International Gemological Institute) laboratory report with matching microscopic laser inscription. Every gold creation is certified with BIS Hallmark 750 (18K) carrying the official government HUID.",
  },
  {
    q: "Can virtual consultations be scheduled if we live outside Lucknow?",
    a: "Yes. Over 60% of our bespoke bridal patrons consult with us virtually from Delhi, Mumbai, Bengaluru, the Middle East, and the USA. We conduct private video styling sessions with live camera showcases of gemstones, sample pieces, and CAD models.",
  },
  {
    q: "What is your resizing and lifetime buyback policy on bridal heirlooms?",
    a: "We provide 30-day complimentary ring and choker adjustments. All Aryora fine jewellery is protected by our transparent lifetime buyback and exchange policy based on prevailing market gold valuations and 100% diamond exchange credit.",
  },
];

export default function BridalPage() {
  const [selectedTab, setSelectedTab] = useState<BridalTab>("all");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    emailId: "",
    mobileNumber: "",
    weddingDate: "",
    consultationType: "Virtual Video Concierge",
    budgetRange: "₹2 Lakh – ₹5 Lakh",
    customerNotes: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/leads/appointment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            source: "BRIDAL_PAGE",
          }),
        }
      ).catch(() => null);
      setStatus("done");
    } catch {
      setStatus("done");
    }
  };

  const whatsappBridalUrl =
    "https://wa.me/918808828646?text=" +
    encodeURIComponent(
      "Hello Aryora Concierge, I would like to book a private consultation for bridal heirloom jewellery."
    );

  // Filter curated bridal products
  const allProducts = getAllProducts();
  const bridalProducts = allProducts.filter((product) => {
    if (selectedTab === "all") {
      return (
        product.category === "Bridal" ||
        product.category === "Solitaires" ||
        product.subcategory === "Mangalsutras" ||
        product.occasion === "Wedding"
      );
    }
    if (selectedTab === "suites") {
      return product.category === "Bridal" || product.category === "Necklaces";
    }
    if (selectedTab === "solitaires") {
      return product.category === "Solitaires" || product.style === "Solitaire";
    }
    if (selectedTab === "mangalsutras") {
      return product.subcategory === "Mangalsutras";
    }
    return true;
  });

  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-6 md:py-12 space-y-16 md:space-y-24">
      {/* 1. BREADCRUMBS */}
      <Breadcrumbs items={[{ label: "Bridal Heirloom" }]} />

      {/* 2. HERO BANNER */}
      <section className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.24em] font-semibold text-champagne">
              Awadhi Royal Atelier · Bespoke Haute Joaillerie
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-ink leading-[1.15] font-light">
              Heritage Bridal Heirlooms For Modern Royalty
            </h1>
            <p className="text-sm md:text-base text-ink-muted leading-relaxed max-w-xl">
              Crafted in homage to the majestic royal courts of Awadh, Aryora creates
              one-of-a-kind wedding suites and regal solitaire heirlooms. Hand-set with
              flawless D-F VVS lab-grown diamonds, royal emeralds, and solid 18K
              BIS-hallmarked gold—born to be treasured for generations.
            </p>
          </div>

          {/* Quick Assurance Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-ivory-warm/40 border border-border-subtle flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-champagne-accessible flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-ink">100% IGI Certified</p>
                <p className="text-[10px] text-ink-muted">Laser-inscribed stones</p>
              </div>
            </div>
            <div className="p-3 bg-ivory-warm/40 border border-border-subtle flex items-center gap-2.5">
              <Award size={18} className="text-champagne-accessible flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-ink">BIS 750 Hallmark</p>
                <p className="text-[10px] text-ink-muted">Govt HUID guarantee</p>
              </div>
            </div>
            <div className="p-3 bg-ivory-warm/40 border border-border-subtle flex items-center gap-2.5 col-span-2 sm:col-span-1">
              <Clock size={18} className="text-champagne-accessible flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-ink">3–4 Week Atelier</p>
                <p className="text-[10px] text-ink-muted">Bespoke CAD to door</p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#book-consultation"
              className="btn-primary inline-flex items-center gap-2 text-xs font-semibold px-7 py-3.5"
            >
              <span>Book Private Consultation</span>
              <ArrowRight size={14} />
            </a>
            <a
              href={whatsappBridalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold px-6 py-3.5 border border-[#1B3B30] text-[#1B3B30] hover:bg-[#1B3B30] hover:text-ivory transition-colors"
            >
              <MessageCircle size={16} />
              <span>WhatsApp Bridal Concierge</span>
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="relative aspect-[4/5] bg-ivory-warm border border-border-subtle shadow-lg overflow-hidden group p-8 flex items-center justify-center">
            <Image
              src="/site/cat-bridal.svg"
              alt="Aryora Heritage Bridal Suite in 18K Gold and Certified Lab-Grown Diamonds"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-contain group-hover:scale-105 transition-transform duration-700 ease-out p-6"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-4 left-4 right-4 p-4 bg-ivory-pure/90 backdrop-blur-md border border-border-subtle text-ink space-y-1">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-champagne">
                Haute Joaillerie Atelier
              </p>
              <p className="font-serif text-lg leading-snug">
                Noor Heritage Bridal Suite & Royal Emerald Choker
              </p>
              <p className="text-[11px] text-ink-muted">
                Handcrafted in Lucknow · Accompanied by physical IGI Dossiers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CURATED BRIDAL HEIRLOOMS CATALOGUE */}
      <section className="space-y-8 pt-6 border-t border-border-subtle">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-champagne">
              Royal Wedding Curation
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink font-light">
              Signature Bridal Creations
            </h2>
            <p className="text-xs text-ink-muted mt-1 max-w-md">
              Timeless ceremonial chokers, graduated diamond solitaires, and contemporary
              mangalsutras crafted for the discerning Indian bride.
            </p>
          </div>

          {/* Tab Filter Controls */}
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { id: "all", label: "All Heirlooms" },
              { id: "suites", label: "Necklace Suites" },
              { id: "solitaires", label: "Solitaires & Bands" },
              { id: "mangalsutras", label: "Mangalsutras" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTab(tab.id as BridalTab)}
                className={`px-4 py-2 border text-xs uppercase tracking-wider font-medium transition-colors ${
                  selectedTab === tab.id
                    ? "bg-ink text-ivory border-ink"
                    : "bg-ivory border-border-subtle text-ink-muted hover:border-ink hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {bridalProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center pt-4">
          <Link
            href="/shop?category=bridal"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-luxury font-semibold text-champagne-accessible hover:text-ink hover:underline transition-colors"
          >
            <span>Explore Complete Bridal & Solitaire Collection</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* 4. THE 4-STEP BESPOKE ATELIER JOURNEY */}
      <section className="bg-ivory-warm/40 border border-border-subtle p-8 md:p-12 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-champagne">
            The Bespoke Experience
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-ink font-light">
            How Your Bridal Heirloom Is Created
          </h2>
          <p className="text-xs text-ink-muted leading-relaxed">
            From your first virtual conversation to the moment your velvet presentation chest
            arrives, every step is executed with atelier precision.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BRIDAL_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="bg-ivory-pure border border-border-subtle p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-2xl font-light text-champagne">
                      {step.step}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-champagne-accessible border border-champagne/40">
                      <Icon size={18} strokeWidth={1.5} />
                    </div>
                  </div>
                  <h3 className="font-serif text-lg text-ink">{step.title}</h3>
                  <p className="text-xs text-ink-muted leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. OFFICIAL CERTIFICATIONS & PURITY ASSURANCE */}
      <section className="border border-border-subtle bg-ivory-pure p-8 md:p-12">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-champagne">
              Government & Global Accreditation
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-ink font-light">
              Dual Certification with Every Bridal Heirloom
            </h2>
            <p className="text-xs text-ink-muted leading-relaxed">
              We eliminate doubts with transparent laboratory grading and official gold
              hallmarking. Your bridal jewellery is guaranteed authentic, ethically grown,
              and completely traceable.
            </p>
            <ul className="space-y-2.5 text-xs text-ink">
              <li className="flex items-start gap-2">
                <Check size={16} className="text-champagne-accessible mt-0.5 flex-shrink-0" />
                <span>
                  <strong>IGI Laboratory Dossier:</strong> International Gemological Institute
                  grades cut, color, clarity, and carat with microscopic laser-inscribed girdle
                  numbers.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-champagne-accessible mt-0.5 flex-shrink-0" />
                <span>
                  <strong>BIS Hallmark 750 (18K) & 925:</strong> Bureau of Indian Standards
                  hallmarked with unique 6-character HUID identifier verifiable on the BIS Care
                  app.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-champagne-accessible mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Lifetime Buyback & Exchange:</strong> Guaranteed upgrade policy on all
                  Aryora diamond and gold components at prevailing market values.
                </span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-5 flex flex-col sm:flex-row items-center justify-center gap-6 p-6 bg-ivory-warm/30 border border-border-subtle rounded-sm">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="relative w-28 h-28 flex items-center justify-center bg-white p-2 border border-border-subtle shadow-sm rounded-full">
                <Image
                  src="/images/certifications/igi-certified.png"
                  alt="IGI Certified Laboratory Logo"
                  width={90}
                  height={90}
                  className="object-contain"
                />
              </div>
              <p className="text-xs font-semibold text-ink">100% IGI Certified</p>
              <p className="text-[10px] text-ink-muted">Lab-Grown Diamond Dossier</p>
            </div>

            <div className="h-px sm:h-20 w-24 sm:w-px bg-border-subtle" />

            <div className="flex flex-col items-center text-center space-y-2">
              <div className="relative w-28 h-28 flex items-center justify-center bg-white p-2 border border-border-subtle shadow-sm rounded-full">
                <Image
                  src="/images/certifications/bis-hallmark.png"
                  alt="BIS Hallmark 750 Gold Certification Logo"
                  width={90}
                  height={50}
                  className="object-contain"
                />
              </div>
              <p className="text-xs font-semibold text-ink">BIS Hallmark 750</p>
              <p className="text-[10px] text-ink-muted">Govt Purity Authentication</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BRIDAL CONSULTATION BOOKING BOX + DIRECT CONCIERGE */}
      <section id="book-consultation" className="scroll-mt-24">
        <div className="border border-border-subtle bg-ivory-pure p-8 md:p-12 shadow-sm">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            {/* Form Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-champagne">
                  Personalized Atelier Service
                </p>
                <h2 className="font-serif text-3xl text-ink font-light">
                  Book a Private Bridal Consultation
                </h2>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Reserve a dedicated 45-minute styling consultation with our master
                  gemologists to review designs, custom stone settings, and quotation options.
                </p>
              </div>

              {status === "done" ? (
                <div className="text-center py-12 space-y-3 bg-champagne-subtle p-8 border border-champagne-light">
                  <div className="w-12 h-12 rounded-full bg-[#1B3B30] text-ivory flex items-center justify-center mx-auto">
                    <Check size={22} />
                  </div>
                  <h3 className="font-serif text-2xl text-ink">
                    Consultation Request Received
                  </h3>
                  <p className="text-xs text-ink-muted leading-relaxed max-w-sm mx-auto">
                    Our Senior Bridal Concierge will connect with you via WhatsApp/call within
                    4 hours to confirm your preferred time slot and share initial bridal
                    lookbooks.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-medium text-ink mb-1.5">
                        Full Name *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Radhika Verma"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-medium text-ink mb-1.5">
                        WhatsApp Mobile Number *
                      </label>
                      <input
                        required
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={form.mobileNumber}
                        onChange={(e) =>
                          setForm({ ...form, mobileNumber: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-medium text-ink mb-1.5">
                        Email Address *
                      </label>
                      <input
                        required
                        type="email"
                        placeholder="radhika@example.com"
                        value={form.emailId}
                        onChange={(e) => setForm({ ...form, emailId: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-medium text-ink mb-1.5">
                        Anticipated Wedding / Event Date
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. November 2026"
                        value={form.weddingDate}
                        onChange={(e) => setForm({ ...form, weddingDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-medium text-ink mb-1.5">
                        Consultation Preference
                      </label>
                      <select
                        value={form.consultationType}
                        onChange={(e) =>
                          setForm({ ...form, consultationType: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink transition-colors"
                      >
                        <option>Virtual Video Concierge</option>
                        <option>Private Atelier in Lucknow</option>
                        <option>Phone / WhatsApp Discussion</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-medium text-ink mb-1.5">
                        Approximate Budget
                      </label>
                      <select
                        value={form.budgetRange}
                        onChange={(e) =>
                          setForm({ ...form, budgetRange: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink transition-colors"
                      >
                        <option>Under ₹1.5 Lakh</option>
                        <option>₹1.5 Lakh – ₹3 Lakh</option>
                        <option>₹3 Lakh – ₹5 Lakh</option>
                        <option>₹5 Lakh – ₹10 Lakh</option>
                        <option>₹10 Lakh+</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-medium text-ink mb-1.5">
                      Tell us about your bridal vision (specific pieces, metal preference,
                      gemstone accents)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Share details such as lehenga colors, neckline style, preferred diamond shapes, or specific heirloom ideas..."
                      value={form.customerNotes}
                      onChange={(e) =>
                        setForm({ ...form, customerNotes: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="btn-primary w-full text-xs font-semibold py-4 uppercase tracking-wider"
                  >
                    {status === "sending"
                      ? "Submitting Appointment Request..."
                      : "Request Private Bridal Consultation"}
                  </button>
                </form>
              )}
            </div>

            {/* Direct Concierge Contact Card */}
            <div className="lg:col-span-5 bg-ivory-warm/50 border border-border-subtle p-6 md:p-8 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-champagne">
                  Direct Boutique Access
                </span>
                <h3 className="font-serif text-2xl text-ink">Prefer Instant WhatsApp?</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Have urgent bridal questions or wedding dates coming up soon? Chat with
                  our head stylist directly on WhatsApp for instantaneous lookbooks, live
                  video showcases, and custom quotes.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <a
                  href={whatsappBridalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 bg-[#1B3B30] text-ivory hover:bg-[#122720] transition-colors py-3.5 px-4 text-xs uppercase tracking-wider font-semibold"
                >
                  <MessageCircle size={16} />
                  <span>Chat on WhatsApp (+91 8808828646)</span>
                </a>

                <div className="p-4 bg-ivory-pure border border-border-subtle space-y-2 text-xs text-ink">
                  <p className="font-semibold flex items-center gap-2">
                    <Phone size={14} className="text-champagne-accessible" />
                    <span>Bridal Atelier Helpline</span>
                  </p>
                  <p className="text-ink-muted text-[11px]">
                    Available Monday – Saturday, 10:30 AM to 8:00 PM IST
                  </p>
                  <a
                    href="tel:+918808828646"
                    className="text-xs font-medium text-ink hover:underline"
                  >
                    +91 8808828646
                  </a>
                </div>

                <div className="p-4 bg-ivory-pure border border-border-subtle space-y-1.5 text-xs text-ink">
                  <p className="font-semibold">Atelier Visit Location</p>
                  <p className="text-ink-muted text-[11px] leading-relaxed">
                    Aryora Haute Joaillerie Atelier, Lucknow, Uttar Pradesh, India.
                    By prior appointment only.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BRIDAL CLIENT FAQS */}
      <section className="space-y-6 border-t border-border-subtle pt-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-champagne">
            Frequently Asked Questions
          </p>
          <h2 className="font-serif text-3xl text-ink font-light">Bridal Client Inquiries</h2>
        </div>

        <div className="max-w-3xl mx-auto divide-y divide-border-subtle border-y border-border-subtle">
          {BRIDAL_FAQS.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div key={faq.q}>
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-wider font-semibold text-ink hover:text-champagne-accessible transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 flex-shrink-0 ml-4 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="pb-4 text-xs text-ink-muted leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
