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
    items: [
      { label: "All Rings", href: "/shop?category=Rings" },
      { label: "Solitaire Engagement", href: "/shop?category=Rings&style=Solitaire" },
      { label: "Eternity & Stacking Bands", href: "/shop?category=Rings&subcategory=Eternity+Bands" },
      { label: "Classic Wedding Bands", href: "/shop?category=Rings&gender=Men" },
    ],
  },
  {
    name: "Earrings",
    href: "/shop?category=Earrings",
    items: [
      { label: "All Earrings", href: "/shop?category=Earrings" },
      { label: "Solitaire Studs", href: "/shop?category=Earrings&subcategory=Studs" },
      { label: "Drops & Danglers", href: "/shop?category=Earrings&subcategory=Drops" },
      { label: "Diamond Huggies", href: "/shop?category=Earrings&subcategory=Hoops" },
    ],
  },
  {
    name: "Necklaces & Pendants",
    href: "/shop?category=Necklaces",
    items: [
      { label: "All Necklaces", href: "/shop?category=Necklaces" },
      { label: "Solitaire Pendants With Chain", href: "/shop?category=Pendants" },
      { label: "Diamond Tennis Necklaces", href: "/shop?category=Necklaces&style=Tennis" },
      { label: "Chokers & Heritage Chains", href: "/shop?category=Necklaces&subcategory=Chokers" },
    ],
  },
  {
    name: "Bracelets & Solitaires",
    href: "/shop?category=Bracelets",
    items: [
      { label: "All Bracelets", href: "/shop?category=Bracelets" },
      { label: "Solitaire Tennis Bracelets", href: "/shop?category=Bracelets&style=Tennis" },
      { label: "Certified Solitaires (1-3ct)", href: "/shop?category=Solitaires" },
      { label: "Heritage Bridal Suites", href: "/bridal" },
    ],
  },
];

const MORE_MENU = [
  { label: "About Ayor Atelier", href: "/about", desc: "Heritage craft born in Lucknow" },
  { label: "The World of Lab Diamonds", href: "/world-of-lgd", desc: "Chemical, physical & optical equivalence" },
  { label: "Ethical & Sustainable Craft", href: "/sustainability", desc: "Zero earth mining & solar brilliance" },
  { label: "Ring Size & Fitting Guide", href: "/size-guide", desc: "Accurate Indian standard measurements" },
  { label: "Client FAQ & Dossiers", href: "/faq", desc: "IGI certification, buyback & warranties" },
  { label: "Contact Customer Support", href: "/contact", desc: "+91 8808828646 · Call & WhatsApp Help" },
  { label: "🔒 Master Admin Console", href: "/admin", desc: "Daily metal rates, auto-pricing & product editor" },
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
      {/* 1. TOP ANNOUNCEMENT STRIP (Miss Jo Luxury Minimal Aesthetic) */}
      <div className="bg-[#1A1A1A] text-[#FDFBF9] text-[11px] py-2 px-4 text-center tracking-wider font-medium flex items-center justify-center gap-2 border-b border-white/10">
        <Sparkles size={12} className="text-[#C09981]" />
        <span>100% IGI-Certified Lab-Grown Diamonds · Complimentary Insured Pan-India Delivery</span>
        <span className="hidden md:inline text-[#C09981]">· 15-Day Easy Returns</span>
      </div>

      {/* 2. MAIN HEADER (Ethera Diamonds Reference Layout) */}
      <header
        className={`sticky top-0 z-40 bg-ivory-pure/95 backdrop-blur-md border-b border-border-subtle transition-shadow duration-300 ${
          isScrolled ? "shadow-sm" : ""
        }`}
      >
        <div className="max-w-content mx-auto px-4 md:px-8 h-18 md:h-20 flex items-center justify-between">
          {/* LEFT: Categories, Customize, More */}
          <nav className="hidden lg:flex items-center space-x-8 text-xs font-medium text-[#111111]">
            {/* Categories Mega Dropdown Trigger */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("categories")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "categories" ? null : "categories")}
                className={`flex items-center gap-1.5 py-4 transition-colors font-semibold tracking-wider text-[13px] text-[#111111] hover:text-[#8E5B42] ${
                  activeDropdown === "categories" ? "text-[#8E5B42]" : ""
                }`}
              >
                <span>Categories</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    activeDropdown === "categories" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Mega-menu Panel */}
              {activeDropdown === "categories" && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 w-[880px] bg-white border border-[#DDD8D0] shadow-[0_20px_45px_rgba(0,0,0,0.12)] rounded-b-2xl p-7 animate-fadeIn z-50 normal-case"
                >
                  <div className="grid grid-cols-12 gap-7">
                    {/* 4 Clean Columns (Col-span 8) */}
                    <div className="col-span-8 grid grid-cols-4 gap-6">
                      {CATEGORIES_MENU.map((col) => (
                        <div key={col.name} className="space-y-3">
                          <Link
                            href={col.href}
                            onClick={() => setActiveDropdown(null)}
                            className="font-serif text-[15px] text-[#111111] font-semibold hover:text-[#8E5B42] transition-colors block pb-1 border-b border-[#EAE5DE]"
                          >
                            {col.name}
                          </Link>
                          <ul className="space-y-2 text-[13px]">
                            {col.items.map((sub) => (
                              <li key={sub.label}>
                                <Link
                                  href={sub.href}
                                  onClick={() => setActiveDropdown(null)}
                                  className="text-[#2D2D2D] hover:text-[#8E5B42] hover:translate-x-1 transition-all duration-150 block py-0.5 font-normal"
                                >
                                  {sub.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Spotlight Card (Col-span 4) */}
                    <div className="col-span-4 bg-[#FAF7F2] border border-[#EAE5DE] rounded-xl p-4 flex flex-col justify-between">
                      <div>
                        <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-3 bg-white">
                          <Image
                            src="/products/ring-01-a.jpg"
                            alt="Brilliant Round Solitaire Engagement Ring"
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-2 left-2 bg-[#1A1A1A] text-white text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full">
                            Bestseller
                          </span>
                        </div>
                        <p className="font-serif text-sm font-semibold text-[#111111] leading-snug">
                          Brilliant Round Solitaire Ring
                        </p>
                        <p className="text-[11px] text-[#4A4A4A] mt-0.5">
                          925 Silver · IGI Certified Lab Diamond
                        </p>
                      </div>
                      <Link
                        href="/product/brilliant-round-shaped-solitaire-engagement-ring"
                        onClick={() => setActiveDropdown(null)}
                        className="mt-3 pt-2.5 border-t border-[#DDD8D0] inline-flex items-center justify-between text-xs font-semibold text-[#8E5B42] hover:text-[#111111] transition-colors group"
                      >
                        <span>Explore Solitaire</span>
                        <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>

                  {/* Bottom Trust & Full Catalog Bar */}
                  <div className="mt-6 pt-4 border-t border-[#EAE5DE] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-[#2D2D2D] font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#108474]" />
                        100% IGI Certified Diamonds
                      </span>
                      <span className="text-[#C4C0B9]">·</span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C09981]" />
                        925 Sterling Silver & 18K Gold
                      </span>
                    </div>
                    <Link
                      href="/shop"
                      onClick={() => setActiveDropdown(null)}
                      className="font-semibold text-[#8E5B42] hover:text-[#111111] flex items-center gap-1.5 group transition-colors"
                    >
                      <span>Explore Entire Catalogue</span>
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Customize / Atelier Link */}
            <Link
              href="/customize"
              className="py-4 font-semibold tracking-wider text-[13px] text-[#111111] hover:text-[#8E5B42] transition-colors"
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
                className={`flex items-center gap-1.5 py-4 transition-colors font-semibold tracking-wider text-[13px] text-[#111111] hover:text-[#8E5B42] ${
                  activeDropdown === "more" ? "text-[#8E5B42]" : ""
                }`}
              >
                <span>More</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    activeDropdown === "more" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* More Dropdown Panel */}
              {activeDropdown === "more" && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 w-80 bg-white border border-[#DDD8D0] shadow-[0_20px_45px_rgba(0,0,0,0.1)] rounded-2xl p-3.5 space-y-1 animate-fadeIn z-50 normal-case"
                >
                  {MORE_MENU.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setActiveDropdown(null)}
                      className="block p-2.5 rounded-lg hover:bg-[#FAF7F2] transition-colors"
                    >
                      <p className="font-semibold text-[#111111] text-[13px]">{item.label}</p>
                      <p className="text-[11px] text-[#4A4A4A] mt-0.5 leading-snug">{item.desc}</p>
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

          {/* CENTER: Official AYOR Brand Logo */}
          <div className="flex-1 lg:flex-initial text-center">
            <Link href="/" className="inline-flex flex-col items-center group py-1">
              <div className="relative h-7 sm:h-8 md:h-9 w-28 sm:w-32 md:w-36 flex items-center justify-center">
                <Image
                  src="/site/ayor-logo.svg"
                  alt="AYOR Fine Jewellery"
                  width={144}
                  height={42}
                  priority
                  className="w-full h-full object-contain group-hover:opacity-85 transition-opacity"
                />
              </div>
              <span className="text-[7.5px] md:text-[8.5px] uppercase tracking-[0.34em] text-[#B89B77] font-semibold block pt-1 leading-none">
                Light. Legacy. You.
              </span>
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
              aria-label="Find Ayor Lucknow Boutique"
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
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#C09981] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none shadow-sm">
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
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-start"
              >
                <div className="relative h-6 w-24 flex items-center">
                  <Image
                    src="/site/ayor-logo.svg"
                    alt="AYOR Logo"
                    width={100}
                    height={30}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[7px] uppercase tracking-[0.3em] text-[#B89B77] font-semibold pt-0.5">
                  Light. Legacy. You.
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation"
                className="p-1 text-ink-muted hover:text-ink"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium text-[#111111]">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-[#8E5B42] pt-1">
                Fine Jewellery Categories
              </p>
              {CATEGORIES_MENU.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <Link
                    href={cat.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block font-serif text-base font-semibold text-[#111111] hover:text-[#8E5B42]"
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
                  className="block text-[#111111] font-semibold text-sm"
                >
                  Heritage Bridal Suites
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openStoreLocator();
                  }}
                  className="block text-left text-[#2D2D2D] hover:text-[#111111] text-sm"
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
                  About Ayor
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-[#0E382B] font-semibold text-xs pt-1"
                >
                  🔒 Master Admin Console
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-border-subtle text-xs text-ink-muted space-y-1">
              <p className="font-semibold text-ink">Customer Care & Support</p>
              <p>+91 8808828646</p>
              <p>ayor.legacy@hotmail.com</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
