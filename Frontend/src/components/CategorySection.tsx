"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getSiteConfig } from "@/lib/data";

export default function CategorySection() {
  const siteConfig = getSiteConfig();
  const tiles = siteConfig.categoryTiles;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-14 space-y-6 md:space-y-8">
      {/* 1. Header (Aukera Style: SHOP BY CATEGORY - Choose what speaks to you) */}
      <div className="text-center space-y-1.5">
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#111111] uppercase tracking-[0.14em] font-light">
          Shop By Category
        </h2>
        <p className="text-xs sm:text-sm text-[#555555] font-light tracking-wide">
          Choose what speaks to you
        </p>
      </div>

      {/* 2. Editorial Category Cards Slider (Aukera reference design) */}
      <div className="relative group/slider">
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Previous categories"
            className="absolute -left-2 sm:left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 text-[#111111] shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[#DDD8D0] flex items-center justify-center hover:bg-[#111111] hover:text-white transition-all duration-300"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth pb-4 pt-1 px-1 no-scrollbar select-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tiles.map((tile, index) => {
            // Give card 3 (Earrings, index 2) & card 7 (Bangles, index 6) the signature Aukera arch top
            const isArched = index % 4 === 2;

            return (
              <Link
                key={tile.name}
                href={tile.href}
                className={`group relative flex-shrink-0 w-[210px] sm:w-[240px] md:w-[270px] aspect-[3/4] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 bg-[#F5F0EA] ${
                  isArched ? "rounded-t-[80px] rounded-b-xl" : "rounded-xl"
                }`}
              >
                {/* Background Image */}
                <Image
                  src={tile.image}
                  alt={tile.name}
                  fill
                  sizes="(max-width: 640px) 210px, (max-width: 768px) 240px, 270px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Dark Gradient Overlay for optimal contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none transition-opacity duration-300" />

                {/* Category Title & Shop Now pill */}
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
            );
          })}
        </div>

        {/* Right Arrow Button (Aukera Style) */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Next categories"
            className="absolute -right-2 sm:right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 text-[#111111] shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[#DDD8D0] flex items-center justify-center hover:bg-[#111111] hover:text-white transition-all duration-300"
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </section>
  );
}
