"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  MapPin,
  Sparkles,
  ArrowRight,
  Gem,
} from "lucide-react";
import { useAryoraStore } from "@/lib/store";
import { getSiteConfig } from "@/lib/data";

const CATEGORIES_MENU = [
  {
    name: "Rings",
    href: "/shop?category=Rings",
    desc: "Solitaires, Eternity & Stacking Bands",
    items: [
      { label: "All Rings", href: "/shop?category=Rings" },
      { label: "Solitaire Rings", href: "/shop?category=Rings&style=Solitaire" },
      { label: "Eternity Bands", href: "/shop?category=Rings&subcategory=Eternity+Bands" },
      { label: "Halo Rings", href: "/shop?category=Rings&style=Halo" },
      { label: "Men's Bands", href: "/shop?category=Rings&gender=Men" },
    ],
  },
  {
    name: "Earrings",
    href: "/shop?category=Earrings",
    desc: "Classic Studs, Luminary Drops & Huggies",
    items: [
      { label: "All Earrings", href: "/shop?category=Earrings" },
      { label: "Solitaire Studs", href: "/shop?category=Earrings&subcategory=Studs" },
      { label: "Luminary Drops", href: "/shop?category=Earrings&subcategory=Drops" },
      { label: "Diamond Huggies", href: "/shop?category=Earrings&subcategory=Hoops" },
      { label: "Chandeliers", href: "/shop?category=Earrings&subcategory=Chandeliers" },
    ],
  },
  {
    name: "Pendants",
    href: "/shop?category=Pendants",
    desc: "Floating Bezels & Geometric Bars",
    items: [
      { label: "All Pendants", href: "/shop?category=Pendants" },
      { label: "Solitaire Pendants", href: "/shop?category=Pendants&subcategory=Solitaires" },
      { label: "Teardrop Halos", href: "/shop?category=Pendants&subcategory=Halo+Pendants" },
      { label: "Geometric Bars", href: "/shop?category=Pendants&subcategory=Geometric" },
    ],
  },
  {
    name: "Necklaces",
    href: "/shop?category=Necklaces",
    desc: "Graduated Tennis Lines & Chokers",
    items: [
      { label: "All Necklaces", href: "/shop?category=Necklaces" },
      { label: "Graduated Tennis", href: "/shop?category=Necklaces&style=Tennis" },
      { label: "Heritage Chokers", href: "/shop?category=Necklaces&subcategory=Chokers" },
      { label: "Collar Solitaires", href: "/shop?category=Necklaces&subcategory=Solitaires" },
    ],
  },
  {
    name: "Bracelets",
    href: "/shop?category=Bracelets",
    desc: "Tennis Lines, Open Cuffs & Chains",
    items: [
      { label: "All Bracelets", href: "/shop?category=Bracelets" },
      { label: "Classic Tennis Lines", href: "/shop?category=Bracelets&style=Tennis" },
      { label: "Open Cuff Bangles", href: "/shop?category=Bracelets&subcategory=Bangles" },
      { label: "Minimal Chains", href: "/shop?category=Bracelets&subcategory=Chain+Bracelets" },
    ],
  },
  {
    name: "Solitaires & Bridal",
    href: "/bridal",
    desc: "1ct to 3ct IGI Certified & Wedding Suites",
    items: [
      { label: "Heritage Bridal Suite", href: "/bridal" },
      { label: "2ct+ Solitaires", href: "/shop?category=Solitaires" },
      { label: "Modern Mangalsutras", href: "/shop?category=Bridal&subcategory=Mangalsutras" },
      { label: "Emerald Wedding Suites", href: "/shop?category=Bridal&stone=Emerald+%26+Diamond" },
    ],
  },
];

const MORE_MENU = [
  { label: "About Aryora Atelier", href: "/about", desc: "Heritage craft born in Lucknow" },
  { label: "The World of Lab Diamonds", href: "/world-of-lgd", desc: "Chemical, physical & optical equivalence" },
  { label: "Ethical & Sustainable Craft", href: "/sustainability", desc: "Zero earth mining & solar brilliance" },
  { label: "Ring Size & Fitting Guide", href: "/size-guide", desc: "Accurate Indian standard measurements" },
  { label: "Client FAQ & Dossiers", href: "/faq", desc: "IGI certification, buyback & warranties" },
  { label: "Contact Atelier Concierge", href: "/contact", desc: "+91 8808828646 · Private appointments" },
];

export default function Header() {
  const pathname = usePathname();
  const siteConfig = getSiteConfig();
  const {
    getCartCount,
    wishlist,
    openCart,
    openSearch,
    openStoreLocator,
  } = useAryoraStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"categories" | "more" | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Scroll detection for sticky header shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cartCount = getCartCount();
  const wishlistCount = wishlist.length;

  return (
    <>
      {/* 1. TOP ANNOUNCEMENT STRIP */}
      <div className="bg-[#1B3B30] text-ivory text-[11px] py-2 px-4 text-center tracking-wider font-medium flex items-center justify-center gap-2">
        <Sparkles size={12} className="text-champagne-light" />
        <span>100% IGI-Certified Lab-Grown Diamonds · Complimentary Insured Pan-India Delivery</span>
        <span className="hidden md:inline text-champagne-light">· 15-Day Easy Returns</span>
      </div>

      {/* 2. MAIN HEADER (Ethera Diamonds Reference Layout) */}
      <header
        className={`sticky top-0 z-40 bg-ivory-pure/95 backdrop-blur-md border-b border-border-subtle transition-shadow duration-300 ${
          isScrolled ? "shadow-sm" : ""
        }`}
      >
        <div className="max-w-content mx-auto px-4 md:px-8 h-18 md:h-20 flex items-center justify-between">
          {/* LEFT: Categories, Customize, More */}
          <nav className="hidden lg:flex items-center space-x-7 text-xs uppercase tracking-luxury font-medium text-ink">
            {/* Categories Mega Dropdown Trigger */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("categories")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "categories" ? null : "categories")}
                className={`flex items-center gap-1.5 py-4 transition-colors hover:text-champagne-accessible ${
                  activeDropdown === "categories" ? "text-champagne-accessible font-semibold" : ""
                }`}
              >
                <span>Categories</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${
                    activeDropdown === "categories" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Mega-menu Panel */}
              {activeDropdown === "categories" && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 w-[840px] bg-ivory-pure border border-border-subtle shadow-xl p-6 grid grid-cols-3 gap-6 animate-fadeIn"
                >
                  {CATEGORIES_MENU.map((col) => (
                    <div key={col.name} className="space-y-2.5">
                      <Link
                        href={col.href}
                        className="font-serif text-base text-ink font-semibold hover:text-champagne-accessible transition-colors block"
                      >
                        {col.name}
                      </Link>
                      <p className="text-[10px] text-ink-muted leading-tight">{col.desc}</p>
                      <ul className="space-y-1.5 pt-1 text-[11px] text-ink-muted">
                        {col.items.map((sub) => (
                          <li key={sub.label}>
                            <Link
                              href={sub.href}
                              className="hover:text-ink hover:underline transition-colors block py-0.5"
                            >
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div className="col-span-3 pt-3 border-t border-border-subtle flex items-center justify-between text-[11px]">
                    <span className="text-ink-muted font-normal">
                      Every jewel is accompanied by independent IGI documentation and BIS 750 hallmark.
                    </span>
                    <Link
                      href="/shop"
                      className="font-semibold text-champagne-accessible hover:text-ink flex items-center gap-1"
                    >
                      <span>Explore Full Catalogue</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Customize / Atelier Link */}
            <Link
              href="/customize"
              className="py-4 hover:text-champagne-accessible transition-colors"
            >
              Customize
            </Link>

            {/* More Dropdown Trigger */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("more")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "more" ? null : "more")}
                className={`flex items-center gap-1.5 py-4 transition-colors hover:text-champagne-accessible ${
                  activeDropdown === "more" ? "text-champagne-accessible font-semibold" : ""
                }`}
              >
                <span>More</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${
                    activeDropdown === "more" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* More Dropdown Panel */}
              {activeDropdown === "more" && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 w-72 bg-ivory-pure border border-border-subtle shadow-xl p-4 space-y-3 animate-fadeIn"
                >
                  {MORE_MENU.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="block p-2 rounded-sm hover:bg-ivory-warm/40 transition-colors"
                    >
                      <p className="font-medium text-ink text-xs">{item.label}</p>
                      <p className="text-[10px] text-ink-muted">{item.desc}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* MOBILE HAMBURGER BUTTON */}
          <div className="flex lg:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-2 text-ink hover:text-champagne-accessible"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* CENTER: Brand Emblem & Logo */}
          <div className="flex-1 lg:flex-initial text-center">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="relative w-7 h-7 flex-shrink-0">
                <Image
                  src="/site/brand-emblem.svg"
                  alt="Aryora Fine Jewellery Emblem"
                  width={28}
                  height={28}
                  className="object-contain group-hover:rotate-45 transition-transform duration-500"
                />
              </div>
              <div className="text-left">
                <span className="font-serif text-2xl md:text-3xl tracking-[0.22em] text-ink font-medium leading-none block">
                  ARYORA
                </span>
                <span className="text-[8px] uppercase tracking-[0.3em] text-champagne-accessible font-semibold block pt-0.5">
                  Light. Legacy. You.
                </span>
              </div>
            </Link>
          </div>

          {/* RIGHT: Search, Store/Boutique, Account, Wishlist, Cart */}
          <div className="flex items-center space-x-3 sm:space-x-4 text-ink">
            {/* Search Icon */}
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search jewelry catalog"
              className="p-2 text-ink hover:text-champagne-accessible transition-colors"
            >
              <Search size={19} strokeWidth={1.5} />
            </button>

            {/* Store / Boutique Locator Icon */}
            <button
              type="button"
              onClick={openStoreLocator}
              aria-label="Find Aryora Lucknow Boutique"
              title="Lucknow Boutique Atelier"
              className="p-2 text-ink hover:text-champagne-accessible transition-colors hidden sm:inline-flex"
            >
              <MapPin size={19} strokeWidth={1.5} />
            </button>

            {/* User Account Icon */}
            <Link
              href="/account"
              aria-label="User Account"
              className="p-2 text-ink hover:text-champagne-accessible transition-colors hidden sm:inline-flex"
            >
              <User size={19} strokeWidth={1.5} />
            </Link>

            {/* Wishlist Icon with Badge */}
            <Link
              href="/wishlist"
              aria-label={`Wishlist with ${wishlistCount} items`}
              className="p-2 text-ink hover:text-champagne-accessible transition-colors relative"
            >
              <Heart size={19} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#B93826] text-ivory text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Bag Icon with Badge */}
            <button
              type="button"
              onClick={openCart}
              aria-label={`Shopping bag with ${cartCount} items`}
              className="p-2 text-ink hover:text-champagne-accessible transition-colors relative"
            >
              <ShoppingBag size={19} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#1B3B30] text-ivory text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 3. MOBILE SLIDE-OUT MENU DRAWER */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm lg:hidden animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-4/5 max-w-sm h-full bg-ivory-pure p-6 overflow-y-auto space-y-6 animate-slideLeft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <span className="font-serif text-xl tracking-widest text-ink font-semibold">
                ARYORA
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation"
                className="p-1 text-ink-muted hover:text-ink"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs uppercase tracking-luxury font-medium text-ink">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-champagne pt-1">
                Fine Jewellery Categories
              </p>
              {CATEGORIES_MENU.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <Link
                    href={cat.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block font-serif text-sm normal-case font-medium hover:text-champagne-accessible"
                  >
                    {cat.name}
                  </Link>
                </div>
              ))}

              <div className="pt-4 border-t border-border-subtle space-y-3">
                <Link
                  href="/customize"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-champagne-accessible font-semibold"
                >
                  ✦ Custom Ring Builder
                </Link>
                <Link
                  href="/bridal"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-ink font-medium"
                >
                  Heritage Bridal Suites
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openStoreLocator();
                  }}
                  className="block text-left text-ink-muted hover:text-ink"
                >
                  Lucknow Boutique Atelier
                </button>
                <Link
                  href="/world-of-lgd"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-ink-muted hover:text-ink"
                >
                  The World of LGD
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-ink-muted hover:text-ink"
                >
                  About Aryora
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-border-subtle text-xs text-ink-muted space-y-1">
              <p className="font-semibold text-ink">Client Concierge</p>
              <p>+91 8808828646</p>
              <p>aryora.legacy@hotmail.com</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
