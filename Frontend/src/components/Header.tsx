"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Phone,
  Video,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";
import { useAryoraStore } from "@/lib/store";
import { PRODUCTS, formatPriceINR, ProductItem } from "@/lib/products";

// Mega menu configurations following BlueStone concept with Aryora identity
interface MegaMenuItem {
  id: string;
  label: string;
  href: string;
  subCategories: { name: string; href: string }[];
  shopBy: {
    title: string;
    items: { name: string; href: string }[];
  }[];
  featured: {
    title: string;
    description: string;
    image: string;
    href: string;
  };
}

const MEGA_MENU_DATA: MegaMenuItem[] = [
  {
    id: "rings",
    label: "Rings",
    href: "/shop?category=rings",
    subCategories: [
      { name: "All Rings", href: "/shop?category=rings" },
      { name: "Solitaire Rings", href: "/shop?category=rings&style=Solitaire" },
      { name: "Engagement Bands", href: "/shop?category=rings&occasion=Engagement" },
      { name: "Eternity Bands", href: "/shop?category=rings&style=Eternity" },
      { name: "Cocktail Rings", href: "/shop?category=rings&style=Cocktail" },
      { name: "Daily Wear Bands", href: "/shop?category=rings&occasion=Everyday" },
      { name: "92.5 Silver Rings", href: "/shop?category=rings&metal=SILVER_925" },
    ],
    shopBy: [
      {
        title: "Shop By Price",
        items: [
          { name: "Under ₹25,000", href: "/shop?category=rings&price=under-25k" },
          { name: "₹25,000 - ₹50,000", href: "/shop?category=rings&price=25k-50k" },
          { name: "₹50,000 - ₹1,00,000", href: "/shop?category=rings&price=50k-100k" },
          { name: "Above ₹1,00,000", href: "/shop?category=rings&price=above-100k" },
        ],
      },
      {
        title: "Shop By Metal",
        items: [
          { name: "18K Yellow Gold", href: "/shop?category=rings&metal=YELLOW_GOLD" },
          { name: "18K Rose Gold", href: "/shop?category=rings&metal=ROSE_GOLD" },
          { name: "18K White Gold", href: "/shop?category=rings&metal=WHITE_GOLD" },
          { name: "92.5 Sterling Silver", href: "/shop?category=rings&metal=SILVER_925" },
        ],
      },
    ],
    featured: {
      title: "Emerald Solitaire Suite",
      description: "1.50ct architectural emerald-cut lab diamond perched on 18K gold.",
      image: "/images/products/emerald-solitaire-1.jpg",
      href: "/product/emerald-cut-solitaire-ring",
    },
  },
  {
    id: "earrings",
    label: "Earrings",
    href: "/shop?category=earrings",
    subCategories: [
      { name: "All Earrings", href: "/shop?category=earrings" },
      { name: "Solitaire Studs", href: "/shop?category=earrings&style=Studs" },
      { name: "Luminary Drops", href: "/shop?category=earrings&style=Drops" },
      { name: "Everyday Huggies & Hoops", href: "/shop?category=earrings&style=Hoops" },
      { name: "Chandbali & Royal Drops", href: "/shop?category=earrings&occasion=Wedding" },
    ],
    shopBy: [
      {
        title: "Shop By Occasion",
        items: [
          { name: "Daily Office Wear", href: "/shop?category=earrings&occasion=Workwear" },
          { name: "Cocktail Soirées", href: "/shop?category=earrings&occasion=Everyday" },
          { name: "Wedding Celebrations", href: "/shop?category=earrings&occasion=Wedding" },
        ],
      },
      {
        title: "Shop By Price",
        items: [
          { name: "Under ₹30,000", href: "/shop?category=earrings&price=under-25k" },
          { name: "₹30,000 - ₹60,000", href: "/shop?category=earrings&price=25k-50k" },
          { name: "Above ₹60,000", href: "/shop?category=earrings&price=above-100k" },
        ],
      },
    ],
    featured: {
      title: "Celeste Solitaire Studs",
      description: "1.00ct total certified lab-grown diamonds in 18K yellow gold baskets.",
      image: "/images/products/solitaire-studs.jpg",
      href: "/product/celeste-solitaire-diamond-studs",
    },
  },
  {
    id: "pendants",
    label: "Pendants",
    href: "/shop?category=pendants",
    subCategories: [
      { name: "All Pendants", href: "/shop?category=pendants" },
      { name: "Solitaire Pendants", href: "/shop?category=pendants&style=Solitaire" },
      { name: "Bezel Daily Pendants", href: "/shop?category=pendants&style=Lightweight" },
      { name: "Halo Light Pendants", href: "/shop?category=pendants" },
      { name: "Layering Medallions", href: "/shop?category=pendants" },
    ],
    shopBy: [
      {
        title: "Shop By Price",
        items: [
          { name: "Under ₹30,000", href: "/shop?category=pendants&price=under-25k" },
          { name: "₹30,000 - ₹50,000", href: "/shop?category=pendants&price=25k-50k" },
          { name: "Above ₹50,000", href: "/shop?category=pendants&price=50k-100k" },
        ],
      },
      {
        title: "Occasion",
        items: [
          { name: "Everyday Minimalist", href: "/shop?category=pendants&occasion=Everyday" },
          { name: "Meaningful Gifting", href: "/shop?category=pendants&occasion=Gifting" },
        ],
      },
    ],
    featured: {
      title: "Aura Solitaire Pendant",
      description: "0.80ct brilliant round diamond floating in an ultra-low profile bezel.",
      image: "/images/essence-necklace.jpg",
      href: "/product/cascade-solitaire-pendant",
    },
  },
  {
    id: "necklaces",
    label: "Necklaces",
    href: "/shop?category=necklaces",
    subCategories: [
      { name: "All Necklaces", href: "/shop?category=necklaces" },
      { name: "Graduated Tennis Necklaces", href: "/shop?category=necklaces&style=Tennis" },
      { name: "Heritage Chokers", href: "/shop?category=necklaces&style=Choker" },
      { name: "Bridal Suites", href: "/bridal" },
    ],
    shopBy: [
      {
        title: "Shop By Metal",
        items: [
          { name: "18K White Gold", href: "/shop?category=necklaces&metal=WHITE_GOLD" },
          { name: "18K Yellow Gold", href: "/shop?category=necklaces&metal=YELLOW_GOLD" },
          { name: "18K Champagne Gold", href: "/shop?category=necklaces&metal=CHAMPAGNE_GOLD" },
        ],
      },
      {
        title: "Collections",
        items: [
          { name: "Everyday Luxury", href: "/collections/everyday" },
          { name: "Noor Bridal Suite", href: "/bridal" },
        ],
      },
    ],
    featured: {
      title: "Étoile Tennis Necklace",
      description: "64 calibrated diamonds graduated along 18K white gold articulated links.",
      image: "/images/collection-everyday.jpg",
      href: "/product/verve-tennis-necklace",
    },
  },
  {
    id: "bracelets",
    label: "Bracelets & Bangles",
    href: "/shop?category=bracelets",
    subCategories: [
      { name: "All Bracelets", href: "/shop?category=bracelets" },
      { name: "Diamond Tennis Bracelets", href: "/shop?category=bracelets&style=Tennis" },
      { name: "Modern Bar Mangalsutras", href: "/shop?category=mangalsutras" },
      { name: "Stackable Bangles", href: "/shop?category=bracelets" },
      { name: "Men's Kada & Bands", href: "/shop?category=mens" },
    ],
    shopBy: [
      {
        title: "Shop By Price",
        items: [
          { name: "Under ₹50,000", href: "/shop?category=bracelets&price=25k-50k" },
          { name: "₹50,000 - ₹1,50,000", href: "/shop?category=bracelets&price=50k-100k" },
          { name: "Luxury Heirloom", href: "/shop?category=bracelets&price=above-100k" },
        ],
      },
      {
        title: "Recipient",
        items: [
          { name: "For Her", href: "/shop?gender=Women" },
          { name: "For Him", href: "/shop?category=mens" },
        ],
      },
    ],
    featured: {
      title: "Étoile Tennis Bracelet",
      description: "3.50 carats of hand-set lab diamonds in a continuous 18K gold strand.",
      image: "/images/products/tennis-bracelet.jpg",
      href: "/product/etoile-diamond-tennis-bracelet",
    },
  },
  {
    id: "solitaires",
    label: "Solitaires",
    href: "/collections/solitaire",
    subCategories: [
      { name: "Solitaire Collection", href: "/collections/solitaire" },
      { name: "Solitaire Engagement Rings", href: "/shop?category=rings&style=Solitaire" },
      { name: "Solitaire Diamond Studs", href: "/shop?category=earrings&style=Studs" },
      { name: "Solitaire Pendants", href: "/shop?category=pendants&style=Solitaire" },
      { name: "Design Your Own Solitaire", href: "/customize" },
    ],
    shopBy: [
      {
        title: "Diamond Shapes",
        items: [
          { name: "Round Brilliant", href: "/shop?category=solitaires&shape=Round" },
          { name: "Emerald Cut", href: "/shop?category=solitaires&shape=Emerald" },
          { name: "Pear Cut", href: "/shop?category=solitaires&shape=Pear" },
          { name: "Princess Cut", href: "/shop?category=solitaires&shape=Princess" },
        ],
      },
      {
        title: "Carat Weights",
        items: [
          { name: "0.50 Carat IGI", href: "/shop?category=solitaires" },
          { name: "1.00 Carat IGI", href: "/shop?category=solitaires" },
          { name: "1.50 Carat IGI", href: "/shop?category=solitaires" },
          { name: "2.00+ Carats", href: "/shop?category=solitaires" },
        ],
      },
    ],
    featured: {
      title: "The Solitaire Guarantee",
      description: "IGI certified with laser inscription. 100% Type IIa chemical purity.",
      image: "/images/collection-solitaire.jpg",
      href: "/collections/solitaire",
    },
  },
  {
    id: "bridal",
    label: "Bridal",
    href: "/bridal",
    subCategories: [
      { name: "Bridal Suite", href: "/bridal" },
      { name: "Royal Awadh Chokers", href: "/shop?category=bridal" },
      { name: "Modern Mangalsutras", href: "/shop?category=mangalsutras" },
      { name: "Engagement Rings", href: "/shop?category=rings&occasion=Engagement" },
      { name: "Bespoke Bridal Concierge", href: "/customize" },
    ],
    shopBy: [
      {
        title: "Occasion",
        items: [
          { name: "Engagement Ceremony", href: "/shop?occasion=Engagement" },
          { name: "Sangeet & Cocktail", href: "/shop?occasion=Everyday" },
          { name: "The Wedding Day", href: "/bridal" },
          { name: "Reception Heirlooms", href: "/shop?category=bridal" },
        ],
      },
      {
        title: "Craftsmanship",
        items: [
          { name: "Awadhi Heritage Filigree", href: "/about" },
          { name: "Lab-Grown Emeralds", href: "/shop?category=bridal" },
          { name: "18K Champagne Gold", href: "/shop?metal=CHAMPAGNE_GOLD" },
        ],
      },
    ],
    featured: {
      title: "Noor Bridal Suite",
      description: "8.20 carats of royal brilliance handcrafted for Lucknow weddings.",
      image: "/images/collection-bridal.jpg",
      href: "/product/radiant-heritage-bridal-set",
    },
  },
  {
    id: "gifts",
    label: "Gifts",
    href: "/shop?occasion=Gifting",
    subCategories: [
      { name: "All Gifting Pieces", href: "/shop?occasion=Gifting" },
      { name: "Gifts Under ₹25,000", href: "/shop?price=under-25k" },
      { name: "Gifts ₹25,000 - ₹50,000", href: "/shop?price=25k-50k" },
      { name: "Luxury Milestone Gifts", href: "/shop?price=above-100k" },
      { name: "Anniversary Jewellery", href: "/shop?occasion=Anniversary" },
      { name: "Men's Fine Gifting", href: "/shop?category=mens" },
    ],
    shopBy: [
      {
        title: "By Recipient",
        items: [
          { name: "For Partner", href: "/shop?occasion=Anniversary" },
          { name: "For Mother & Sister", href: "/shop?occasion=Gifting" },
          { name: "Self Purchase Treat", href: "/shop?occasion=Everyday" },
          { name: "For Groom / Him", href: "/shop?category=mens" },
        ],
      },
      {
        title: "Aryora Gift Box",
        items: [
          { name: "Signature Velvet Box", href: "/about" },
          { name: "Personalized Note Card", href: "/checkout" },
          { name: "IGI Certificate Card", href: "/world-of-lgd" },
        ],
      },
    ],
    featured: {
      title: "Conscious Giving",
      description: "Arrives in our signature warm ivory & gold velvet heirloom packaging.",
      image: "/images/craft-hands.jpg",
      href: "/shop?occasion=Gifting",
    },
  },
  {
    id: "customize",
    label: "Customize",
    href: "/customize",
    subCategories: [
      { name: "Interactive Ring Customizer", href: "/customize" },
      { name: "Book Lucknow Atelier Visit", href: "/contact#visit-lucknow" },
      { name: "WhatsApp Virtual Consultation", href: "https://wa.me/918808828646?text=Hi%20Aryora,%20I%20would%20like%20to%20custom-design%20a%20jewel" },
      { name: "Ring Size Guide", href: "/size-guide" },
      { name: "The World of LGD", href: "/world-of-lgd" },
    ],
    shopBy: [
      {
        title: "Bespoke Steps",
        items: [
          { name: "1. Select Diamond Shape", href: "/customize" },
          { name: "2. Choose Gold Metal & Purity", href: "/customize" },
          { name: "3. 3D Real-time CAD Preview", href: "/customize" },
          { name: "4. Delivered in 14 Days", href: "/shipping" },
        ],
      },
      {
        title: "Expert Assistance",
        items: [
          { name: "Video Call with Gemologist", href: "https://wa.me/918808828646?text=Hi%20Aryora,%20I%20would%20like%20to%20book%20a%20video%20consultation" },
          { name: "Custom Engraving", href: "/customize" },
        ],
      },
    ],
    featured: {
      title: "Atelier Customization",
      description: "Work directly with our Lucknow master artisans to craft your dream ring.",
      image: "/images/hero-emerald.jpg",
      href: "/customize",
    },
  },
  {
    id: "offers",
    label: "Offers",
    href: "/shop?offer=special",
    subCategories: [
      { name: "All Special Privileges", href: "/shop" },
      { name: "Making Charges 50% Off", href: "/shop?offer=making-charges-off" },
      { name: "Ready to Ship Today", href: "/shop?delivery=ready-to-ship" },
      { name: "Complimentary Insured Shipping", href: "/shipping" },
      { name: "30-Day Free Resizing", href: "/returns" },
    ],
    shopBy: [
      {
        title: "Aryora Trust",
        items: [
          { name: "100% IGI Certified", href: "/world-of-lgd" },
          { name: "Lifetime Buyback & Exchange", href: "/returns" },
          { name: "Zero Middleman Pricing", href: "/about" },
        ],
      },
      {
        title: "Ready to Dispatch",
        items: [
          { name: "Next Day Dispatched Rings", href: "/shop?category=rings&delivery=ready-to-ship" },
          { name: "Solitaire Studs in Stock", href: "/shop?category=earrings&delivery=ready-to-ship" },
        ],
      },
    ],
    featured: {
      title: "Direct Atelier Pricing",
      description: "Direct-from-creator value: 70% better diamond value than mined equivalents.",
      image: "/images/products/tulip.jpg",
      href: "/shop",
    },
  },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>("rings");
  const [mounted, setMounted] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Recently Viewed dropdown state
  const [recentDropdownOpen, setRecentDropdownOpen] = useState(false);
  const recentDropdownRef = useRef<HTMLDivElement>(null);

  const { cart, wishlist, recentlyViewed, openCart, openSearch } = useAryoraStore();

  const cartCount = mounted ? cart.reduce((t, i) => t + i.quantity, 0) : 0;
  const wishlistCount = mounted ? wishlist.length : 0;

  // Filter products for fast inline search suggestions
  const searchResults = searchQuery.trim()
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.specs.metal.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.style.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  const recentProducts: ProductItem[] = mounted
    ? recentlyViewed
        .map((slug) => PRODUCTS.find((p) => p.slug === slug))
        .filter((p): p is ProductItem => Boolean(p))
        .slice(0, 3)
    : [];

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle outside click for search and recently viewed dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchDropdownOpen(false);
      }
      if (
        recentDropdownRef.current &&
        !recentDropdownRef.current.contains(e.target as Node)
      ) {
        setRecentDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    setActiveMegaMenu(null);
    setSearchDropdownOpen(false);
    setRecentDropdownOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchDropdownOpen(false);
    }
  };

  const handleMegaMenuEnter = (id: string) => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setActiveMegaMenu(id);
  };

  const handleMegaMenuLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 150);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-ivory text-ink shadow-sm transition-all duration-200">
        {/* ========================================================= */}
        {/* 1. TOP UTILITY STRIP (BlueStone Concept, Aryora Palette) */}
        {/* ========================================================= */}
        <div className="bg-ivory-warm border-b border-border-subtle/80 text-[11px] text-ink-muted">
          <div className="max-w-content mx-auto px-4 md:px-8 py-1.5 flex items-center justify-between">
            {/* Left Utility Links */}
            <div className="flex items-center space-x-5">
              {/* Recently Viewed Dropdown */}
              <div className="relative" ref={recentDropdownRef}>
                <button
                  type="button"
                  onClick={() => setRecentDropdownOpen(!recentDropdownOpen)}
                  className="flex items-center space-x-1 hover:text-ink transition-colors font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-champagne"
                  aria-expanded={recentDropdownOpen}
                >
                  <Clock size={12} className="text-champagne-accessible" />
                  <span>Recently Viewed</span>
                  <ChevronDown
                    size={11}
                    className={`transition-transform ${recentDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {recentDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-72 bg-ivory-pure border border-border-subtle shadow-xl p-3 z-50 animate-fadeIn">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-ink-light pb-2 border-b border-border-subtle">
                      Your Viewed Designs
                    </p>
                    {recentProducts.length > 0 ? (
                      <div className="divide-y divide-border-subtle/60">
                        {recentProducts.map((p) => (
                          <Link
                            key={p.id}
                            href={`/product/${p.slug}`}
                            onClick={() => setRecentDropdownOpen(false)}
                            className="flex items-center space-x-3 py-2.5 hover:bg-ivory/60 transition-colors group"
                          >
                            <div className="relative w-10 h-10 bg-ivory flex-shrink-0 border border-border-subtle overflow-hidden">
                              <Image
                                src={p.images[0].url}
                                alt={p.name}
                                fill
                                sizes="40px"
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-ink truncate group-hover:text-champagne-accessible transition-colors">
                                {p.name}
                              </p>
                              <p className="text-[11px] font-medium text-ink">
                                {formatPriceINR(p.price)}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-ink-muted py-4 text-center">
                        No designs viewed yet. Browse our collections!
                      </p>
                    )}
                    <Link
                      href="/shop"
                      onClick={() => setRecentDropdownOpen(false)}
                      className="block text-center text-[10px] uppercase tracking-widest text-champagne-accessible font-semibold pt-2 border-t border-border-subtle hover:underline"
                    >
                      Browse Catalogue
                    </Link>
                  </div>
                )}
              </div>

              {/* Video Consultation (WhatsApp) */}
              <a
                href="https://wa.me/918808828646?text=Hi%20Aryora,%20I%20would%20like%20to%20book%20a%20virtual%20video%20consultation"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center space-x-1.5 hover:text-ink transition-colors font-medium text-champagne-accessible"
              >
                <Video size={12} />
                <span>Video Consultation</span>
              </a>

              {/* Visit Lucknow Atelier */}
              <Link
                href="/contact#visit-lucknow"
                className="hidden md:flex items-center space-x-1.5 hover:text-ink transition-colors"
              >
                <MapPin size={12} className="text-ink-light" />
                <span>Visit Us / Lucknow Atelier</span>
              </Link>
            </div>

            {/* Right Trust Announcement & Utility */}
            <div className="flex items-center space-x-5">
              <span className="hidden lg:inline text-ink-muted">
                100% IGI Certified Lab Diamonds · Free Insured Courier Across India
              </span>

              <div className="flex items-center space-x-4">
                <Link
                  href="/account"
                  className="hidden sm:flex items-center space-x-1 hover:text-ink transition-colors"
                >
                  <User size={12} />
                  <span>Account</span>
                </Link>

                <Link
                  href="/wishlist"
                  className="flex items-center space-x-1 hover:text-ink transition-colors"
                  aria-label={`Wishlist (${wishlistCount})`}
                >
                  <Heart size={12} />
                  <span>Wishlist ({wishlistCount})</span>
                </Link>

                <button
                  type="button"
                  onClick={openCart}
                  className="flex items-center space-x-1 font-semibold text-ink hover:text-champagne-accessible transition-colors"
                  aria-label={`Shopping bag (${cartCount})`}
                >
                  <ShoppingBag size={12} />
                  <span>Bag ({cartCount})</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. MAIN HEADER ROW (Logo, Wide Search Bar, Action Icons)  */}
        {/* ========================================================= */}
        <div className="max-w-content mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-4 md:gap-8">
          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 text-ink hover:opacity-70 transition-opacity lg:hidden"
            aria-label="Open jewellery navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>

          {/* Aryora Brand Logo */}
          <Link
            href="/"
            className="flex flex-col items-center group flex-shrink-0"
            aria-label="Aryora Home"
          >
            <span className="font-serif text-2xl md:text-3xl tracking-[0.22em] text-ink uppercase font-light leading-none group-hover:text-champagne-accessible transition-colors">
              Aryora
            </span>
            <span className="text-[8px] uppercase tracking-[0.28em] text-champagne font-medium mt-1">
              Lucknow · Fine Jewellery
            </span>
          </Link>

          {/* Wide BlueStone-style Search Bar with Instant Dropdown */}
          <div
            ref={searchContainerRef}
            className="hidden sm:block flex-1 max-w-xl mx-2 relative"
          >
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchDropdownOpen(true);
                }}
                onFocus={() => setSearchDropdownOpen(true)}
                placeholder="Search rings, solitaires, tennis bracelets, studs, bridal..."
                className="w-full bg-ivory-pure border border-border-subtle px-4 py-2 pl-10 pr-10 text-xs text-ink placeholder:text-ink-light focus:outline-none focus:border-champagne focus:ring-1 focus:ring-champagne transition-all"
                aria-label="Search catalogue"
              />
              <Search
                size={16}
                strokeWidth={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light pointer-events-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-light hover:text-ink p-1"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </form>

            {/* Instant Search Suggestions Dropdown */}
            {searchDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-full bg-ivory-pure border border-border-subtle shadow-xl p-4 z-50 animate-fadeIn">
                {searchQuery.trim().length > 0 ? (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-ink-light mb-2">
                      Matching Designs ({searchResults.length})
                    </p>
                    {searchResults.length > 0 ? (
                      <div className="divide-y divide-border-subtle/50">
                        {searchResults.map((p) => (
                          <Link
                            key={p.id}
                            href={`/product/${p.slug}`}
                            onClick={() => setSearchDropdownOpen(false)}
                            className="flex items-center space-x-3 py-2 hover:bg-ivory/60 transition-colors group"
                          >
                            <div className="relative w-12 h-12 bg-ivory flex-shrink-0 border border-border-subtle overflow-hidden">
                              <Image
                                src={p.images[0].url}
                                alt={p.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-ink truncate group-hover:text-champagne-accessible">
                                {p.name}
                              </p>
                              <p className="text-[11px] text-ink-muted">
                                {p.specs.metal} · {formatPriceINR(p.price)}
                              </p>
                            </div>
                            <span className="text-[10px] text-champagne font-semibold uppercase tracking-wider">
                              View
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-ink-muted py-2">
                        No designs found matching &quot;{searchQuery}&quot;. Try &quot;solitaire&quot;, &quot;emerald&quot;, or &quot;bracelet&quot;.
                      </p>
                    )}
                    <Link
                      href={`/shop?q=${encodeURIComponent(searchQuery)}`}
                      onClick={() => setSearchDropdownOpen(false)}
                      className="block text-center text-xs font-semibold text-champagne-accessible hover:underline pt-3 mt-2 border-t border-border-subtle"
                    >
                      View all results for &quot;{searchQuery}&quot; →
                    </Link>
                  </div>
                ) : (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-ink-light mb-2">
                      Popular Searches
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {[
                        "Solitaire Engagement Rings",
                        "Tennis Bracelets",
                        "18K Gold Studs",
                        "Emerald Choker",
                        "Modern Mangalsutra",
                        "Men's Diamond Band",
                      ].map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => {
                            setSearchQuery(term);
                            router.push(`/shop?q=${encodeURIComponent(term)}`);
                            setSearchDropdownOpen(false);
                          }}
                          className="text-[11px] px-2.5 py-1 bg-ivory hover:bg-ivory-warm border border-border-subtle text-ink transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Mobile Search Button */}
            <button
              type="button"
              onClick={openSearch}
              className="p-2 text-ink hover:opacity-75 sm:hidden"
              aria-label="Open search dialog"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>

            {/* Video Consultation (WhatsApp Video Call) */}
            <a
              href="https://wa.me/918808828646?text=Hi%20Aryora,%20I%20would%20like%20to%20book%20a%20virtual%20video%20consultation"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 border border-champagne/40 bg-ivory-warm text-champagne-accessible text-xs font-medium hover:border-champagne transition-all"
              title="Book 1-on-1 WhatsApp Video Consultation with our gemologists in Lucknow"
            >
              <Video size={14} />
              <span>Video Consultation</span>
            </a>

            {/* Wishlist Icon */}
            <Link
              href="/wishlist"
              className="relative p-2 text-ink hover:opacity-75 transition-opacity"
              aria-label={`Wishlist with ${wishlistCount} items`}
            >
              <Heart size={20} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-champagne text-ivory text-[9px] font-semibold flex items-center justify-center animate-scaleIn">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Bag Icon */}
            <button
              type="button"
              onClick={openCart}
              className="relative p-2 text-ink hover:opacity-75 transition-opacity"
              aria-label={`Shopping bag with ${cartCount} items`}
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-ink text-ivory text-[9px] font-semibold flex items-center justify-center animate-scaleIn">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. CATEGORY ROW & BLUESTONE-STYLE MEGA MENU               */}
        {/* ========================================================= */}
        <nav
          className="hidden lg:block border-t border-border-subtle relative bg-ivory"
          aria-label="Category navigation"
          onMouseLeave={handleMegaMenuLeave}
        >
          <div className="max-w-content mx-auto px-4 md:px-8">
            <ul className="flex items-center justify-between text-xs font-medium tracking-[0.14em] uppercase text-ink">
              {MEGA_MENU_DATA.map((cat) => {
                const isActive = activeMegaMenu === cat.id;
                return (
                  <li
                    key={cat.id}
                    className="relative"
                    onMouseEnter={() => handleMegaMenuEnter(cat.id)}
                  >
                    <Link
                      href={cat.href}
                      className={`inline-flex items-center space-x-1 py-3 px-2 border-b-2 transition-all ${
                        isActive
                          ? "border-champagne text-champagne-accessible"
                          : "border-transparent text-ink hover:text-champagne-accessible"
                      }`}
                      aria-expanded={isActive}
                    >
                      <span>{cat.label}</span>
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-200 ${
                          isActive ? "rotate-180" : ""
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Active Mega Menu Dropdown Overlay */}
          {activeMegaMenu && (
            <div
              className="absolute left-0 top-full w-full bg-ivory-pure border-b border-border shadow-2xl z-50 animate-fadeIn"
              onMouseEnter={() => {
                if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
              }}
              onMouseLeave={handleMegaMenuLeave}
            >
              {(() => {
                const current = MEGA_MENU_DATA.find((m) => m.id === activeMegaMenu);
                if (!current) return null;
                return (
                  <div className="max-w-content mx-auto px-8 py-8 grid grid-cols-12 gap-8">
                    {/* Column 1: Sub-categories */}
                    <div className="col-span-3 space-y-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-ink border-b border-border-subtle pb-2">
                        {current.label} Categories
                      </p>
                      <ul className="space-y-2 text-xs">
                        {current.subCategories.map((sub) => (
                          <li key={sub.name}>
                            <Link
                              href={sub.href}
                              onClick={() => setActiveMegaMenu(null)}
                              className="text-ink-muted hover:text-champagne-accessible hover:translate-x-1 transition-all inline-block py-0.5"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Column 2 & 3: Shop By Groups */}
                    <div className="col-span-5 grid grid-cols-2 gap-6">
                      {current.shopBy.map((group) => (
                        <div key={group.title} className="space-y-3">
                          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-ink border-b border-border-subtle pb-2">
                            {group.title}
                          </p>
                          <ul className="space-y-2 text-xs">
                            {group.items.map((item) => (
                              <li key={item.name}>
                                <Link
                                  href={item.href}
                                  onClick={() => setActiveMegaMenu(null)}
                                  className="text-ink-muted hover:text-champagne-accessible hover:translate-x-1 transition-all inline-block py-0.5"
                                >
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Column 4: Featured Editorial Visual */}
                    <div className="col-span-4 pl-4 border-l border-border-subtle">
                      <Link
                        href={current.featured.href}
                        onClick={() => setActiveMegaMenu(null)}
                        className="group block space-y-3"
                      >
                        <div className="relative aspect-[4/3] bg-ivory overflow-hidden border border-border-subtle">
                          <Image
                            src={current.featured.image}
                            alt={current.featured.title}
                            fill
                            sizes="360px"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-ivory-pure/90 backdrop-blur-sm text-[9px] uppercase tracking-wider font-semibold text-ink">
                            Featured
                          </div>
                        </div>
                        <div>
                          <p className="font-serif text-base text-ink group-hover:text-champagne-accessible transition-colors">
                            {current.featured.title}
                          </p>
                          <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
                            {current.featured.description}
                          </p>
                          <span className="inline-flex items-center space-x-1 text-xs text-champagne-accessible font-medium mt-1">
                            <span>Explore Design</span>
                            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </Link>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </nav>
      </header>

      {/* ========================================================= */}
      {/* 4. MOBILE SLIDE-IN ACCORDION DRAWER                       */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-ivory shadow-2xl flex flex-col z-50 overflow-y-auto animate-slideInLeft">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif text-xl tracking-[0.2em] uppercase text-ink"
              >
                Aryora
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-ink hover:opacity-75"
                aria-label="Close menu"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Mobile Search input */}
            <div className="p-4 border-b border-border-subtle bg-ivory-warm">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search rings, solitaires, studs..."
                  className="w-full bg-ivory-pure border border-border-subtle px-3 py-2 pl-9 text-xs text-ink placeholder:text-ink-light focus:outline-none focus:border-champagne"
                />
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light pointer-events-none"
                />
              </form>
            </div>

            {/* Category Accordion */}
            <div className="flex-1 px-4 py-3 divide-y divide-border-subtle">
              {MEGA_MENU_DATA.map((cat) => {
                const isOpen = mobileAccordion === cat.id;
                return (
                  <div key={cat.id} className="py-2">
                    <button
                      type="button"
                      onClick={() => setMobileAccordion(isOpen ? null : cat.id)}
                      className="w-full flex items-center justify-between py-2 text-left font-serif text-base text-ink"
                    >
                      <span>{cat.label}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform text-ink-light ${
                          isOpen ? "rotate-180 text-champagne" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="pl-3 pr-2 py-2 space-y-2 text-xs animate-fadeIn">
                        <Link
                          href={cat.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block font-medium text-champagne-accessible py-1"
                        >
                          View All {cat.label} →
                        </Link>
                        <div className="space-y-1.5 pt-1">
                          {cat.subCategories.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block text-ink-muted hover:text-ink py-1"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Additional Brand Links */}
              <div className="py-4 space-y-2 text-xs">
                <Link
                  href="/world-of-lgd"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 text-ink hover:text-champagne"
                >
                  The World of Lab-Grown Diamonds
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 text-ink hover:text-champagne"
                >
                  About Aryora Atelier & Lucknow Heritage
                </Link>
                <Link
                  href="/size-guide"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 text-ink hover:text-champagne"
                >
                  Ring Size & Fitting Guide
                </Link>
                <Link
                  href="/faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 text-ink hover:text-champagne"
                >
                  Client FAQ & Certifications
                </Link>
              </div>
            </div>

            {/* Mobile Footer Concierge Bar */}
            <div className="p-4 border-t border-border bg-ivory-warm space-y-3">
              <a
                href="https://wa.me/918808828646?text=Hi%20Aryora,%20I%20would%20like%20to%20book%20a%20virtual%20video%20consultation"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-champagne text-ivory text-xs font-semibold tracking-wider uppercase"
              >
                <Video size={14} />
                <span>Book Video Consultation</span>
              </a>

              <div className="flex items-center justify-between text-[11px] text-ink-muted">
                <a href="tel:+918808828646" className="flex items-center space-x-1">
                  <Phone size={11} />
                  <span>+91 8808828646</span>
                </a>
                <span>Lucknow, India</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. STICKY MOBILE BOTTOM BAR (BlueStone E-Commerce Concept) */}
      {/* ========================================================= */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-ivory-pure/95 backdrop-blur-md border-t border-border shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-2">
        <div className="grid grid-cols-4 text-center">
          <Link
            href="/shop"
            className={`flex flex-col items-center justify-center py-1 text-[10px] ${
              pathname === "/shop"
                ? "text-champagne-accessible font-semibold"
                : "text-ink-muted"
            }`}
          >
            <Sparkles size={18} strokeWidth={1.5} />
            <span className="mt-1">Catalogue</span>
          </Link>

          <Link
            href="/wishlist"
            className={`flex flex-col items-center justify-center py-1 text-[10px] relative ${
              pathname === "/wishlist"
                ? "text-champagne-accessible font-semibold"
                : "text-ink-muted"
            }`}
          >
            <div className="relative">
              <Heart size={18} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-champagne text-ivory text-[8px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="mt-1">Wishlist</span>
          </Link>

          <button
            type="button"
            onClick={openCart}
            className="flex flex-col items-center justify-center py-1 text-[10px] text-ink-muted relative"
          >
            <div className="relative">
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-ink text-ivory text-[8px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="mt-1">Bag</span>
          </button>

          <a
            href="https://wa.me/918808828646?text=Hi%20Aryora,%20I%20have%20an%20enquiry%20regarding%20your%20jewellery"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-1 text-[10px] text-champagne-accessible font-semibold"
          >
            <Phone size={18} strokeWidth={1.5} />
            <span className="mt-1">Concierge</span>
          </a>
        </div>
      </div>
    </>
  );
}
