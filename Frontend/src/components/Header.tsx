"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useAryoraStore } from "@/lib/store";

const SHOP_CATEGORIES = [
  { label: "All Jewellery", href: "/shop" },
  { label: "Rings", href: "/shop?category=rings" },
  { label: "Earrings", href: "/shop?category=earrings" },
  { label: "Pendants", href: "/shop?category=pendants" },
  { label: "Necklaces", href: "/shop?category=necklaces" },
  { label: "Bridal Heirloom", href: "/bridal" },
  { label: "Design Your Own", href: "/customize" },
];

const COLLECTIONS = [
  { label: "Bridal Collection", href: "/bridal", desc: "Heritage heirloom sets" },
  { label: "Solitaire Collection", href: "/collections/solitaire", desc: "Timeless brilliance" },
  { label: "Everyday Luxury", href: "/collections/everyday", desc: "Conscious daily radiance" },
];

const DISCOVER_LINKS = [
  { label: "About Aryora", href: "/about" },
  { label: "The World of LGD", href: "/world-of-lgd" },
  { label: "Sustainability", href: "/sustainability" },
];

const HELP_LINKS = [
  { label: "Ring Size Guide", href: "/size-guide" },
  { label: "Frequently Asked Questions", href: "/faq" },
  { label: "Shipping Policy", href: "/shipping" },
  { label: "Returns & Warranty", href: "/returns" },
  { label: "Terms & Conditions", href: "/terms" },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopShopDropdown, setDesktopShopDropdown] = useState(false);
  const [desktopCollectionsDropdown, setDesktopCollectionsDropdown] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>("shop");
  const [mounted, setMounted] = useState(false);

  const { cart, wishlist, openCart, openSearch } = useAryoraStore();

  const isHome = pathname === "/";
  const cartCount = mounted ? cart.reduce((t, i) => t + i.quantity, 0) : 0;
  const wishlistCount = mounted ? wishlist.length : 0;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDesktopShopDropdown(false);
    setDesktopCollectionsDropdown(false);
  }, [pathname]);

  const isTransparent = isHome && !scrolled && !mobileMenuOpen;

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-colors duration-300 w-full ${
          isTransparent
            ? "bg-transparent text-ivory border-b border-ivory/15"
            : "bg-ivory/95 backdrop-blur-md text-ink border-b border-border-subtle shadow-sm"
        }`}
      >
        <div className="max-w-content mx-auto px-5 md:px-8 h-20 flex items-center justify-between">
          {/* Mobile Menu Button (min 48px touch target) */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-3 -ml-3 text-current hover:opacity-75 transition-opacity"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>

          {/* Desktop Left Nav: Shop & Collections */}
          <nav className="hidden md:flex items-center space-x-8 text-xs uppercase tracking-widest2 font-medium">
            {/* Shop with subtle dropdown */}
            <div
              className="relative py-4"
              onMouseEnter={() => setDesktopShopDropdown(true)}
              onMouseLeave={() => setDesktopShopDropdown(false)}
            >
              <Link
                href="/shop"
                className={`flex items-center gap-1.5 transition-colors ${
                  isTransparent ? "hover:text-champagne-light" : "hover:text-champagne-accessible"
                } ${pathname.startsWith("/shop") ? "font-semibold" : ""}`}
              >
                Shop
                <ChevronDown size={14} strokeWidth={1.5} className="opacity-70" />
              </Link>

              {desktopShopDropdown && (
                <div className="absolute top-full left-0 w-64 bg-ivory text-ink border border-border-subtle shadow-lg py-3 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-border-subtle mb-1">
                    <p className="eyebrow text-[10px]">Categories</p>
                  </div>
                  {SHOP_CATEGORIES.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-5 py-2.5 text-xs tracking-wider normal-case text-ink/80 hover:text-ink hover:bg-ivory-muted transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Collections with dropdown */}
            <div
              className="relative py-4"
              onMouseEnter={() => setDesktopCollectionsDropdown(true)}
              onMouseLeave={() => setDesktopCollectionsDropdown(false)}
            >
              <Link
                href="/collections"
                className={`flex items-center gap-1.5 transition-colors ${
                  isTransparent ? "hover:text-champagne-light" : "hover:text-champagne-accessible"
                } ${pathname.startsWith("/collections") ? "font-semibold" : ""}`}
              >
                Collections
                <ChevronDown size={14} strokeWidth={1.5} className="opacity-70" />
              </Link>

              {desktopCollectionsDropdown && (
                <div className="absolute top-full left-0 w-72 bg-ivory text-ink border border-border-subtle shadow-lg p-3 animate-fadeIn">
                  <div className="px-3 py-1 border-b border-border-subtle mb-2">
                    <p className="eyebrow text-[10px]">Curated Heirlooms</p>
                  </div>
                  {COLLECTIONS.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className="block p-3 rounded-none hover:bg-ivory-muted transition-colors group"
                    >
                      <p className="text-sm font-serif font-medium text-ink group-hover:text-champagne-accessible">
                        {c.label}
                      </p>
                      <p className="text-[11px] text-ink-subtle normal-case tracking-normal">
                        {c.desc}
                      </p>
                    </Link>
                  ))}
                  <div className="pt-2 border-t border-border-subtle mt-1 px-3">
                    <Link
                      href="/collections"
                      className="text-[11px] tracking-wider uppercase text-champagne-accessible font-medium block hover:underline"
                    >
                      View All Collections →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Centered Logo */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-block py-2 text-2xl md:text-3xl font-serif tracking-[0.18em] uppercase transition-opacity hover:opacity-90"
            >
              Aryora
            </Link>
          </div>

          {/* Right Action Icons: Search, Wishlist, Cart, Account */}
          <div className="flex items-center space-x-2 md:space-x-5 text-current">
            {/* Search */}
            <button
              onClick={openSearch}
              className="p-2.5 hover:opacity-75 transition-opacity"
              aria-label="Search collection"
            >
              <Search size={19} strokeWidth={1.5} />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-2.5 relative hover:opacity-75 transition-opacity"
              aria-label={`Wishlist with ${wishlistCount} items`}
            >
              <Heart size={19} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-champagne text-ivory text-[10px] font-medium flex items-center justify-center rounded-full leading-none">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart with count badge */}
            <button
              onClick={openCart}
              className="p-2.5 relative hover:opacity-75 transition-opacity"
              aria-label={`Shopping bag with ${cartCount} items`}
            >
              <ShoppingBag size={19} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-ink text-ivory text-[10px] font-medium flex items-center justify-center rounded-full leading-none">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Account */}
            <Link
              href="/account"
              className="p-2.5 hidden sm:inline-block hover:opacity-75 transition-opacity"
              aria-label="Customer Account"
            >
              <User size={19} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Drawer Menu (with 48px tap targets & accordions) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer container */}
          <div className="relative w-full max-w-sm bg-ivory text-ink h-full shadow-2xl flex flex-col z-10 overflow-y-auto animate-slideLeft">
            {/* Header bar */}
            <div className="p-5 border-b border-border-subtle flex items-center justify-between">
              <span className="font-serif text-xl tracking-[0.16em] uppercase">Aryora</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-ink hover:opacity-75"
                aria-label="Close menu"
              >
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>

            {/* Search Bar at Top of Mobile Menu */}
            <div className="p-5 border-b border-border-subtle bg-ivory-pure">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openSearch();
                }}
                className="w-full h-12 px-4 rounded-none border border-border-subtle bg-ivory flex items-center justify-between text-ink-subtle text-sm text-left"
              >
                <span className="flex items-center gap-3">
                  <Search size={16} strokeWidth={1.5} />
                  Search diamonds, rings, necklaces...
                </span>
              </button>
            </div>

            {/* Navigation Accordion Sections */}
            <nav className="flex-1 divide-y divide-border-subtle">
              {/* Group 1: Shop */}
              <div className="py-2">
                <button
                  onClick={() =>
                    setMobileAccordion(mobileAccordion === "shop" ? null : "shop")
                  }
                  className="w-full min-h-[48px] px-6 py-3.5 flex items-center justify-between text-left text-sm uppercase tracking-widest2 font-medium"
                  aria-expanded={mobileAccordion === "shop"}
                >
                  <span>Shop Jewellery</span>
                  <ChevronDown
                    size={18}
                    strokeWidth={1.5}
                    className={`transition-transform duration-200 ${
                      mobileAccordion === "shop" ? "rotate-180 text-champagne-accessible" : ""
                    }`}
                  />
                </button>
                {mobileAccordion === "shop" && (
                  <div className="bg-ivory-muted/60 px-6 py-2 space-y-1">
                    {SHOP_CATEGORIES.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between min-h-[44px] py-2 text-sm text-ink-muted hover:text-ink transition-colors"
                      >
                        {item.label}
                        <ChevronRight size={14} strokeWidth={1.5} className="opacity-40" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Group 2: Collections */}
              <div className="py-2">
                <button
                  onClick={() =>
                    setMobileAccordion(
                      mobileAccordion === "collections" ? null : "collections"
                    )
                  }
                  className="w-full min-h-[48px] px-6 py-3.5 flex items-center justify-between text-left text-sm uppercase tracking-widest2 font-medium"
                  aria-expanded={mobileAccordion === "collections"}
                >
                  <span>Collections</span>
                  <ChevronDown
                    size={18}
                    strokeWidth={1.5}
                    className={`transition-transform duration-200 ${
                      mobileAccordion === "collections" ? "rotate-180 text-champagne-accessible" : ""
                    }`}
                  />
                </button>
                {mobileAccordion === "collections" && (
                  <div className="bg-ivory-muted/60 px-6 py-2 space-y-1">
                    {COLLECTIONS.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex flex-col justify-center min-h-[48px] py-2 border-b border-border-subtle/40 last:border-0"
                      >
                        <span className="text-sm font-medium text-ink">{c.label}</span>
                        <span className="text-xs text-ink-subtle">{c.desc}</span>
                      </Link>
                    ))}
                    <Link
                      href="/collections"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-3 text-xs uppercase tracking-widest text-champagne-accessible font-medium"
                    >
                      View All Collections →
                    </Link>
                  </div>
                )}
              </div>

              {/* Group 3: Discover */}
              <div className="py-2">
                <button
                  onClick={() =>
                    setMobileAccordion(
                      mobileAccordion === "discover" ? null : "discover"
                    )
                  }
                  className="w-full min-h-[48px] px-6 py-3.5 flex items-center justify-between text-left text-sm uppercase tracking-widest2 font-medium"
                  aria-expanded={mobileAccordion === "discover"}
                >
                  <span>Discover</span>
                  <ChevronDown
                    size={18}
                    strokeWidth={1.5}
                    className={`transition-transform duration-200 ${
                      mobileAccordion === "discover" ? "rotate-180 text-champagne-accessible" : ""
                    }`}
                  />
                </button>
                {mobileAccordion === "discover" && (
                  <div className="bg-ivory-muted/60 px-6 py-2 space-y-1">
                    {DISCOVER_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between min-h-[44px] py-2 text-sm text-ink-muted hover:text-ink transition-colors"
                      >
                        {link.label}
                        <ChevronRight size={14} strokeWidth={1.5} className="opacity-40" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Group 4: Client Care & Help */}
              <div className="py-2">
                <button
                  onClick={() =>
                    setMobileAccordion(mobileAccordion === "help" ? null : "help")
                  }
                  className="w-full min-h-[48px] px-6 py-3.5 flex items-center justify-between text-left text-sm uppercase tracking-widest2 font-medium"
                  aria-expanded={mobileAccordion === "help"}
                >
                  <span>Client Care</span>
                  <ChevronDown
                    size={18}
                    strokeWidth={1.5}
                    className={`transition-transform duration-200 ${
                      mobileAccordion === "help" ? "rotate-180 text-champagne-accessible" : ""
                    }`}
                  />
                </button>
                {mobileAccordion === "help" && (
                  <div className="bg-ivory-muted/60 px-6 py-2 space-y-1">
                    {HELP_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between min-h-[44px] py-2 text-sm text-ink-muted hover:text-ink transition-colors"
                      >
                        {link.label}
                        <ChevronRight size={14} strokeWidth={1.5} className="opacity-40" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile Footer Links */}
            <div className="p-6 border-t border-border-subtle bg-ivory-muted/30 space-y-3">
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 min-h-[48px] text-sm text-ink font-medium"
              >
                <User size={18} strokeWidth={1.5} />
                My Account
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 min-h-[48px] text-sm text-ink font-medium"
              >
                <Heart size={18} strokeWidth={1.5} />
                Saved Pieces ({wishlistCount})
              </Link>
              <div className="pt-2 text-xs text-ink-subtle leading-relaxed">
                <p>Aryora Atelier, Lucknow</p>
                <p>+91 8808828646 • aryora.legacy@hotmail.com</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
