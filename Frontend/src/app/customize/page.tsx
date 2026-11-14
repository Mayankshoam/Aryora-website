"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Ring3DViewer from "@/components/ring3d/Ring3DViewer";
import {
  DEFAULT_CONFIG,
  RingConfig,
  RingStyle,
  SideSetting,
  DiamondShape,
  Halo,
  Metal,
  INDIAN_RING_SIZES,
} from "@/components/ring3d/types";
import { useAryoraStore } from "@/lib/store";
import { Product } from "@/lib/data";
import {
  Sparkles,
  ShoppingBag,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  X,
  Check,
  MessageCircle,
  HelpCircle,
  ShieldCheck,
  Truck,
  RotateCw,
  Info,
  Ruler,
} from "lucide-react";

// 1. RING STYLES with line-drawing icons
const RING_STYLES = [
  {
    id: "classic",
    label: "Classic Straight",
    desc: "Clean, timeless shank meeting center basket",
    icon: (
      <svg viewBox="0 0 48 24" className="w-9 h-5 stroke-current fill-none stroke-[1.4]">
        <circle cx="24" cy="12" r="5" className="stroke-[1.6]" />
        <line x1="4" y1="12" x2="19" y2="12" />
        <line x1="29" y1="12" x2="44" y2="12" />
      </svg>
    ),
  },
  {
    id: "cathedral",
    label: "Cathedral Straight",
    desc: "Elevated shoulder arches sweeping to the head",
    icon: (
      <svg viewBox="0 0 48 24" className="w-9 h-5 stroke-current fill-none stroke-[1.4]">
        <circle cx="24" cy="9" r="5" className="stroke-[1.6]" />
        <path d="M6 18 Q 18 18 20 11" />
        <path d="M42 18 Q 30 18 28 11" />
      </svg>
    ),
  },
  {
    id: "twist",
    label: "Twist",
    desc: "Gracefully intertwining dual strands",
    icon: (
      <svg viewBox="0 0 48 24" className="w-9 h-5 stroke-current fill-none stroke-[1.4]">
        <circle cx="24" cy="12" r="5" className="stroke-[1.6]" />
        <path d="M6 14 Q 16 8 20 12" />
        <path d="M42 10 Q 32 16 28 12" />
      </svg>
    ),
  },
  {
    id: "split",
    label: "Split Shank",
    desc: "Dual bands flaring towards solitaire",
    icon: (
      <svg viewBox="0 0 48 24" className="w-9 h-5 stroke-current fill-none stroke-[1.4]">
        <circle cx="24" cy="12" r="5" className="stroke-[1.6]" />
        <path d="M6 12 L 18 9" />
        <path d="M6 12 L 18 15" />
        <path d="M42 12 L 30 9" />
        <path d="M42 12 L 30 15" />
      </svg>
    ),
  },
  {
    id: "twoRowSplit",
    label: "Two Row Split",
    desc: "Modern parallel architectural double band",
    icon: (
      <svg viewBox="0 0 48 24" className="w-9 h-5 stroke-current fill-none stroke-[1.4]">
        <circle cx="24" cy="12" r="5" className="stroke-[1.6]" />
        <line x1="6" y1="9" x2="19" y2="9" />
        <line x1="6" y1="15" x2="19" y2="15" />
        <line x1="29" y1="9" x2="42" y2="9" />
        <line x1="29" y1="15" x2="42" y2="15" />
      </svg>
    ),
  },
  {
    id: "pinch",
    label: "Pinch (Tapered)",
    desc: "Band narrows at head to magnify diamond",
    icon: (
      <svg viewBox="0 0 48 24" className="w-9 h-5 stroke-current fill-none stroke-[1.4]">
        <circle cx="24" cy="12" r="5" className="stroke-[1.6]" />
        <path d="M6 10 C 14 10, 18 12, 20 12" />
        <path d="M6 14 C 14 14, 18 12, 20 12" />
        <path d="M42 10 C 34 10, 30 12, 28 12" />
        <path d="M42 14 C 34 14, 30 12, 28 12" />
      </svg>
    ),
  },
];

// 2. SIDE SETTINGS
const SIDE_SETTINGS = [
  {
    id: "plain",
    label: "Plain Gold",
    desc: "Smooth mirror-polished precious metal",
    icon: (
      <svg viewBox="0 0 48 20" className="w-8 h-4 stroke-current fill-none stroke-[1.4]">
        <rect x="6" y="8" width="36" height="4" rx="2" />
      </svg>
    ),
  },
  {
    id: "pave",
    label: "Pavé",
    desc: "Micro-diamonds along the band crest",
    icon: (
      <svg viewBox="0 0 48 20" className="w-8 h-4 stroke-current fill-none stroke-[1.4]">
        <circle cx="10" cy="10" r="1.5" className="fill-current" />
        <circle cx="17" cy="10" r="1.5" className="fill-current" />
        <circle cx="24" cy="10" r="1.5" className="fill-current" />
        <circle cx="31" cy="10" r="1.5" className="fill-current" />
        <circle cx="38" cy="10" r="1.5" className="fill-current" />
      </svg>
    ),
  },
  {
    id: "prong",
    label: "Shared Prong",
    desc: "Raised prong diamond accents",
    icon: (
      <svg viewBox="0 0 48 20" className="w-8 h-4 stroke-current fill-none stroke-[1.4]">
        <circle cx="12" cy="10" r="2.5" />
        <circle cx="24" cy="10" r="2.5" />
        <circle cx="36" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    id: "channel",
    label: "Channel Set",
    desc: "Nestled between polished gold rails",
    icon: (
      <svg viewBox="0 0 48 20" className="w-8 h-4 stroke-current fill-none stroke-[1.4]">
        <line x1="6" y1="6" x2="42" y2="6" />
        <circle cx="14" cy="10" r="2" />
        <circle cx="24" cy="10" r="2" />
        <circle cx="34" cy="10" r="2" />
        <line x1="6" y1="14" x2="42" y2="14" />
      </svg>
    ),
  },
];

// 3. 9 DIAMOND SHAPES (Structured in a 3x3 balanced grid)
const DIAMOND_SHAPES: { id: DiamondShape; label: string; ratio: string; icon: React.ReactNode }[] = [
  {
    id: "round",
    label: "Round",
    ratio: "1.00",
    icon: (
      <svg viewBox="0 0 32 32" className="w-7 h-7 stroke-current fill-none stroke-[1.3]">
        <circle cx="16" cy="16" r="12" />
        <circle cx="16" cy="16" r="6" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    id: "oval",
    label: "Oval",
    ratio: "1.35",
    icon: (
      <svg viewBox="0 0 32 32" className="w-7 h-7 stroke-current fill-none stroke-[1.3]">
        <ellipse cx="16" cy="16" rx="8" ry="12" />
        <ellipse cx="16" cy="16" rx="4" ry="6" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    id: "emerald",
    label: "Emerald",
    ratio: "1.40",
    icon: (
      <svg viewBox="0 0 32 32" className="w-7 h-7 stroke-current fill-none stroke-[1.3]">
        <polygon points="9,5 23,5 27,9 27,23 23,27 9,27 5,23 5,9" />
        <polygon points="12,9 20,9 22,11 22,21 20,23 12,23 10,21 10,11" />
      </svg>
    ),
  },
  {
    id: "cushion",
    label: "Cushion",
    ratio: "1.05",
    icon: (
      <svg viewBox="0 0 32 32" className="w-7 h-7 stroke-current fill-none stroke-[1.3]">
        <rect x="6" y="6" width="20" height="20" rx="6" />
        <rect x="10" y="10" width="12" height="12" rx="3" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    id: "princess",
    label: "Princess",
    ratio: "1.00",
    icon: (
      <svg viewBox="0 0 32 32" className="w-7 h-7 stroke-current fill-none stroke-[1.3]">
        <rect x="6" y="6" width="20" height="20" />
        <line x1="6" y1="6" x2="26" y2="26" />
        <line x1="26" y1="6" x2="6" y2="26" />
      </svg>
    ),
  },
  {
    id: "pear",
    label: "Pear",
    ratio: "1.50",
    icon: (
      <svg viewBox="0 0 32 32" className="w-7 h-7 stroke-current fill-none stroke-[1.3]">
        <path d="M16 4 C 23 14, 25 24, 16 27 C 7 24, 9 14, 16 4 Z" />
      </svg>
    ),
  },
  {
    id: "radiant",
    label: "Radiant",
    ratio: "1.25",
    icon: (
      <svg viewBox="0 0 32 32" className="w-7 h-7 stroke-current fill-none stroke-[1.3]">
        <polygon points="9,5 23,5 27,9 27,23 23,27 9,27 5,23 5,9" />
        <line x1="5" y1="9" x2="27" y2="23" strokeDasharray="1.5 1.5" />
        <line x1="27" y1="9" x2="5" y2="23" strokeDasharray="1.5 1.5" />
      </svg>
    ),
  },
  {
    id: "asscher",
    label: "Asscher",
    ratio: "1.00",
    icon: (
      <svg viewBox="0 0 32 32" className="w-7 h-7 stroke-current fill-none stroke-[1.3]">
        <polygon points="9,5 23,5 27,9 27,23 23,27 9,27 5,23 5,9" />
        <line x1="6" y1="6" x2="26" y2="26" />
        <line x1="26" y1="6" x2="6" y2="26" />
      </svg>
    ),
  },
  {
    id: "marquise",
    label: "Marquise",
    ratio: "1.80",
    icon: (
      <svg viewBox="0 0 32 32" className="w-7 h-7 stroke-current fill-none stroke-[1.3]">
        <path d="M16 4 Q 28 16 16 28 Q 4 16 16 4 Z" />
      </svg>
    ),
  },
];

// 4. CARAT WEIGHT STEPS & PHYSICAL MM DIMENSIONS
const CARAT_STEPS = [0.5, 0.75, 1.0, 1.5, 2.0, 3.0];
const CARAT_MM: Record<number, string> = {
  0.5: "5.1 × 5.1 mm",
  0.75: "5.8 × 5.8 mm",
  1.0: "6.5 × 6.5 mm",
  1.5: "7.4 × 7.4 mm",
  2.0: "8.1 × 8.1 mm",
  3.0: "9.2 × 9.2 mm",
};

// 5. CROWN SETTING (Halo)
const CROWN_SETTINGS: { id: Halo; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: "none",
    label: "No Halo",
    desc: "Pure solitaire focus",
    icon: (
      <svg viewBox="0 0 36 20" className="w-7 h-4 stroke-current fill-none stroke-[1.4]">
        <circle cx="18" cy="10" r="5" />
      </svg>
    ),
  },
  {
    id: "hidden",
    label: "Hidden Halo",
    desc: "Micro-diamonds under basket collar",
    icon: (
      <svg viewBox="0 0 36 20" className="w-7 h-4 stroke-current fill-none stroke-[1.4]">
        <circle cx="18" cy="8" r="5" />
        <line x1="12" y1="14" x2="24" y2="14" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    id: "single",
    label: "Single Halo",
    desc: "Full framing border of diamonds",
    icon: (
      <svg viewBox="0 0 36 20" className="w-7 h-4 stroke-current fill-none stroke-[1.4]">
        <circle cx="18" cy="10" r="4" />
        <circle cx="18" cy="10" r="8" strokeDasharray="2 2" />
      </svg>
    ),
  },
];

// 6. METALS LIST
const METALS_LIST: { id: Metal; label: string; sub: string; color: string }[] = [
  { id: "yellow", label: "Yellow Gold", sub: "18KT / 14KT", color: "#F2C26B" },
  { id: "white", label: "White Gold", sub: "18KT / 14KT", color: "#F0F0F2" },
  { id: "rose", label: "Rose Gold", sub: "18KT / 14KT", color: "#EDA490" },
  { id: "silver", label: "925 Silver", sub: "Sterling", color: "#E3E4E6" },
];

export default function CustomizePage() {
  const addToCart = useAryoraStore((state) => state.addToCart);

  // Configuration State
  const [ringConfig, setRingConfig] = useState<RingConfig>(DEFAULT_CONFIG);
  const [engraving, setEngraving] = useState("");
  const [activeStep, setActiveStep] = useState<number>(1); // 1: Setting, 2: Diamond, 3: Metal & Size, 4: Review

  // Modals
  const [isBreakupOpen, setIsBreakupOpen] = useState(false);
  const [isConsultOpen, setIsConsultOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [consultForm, setConsultForm] = useState({ name: "", phone: "", notes: "" });
  const [consultSent, setConsultSent] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  // Dynamic Price Engine
  const priceBreakup = useMemo(() => {
    let goldRatePerGram = 6780;
    if (ringConfig.karat === 14) goldRatePerGram = 5420;
    if (ringConfig.metal === "silver") goldRatePerGram = 1200;

    let metalWeight = 4.2;
    if (ringConfig.style === "cathedral" || ringConfig.style === "split") metalWeight += 0.6;
    if (ringConfig.style === "twoRowSplit") metalWeight += 0.9;

    const metalTotal = Math.round(metalWeight * goldRatePerGram);

    const caratValues: Record<number, number> = {
      0.5: 24500,
      0.75: 36800,
      1.0: 52400,
      1.5: 78900,
      2.0: 112000,
      3.0: 178000,
    };
    const diamondTotal = caratValues[ringConfig.carat] ?? 78900;

    let sideStonesTotal = 0;
    if (ringConfig.side === "pave") sideStonesTotal = 8500;
    if (ringConfig.side === "prong") sideStonesTotal = 9200;
    if (ringConfig.side === "channel") sideStonesTotal = 10500;

    let haloTotal = 0;
    if (ringConfig.halo === "hidden") haloTotal = 4800;
    if (ringConfig.halo === "single") haloTotal = 8900;

    const makingCharges = 4200;

    const subTotal = metalTotal + diamondTotal + sideStonesTotal + haloTotal + makingCharges;
    const gst3Percent = Math.round(subTotal * 0.03);
    const finalTotal = subTotal + gst3Percent;

    return {
      metalWeight,
      goldRatePerGram,
      metalTotal,
      diamondTotal,
      sideStonesTotal,
      haloTotal,
      makingCharges,
      subTotal,
      gst3Percent,
      finalTotal,
    };
  }, [ringConfig]);

  // Dynamic Ring Title
  const ringTitle = useMemo(() => {
    const styleObj = RING_STYLES.find((s) => s.id === ringConfig.style);
    const shapeObj = DIAMOND_SHAPES.find((s) => s.id === ringConfig.shape);
    const haloStr = ringConfig.halo === "hidden" ? "Hidden Halo " : ringConfig.halo === "single" ? "Halo " : "";
    const sideStr = ringConfig.side !== "plain" ? ` with ${ringConfig.side.toUpperCase()} Diamonds` : "";
    const metalLabel = ringConfig.metal === "silver"
      ? "925 Sterling Silver"
      : `${ringConfig.karat}KT ${ringConfig.metal.charAt(0).toUpperCase() + ringConfig.metal.slice(1)} Gold`;
    return `Solitaire ${ringConfig.carat.toFixed(2)}ct ${shapeObj?.label || ringConfig.shape} ${haloStr}${styleObj?.label || ""} Ring (${metalLabel})${sideStr}`;
  }, [ringConfig]);

  const handleAddToCart = () => {
    const metalLabel = ringConfig.metal === "silver"
      ? "925 Sterling Silver"
      : `${ringConfig.karat}KT ${ringConfig.metal.charAt(0).toUpperCase() + ringConfig.metal.slice(1)} Gold`;
    const ringSizeLabel = `Size ${ringConfig.indianSize} (${INDIAN_RING_SIZES[ringConfig.indianSize] || 16.6} mm)`;

    const customProduct: Product = {
      id: `custom-ring-${Date.now()}`,
      slug: `custom-ring-${Date.now()}`,
      name: ringTitle,
      category: "Rings",
      subcategory: "Custom Engagement Rings",
      metal: metalLabel,
      purity: `${ringConfig.karat}KT`,
      stone: "IGI Certified Lab Diamond",
      carat: ringConfig.carat,
      shape: ringConfig.shape,
      color: "E-F Colorless",
      clarity: "VVS-VS",
      certificate: "IGI Certified",
      weightGrams: priceBreakup.metalWeight,
      sizes: [ringSizeLabel],
      occasion: "Engagement & Daily Fine Luxury",
      gender: "Women",
      style: `${ringConfig.style} / ${ringConfig.side} / ${ringConfig.halo}`,
      price: priceBreakup.finalTotal,
      discountPercent: 0,
      stock: 50,
      images: ["/site/hero-poster.svg"],
      description: `Bespoke custom solitaire ring configured online: ${ringTitle}. Crafted in ${metalLabel} (${priceBreakup.metalWeight}g). Ring Size: ${ringSizeLabel}${engraving ? `. Inscription: "${engraving}"` : ""}. Includes physical IGI Solitaire Report & BIS Hallmarking Certificate.`,
      tags: ["Custom", "Solitaire", "Bespoke", "Ring Builder", "Lab Grown"],
      isBestseller: false,
      isNew: true,
    };

    addToCart(customProduct, 1, ringSizeLabel, metalLabel);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  const handleReset = () => {
    setRingConfig(DEFAULT_CONFIG);
    setEngraving("");
    setActiveStep(1);
  };

  const stepsList = [
    { num: 1, title: "Setting", subtitle: "Shank & Shoulders" },
    { num: 2, title: "Diamond", subtitle: "Cut & Carat" },
    { num: 3, title: "Metal & Size", subtitle: "Purity & Sizing" },
    { num: 4, title: "Personalize", subtitle: "Engraving & Order" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#111111] flex flex-col font-sans">
      {/* 1. Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E0D8] px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium text-[#555555] hover:text-[#111111] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Atelier</span>
          </Link>
          <span className="text-[#D0C8B8]">/</span>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#0E382B]">
            3D Solitaire Builder
          </span>
        </div>

        {/* Center Tagline */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-[#0E382B] font-medium bg-[#FAF6F0] px-4 py-1.5 rounded-full border border-[#E5DEC9]">
          <Sparkles size={13} className="text-[#C5A880]" />
          <span>Bespoke 3D Ring Atelier · Live CAD Studio Preview</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsConsultOpen(true)}
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border border-[#E5E0D8] hover:border-[#0E382B] text-[#555555] hover:text-[#0E382B] transition-all cursor-pointer"
          >
            <MessageCircle size={13} />
            <span>Consult Stylist</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium px-3 py-1.5 rounded-xl border border-[#E5E0D8] hover:border-[#0E382B] text-[#666666] hover:text-[#111111] transition-all cursor-pointer"
            title="Reset to default ring"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </header>

      {/* 2. Main Workspace Layout: Sticky 3D Studio on Left, Guided Configurator on Right */}
      <main className="flex-1 max-w-[1520px] w-full mx-auto grid lg:grid-cols-12 min-h-[calc(100vh-62px)]">
        {/* Left Column: Viewport-Pinned 3D Studio Canvas */}
        <section className="lg:col-span-7 p-4 sm:p-6 lg:p-8 flex flex-col justify-between lg:sticky lg:top-[62px] lg:h-[calc(100vh-62px)] bg-[#FAF8F5]">
          <div className="w-full flex-1 flex flex-col justify-center items-center">
            <div className="w-full max-w-[700px] relative">
              <Ring3DViewer config={ringConfig} />
            </div>
          </div>

          {/* Under 3D Canvas: Live Spec Pill + Luxury Trust Pillars */}
          <div className="mt-4 pt-4 border-t border-[#EAE5DE] space-y-3">
            {/* Quick Live Spec Indicator */}
            <div className="flex items-center justify-between text-xs text-[#555555] bg-white px-3.5 py-2 rounded-xl border border-[#E5E0D8]">
              <span className="font-medium text-[#111111] line-clamp-1">
                {ringConfig.carat.toFixed(2)}ct {ringConfig.shape.toUpperCase()} · {ringConfig.karat}KT {ringConfig.metal.toUpperCase()} · SIZE {ringConfig.indianSize}
              </span>
              <span className="text-[#0E382B] font-semibold flex items-center gap-1 shrink-0">
                <Check size={12} /> Live Precision CAD
              </span>
            </div>

            {/* 4 Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#666666]">
              <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-2 rounded-lg border border-[#EBE5DB]">
                <ShieldCheck size={14} className="text-[#0E382B] shrink-0" />
                <span className="font-medium text-[#222222]">BIS Hallmarked</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-2 rounded-lg border border-[#EBE5DB]">
                <Sparkles size={14} className="text-[#C5A880] shrink-0" />
                <span className="font-medium text-[#222222]">IGI Certified</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-2 rounded-lg border border-[#EBE5DB]">
                <Truck size={14} className="text-[#0E382B] shrink-0" />
                <span className="font-medium text-[#222222]">Insured Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-2 rounded-lg border border-[#EBE5DB]">
                <RotateCw size={14} className="text-[#0E382B] shrink-0" />
                <span className="font-medium text-[#222222]">Free 30D Resizing</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Guided 4-Step Configurator Panel */}
        <section className="lg:col-span-5 bg-white border-l border-[#E5E0D8] flex flex-col justify-between">
          {/* Top Step Progress Tabs */}
          <div className="border-b border-[#E5E0D8] bg-white sticky top-[62px] z-20">
            <div className="grid grid-cols-4 text-center">
              {stepsList.map((step) => {
                const isActive = activeStep === step.num;
                const isCompleted = activeStep > step.num;
                return (
                  <button
                    key={step.num}
                    type="button"
                    onClick={() => setActiveStep(step.num)}
                    className={`py-3 px-1 flex flex-col items-center border-b-2 transition-all cursor-pointer ${
                      isActive
                        ? "border-[#0E382B] bg-[#FAF8F5] text-[#0E382B]"
                        : isCompleted
                        ? "border-transparent text-[#111111] hover:bg-[#FAF8F5]"
                        : "border-transparent text-[#888888] hover:text-[#444444]"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span
                        className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                          isActive
                            ? "bg-[#0E382B] text-white"
                            : isCompleted
                            ? "bg-[#EAF3DE] text-[#0E382B]"
                            : "bg-[#EAE5DE] text-[#666666]"
                        }`}
                      >
                        {isCompleted ? "✓" : step.num}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">
                        {step.title}
                      </span>
                    </div>
                    <span className="text-[10px] sm:hidden font-medium mt-0.5">
                      {step.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrollable Configurator Content based on activeStep */}
          <div className="p-6 md:p-8 space-y-7 overflow-y-auto max-h-[calc(100vh-210px)]">
            {/* Dynamic Ring Title */}
            <div className="space-y-1 pb-4 border-b border-[#E5E0D8]">
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#0E382B]">
                Awadhi Atelier Bespoke Creation
              </p>
              <h1 className="font-serif text-2xl font-medium text-[#111111] leading-tight">
                {ringTitle}
              </h1>
              <p className="text-xs text-[#666666]">
                IGI Certified Solitaire · {ringConfig.karat}KT Gold · Handcrafted in Lucknow Atelier
              </p>
            </div>

            {/* STEP 1: SETTING & SHANK */}
            {activeStep === 1 && (
              <div className="space-y-7 animate-in fade-in duration-300">
                {/* 1.1 Ring Style */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
                        1. Band Shank Style
                      </span>
                      <p className="text-[11px] text-[#777777]">
                        Comfort-fit profile contoured against the finger
                      </p>
                    </div>
                    <span className="text-xs text-[#0E382B] font-medium">
                      {RING_STYLES.find((s) => s.id === ringConfig.style)?.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {RING_STYLES.map((s) => {
                      const active = ringConfig.style === s.id;
                      return (
                        <button
                          type="button"
                          key={s.id}
                          onClick={() => setRingConfig((prev) => ({ ...prev, style: s.id as RingStyle }))}
                          className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                            active
                              ? "border-[#0E382B] bg-[#FAF7F2] ring-1 ring-[#0E382B] shadow-xs text-[#0E382B]"
                              : "border-[#E5E0D8] bg-white text-[#666666] hover:border-[#0E382B]/60"
                          }`}
                        >
                          <div className="mb-2 text-[#111111]">{s.icon}</div>
                          <span className="text-xs font-semibold leading-tight text-[#111111]">
                            {s.label}
                          </span>
                          <span className="text-[10px] text-[#777777] mt-1 leading-tight line-clamp-1">
                            {s.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 1.2 Side Setting */}
                <div className="space-y-3 pt-2 border-t border-[#E5E0D8]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
                        2. Shoulder Accent Setting
                      </span>
                      <p className="text-[11px] text-[#777777]">
                        Micro-diamonds flanking the center basket
                      </p>
                    </div>
                    <span className="text-xs text-[#0E382B] font-medium">
                      {SIDE_SETTINGS.find((s) => s.id === ringConfig.side)?.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {SIDE_SETTINGS.map((s) => {
                      const active = ringConfig.side === s.id;
                      return (
                        <button
                          type="button"
                          key={s.id}
                          onClick={() => setRingConfig((prev) => ({ ...prev, side: s.id as SideSetting }))}
                          className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                            active
                              ? "border-[#0E382B] bg-[#FAF7F2] ring-1 ring-[#0E382B] shadow-xs text-[#0E382B]"
                              : "border-[#E5E0D8] bg-white text-[#666666] hover:border-[#0E382B]/60"
                          }`}
                        >
                          <div className="mb-1.5 text-[#111111]">{s.icon}</div>
                          <span className="text-xs font-semibold leading-tight text-[#111111]">
                            {s.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Next Step CTA */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="w-full py-3 bg-[#0E382B] hover:bg-[#154a3a] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Continue to Center Diamond</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SOLITAIRE DIAMOND */}
            {activeStep === 2 && (
              <div className="space-y-7 animate-in fade-in duration-300">
                {/* 2.1 Diamond Shape - Balanced 3x3 Grid (9 Shapes) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
                        1. Diamond Shape (9 Cuts)
                      </span>
                      <p className="text-[11px] text-[#777777]">
                        Tolkowsky CAD faceted cut proportions
                      </p>
                    </div>
                    <span className="text-xs text-[#0E382B] font-medium">
                      {DIAMOND_SHAPES.find((s) => s.id === ringConfig.shape)?.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {DIAMOND_SHAPES.map((s) => {
                      const active = ringConfig.shape === s.id;
                      return (
                        <button
                          type="button"
                          key={s.id}
                          onClick={() => setRingConfig((prev) => ({ ...prev, shape: s.id }))}
                          className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                            active
                              ? "border-[#0E382B] bg-[#FAF7F2] ring-1 ring-[#0E382B] shadow-xs text-[#0E382B]"
                              : "border-[#E5E0D8] bg-white text-[#666666] hover:border-[#0E382B]/60"
                          }`}
                        >
                          <div className="mb-1 text-[#111111]">{s.icon}</div>
                          <span className="text-xs font-semibold leading-tight text-[#111111]">
                            {s.label}
                          </span>
                          <span className="text-[10px] text-[#888888] mt-0.5 font-mono">
                            {s.ratio} ratio
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2.2 Carat Size Slider */}
                <div className="space-y-4 pt-2 border-t border-[#E5E0D8]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
                        2. Center Diamond Carat
                      </span>
                      <p className="text-[11px] text-[#777777]">
                        IGI Certified VVS-VS Colorless Solitaire
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#0E382B] bg-[#EAF3DE] px-2.5 py-1 rounded-full">
                      {ringConfig.carat.toFixed(2)} CT ({CARAT_MM[ringConfig.carat] || `${(ringConfig.carat * 5).toFixed(1)} mm`})
                    </span>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max={CARAT_STEPS.length - 1}
                      step="1"
                      value={CARAT_STEPS.indexOf(ringConfig.carat) !== -1 ? CARAT_STEPS.indexOf(ringConfig.carat) : 3}
                      onChange={(e) =>
                        setRingConfig((prev) => ({
                          ...prev,
                          carat: CARAT_STEPS[parseInt(e.target.value)] || 1.5,
                        }))
                      }
                      className="w-full h-2 bg-[#E5E0D8] rounded-lg appearance-none cursor-pointer accent-[#0E382B]"
                    />
                    <div className="grid grid-cols-6 text-center text-[10px] font-semibold text-[#666666]">
                      {CARAT_STEPS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setRingConfig((prev) => ({ ...prev, carat: c }))}
                          className={`py-1 rounded-md transition-colors cursor-pointer ${
                            ringConfig.carat === c
                              ? "bg-[#0E382B] text-white"
                              : "hover:text-[#111111] hover:bg-black/5"
                          }`}
                        >
                          {c.toFixed(2)} CT
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2.3 Crown Halo Setting */}
                <div className="space-y-3 pt-2 border-t border-[#E5E0D8]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
                        3. Crown Halo Accent
                      </span>
                      <p className="text-[11px] text-[#777777]">
                        Micro-diamonds framing or underneath the diamond
                      </p>
                    </div>
                    <span className="text-xs text-[#0E382B] font-medium">
                      {CROWN_SETTINGS.find((c) => c.id === ringConfig.halo)?.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {CROWN_SETTINGS.map((c) => {
                      const active = ringConfig.halo === c.id;
                      return (
                        <button
                          type="button"
                          key={c.id}
                          onClick={() => setRingConfig((prev) => ({ ...prev, halo: c.id }))}
                          className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                            active
                              ? "border-[#0E382B] bg-[#FAF7F2] ring-1 ring-[#0E382B] shadow-xs text-[#0E382B]"
                              : "border-[#E5E0D8] bg-white text-[#666666] hover:border-[#0E382B]/60"
                          }`}
                        >
                          <div className="mb-1 text-[#111111]">{c.icon}</div>
                          <span className="text-xs font-semibold leading-tight text-[#111111]">
                            {c.label}
                          </span>
                          <span className="text-[10px] text-[#777777] mt-0.5 leading-tight line-clamp-1">
                            {c.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation CTA Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="py-3 px-4 border border-[#E5E0D8] hover:border-[#111111] text-[#555555] hover:text-[#111111] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep(3)}
                    className="flex-1 py-3 bg-[#0E382B] hover:bg-[#154a3a] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Continue to Metal & Size</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PRECIOUS METAL & SIZING */}
            {activeStep === 3 && (
              <div className="space-y-7 animate-in fade-in duration-300">
                {/* 3.1 Precious Metal */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
                        1. Precious Metal
                      </span>
                      <p className="text-[11px] text-[#777777]">
                        Mirror-polished fine jewelry atelier alloys
                      </p>
                    </div>
                    <span className="text-xs text-[#0E382B] font-medium">
                      {METALS_LIST.find((m) => m.id === ringConfig.metal)?.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {METALS_LIST.map((m) => {
                      const active = ringConfig.metal === m.id;
                      return (
                        <button
                          type="button"
                          key={m.id}
                          onClick={() => setRingConfig((prev) => ({ ...prev, metal: m.id }))}
                          className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                            active
                              ? "border-[#0E382B] bg-[#FAF7F2] ring-1 ring-[#0E382B] shadow-xs"
                              : "border-[#E5E0D8] bg-white hover:border-[#0E382B]/60"
                          }`}
                        >
                          <span
                            className="w-7 h-7 rounded-full border border-black/10 shadow-sm"
                            style={{ backgroundColor: m.color }}
                          />
                          <span className="text-xs font-semibold text-[#111111] leading-tight text-center">
                            {m.label}
                          </span>
                          <span className="text-[10px] text-[#888888]">{m.sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3.2 Gold Purity / Karat */}
                <div className="space-y-3 pt-2 border-t border-[#E5E0D8]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
                        2. Gold Purity / Hallmark
                      </span>
                      <p className="text-[11px] text-[#777777]">
                        BIS certified gold purity standard
                      </p>
                    </div>
                    <span className="text-xs text-[#0E382B] font-medium">
                      {ringConfig.metal === "silver" ? "925 Sterling Silver" : `${ringConfig.karat}KT Hallmarked`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={ringConfig.metal === "silver"}
                      onClick={() => setRingConfig((prev) => ({ ...prev, karat: 18 }))}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        ringConfig.karat === 18 && ringConfig.metal !== "silver"
                          ? "border-[#0E382B] bg-[#FAF7F2] ring-1 ring-[#0E382B]"
                          : "border-[#E5E0D8] bg-white hover:border-[#0E382B]/60 opacity-80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#111111]">18KT Gold (750)</span>
                        <span className="text-[10px] bg-[#EAF3DE] text-[#0E382B] font-bold px-1.5 py-0.5 rounded">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666666] mt-1">
                        Prestige benchmark for fine diamond solitaires. Rich luster and enduring strength.
                      </p>
                    </button>

                    <button
                      type="button"
                      disabled={ringConfig.metal === "silver"}
                      onClick={() => setRingConfig((prev) => ({ ...prev, karat: 14 }))}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        ringConfig.karat === 14 && ringConfig.metal !== "silver"
                          ? "border-[#0E382B] bg-[#FAF7F2] ring-1 ring-[#0E382B]"
                          : "border-[#E5E0D8] bg-white hover:border-[#0E382B]/60 opacity-80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#111111]">14KT Gold (585)</span>
                        <span className="text-[10px] bg-[#F5EFE6] text-[#7A6448] font-bold px-1.5 py-0.5 rounded">
                          Value
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666666] mt-1">
                        High durability with genuine gold content. Ideal for active lifestyle daily wear.
                      </p>
                    </button>
                  </div>
                </div>

                {/* 3.3 Indian Ring Size */}
                <div className="space-y-3 pt-2 border-t border-[#E5E0D8]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
                        3. Indian Ring Size
                      </span>
                      <p className="text-[11px] text-[#777777]">
                        Inner diameter: {INDIAN_RING_SIZES[ringConfig.indianSize] || 16.6} mm
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="text-xs text-[#0E382B] underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Ruler size={13} />
                      <span>Size Guide</span>
                    </button>
                  </div>

                  {/* Horizontal Scrollable Ring Size Pills */}
                  <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                    {Object.entries(INDIAN_RING_SIZES).map(([sz, mm]) => {
                      const numSz = Number(sz);
                      const isSelected = ringConfig.indianSize === numSz;
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setRingConfig((prev) => ({ ...prev, indianSize: numSz }))}
                          className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#0E382B] bg-[#0E382B] text-white shadow-sm"
                              : "border-[#E5E0D8] bg-white text-[#444444] hover:border-[#0E382B]"
                          }`}
                        >
                          <span className="text-xs font-bold leading-none">{sz}</span>
                          <span className={`text-[9px] mt-0.5 ${isSelected ? "text-white/80" : "text-[#888888]"}`}>
                            {mm}mm
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation CTA Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="py-3 px-4 border border-[#E5E0D8] hover:border-[#111111] text-[#555555] hover:text-[#111111] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep(4)}
                    className="flex-1 py-3 bg-[#0E382B] hover:bg-[#154a3a] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Review & Personalize</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & PERSONALIZE */}
            {activeStep === 4 && (
              <div className="space-y-7 animate-in fade-in duration-300">
                {/* 4.1 Complimentary Engraving */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
                        1. Complimentary Inner Shank Engraving
                      </span>
                      <p className="text-[11px] text-[#777777]">
                        Laser etched inside the band (Initials, date, or message)
                      </p>
                    </div>
                    <span className="text-[10px] text-[#888888]">Max 18 chars</span>
                  </div>

                  <input
                    type="text"
                    maxLength={18}
                    placeholder="e.g. Forever & Always ♡ 24.12.26"
                    value={engraving}
                    onChange={(e) => setEngraving(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs border border-[#E5E0D8] rounded-xl bg-white text-[#111111] focus:outline-none focus:border-[#0E382B]"
                  />
                  {engraving && (
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DEC9] flex items-center justify-between">
                      <span className="text-xs text-[#777777]">Laser preview:</span>
                      <span className="font-serif italic text-sm text-[#0E382B] font-medium tracking-wide">
                        &quot;{engraving}&quot;
                      </span>
                    </div>
                  )}
                </div>

                {/* 4.2 Comprehensive Configuration Summary Card */}
                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E5E0D8] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#EAE5DE] pb-2">
                    <span className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
                      Selected Configuration
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="text-[11px] text-[#0E382B] underline font-medium cursor-pointer"
                    >
                      Edit Options
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-[#555555]">
                    <div>
                      <span className="text-[#888888] block text-[10px]">CENTER SOLITAIRE</span>
                      <span className="font-semibold text-[#111111]">
                        {ringConfig.carat.toFixed(2)} CT {ringConfig.shape.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#888888] block text-[10px]">METAL & PURITY</span>
                      <span className="font-semibold text-[#111111]">
                        {ringConfig.karat}KT {ringConfig.metal.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#888888] block text-[10px]">SHANK & SHOULDERS</span>
                      <span className="font-semibold text-[#111111]">
                        {RING_STYLES.find((s) => s.id === ringConfig.style)?.label}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#888888] block text-[10px]">INDIAN RING SIZE</span>
                      <span className="font-semibold text-[#111111]">
                        Size {ringConfig.indianSize} ({INDIAN_RING_SIZES[ringConfig.indianSize]} mm)
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4.3 Transparent Atelier Price Breakdown Card */}
                <div className="p-4 bg-white rounded-2xl border border-[#E5E0D8] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
                      Transparent Price Quotation
                    </span>
                    <span className="text-[10px] text-[#0E382B] font-bold bg-[#EAF3DE] px-2 py-0.5 rounded">
                      Zero Hidden Markups
                    </span>
                  </div>

                  <div className="space-y-2 text-xs border-y border-[#F0ECE6] py-3 text-[#444444]">
                    <div className="flex justify-between items-center">
                      <span>Gold Value ({ringConfig.karat}KT · ~{priceBreakup.metalWeight}g @ ₹{priceBreakup.goldRatePerGram}/g)</span>
                      <span className="font-semibold text-[#111111]">
                        ₹{priceBreakup.metalTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Center Solitaire ({ringConfig.carat.toFixed(2)} CT {ringConfig.shape.toUpperCase()} · IGI Certified)</span>
                      <span className="font-semibold text-[#111111]">
                        ₹{priceBreakup.diamondTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                    {priceBreakup.sideStonesTotal > 0 && (
                      <div className="flex justify-between items-center">
                        <span>Side Stones ({ringConfig.side.toUpperCase()} Setting)</span>
                        <span className="font-semibold text-[#111111]">
                          ₹{priceBreakup.sideStonesTotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    {priceBreakup.haloTotal > 0 && (
                      <div className="flex justify-between items-center">
                        <span>Crown Halo ({ringConfig.halo.toUpperCase()})</span>
                        <span className="font-semibold text-[#111111]">
                          ₹{priceBreakup.haloTotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span>Atelier Crafting & BIS Hallmarking</span>
                      <span className="font-semibold text-[#111111]">
                        ₹{priceBreakup.makingCharges.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[#777777] pt-1">
                      <span>GST (3% Indian Jewellery Tax)</span>
                      <span className="font-medium text-[#111111]">
                        ₹{priceBreakup.gst3Percent.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline pt-1">
                    <div>
                      <p className="text-[11px] text-[#777777]">Total Investment (All Taxes Included)</p>
                      <p className="font-serif text-2xl font-bold text-[#0E382B]">
                        ₹{priceBreakup.finalTotal.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <span className="text-[10px] text-[#666666]">Ready in 10-14 days</span>
                  </div>
                </div>

                {/* Back to Metal */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep(3)}
                    className="py-2.5 px-4 border border-[#E5E0D8] hover:border-[#111111] text-[#555555] hover:text-[#111111] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Metal & Sizing</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Pricing & Action Bar */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-[#E5E0D8] p-4 sm:p-5 flex items-center justify-between gap-4 z-30">
            {/* Price & Price Breakup Modal Trigger */}
            <div className="flex flex-col">
              <span className="font-serif text-2xl sm:text-3xl font-semibold text-[#111111]">
                ₹{priceBreakup.finalTotal.toLocaleString("en-IN")}
              </span>
              <button
                type="button"
                onClick={() => setIsBreakupOpen(true)}
                className="text-[11px] uppercase tracking-wider font-semibold text-[#0E382B] underline underline-offset-2 hover:text-[#175643] transition-colors text-left cursor-pointer mt-0.5"
              >
                View Itemized Breakup
              </button>
            </div>

            {/* Add to Cart & Consultation Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsConsultOpen(true)}
                title="Book an Atelier Expert Consultation"
                className="px-3.5 py-3.5 rounded-xl border border-[#E5E0D8] hover:border-[#0E382B] text-[#111111] hover:text-[#0E382B] transition-all cursor-pointer hidden sm:flex items-center justify-center"
              >
                <MessageCircle size={17} />
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                className="px-6 sm:px-8 py-3.5 bg-[#0E382B] hover:bg-[#154a3a] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <ShoppingBag size={15} />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 3. Notification Toast when Added to Cart */}
      {addedNotice && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#0E382B] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <Check size={16} className="text-[#C5A880]" />
          <span>Bespoke Solitaire Ring Added to Bag!</span>
        </div>
      )}

      {/* 4. Luxury Price Breakup Modal */}
      {isBreakupOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#E5E0D8] relative">
            <button
              type="button"
              onClick={() => setIsBreakupOpen(false)}
              className="absolute top-5 right-5 text-[#888888] hover:text-[#111111] p-1 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#0E382B]">
                Transparent Atelier Quotation
              </p>
              <h2 className="font-serif text-2xl text-[#111111]">Itemized Price Breakup</h2>
              <p className="text-xs text-[#666666]">
                Every component is individually quantified with zero hidden markups.
              </p>
            </div>

            <div className="space-y-3 text-xs border-y border-[#E5E0D8] py-4 text-[#333333]">
              <div className="flex justify-between items-center">
                <span>
                  Gold Value ({ringConfig.karat}KT · ~{priceBreakup.metalWeight}g @ ₹{priceBreakup.goldRatePerGram}/g)
                </span>
                <span className="font-semibold text-[#111111]">
                  ₹{priceBreakup.metalTotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>
                  Center Solitaire ({ringConfig.carat.toFixed(2)} CT {ringConfig.shape.toUpperCase()} · IGI Certified VVS-VS)
                </span>
                <span className="font-semibold text-[#111111]">
                  ₹{priceBreakup.diamondTotal.toLocaleString("en-IN")}
                </span>
              </div>
              {priceBreakup.sideStonesTotal > 0 && (
                <div className="flex justify-between items-center">
                  <span>Side Stones ({ringConfig.side.toUpperCase()} Setting)</span>
                  <span className="font-semibold text-[#111111]">
                    ₹{priceBreakup.sideStonesTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              {priceBreakup.haloTotal > 0 && (
                <div className="flex justify-between items-center">
                  <span>Crown Setting ({ringConfig.halo.toUpperCase()})</span>
                  <span className="font-semibold text-[#111111]">
                    ₹{priceBreakup.haloTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span>Atelier Making Charges & BIS Hallmarking</span>
                <span className="font-semibold text-[#111111]">
                  ₹{priceBreakup.makingCharges.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#777777] pt-2 border-t border-[#F0ECE6]">
                <span>GST (3% Indian Jewellery Tax)</span>
                <span className="font-medium text-[#111111]">
                  ₹{priceBreakup.gst3Percent.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1">
              <div>
                <p className="text-xs text-[#777777]">Final Total (All Inclusive)</p>
                <p className="font-serif text-2xl font-bold text-[#0E382B]">
                  ₹{priceBreakup.finalTotal.toLocaleString("en-IN")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsBreakupOpen(false);
                  handleAddToCart();
                }}
                className="px-6 py-2.5 bg-[#0E382B] text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#154a3a] transition-all cursor-pointer"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Ring Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[#E5E0D8] relative">
            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(false)}
              className="absolute top-5 right-5 text-[#888888] hover:text-[#111111] p-1 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#0E382B]">
                Precision Sizing
              </p>
              <h2 className="font-serif text-2xl text-[#111111]">Indian Ring Size Guide</h2>
              <p className="text-xs text-[#666666]">
                Standard Indian ring sizes corresponding to inner millimeter diameter.
              </p>
            </div>

            <div className="max-h-[260px] overflow-y-auto border border-[#E5E0D8] rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] text-[#111111] border-b border-[#E5E0D8] sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Indian Size</th>
                    <th className="py-2.5 px-4 font-semibold">Inner Diameter</th>
                    <th className="py-2.5 px-4 font-semibold">Inner Circumference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0ECE6]">
                  {Object.entries(INDIAN_RING_SIZES).map(([sz, mm]) => (
                    <tr
                      key={sz}
                      className={ringConfig.indianSize === Number(sz) ? "bg-[#FAF7F2] font-semibold text-[#0E382B]" : ""}
                    >
                      <td className="py-2 px-4">Size {sz}</td>
                      <td className="py-2 px-4">{mm} mm</td>
                      <td className="py-2 px-4">{(mm * Math.PI).toFixed(1)} mm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E5DEC9] space-y-1 text-xs text-[#555555]">
              <span className="font-semibold text-[#111111] block">How to Measure at Home:</span>
              <p className="text-[11px] leading-relaxed">
                Wrap a narrow strip of paper snugly around your finger base. Mark where the paper overlaps and measure the millimeter length on a ruler. Compare with the circumference above.
              </p>
              <p className="text-[10px] text-[#0E382B] font-medium pt-1">
                ✓ Free ring resizing offered within 30 days of delivery.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(false)}
              className="w-full py-2.5 bg-[#0E382B] text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#154a3a] transition-all cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* 6. Atelier Stylist Consultation Modal */}
      {isConsultOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[#E5E0D8] relative">
            <button
              type="button"
              onClick={() => {
                setIsConsultOpen(false);
                setConsultSent(false);
              }}
              className="absolute top-5 right-5 text-[#888888] hover:text-[#111111] p-1 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#0E382B]">
                Aryora Atelier Bespoke Concierge
              </p>
              <h2 className="font-serif text-2xl text-[#111111]">Speak with a Diamond Master</h2>
              <p className="text-xs text-[#666666]">
                Our master gemologist will contact you to refine prong profile, diamond grading, or custom band contours.
              </p>
            </div>

            {consultSent ? (
              <div className="p-6 bg-[#FAF7F2] rounded-2xl border border-[#C5DDA8] text-center space-y-2">
                <Check size={28} className="text-[#0E382B] mx-auto" />
                <h3 className="font-serif text-lg font-semibold text-[#0E382B]">
                  Consultation Booked
                </h3>
                <p className="text-xs text-[#666666]">
                  Our master artisan will reach out via WhatsApp at {consultForm.phone || "your number"} within 2 hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setConsultSent(true);
                }}
                className="space-y-3.5 text-xs"
              >
                <div>
                  <label className="block text-[11px] font-medium text-[#444444] mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mayank Sharma"
                    value={consultForm.name}
                    onChange={(e) => setConsultForm({ ...consultForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E5E0D8] rounded-xl focus:outline-none focus:border-[#0E382B]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#444444] mb-1">WhatsApp Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={consultForm.phone}
                    onChange={(e) => setConsultForm({ ...consultForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E5E0D8] rounded-xl focus:outline-none focus:border-[#0E382B]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#444444] mb-1">Specific Requests</label>
                  <textarea
                    rows={2}
                    placeholder="Prong profile, diamond certification, target engagement date..."
                    value={consultForm.notes}
                    onChange={(e) => setConsultForm({ ...consultForm, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E5E0D8] rounded-xl focus:outline-none focus:border-[#0E382B]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0E382B] text-white py-3 rounded-xl font-medium text-xs uppercase tracking-wider hover:bg-[#154a3a] transition-all cursor-pointer mt-2"
                >
                  Send Consultation Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
