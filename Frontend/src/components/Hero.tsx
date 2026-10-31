"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Play, Pause, ArrowRight, Calendar } from "lucide-react";
import { getSiteConfig } from "@/lib/data";

export default function Hero() {
  const siteConfig = getSiteConfig();
  const heroData = siteConfig.hero;

  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-play muted video safely on mount and respect prefers-reduced-motion
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // React muted property fix: explicitly set on DOM element
    video.muted = true;
    video.defaultMuted = true;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // If auto-play was blocked, try again on user interaction
          setIsPlaying(false);
        });
    }
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.muted = true;
      video.play().catch(() => null);
      setIsPlaying(true);
    }
  };

  return (
    <section className="relative w-full min-h-[580px] md:min-h-[680px] lg:min-h-[760px] flex items-center bg-[#1B3B30] overflow-hidden">
      {/* Background Loop Video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={heroData.poster}
          className="w-full h-full object-cover object-center scale-[1.01]"
        >
          <source src={heroData.videoDesktop} type="video/mp4" />
          <source src={heroData.videoMobile} type="video/mp4" />
        </video>

        {/* Sophisticated gradient overlay for text readability */}
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
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause background video" : "Play background video"}
        className="absolute bottom-6 right-6 z-20 w-10 h-10 rounded-full bg-ink/60 hover:bg-ink/80 text-ivory flex items-center justify-center backdrop-blur-sm transition-colors border border-ivory/20"
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>
    </section>
  );
}

