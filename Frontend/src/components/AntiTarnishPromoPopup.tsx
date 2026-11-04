"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  Droplets,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  DEFAULT_POPUP_CONFIG,
  AntiTarnishPopupConfig,
  POPUP_STORAGE_KEYS,
  POPUP_RULES,
  shouldShowAntiTarnishPopup,
} from "@/lib/antiTarnishConfig";

export default function AntiTarnishPromoPopup() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<AntiTarnishPopupConfig>(DEFAULT_POPUP_CONFIG);
  const modalRef = useRef<HTMLDivElement>(null);
  const hasTriggeredRef = useRef(false);

  // Load config from API/localStorage if modified by admin
  useEffect(() => {
    fetch("/api/admin/popup-config")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setConfig(data.config);
        }
      })
      .catch(() => {
        // Fallback to default
      });
  }, []);

  // Send analytics event
  const trackEvent = useCallback((event: "popup_shown" | "popup_clicked" | "popup_closed") => {
    try {
      fetch("/api/analytics/popup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          timestamp: Date.now(),
          path: pathname || "/",
        }),
      }).catch(() => null);
    } catch {
      // ignore
    }
  }, [pathname]);

  // Evaluate if popup should show
  const checkAndOpen = useCallback(() => {
    if (hasTriggeredRef.current || isOpen) return;

    if (typeof window === "undefined") return;

    const sessionShown = sessionStorage.getItem(POPUP_STORAGE_KEYS.SESSION_SHOWN) === "true";
    const dismissedAt = localStorage.getItem(POPUP_STORAGE_KEYS.DISMISSED_AT);
    const clickedAt = localStorage.getItem(POPUP_STORAGE_KEYS.CLICKED_AT);

    const dismissedMs = dismissedAt ? parseInt(dismissedAt, 10) : null;
    const clickedMs = clickedAt ? parseInt(clickedAt, 10) : null;

    const evalResult = shouldShowAntiTarnishPopup(
      pathname || "/",
      sessionShown,
      dismissedMs,
      clickedMs,
      config
    );

    if (evalResult.shouldShow) {
      hasTriggeredRef.current = true;
      setIsOpen(true);
      sessionStorage.setItem(POPUP_STORAGE_KEYS.SESSION_SHOWN, "true");
      trackEvent("popup_shown");
    }
  }, [pathname, isOpen, config, trackEvent]);

  // 1. Initial 5-Second Timer Trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      checkAndOpen();
    }, POPUP_RULES.INITIAL_DELAY_MS);

    return () => clearTimeout(timer);
  }, [checkAndOpen]);

  // 2. Desktop Exit-Intent Trigger
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when cursor leaves through the top of the browser window
      if (e.clientY <= 0) {
        checkAndOpen();
      }
    };

    window.addEventListener("mouseleave", handleMouseLeave);
    return () => window.removeEventListener("mouseleave", handleMouseLeave);
  }, [checkAndOpen]);

  // 3. Close & Escape handlers
  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(POPUP_STORAGE_KEYS.DISMISSED_AT, Date.now().toString());
    trackEvent("popup_closed");
  };

  const handleCtaClick = () => {
    setIsOpen(false);
    localStorage.setItem(POPUP_STORAGE_KEYS.CLICKED_AT, Date.now().toString());
    trackEvent("popup_clicked");
  };

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="anti-tarnish-popup-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* Modal / Bottom Sheet Card */}
      <div
        ref={modalRef}
        className="w-full sm:max-w-lg bg-[#FAF8F5] rounded-t-3xl sm:rounded-2xl border border-[#E5E0D8] shadow-2xl overflow-hidden relative transform transition-all duration-300 animate-in slide-in-from-bottom sm:slide-in-from-bottom-4"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close promotional announcement"
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#555555] hover:text-[#111111] border border-[#E5E0D8] flex items-center justify-center transition-all shadow-xs cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Banner Graphic Header */}
        <div className="relative h-44 sm:h-52 w-full bg-gradient-to-r from-[#0E382B] via-[#144636] to-[#0A261D] overflow-hidden flex items-center justify-between p-6 sm:p-8">
          <div className="space-y-2 z-10 max-w-[65%]">
            <span className="inline-flex items-center gap-1.5 bg-white/15 text-[#ECD078] px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-[0.2em] font-semibold border border-white/20">
              <Droplets size={10} />
              <span>{config.badge}</span>
            </span>
            <p className="font-serif text-xl sm:text-2xl font-light text-white leading-tight">
              Shine That Never Fades.
            </p>
            <p className="text-[11px] text-white/80 font-light">
              Shower, sweat & perfume proof everyday luxury.
            </p>
          </div>

          {/* Floating Jewelry Graphic */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0">
            <Image
              src={config.imageUrl || "/site/cat-bracelets.svg"}
              alt="Anti-Tarnish Jewellery"
              fill
              className="object-contain drop-shadow-lg"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-5 bg-white">
          <div className="space-y-1.5">
            <h2
              id="anti-tarnish-popup-title"
              className="font-serif text-2xl sm:text-3xl font-medium text-[#111111] leading-snug"
            >
              {config.heading}
            </h2>
            <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
              {config.subtext}
            </p>
          </div>

          {/* 3 Value Pillars */}
          <div className="grid grid-cols-3 gap-2 py-1 text-center">
            <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5E0D8]">
              <Droplets size={16} className="text-[#108474] mx-auto mb-1" />
              <p className="text-[10px] font-semibold text-[#111111]">100% Waterproof</p>
              <p className="text-[9px] text-[#777777]">Shower & Swim</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5E0D8]">
              <Sparkles size={16} className="text-[#C09981] mx-auto mb-1" />
              <p className="text-[10px] font-semibold text-[#111111]">Anti-Tarnish</p>
              <p className="text-[9px] text-[#777777]">Never Discolors</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5E0D8]">
              <ShieldCheck size={16} className="text-[#0E382B] mx-auto mb-1" />
              <p className="text-[10px] font-semibold text-[#111111]">Hypoallergenic</p>
              <p className="text-[9px] text-[#777777]">Sensitive Skin</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Link
              href={config.ctaLink || "/collections/anti-tarnish"}
              onClick={handleCtaClick}
              className="w-full bg-[#0E382B] hover:bg-[#154a3a] text-white py-3.5 px-6 rounded-xl font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>{config.ctaText || "Shop Now"}</span>
              <ArrowRight size={14} />
            </Link>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2 text-center text-[11px] text-[#777777] hover:text-[#111111] transition-colors cursor-pointer"
            >
              Maybe later, continue browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
