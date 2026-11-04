"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Sparkles, X, Heart, ShieldCheck, ArrowRight, Play, Volume2, VolumeX } from "lucide-react";

export default function NamasteWelcome() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check if user has already seen welcome during this browsing session
    const seen = sessionStorage.getItem("ayor_welcome_greeted");
    if (!seen) {
      // Delay slightly for dramatic, smooth entrance after initial page mount
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for custom trigger event to replay welcome video anytime
  useEffect(() => {
    const handleReplay = () => {
      setHasEntered(false);
      setIsOpen(true);
    };
    window.addEventListener("ayor_replay_welcome", handleReplay);
    return () => window.removeEventListener("ayor_replay_welcome", handleReplay);
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem("ayor_welcome_greeted", "true");
  };

  const handleEnterAtelier = () => {
    setHasEntered(true);
    setTimeout(() => {
      handleDismiss();
    }, 450);
  };

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 transition-all duration-700 ${
        hasEntered ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
      }`}
      style={{
        backgroundColor: "rgba(14, 56, 43, 0.78)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      {/* 3D Perspective Modal Card */}
      <div
        className="relative w-full max-w-4xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF7F2] to-[#F5EFEB] border-2 border-[#C5A880]/70 rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl overflow-hidden animate-fadeIn"
        style={{
          perspective: "1200px",
          boxShadow: "0 25px 65px -15px rgba(14, 56, 43, 0.5), 0 0 50px rgba(197, 168, 128, 0.3)",
        }}
      >
        {/* Decorative Gold Corner Accents */}
        <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-[#C5A880]/50 rounded-tl-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-[#C5A880]/50 rounded-tr-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-[#C5A880]/50 rounded-bl-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-[#C5A880]/50 rounded-br-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-[#DDD8D0] flex items-center justify-center text-[#666666] hover:text-[#111111] transition-colors z-30 shadow-xs"
          aria-label="Close welcome"
        >
          <X size={18} />
        </button>

        {/* MAIN VIDEO & WELCOME GREETING STAGE */}
        <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-8 pt-2">
          {/* LEFT: HIGH-DEFINITION NAMASTE WELCOME VIDEO */}
          <div className="w-full md:w-1/2 flex-shrink-0">
            <div className="relative group rounded-2xl overflow-hidden border-2 border-[#C5A880] shadow-2xl bg-black aspect-[16/10] sm:aspect-[16/10]">
              {/* Radiant Glow Behind Video Frame */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#C5A880]/40 to-[#E8D8C0]/40 rounded-2xl blur-md opacity-75 pointer-events-none" />

              {/* HTML5 Autoplay Loop Muted Video */}
              <video
                ref={videoRef}
                src="/videos/welcome-namaste.mp4"
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="relative z-10 w-full h-full object-cover rounded-2xl"
              />

              {/* Cultural Badges Overlay */}
              <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2">
                <span className="bg-[#0E382B]/90 backdrop-blur-xs text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-md border border-[#C5A880]/60">
                  नमस्ते • Namaste
                </span>
                <span className="bg-white/90 backdrop-blur-xs text-[#0E382B] text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full shadow-md border border-[#DDD8D0]">
                  स्वागतम्
                </span>
              </div>

              {/* Audio toggle button if video has audio */}
              <button
                type="button"
                onClick={toggleSound}
                className="absolute top-3 right-3 z-20 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full backdrop-blur-xs transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </div>
            <p className="text-[10px] text-center text-[#888888] mt-2 font-serif italic">
              Traditional Indian Atelier Welcome Greeting
            </p>
          </div>

          {/* RIGHT: ROYAL WELCOME TYPOGRAPHY & HERITAGE MESSAGE */}
          <div className="w-full md:w-1/2 text-center md:text-left space-y-4 z-10">
            <div className="inline-flex items-center gap-2 bg-[#0E382B]/5 border border-[#0E382B]/15 px-4 py-1.5 rounded-full">
              <Sparkles size={13} className="text-[#C5A880]" />
              <span className="text-[11px] uppercase tracking-widest font-semibold text-[#0E382B]">
                Aapka Swagat Hai • Welcome
              </span>
              <Sparkles size={13} className="text-[#C5A880]" />
            </div>

            <div className="space-y-1">
              <h2 className="font-serif text-3xl sm:text-4xl text-[#111111] font-normal leading-tight">
                Welcome to <span className="text-[#0E382B] font-semibold">AYOR</span>
              </h2>
              <p className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-medium">
                Fine Jewellery &amp; Solitaire Atelier
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
              Experience the warmth and grace of authentic Indian hospitality. Handcrafted{" "}
              <strong>925 Sterling Silver</strong>, BIS Hallmarked Gold, and IGI Certified Lab-Grown Solitaires
              crafted with perfection by our master karigars.
            </p>

            {/* Badges of Authenticity */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-[11px] text-[#666666] pt-1">
              <span className="flex items-center gap-1 font-medium text-[#0E382B]">
                <ShieldCheck size={14} className="text-[#C5A880]" /> 100% BIS Hallmarked
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium text-[#0E382B]">
                <Heart size={13} className="text-[#C5A880]" /> Insured Pan-India Delivery
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
              <button
                type="button"
                onClick={handleEnterAtelier}
                className="w-full sm:w-auto bg-[#0E382B] hover:bg-[#144636] text-white px-7 py-3.5 rounded-full text-xs uppercase tracking-widest font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter Atelier (प्रवेश करें)</span>
                <Sparkles size={14} className="text-[#C5A880]" />
              </button>

              <Link
                href="/shop?category=Silver"
                onClick={handleDismiss}
                className="w-full sm:w-auto bg-white hover:bg-[#FAF7F2] text-[#0E382B] border border-[#0E382B]/30 px-6 py-3.5 rounded-full text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-2 text-center"
              >
                <span>Explore Silver</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
