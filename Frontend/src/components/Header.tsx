"use client";

import Link from "next/link";
import { useState } from "react";

const NAV = [
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "Bridal", href: "/bridal" },
  { label: "About", href: "/about" },
  { label: "Sustainability", href: "/sustainability" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-ivory/95 backdrop-blur border-b border-black/5">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <button className="md:hidden text-sm" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          ☰
        </button>

        <nav className="hidden md:flex gap-8 text-sm tracking-wide">
          {NAV.slice(0, 2).map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-champagne transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/" className="font-display text-2xl tracking-wide text-emerald">
          Aryora
        </Link>

        <div className="flex items-center gap-5 text-sm">
          <nav className="hidden md:flex gap-8">
            {NAV.slice(2).map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-champagne transition-colors">
                {item.label}
              </Link>
            ))}
          </nav>
          <button aria-label="Search">🔍</button>
          <Link href="/wishlist" aria-label="Wishlist">♡</Link>
          <Link href="/cart" aria-label="Bag">🛍</Link>
          <Link href="/account" aria-label="Account">👤</Link>
        </div>
      </div>

      {open && (
        <nav className="md:hidden flex flex-col px-6 pb-4 gap-3 text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
