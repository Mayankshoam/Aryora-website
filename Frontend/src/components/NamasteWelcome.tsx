"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Sparkles, X, Heart, ShieldCheck, ArrowRight, Volume2, VolumeX, CheckCircle2, Phone, Tag } from "lucide-react";
import { loginWithMobile, isValidIndianMobile, toggleCustomerWishlist } from "@/lib/customerStore";
import { useAryoraStore } from "@/lib/store";

export default function NamasteWelcome() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [mobileNumber, setMobileNumber] = useState("");
  const [inputError, setInputError] = useState("");
  const [discountUnlocked, setDiscountUnlocked] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [hasPendingWishlist, setHasPendingWishlist] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check if user has already seen welcome during this browsing session
    const seen = sessionStorage.getItem("ayor_welcome_greeted");
    if (!seen) {
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
      if (typeof window !== "undefined" && localStorage.getItem("ayor_pending_wishlist_slug")) {
        setHasPendingWishlist(true);
      }
      setIsOpen(true);
    };
    window.addEventListener("ayor_replay_welcome", handleReplay);
    return () => window.removeEventListener("ayor_replay_welcome", handleReplay);
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem("ayor_welcome_greeted", "true");
  };

  const handleEnterStore = () => {
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

  // Instant Mobile Login without OTP + 10% Discount Activation
  const handleClaimDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError("");

    const clean = mobileNumber.replace(/\D/g, "");
    if (!isValidIndianMobile(clean)) {
      setInputError("Kripya 10-digit ka valid mobile number dalein (e.g. 9876543210).");
      return;
    }

    try {
      const res = loginWithMobile(clean);
      setCustomerId(res.customer.customerId);
      setDiscountUnlocked(true);

      // If triggered by a guest wishlist click, automatically add the pending item
      if (typeof window !== "undefined") {
        const pending = localStorage.getItem("ayor_pending_wishlist_slug");
        if (pending) {
          toggleCustomerWishlist(res.customer.customerId, pending);
          useAryoraStore.getState().toggleWishlist(pending);
          localStorage.removeItem("ayor_pending_wishlist_slug");
          setHasPendingWishlist(false);
        }
      }
    } catch (err: any) {
      setInputError(err.message || "Failed to register mobile.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 transition-all duration-700 ${
        hasEntered ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
      }`}
      style={{
        backgroundColor: "rgba(14, 56, 43, 0.82)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      {/* 3D Perspective Modal Card */}
      <div
        className="relative w-full max-w-4xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF7F2] to-[#F5EFEB] border-2 border-[#C5A880]/70 rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl overflow-hidden animate-fadeIn"
        style={{
          perspective: "1200px",
          boxShadow: "0 25px 65px -15px rgba(14, 56, 43, 0.5), 0 0 50px rgba(197, 168, 128, 0.35)",
        }}
      >
        {/* Subtle Decorative Gold Corner Filigrees */}
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

        {/* MAIN STAGE */}
        <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-8 pt-1">
          {/* LEFT: LIVE NAMASTE VIDEO */}
          <div className="w-full md:w-1/2 flex-shrink-0">
            <div className="relative group rounded-2xl overflow-hidden border-2 border-[#C5A880] shadow-2xl bg-black aspect-[16/10] sm:aspect-[16/10]">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#C5A880]/40 to-[#E8D8C0]/40 rounded-2xl blur-md opacity-75 pointer-events-none" />

              <video
                ref={videoRef}
                src="/videos/welcome-namaste.mp4"
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="relative z-10 w-full h-full object-cover rounded-2xl"
              />

              <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2">
                <span className="bg-[#0E382B]/90 backdrop-blur-xs text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-md border border-[#C5A880]/60">
                  नमस्ते • Namaste
                </span>
                <span className="bg-white/95 backdrop-blur-xs text-[#0E382B] text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full shadow-md border border-[#DDD8D0]">
                  स्वागतम्
                </span>
              </div>

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
              Traditional Indian Welcome Greeting
            </p>
          </div>

          {/* RIGHT: ROYAL WELCOME & AESTHETIC 10% DISCOUNT CARD */}
          <div className="w-full md:w-1/2 text-center md:text-left space-y-3.5 z-10">
            <div className="inline-flex items-center gap-1.5 bg-[#0E382B]/5 border border-[#0E382B]/15 px-3 py-1 rounded-full">
              <Sparkles size={12} className="text-[#C5A880]" />
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[#0E382B]">
                Aapka Swagat Hai • Welcome
              </span>
              <Sparkles size={12} className="text-[#C5A880]" />
            </div>

            <div className="space-y-0.5">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#111111] font-normal leading-tight">
                Welcome to <span className="text-[#0E382B] font-semibold">AYOR</span>
              </h2>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#C5A880] font-medium">
                Fine Jewellery &amp; Solitaire Studio
              </p>
            </div>

            {/* Minimalist Member Access & Privilege Card */}
            <div className="bg-[#FAF7F2] border border-[#E5E0D8] p-4 rounded-2xl shadow-sm space-y-3 text-left relative">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-serif font-medium text-[#0E382B] flex items-center gap-1.5">
                  <Sparkles size={12} className="text-[#C09981]" />
                  <span>Welcome Privilege</span>
                </span>
                <span className="text-[10px] text-[#666666] tracking-wide uppercase">
                  10% First Order Benefit
                </span>
              </div>

              {!discountUnlocked ? (
                <>
                  {hasPendingWishlist && (
                    <div className="bg-white border border-[#E5E0D8] p-2.5 rounded-xl flex items-center gap-2 text-[11px] text-[#0E382B]">
                      <Heart size={13} className="text-[#C09981] fill-[#C09981]" />
                      <span>Sign in to save this item to your wishlist</span>
                    </div>
                  )}

                  <form onSubmit={handleClaimDiscount} className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="bg-white border border-[#E5E0D8] px-3 py-2 rounded-xl text-xs font-medium text-[#111111]">
                        🇮🇳 +91
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="Enter 10-digit mobile number"
                        value={mobileNumber}
                        onChange={(e) => {
                          setMobileNumber(e.target.value);
                          if (inputError) setInputError("");
                        }}
                        className="flex-1 bg-white border border-[#E5E0D8] px-3.5 py-2 rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#0E382B] transition-colors"
                        required
                      />
                    </div>

                    {inputError && <p className="text-[11px] text-red-600">{inputError}</p>}

                    <button
                      type="submit"
                      className="w-full bg-[#0E382B] hover:bg-[#144636] text-white py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider font-medium shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Enter Store (प्रवेश करें)</span>
                      <ArrowRight size={13} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="bg-white border border-[#E5E0D8] p-3.5 rounded-xl space-y-2 text-center animate-fadeIn">
                  <div className="w-7 h-7 rounded-full bg-[#0E382B] text-white flex items-center justify-center mx-auto">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#111111]">
                      Welcome Privilege Active
                    </p>
                    <p className="text-[11px] text-[#666666] mt-0.5">
                      10% discount unlocked · Customer ID: <span className="font-mono text-[#0E382B]">{customerId}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleEnterStore}
                    className="w-full bg-[#0E382B] hover:bg-[#144636] text-white py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider font-medium shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Begin Exploring</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* Authenticity Guarantee & Guest Dismiss */}
            <div className="flex items-center justify-between text-[11px] text-[#666666] pt-1">
              <span className="flex items-center gap-1 font-medium text-[#0E382B]">
                <ShieldCheck size={13} className="text-[#C5A880]" /> 100% BIS Hallmarked
              </span>
              <button
                type="button"
                onClick={handleEnterStore}
                className="text-[11px] text-[#888888] hover:text-[#111111] underline transition-colors"
              >
                Skip &amp; Browse as Guest →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
