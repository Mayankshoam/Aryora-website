"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getSiteConfig } from "@/lib/data";

export default function CategorySection() {
  const siteConfig = getSiteConfig();
  const tiles = siteConfig.categoryTiles;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  // We repeat tiles 3 times for a seamless infinite auto-scroll loop
  const displayTiles = [...tiles, ...tiles, ...tiles];

  // Automatic continuous smooth scrolling
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let lastTime = performance.now();

    const step = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      if (!isPaused && el) {
        // Smooth scroll ~45 pixels per second
        el.scrollLeft += (45 * delta) / 1000;

        // Loop calculation: 1 set width = total scroll width / 3
        const singleSetWidth = el.scrollWidth / 3;
        if (el.scrollLeft >= singleSetWidth * 2) {
          el.scrollLeft -= singleSetWidth;
        } else if (el.scrollLeft <= 5) {
          el.scrollLeft += singleSetWidth;
        }
      }

      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPaused]);

  const handleManualScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      const cardWidth = 280;
      el.scrollBy({
        left: direction === "left" ? -cardWidth : cardWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-14 space-y-6 md:space-y-8">
      {/* 1. Header (Simple, clean English) */}
      <div className="text-center space-y-1.5">
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#111111] uppercase tracking-[0.14em] font-light">
          Shop By Category
        </h2>
        <p className="text-xs sm:text-sm text-[#555555] font-light tracking-wide">
          Choose what speaks to you
        </p>
      </div>

      {/* 2. Auto-Moving Category Cards Carousel */}
      <div
        className="relative group/slider"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => handleManualScroll("left")}
          aria-label="Previous category"
          className="absolute -left-2 sm:left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 text-[#111111] shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[#E5E0D8] flex items-center justify-center hover:bg-[#111111] hover:text-white transition-all duration-300 cursor-pointer"
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
        </button>

        {/* Scrollable Container with Hidden Scrollbar */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth pb-4 pt-1 px-1 no-scrollbar select-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {displayTiles.map((tile, index) => (
            <Link
              key={`${tile.name}-${index}`}
              href={tile.href}
              className="group relative flex-shrink-0 w-[210px] sm:w-[245px] md:w-[275px] aspect-square overflow-hidden shadow-sm hover:shadow-xl rounded-2xl hover:rounded-t-[90px] sm:hover:rounded-t-[115px] hover:rounded-b-2xl transition-all duration-500 ease-out bg-[#FAF7F2]"
            >
              {/* Category Image */}
              <Image
                src={tile.image}
                alt={tile.name}
                fill
                sizes="(max-width: 640px) 210px, (max-width: 768px) 245px, 275px"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none transition-opacity duration-300" />

              {/* Category Title & Shop Now Indicator */}
              <div className="absolute inset-x-0 bottom-0 p-5 text-center flex flex-col items-center pointer-events-none">
                <span className="text-white font-sans text-sm sm:text-base font-semibold tracking-[0.14em] uppercase drop-shadow">
                  {tile.name}
                </span>
                <div className="mt-1 flex items-center gap-1 text-[11px] uppercase tracking-widest text-white/85 font-medium group-hover:text-white transition-all">
                  <span>Shop Now</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => handleManualScroll("right")}
          aria-label="Next category"
          className="absolute -right-2 sm:right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 text-[#111111] shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[#E5E0D8] flex items-center justify-center hover:bg-[#111111] hover:text-white transition-all duration-300 cursor-pointer"
        >
          <ChevronRight size={20} strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
}
