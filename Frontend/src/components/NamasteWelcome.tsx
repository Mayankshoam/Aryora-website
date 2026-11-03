"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, X, Heart, ShieldCheck, ArrowRight } from "lucide-react";

export default function NamasteWelcome() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    // Check if user has already seen welcome during this browsing session
    const seen = sessionStorage.getItem("ayor_welcome_greeted");
    if (!seen) {
      // Delay slightly for dramatic, smooth entrance after initial page mount
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem("ayor_welcome_greeted", "true");
  };

  const handleEnterAtelier = () => {
    setHasEntered(true);
    setTimeout(() => {
      handleDismiss();
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-700 ${
        hasEntered ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
      }`}
      style={{
        backgroundColor: "rgba(14, 56, 43, 0.72)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* 3D Perspective Modal Card */}
      <div
        className="relative w-full max-w-4xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF7F2] to-[#F5EFEB] border-2 border-[#C5A880]/60 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden animate-fadeIn"
        style={{
          perspective: "1200px",
          boxShadow: "0 25px 60px -15px rgba(14, 56, 43, 0.4), 0 0 40px rgba(197, 168, 128, 0.25)",
        }}
      >
        {/* Subtle Decorative Gold Corner Accents */}
        <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-[#C5A880]/40 rounded-tl-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-[#C5A880]/40 rounded-tr-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-[#C5A880]/40 rounded-bl-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-[#C5A880]/40 rounded-br-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-white/80 hover:bg-white border border-[#DDD8D0] flex items-center justify-center text-[#666666] hover:text-[#111111] transition-colors z-20 shadow-xs"
          aria-label="Close welcome"
        >
          <X size={18} />
        </button>

        {/* MAIN 3D GREETING STAGE */}
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 pt-2">
          {/* LADY 1 (LEFT): 3D Stepping in with Namaste */}
          <div
            className="flex-shrink-0 flex flex-col items-center animate-namaste-walk-left"
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            <div className="relative group">
              {/* Radiant Glow Behind Avatar */}
              <div className="absolute -inset-2 bg-gradient-to-r from-[#C5A880]/30 to-[#E8D8C0]/30 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-52 md:h-52 rounded-full border-4 border-[#C5A880] p-1.5 bg-white shadow-xl overflow-hidden">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-[#FAF7F2]">
                  <Image
                    src="/images/welcome/namaste-avatar-1.png"
                    alt="Indian Hostess Namaste Greeting"
                    fill
                    sizes="(max-width: 768px) 160px, 208px"
                    className="object-cover object-top hover:scale-105 transition-transform duration-500"
                    priority
                  />
                </div>
              </div>

              {/* Cultural Badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#0E382B] text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-md whitespace-nowrap border border-[#C5A880]/50">
                नमस्ते • Namaste
              </div>
            </div>
          </div>

          {/* CENTER: Royal Welcome Typography & Heritage Message */}
          <div className="flex-1 text-center px-2 sm:px-6 space-y-4 z-10">
            <div className="inline-flex items-center gap-2 bg-[#0E382B]/5 border border-[#0E382B]/15 px-4 py-1.5 rounded-full">
              <Sparkles size={13} className="text-[#C5A880]" />
              <span className="text-[11px] uppercase tracking-widest font-semibold text-[#0E382B]">
                Aapka Swagat Hai • Welcome
              </span>
              <Sparkles size={13} className="text-[#C5A880]" />
            </div>

            <div className="space-y-1">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#111111] font-normal leading-tight">
                Welcome to <span className="text-[#0E382B] font-semibold">AYOR</span>
              </h2>
              <p className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-medium">
                Fine Jewellery &amp; Solitaire Atelier
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#444444] max-w-md mx-auto leading-relaxed">
              Experience the grace of authentic Indian artistry. Handcrafted <strong>925 Sterling Silver</strong>, 
              BIS Hallmarked Gold, and IGI Certified Lab-Grown Solitaires made with love by our master karigars.
            </p>

            {/* Badges of Authenticity */}
            <div className="flex items-center justify-center gap-4 text-[11px] text-[#666666] pt-1">
              <span className="flex items-center gap-1 font-medium text-[#0E382B]">
                <ShieldCheck size={14} className="text-[#C5A880]" /> 100% BIS Hallmarked
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium text-[#0E382B]">
                <Heart size={13} className="text-[#C5A880]" /> Insured Pan-India Delivery
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={handleEnterAtelier}
                className="w-full sm:w-auto bg-[#0E382B] hover:bg-[#144636] text-white px-8 py-3.5 rounded-full text-xs uppercase tracking-widest font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <span>Enter Atelier (प्रवेश करें)</span>
                <Sparkles size={14} className="text-[#C5A880]" />
              </button>

              <Link
                href="/shop?category=Silver"
                onClick={handleDismiss}
                className="w-full sm:w-auto bg-white hover:bg-[#FAF7F2] text-[#0E382B] border border-[#0E382B]/30 px-6 py-3.5 rounded-full text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <span>Explore Silver</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* LADY 2 (RIGHT): 3D Stepping in with Namaste */}
          <div
            className="flex-shrink-0 flex flex-col items-center animate-namaste-walk-right"
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            <div className="relative group">
              {/* Radiant Glow Behind Avatar */}
              <div className="absolute -inset-2 bg-gradient-to-r from-[#C5A880]/30 to-[#E8D8C0]/30 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-52 md:h-52 rounded-full border-4 border-[#C5A880] p-1.5 bg-white shadow-xl overflow-hidden">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-[#FAF7F2]">
                  <Image
                    src="/images/welcome/namaste-avatar-2.jpg"
                    alt="Traditional Indian Hostess Namaste Greeting"
                    fill
                    sizes="(max-width: 768px) 160px, 208px"
                    className="object-cover object-top hover:scale-105 transition-transform duration-500"
                    priority
                  />
                </div>
              </div>

              {/* Cultural Badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#0E382B] text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-md whitespace-nowrap border border-[#C5A880]/50">
                स्वागतम् • Swagatam
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
