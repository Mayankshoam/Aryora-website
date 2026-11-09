"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { CARAT_SCALES, METAL_PROPERTIES } from "@/components/RingPreview";
import { RingConfig, RingStyle, SideSetting, DiamondShape, Halo, Metal } from "@/components/ring3d/types";

const Ring3DViewer = dynamic(() => import("@/components/ring3d/Ring3DViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-square min-h-[460px] sm:min-h-[560px] lg:min-h-[620px] bg-[#FAF8F5] rounded-3xl flex flex-col items-center justify-center border border-[#E8E2D8] gap-3">
      <div className="w-8 h-8 border-2 border-[#0E382B] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-[#666666] tracking-wide font-medium">Loading 3D Solitaire Atelier...</span>
    </div>
  ),
});
import { useAryoraStore } from "@/lib/store";
import { Product } from "@/lib/data";
import {
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  ArrowLeft,
  X,
  Check,
  Calendar,
  MessageCircle,
  HelpCircle,
} from "lucide-react";

// 1. RING STYLES with line-drawing icons
const RING_STYLES = [
  {
    id: "classic",
    label: "Classic Straight",
    desc: "Clean, timeless shank meeting the center basket",
    icon: (
      <svg viewBox="0 0 48 24" className="w-10 h-5 stroke-current fill-none stroke-[1.4]">
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
      <svg viewBox="0 0 48 24" className="w-10 h-5 stroke-current fill-none stroke-[1.4]">
        <circle cx="24" cy="9" r="5" className="stroke-[1.6]" />
        <path d="M6 18 Q 18 18 20 11" />
        <path d="M42 18 Q 30 18 28 11" />
      </svg>
    ),
  },
  {
    id: "twist",
    label: "Twist",
    desc: "Gracefully intertwining bands symbolizing unity",
    icon: (
      <svg viewBox="0 0 48 24" className="w-10 h-5 stroke-current fill-none stroke-[1.4]">
        <circle cx="24" cy="12" r="5" className="stroke-[1.6]" />
        <path d="M6 14 Q 16 8 20 12" />
        <path d="M42 10 Q 32 16 28 12" />
      </svg>
    ),
  },
  {
    id: "split",
    label: "Split Shank",
    desc: "Dual bands flaring outwards toward the solitaire",
    icon: (
      <svg viewBox="0 0 48 24" className="w-10 h-5 stroke-current fill-none stroke-[1.4]">
        <circle cx="24" cy="12" r="5" className="stroke-[1.6]" />
        <path d="M6 12 L 18 9" />
        <path d="M6 12 L 18 15" />
        <path d="M42 12 L 30 9" />
        <path d="M42 12 L 30 15" />
      </svg>
    ),
  },
  {
    id: "two-row",
    label: "Two Row Split",
    desc: "Parallel modern double band architecture",
    icon: (
      <svg viewBox="0 0 48 24" className="w-10 h-5 stroke-current fill-none stroke-[1.4]">
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
    label: "Pinch",
    desc: "Band tapers inward to amplify center diamond size",
    icon: (
      <svg viewBox="0 0 48 24" className="w-10 h-5 stroke-current fill-none stroke-[1.4]">
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
    desc: "Smooth mirror-polished precious metal band",
    icon: (
      <svg viewBox="0 0 48 20" className="w-10 h-5 stroke-current fill-none stroke-[1.4]">
        <rect x="6" y="8" width="36" height="4" rx="2" />
      </svg>
    ),
  },
  {
    id: "pave",
    label: "Pavé",
    desc: "Micro-diamonds embedded along band crest",
    icon: (
      <svg viewBox="0 0 48 20" className="w-10 h-5 stroke-current fill-none stroke-[1.4]">
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
    label: "Prong",
    desc: "Raised shared-prong diamond accents",
    icon: (
      <svg viewBox="0 0 48 20" className="w-10 h-5 stroke-current fill-none stroke-[1.4]">
        <circle cx="12" cy="10" r="2.5" />
        <circle cx="24" cy="10" r="2.5" />
        <circle cx="36" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    id: "channel",
    label: "Channel",
    desc: "Accent diamonds nestled inside polished metal rails",
    icon: (
      <svg viewBox="0 0 48 20" className="w-10 h-5 stroke-current fill-none stroke-[1.4]">
        <line x1="6" y1="6" x2="42" y2="6" />
        <circle cx="14" cy="10" r="2" />
        <circle cx="24" cy="10" r="2" />
        <circle cx="34" cy="10" r="2" />
        <line x1="6" y1="14" x2="42" y2="14" />
      </svg>
    ),
  },
];

// 3. DIAMOND SHAPES
const DIAMOND_SHAPES = [
  {
    id: "Round Brilliant",
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
    id: "Princess",
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
    id: "Oval",
    label: "Oval",
    ratio: "1.35",
    icon: (
      <svg viewBox="0 0 32 32" className="w-7 h-7 stroke-current fill-none stroke-[1.3]">
        <ellipse cx="16" cy="16" rx="9" ry="13" />
        <ellipse cx="16" cy="16" rx="5" ry="7" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    id: "Emerald Cut",
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
    id: "Cushion",
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
    id: "Pear (Teardrop)",
    label: "Pear",
    ratio: "1.50",
    icon: (
      <svg viewBox="0 0 32 32" className="w-7 h-7 stroke-current fill-none stroke-[1.3]">
        <path d="M16 4 C 23 14, 25 24, 16 27 C 7 24, 9 14, 16 4 Z" />
      </svg>
    ),
  },
  {
    id: "Radiant",
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
    id: "Marquise",
    label: "Marquise",
    ratio: "1.80",
    icon: (
      <svg viewBox="0 0 32 32" className="w-7 h-7 stroke-current fill-none stroke-[1.3]">
        <path d="M16 4 Q 28 16 16 28 Q 4 16 16 4 Z" />
      </svg>
    ),
  },
];

// 4. CARAT STEPS
const CARAT_STEPS = ["0.50 Carat", "0.75 Carat", "1.00 Carat", "1.50 Carat", "2.00 Carat", "3.00 Carat"];

// 5. CROWN SETTING (Halo)
const CROWN_SETTINGS = [
  {
    id: "none",
    label: "No Halo",
    desc: "Pure classic solitaire",
    icon: (
      <svg viewBox="0 0 36 20" className="w-8 h-5 stroke-current fill-none stroke-[1.4]">
        <circle cx="18" cy="10" r="5" />
      </svg>
    ),
  },
  {
    id: "hidden-halo",
    label: "Hidden Halo",
    desc: "Micro-diamonds under basket collar",
    icon: (
      <svg viewBox="0 0 36 20" className="w-8 h-5 stroke-current fill-none stroke-[1.4]">
        <circle cx="18" cy="8" r="5" />
        <line x1="12" y1="14" x2="24" y2="14" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    id: "single-halo",
    label: "Single Halo",
    desc: "Full halo framing center diamond",
    icon: (
      <svg viewBox="0 0 36 20" className="w-8 h-5 stroke-current fill-none stroke-[1.4]">
        <circle cx="18" cy="10" r="4" />
        <circle cx="18" cy="10" r="8" strokeDasharray="2 2" />
      </svg>
    ),
  },
];

// 6. METALS
const METALS_LIST = [
  { id: "YELLOW_GOLD", label: "Yellow Gold", color: "#E5C158", ringImg: "bg-[#E5C158]" },
  { id: "WHITE_GOLD", label: "White Gold", color: "#F0F2F5", ringImg: "bg-[#E2E6EA]" },
  { id: "ROSE_GOLD", label: "Rose Gold", color: "#E8AD96", ringImg: "bg-[#E8AD96]" },
  { id: "SILVER_925", label: "925 Silver", color: "#DDE1E5", ringImg: "bg-[#DDE1E5]" },
];

// 7. INDIAN RING SIZES
const RING_SIZES = [
  "Size 8 (15.3 mm)",
  "Size 9 (15.6 mm)",
  "Size 10 (15.9 mm)",
  "Size 11 (16.2 mm)",
  "Size 12 (16.5 mm)",
  "Size 13 (16.8 mm)",
  "Size 14 (17.2 mm)",
  "Size 15 (17.5 mm)",
  "Size 16 (17.8 mm)",
  "Size 17 (18.1 mm)",
  "Size 18 (18.5 mm)",
  "Size 19 (18.8 mm)",
  "Size 20 (19.1 mm)",
  "Size 21 (19.4 mm)",
  "Size 22 (19.8 mm)",
];

export default function CustomizePage() {
  const addToCart = useAryoraStore((state) => state.addToCart);

  // Configuration States
  const [ringStyle, setRingStyle] = useState("classic");
  const [sideSetting, setSideSetting] = useState("plain");
  const [shape, setShape] = useState("Round Brilliant");
  const [carat, setCarat] = useState("1.50 Carat");
  const [crownSetting, setCrownSetting] = useState("none");
  const [metal, setMetal] = useState("YELLOW_GOLD");
  const [karat, setKarat] = useState("18KT");
  const [ringSize, setRingSize] = useState("Size 12 (16.5 mm)");
  const [engraving, setEngraving] = useState("");

  // Modals
  const [isBreakupOpen, setIsBreakupOpen] = useState(false);
  const [isConsultOpen, setIsConsultOpen] = useState(false);
  const [consultForm, setConsultForm] = useState({ name: "", phone: "", notes: "" });
  const [consultSent, setConsultSent] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  // Dynamic Price Engine
  const priceBreakup = useMemo(() => {
    // 1. Metal Base (4.2g approx)
    let goldRatePerGram = 6780;
    if (karat === "14KT") goldRatePerGram = 5420;
    if (metal === "SILVER_925") goldRatePerGram = 1200;

    let metalWeight = 4.2;
    if (ringStyle === "cathedral" || ringStyle === "split") metalWeight += 0.6;
    if (ringStyle === "two-row") metalWeight += 0.9;

    const metalTotal = Math.round(metalWeight * goldRatePerGram);

    // 2. Diamond Carat Base
    const caratValues: Record<string, number> = {
      "0.50 Carat": 24500,
      "0.75 Carat": 36800,
      "1.00 Carat": 52400,
      "1.50 Carat": 78900,
      "2.00 Carat": 112000,
      "3.00 Carat": 178000,
    };
    const diamondTotal = caratValues[carat] ?? 78900;

    // 3. Side Stones
    let sideStonesTotal = 0;
    if (sideSetting === "pave") sideStonesTotal = 8500;
    if (sideSetting === "prong") sideStonesTotal = 9200;
    if (sideSetting === "channel") sideStonesTotal = 10500;

    // 4. Crown Halo
    let haloTotal = 0;
    if (crownSetting === "hidden-halo") haloTotal = 4800;
    if (crownSetting === "single-halo") haloTotal = 8900;

    // 5. Making Charges
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
  }, [metal, karat, ringStyle, carat, sideSetting, crownSetting]);

  // Dynamic Ring Title matching Origem India
  const ringTitle = useMemo(() => {
    const styleObj = RING_STYLES.find((s) => s.id === ringStyle);
    const shapeObj = DIAMOND_SHAPES.find((s) => s.id === shape);
    const haloStr = crownSetting === "hidden-halo" ? "Hidden Halo " : crownSetting === "single-halo" ? "Halo " : "";
    const sideStr = sideSetting !== "plain" ? ` with ${sideSetting.toUpperCase()} Diamonds` : "";
    return `Solitaire ${carat.replace(" Carat", "ct")} ${shapeObj?.label || shape} ${haloStr}${styleObj?.label || ""} Ring${sideStr}`;
  }, [ringStyle, shape, carat, crownSetting, sideSetting]);

  // Dynamic 3D Config for Ring3DViewer
  const ring3dConfig: RingConfig = useMemo(() => {
    let style: RingStyle = 'classic';
    if (ringStyle === 'cathedral') style = 'cathedral';
    else if (ringStyle === 'twist') style = 'twist';
    else if (ringStyle === 'split') style = 'split';
    else if (ringStyle === 'two-row') style = 'twoRowSplit';
    else if (ringStyle === 'pinch') style = 'pinch';

    let side: SideSetting = 'plain';
    if (sideSetting === 'pave') side = 'pave';
    else if (sideSetting === 'prong') side = 'prong';
    else if (sideSetting === 'channel') side = 'channel';

    let shapeKey: DiamondShape = 'round';
    const s = shape.toLowerCase();
    if (s.includes('princess')) shapeKey = 'princess';
    else if (s.includes('oval')) shapeKey = 'oval';
    else if (s.includes('emerald')) shapeKey = 'emerald';
    else if (s.includes('cushion')) shapeKey = 'cushion';
    else if (s.includes('pear')) shapeKey = 'pear';
    else if (s.includes('radiant')) shapeKey = 'radiant';
    else if (s.includes('asscher')) shapeKey = 'asscher';
    else if (s.includes('marquise')) shapeKey = 'marquise';

    const caratNum = parseFloat(carat) || 1.5;

    let halo: Halo = 'none';
    if (crownSetting === 'hidden-halo') halo = 'hidden';
    else if (crownSetting === 'single-halo' || crownSetting === 'halo') halo = 'single';

    let metalKey: Metal = 'yellow';
    if (metal.includes('WHITE')) metalKey = 'white';
    else if (metal.includes('ROSE')) metalKey = 'rose';
    else if (metal.includes('SILVER')) metalKey = 'silver';

    const karatNum: 14 | 18 = karat.includes('14') ? 14 : 18;

    const sizeMatch = ringSize.match(/\d+/);
    const indianSize = sizeMatch ? parseInt(sizeMatch[0], 10) : 12;

    return {
      style,
      side,
      shape: shapeKey,
      carat: caratNum,
      halo,
      metal: metalKey,
      karat: karatNum,
      indianSize,
    };
  }, [ringStyle, sideSetting, shape, carat, crownSetting, metal, karat, ringSize]);

  // Handle Add to Cart
  const handleAddToCart = () => {
    const metalLabel = METAL_PROPERTIES[metal]?.label || "18K Gold";
    const customProduct: Product = {
      id: `custom-ring-${Date.now()}`,
      slug: `custom-ring-${Date.now()}`,
      name: ringTitle,
      category: "Rings",
      subcategory: "Custom Engagement Rings",
      metal: `${karat} ${metalLabel}`,
      purity: karat,
      stone: "IGI Certified Lab Diamond",
      carat: CARAT_SCALES[carat]?.num ?? 1.5,
      shape: shape,
      color: "E-F Colorless",
      clarity: "VVS-VS",
      certificate: "IGI Certified",
      weightGrams: priceBreakup.metalWeight,
      sizes: [ringSize],
      occasion: "Engagement & Daily Fine Luxury",
      gender: "Women",
      style: `${ringStyle} / ${sideSetting} / ${crownSetting}`,
      price: priceBreakup.finalTotal,
      discountPercent: 0,
      stock: 50,
      images: ["/site/hero-poster.svg"],
      description: `Bespoke custom solitaire ring configured online: ${ringTitle}. Crafted in ${karat} ${metalLabel} (${priceBreakup.metalWeight}g). Ring Size: ${ringSize}${engraving ? `. Inscription: "${engraving}"` : ""}. Includes physical IGI Solitaire Report & BIS Hallmarking Certificate.`,
      tags: ["Custom", "Solitaire", "Bespoke", "Ring Builder", "Lab Grown"],
      isBestseller: false,
      isNew: true,
    };

    addToCart(customProduct, 1, ringSize, `${karat} ${metalLabel}`);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  // Reset defaults
  const handleReset = () => {
    setRingStyle("classic");
    setSideSetting("plain");
    setShape("Round Brilliant");
    setCarat("1.50 Carat");
    setCrownSetting("none");
    setMetal("YELLOW_GOLD");
    setKarat("18KT");
    setRingSize("Size 12 (16.5 mm)");
    setEngraving("");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#111111] flex flex-col">
      {/* 1. Origem-Style Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E0D8] px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium text-[#666666] hover:text-[#111111] transition-colors"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Exit to Store</span>
          </Link>
          <div className="h-4 w-px bg-[#E5E0D8] hidden sm:block" />
          <span className="font-serif text-lg tracking-wider font-semibold text-[#0E382B]">AYOR</span>
        </div>

        {/* Center Banner matching Origem India */}
        <div className="hidden md:flex items-center gap-2 text-xs text-[#0E382B] font-medium bg-[#FAF6F0] px-4 py-1.5 rounded-full border border-[#E5DEC9]">
          <Sparkles size={13} className="text-[#C5A880]" />
          <span>India&apos;s First 3D Solitaire Builder: Design Your Dream Ring in Minutes</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium px-3 py-1.5 rounded-xl border border-[#E5E0D8] hover:border-[#0E382B] text-[#555555] hover:text-[#111111] transition-all cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>
      </header>

      {/* 2. Main 2-Column Split: 3D Stage on Left, Configurator on Right */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto grid lg:grid-cols-12 min-h-[calc(100vh-60px)]">
        {/* Left Column: 3D Stage */}
        <section className="lg:col-span-7 p-4 sm:p-6 lg:p-8 flex flex-col justify-between relative bg-[#FAF8F5]">
          <div className="w-full flex-1 flex flex-col justify-center items-center">
            <div className="w-full max-w-[640px] w-full relative">
              <Ring3DViewer config={ring3dConfig} />
            </div>
          </div>

          {/* Bottom Trust & Feature Bar under 3D Stage */}
          <div className="mt-4 pt-4 border-t border-[#EAE5DE] flex flex-wrap items-center justify-between gap-4 text-xs text-[#666666]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#108474]" />
              <span className="font-medium text-[#111111]">100% BIS Hallmarked 18K Gold</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#108474]" />
              <span className="font-medium text-[#111111]">IGI Certified Lab-Grown Solitaires</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#108474]" />
              <span className="font-medium text-[#111111]">Free Insured Express Delivery</span>
            </div>
          </div>
        </section>

        {/* Right Column: Scrollable Configurator Panel */}
        <section className="lg:col-span-5 bg-white border-l border-[#E5E0D8] flex flex-col justify-between">
          <div className="p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-140px)]">
            {/* Header: Dynamic Ring Title */}
            <div className="space-y-1.5 pb-4 border-b border-[#E5E0D8]">
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#0E382B]">
                Awadhi Atelier Bespoke Creation
              </p>
              <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#111111] leading-tight">
                {ringTitle}
              </h1>
              <p className="text-xs text-[#666666]">
                IGI Certified · {karat} Gold · Handcrafted in Lucknow · Ready in 10-14 days
              </p>
            </div>

            {/* 1. RING STYLE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
                  Ring Style
                </span>
                <span className="text-xs text-[#0E382B] font-medium">
                  {RING_STYLES.find((s) => s.id === ringStyle)?.label}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {RING_STYLES.map((s) => {
                  const active = ringStyle === s.id;
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setRingStyle(s.id)}
                      className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${active
                          ? "border-[#0E382B] bg-[#FAF7F2] ring-1 ring-[#0E382B] shadow-xs text-[#0E382B]"
                          : "border-[#E5E0D8] bg-white text-[#666666] hover:border-[#0E382B]/60"
                        }`}
                    >
                      <div className="mb-1.5 text-[#111111]">{s.icon}</div>
                      <span className="text-[11px] font-medium leading-tight">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. SIDE SETTING (Shoulder Stones) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
                  Side Setting
                </span>
                <span className="text-xs text-[#0E382B] font-medium">
                  {SIDE_SETTINGS.find((s) => s.id === sideSetting)?.label}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {SIDE_SETTINGS.map((s) => {
                  const active = sideSetting === s.id;
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setSideSetting(s.id)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${active
                          ? "border-[#0E382B] bg-[#FAF7F2] ring-1 ring-[#0E382B] shadow-xs text-[#0E382B]"
                          : "border-[#E5E0D8] bg-white text-[#666666] hover:border-[#0E382B]/60"
                        }`}
                    >
                      <div className="mb-1 text-[#111111]">{s.icon}</div>
                      <span className="text-[11px] font-medium leading-tight">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. DIAMOND SHAPE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
                  Diamond Shape
                </span>
                <span className="text-xs text-[#0E382B] font-medium">{shape}</span>
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {DIAMOND_SHAPES.map((s) => {
                  const active = shape === s.id;
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setShape(s.id)}
                      className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${active
                          ? "border-[#0E382B] bg-[#FAF7F2] ring-1 ring-[#0E382B] shadow-xs text-[#0E382B]"
                          : "border-[#E5E0D8] bg-white text-[#666666] hover:border-[#0E382B]/60"
                        }`}
                    >
                      <div className="mb-1 text-[#111111]">{s.icon}</div>
                      <span className="text-[11px] font-medium leading-tight">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. CENTER DIAMOND SIZE (Carat Slider matching Origem India) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
                  Center Diamond Size
                </span>
                <span className="text-xs font-semibold text-[#0E382B]">
                  {carat} ({CARAT_SCALES[carat]?.mm})
                </span>
              </div>

              {/* Step Buttons and Slider Track */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={CARAT_STEPS.length - 1}
                  step="1"
                  value={CARAT_STEPS.indexOf(carat)}
                  onChange={(e) => setCarat(CARAT_STEPS[parseInt(e.target.value)])}
                  className="w-full h-1.5 bg-[#E5E0D8] rounded-lg appearance-none cursor-pointer accent-[#0E382B]"
                />
                <div className="flex justify-between text-[10px] text-[#777777] font-medium px-1">
                  {CARAT_STEPS.map((c) => (
                    <span
                      key={c}
                      onClick={() => setCarat(c)}
                      className={`cursor-pointer transition-colors ${carat === c ? "text-[#0E382B] font-bold" : "hover:text-[#111111]"
                        }`}
                    >
                      {c.replace(" Carat", " CT")}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. CROWN SETTING (Halo) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
                  Crown Setting
                </span>
                <span className="text-xs text-[#0E382B] font-medium">
                  {CROWN_SETTINGS.find((c) => c.id === crownSetting)?.label}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {CROWN_SETTINGS.map((c) => {
                  const active = crownSetting === c.id;
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setCrownSetting(c.id)}
                      className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${active
                          ? "border-[#0E382B] bg-[#FAF7F2] ring-1 ring-[#0E382B] shadow-xs text-[#0E382B]"
                          : "border-[#E5E0D8] bg-white text-[#666666] hover:border-[#0E382B]/60"
                        }`}
                    >
                      <div className="mb-1 text-[#111111]">{c.icon}</div>
                      <span className="text-[11px] font-medium leading-tight">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. PRECIOUS METAL */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
                  Precious Metal
                </span>
                <span className="text-xs text-[#0E382B] font-medium">
                  {METALS_LIST.find((m) => m.id === metal)?.label}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {METALS_LIST.map((m) => {
                  const active = metal === m.id;
                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setMetal(m.id)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${active
                          ? "border-[#0E382B] bg-[#FAF7F2] ring-1 ring-[#0E382B] shadow-xs"
                          : "border-[#E5E0D8] bg-white hover:border-[#0E382B]/60"
                        }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                        style={{ backgroundColor: m.color }}
                      />
                      <span className="text-[10px] font-medium text-[#111111] leading-tight text-center">
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 7. METAL KARAT & RING SIZE DROPDOWNS */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#111111]">
                  Metal Karat
                </label>
                <select
                  value={karat}
                  onChange={(e) => setKarat(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-white border border-[#E5E0D8] rounded-xl text-[#111111] focus:outline-none focus:border-[#0E382B] cursor-pointer"
                >
                  <option value="18KT">18KT Gold (Standard)</option>
                  <option value="14KT">14KT Gold</option>
                  {metal === "SILVER_925" && <option value="925">925 Sterling Silver</option>}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#111111]">
                  Indian Ring Size
                </label>
                <select
                  value={ringSize}
                  onChange={(e) => setRingSize(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-white border border-[#E5E0D8] rounded-xl text-[#111111] focus:outline-none focus:border-[#0E382B] cursor-pointer"
                >
                  {RING_SIZES.map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 8. OPTIONAL COMPLIMENTARY ENGRAVING */}
            <div className="space-y-2 pt-2 border-t border-[#E5E0D8]">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#111111]">
                  Complimentary Inner Shank Engraving
                </label>
                <span className="text-[10px] text-[#888888]">Max 18 chars</span>
              </div>
              <input
                type="text"
                maxLength={18}
                placeholder="e.g. Forever & Always · 24.12.26"
                value={engraving}
                onChange={(e) => setEngraving(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-[#E5E0D8] rounded-xl bg-white text-[#111111] focus:outline-none focus:border-[#0E382B]"
              />
            </div>
          </div>

          {/* Sticky Bottom Pricing & Action Bar (Origem India Layout) */}
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
                View Price Breakup
              </button>
            </div>

            {/* Add to Cart & Consultation Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsConsultOpen(true)}
                title="Book an Atelier Expert Consultation"
                className="px-3 py-3 rounded-xl border border-[#E5E0D8] hover:border-[#0E382B] text-[#111111] hover:text-[#0E382B] transition-all cursor-pointer hidden sm:flex items-center justify-center"
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
          <span>Bespoke Ring Added to Bag! Opening Cart...</span>
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
              <h2 className="font-serif text-2xl text-[#111111]">Price Breakup</h2>
              <p className="text-xs text-[#666666]">
                Every component is individually quantified with zero hidden markups.
              </p>
            </div>

            <div className="space-y-3 text-xs border-y border-[#E5E0D8] py-4 text-[#333333]">
              <div className="flex justify-between items-center">
                <span>
                  Gold Value ({karat} · ~{priceBreakup.metalWeight}g @ ₹{priceBreakup.goldRatePerGram}/g)
                </span>
                <span className="font-semibold text-[#111111]">
                  ₹{priceBreakup.metalTotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>
                  Center Solitaire ({carat} {shape} · IGI Certified VVS-VS)
                </span>
                <span className="font-semibold text-[#111111]">
                  ₹{priceBreakup.diamondTotal.toLocaleString("en-IN")}
                </span>
              </div>
              {priceBreakup.sideStonesTotal > 0 && (
                <div className="flex justify-between items-center">
                  <span>Side Stones ({sideSetting.toUpperCase()} Lab Diamonds)</span>
                  <span className="font-semibold text-[#111111]">
                    ₹{priceBreakup.sideStonesTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              {priceBreakup.haloTotal > 0 && (
                <div className="flex justify-between items-center">
                  <span>Crown Setting ({crownSetting.replace("-", " ").toUpperCase()})</span>
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
                className="px-5 py-3 bg-[#0E382B] text-white text-xs uppercase tracking-wider font-medium rounded-xl hover:bg-[#154a3a] transition-all cursor-pointer"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Consultation Modal */}
      {isConsultOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[#E5E0D8] relative">
            <button
              type="button"
              onClick={() => setIsConsultOpen(false)}
              className="absolute top-5 right-5 text-[#888888] hover:text-[#111111] p-1 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#0E382B]">
                Atelier Concierge
              </p>
              <h2 className="font-serif text-2xl text-[#111111]">Consult Our Master Gemologist</h2>
              <p className="text-xs text-[#666666]">
                Share your design blueprint for personalized 3D CAD adjustment or diamond selection advice.
              </p>
            </div>

            {consultSent ? (
              <div className="p-4 bg-[#FAF7F2] border border-[#0E382B]/20 rounded-xl text-center space-y-2">
                <Check size={20} className="text-[#108474] mx-auto" />
                <p className="text-xs font-semibold text-[#0E382B]">Request Received</p>
                <p className="text-[11px] text-[#666666]">
                  Our master gemologist will reach out to you within 2 hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setConsultSent(true);
                  setTimeout(() => {
                    setIsConsultOpen(false);
                    setConsultSent(false);
                  }, 2500);
                }}
                className="space-y-3.5 text-xs"
              >
                <div>
                  <label className="block text-[11px] font-medium text-[#444444] mb-1">Your Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter your name"
                    value={consultForm.name}
                    onChange={(e) => setConsultForm({ ...consultForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E5E0D8] rounded-xl focus:outline-none focus:border-[#0E382B]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#444444] mb-1">Mobile (WhatsApp)</label>
                  <input
                    required
                    type="tel"
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
