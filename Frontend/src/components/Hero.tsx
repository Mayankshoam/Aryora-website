"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Pause, ArrowRight, Calendar } from "lucide-react";
import { getSiteConfig } from "@/lib/data";

export default function Hero() {
  const siteConfig = getSiteConfig();
  const heroData = siteConfig.hero;

  const [isPlaying, setIsPlaying] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check viewport size for responsive video source
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => null);
      setIsPlaying(true);
    }
  };

  const videoSrc = isMobile ? heroData.videoMobile : heroData.videoDesktop;

  return (
    <section className="relative w-full min-h-[580px] md:min-h-[680px] lg:min-h-[760px] flex items-center bg-[#1B3B30] overflow-hidden">
      {/* Background Video / Poster Fallback */}
      <div className="absolute inset-0 z-0">
        {!videoError ? (
          <video
            ref={videoRef}
            key={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={heroData.poster}
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover object-center"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          <Image
            src={heroData.poster}
            alt="Aryora Luxury Lab-Grown Fine Diamond Jewellery"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        )}

        {/* Sophisticated gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-transparent md:to-ink/10" />
      </div>

      {/* Content Container (Ethera Editorial Alignment) */}
      <div className="relative z-10 max-w-content mx-auto px-6 md:px-8 py-16 md:py-24 w-full">
        <div className="max-w-2xl space-y-6">
          <p className="text-[10px] md:text-xs uppercase tracking-[0.24em] font-semibold text-champagne-light">
            {heroData.eyebrow}
          </p>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-ivory font-light leading-[1.12]">
            {heroData.title}
          </h1>

          <p className="text-sm md:text-base text-ivory-muted leading-relaxed max-w-xl font-light">
            {heroData.subtitle}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              href={heroData.ctaPrimary.href}
              className="bg-[#B89B5E] text-ink hover:bg-[#A3864A] transition-colors text-xs uppercase tracking-wider font-semibold px-7 py-3.5 inline-flex items-center gap-2 shadow-md"
            >
              <span>{heroData.ctaPrimary.label}</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              href={heroData.ctaSecondary.href}
              className="border border-ivory text-ivory hover:bg-ivory hover:text-ink transition-colors text-xs uppercase tracking-wider font-semibold px-6 py-3.5 inline-flex items-center gap-2 backdrop-blur-sm"
            >
              <Calendar size={14} />
              <span>{heroData.ctaSecondary.label}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Video Control Play/Pause Toggle */}
      {!videoError && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause background video" : "Play background video"}
          className="absolute bottom-6 right-6 z-20 w-10 h-10 rounded-full bg-ink/60 hover:bg-ink/80 text-ivory flex items-center justify-center backdrop-blur-sm transition-colors border border-ivory/20"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>
      )}
    </section>
  );
}

