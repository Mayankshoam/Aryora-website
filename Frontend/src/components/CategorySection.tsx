"use client";

import Link from "next/link";
import Image from "next/image";
import { getSiteConfig } from "@/lib/data";

export default function CategorySection() {
  const siteConfig = getSiteConfig();
  const tiles = siteConfig.categoryTiles;

  return (
    <section className="max-w-content mx-auto px-4 md:px-8 py-10 md:py-16 space-y-8">
      {/* Title matching Ethera reference ("Your favorites, by category.") */}
      <div className="flex items-end justify-between border-b border-border-subtle pb-3">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl text-[#1B3B30] font-normal">
            Your favorites, by category.
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            Handcrafted with 100% IGI-certified lab diamonds and 18K BIS-hallmarked gold.
          </p>
        </div>
        <Link
          href="/shop"
          className="text-xs uppercase tracking-luxury text-champagne-accessible font-semibold hover:underline"
        >
          View All Categories &rarr;
        </Link>
      </div>

      {/* Grid of 8 Circular / Rounded Category Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-5">
        {tiles.map((tile) => (
          <Link
            key={tile.name}
            href={tile.href}
            className="group flex flex-col items-center text-center space-y-2.5 transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-ivory-warm border border-border-subtle group-hover:border-champagne/80 group-hover:shadow-md transition-all overflow-hidden flex items-center justify-center p-2">
              <Image
                src={tile.image}
                alt={tile.name}
                width={80}
                height={80}
                className="object-contain group-hover:scale-110 transition-transform duration-500 ease-out"
              />
            </div>
            <div className="space-y-0.5">
              <p className="font-serif text-sm font-medium text-ink group-hover:text-champagne-accessible transition-colors">
                {tile.name}
              </p>
              <p className="text-[10px] text-ink-muted leading-tight line-clamp-1">
                {tile.count}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

