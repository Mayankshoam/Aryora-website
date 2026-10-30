"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Award, Sparkles, ShieldCheck, Heart } from "lucide-react";
import InstagramIcon from "@/components/InstagramIcon";
import { PRODUCTS, getBestsellers } from "@/lib/products";
import { useAryoraStore } from "@/lib/store";

const CATEGORIES = [
  {
    name: "Rings",
    href: "/shop?category=rings",
    image: "/images/products/emerald-solitaire-1.jpg",
    count: "Solitaires & Bands",
  },
  {
    name: "Earrings",
    href: "/shop?category=earrings",
    image: "/images/essence-earrings.jpg",
    count: "Drops & Studs",
  },
  {
    name: "Pendants",
    href: "/shop?category=pendants",
    image: "/images/essence-necklace.jpg",
    count: "Solitaire Bezel",
  },
  {
    name: "Necklaces",
    href: "/shop?category=necklaces",
    image: "/images/collection-everyday.jpg",
    count: "Tennis & Chokers",
  },
];

const COLLECTIONS = [
  {
    title: "Bridal Collection",
    subtitle: "Heritage Heirloom Sets",
    href: "/bridal",
    image: "/images/collection-bridal.jpg",
  },
  {
    title: "Solitaire Collection",
    subtitle: "Timeless Brilliance",
    href: "/collections/solitaire",
    image: "/images/collection-solitaire.jpg",
  },
  {
    title: "Everyday Luxury",
    subtitle: "Conscious Daily Radiance",
    href: "/collections/everyday",
    image: "/images/collection-everyday.jpg",
  },
];

const WHY_ARYORA = [
  {
    icon: Award,
    title: "IGI Certified Stones",
    desc: "Every diamond is laser-inscribed and accompanied by an independent IGI grading dossier verifying cut, color, clarity, and carat weight.",
  },
  {
    icon: Sparkles,
    title: "Zero Mining Footprint",
    desc: "Created above ground with carbon-neutral technology, offering identical physical brilliance without ecological disruption.",
  },
  {
    icon: ShieldCheck,
    title: "Lifetime Atelier Care",
    desc: "Complimentary 30-day resizing, annual inspection, insured doorstep delivery, and transparent buyback terms.",
  },
];

const INSTAGRAM_TILES = [
  { image: "/images/hero-emerald.jpg", alt: "Emerald necklace editorial" },
  { image: "/images/products/tulip.jpg", alt: "Tulip solitaire diamond ring" },
  { image: "/images/essence-earrings.jpg", alt: "Model styling pear drop earrings" },
  { image: "/images/craft-hands.jpg", alt: "Artisan hand setting stones" },
];

export default function HomePage() {
  const bestsellers = getBestsellers();
  const { toggleWishlist, isInWishlist } = useAryoraStore();

  return (
    <div className="space-y-24 md:space-y-32">
      {/* 1. HERO SECTION */}
      <section className="relative h-[88vh] min-h-[580px] w-full flex items-end overflow-hidden -mt-20">
        <Image
          src="/images/hero-emerald.jpg"
          alt="Aryora Heritage Lab-Grown Emerald and Diamond High Jewellery"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/20 to-transparent" />

        {/* Hero Content Box */}
        <div className="relative z-10 max-w-content mx-auto w-full px-6 md:px-8 pb-16 md:pb-24">
          <div className="max-w-xl text-ivory space-y-4">
            <p className="eyebrow text-champagne-light">Atelier Aryora • Lucknow</p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal leading-[1.08] tracking-tight text-ivory">
              Light. Legacy. You.
            </h1>
            <p className="text-ivory/85 text-base md:text-lg font-light leading-relaxed max-w-md">
              IGI-certified lab-grown diamonds, 18K gold, and 92.5 silver heirlooms crafted for modern India.
            </p>
            <div className="flex flex-wrap gap-4 pt-3">
              <Link
                href="/shop"
                className="btn-primary bg-ivory text-ink hover:bg-ivory-dark border-ivory text-xs"
              >
                Shop Collection
              </Link>
              <Link
                href="/customize"
                className="btn-outline border-ivory text-ivory hover:bg-ivory hover:text-ink text-xs"
              >
                Design Your Own
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SHOP BY CATEGORY (4 clean image tiles) */}
      <section className="max-w-content mx-auto px-6 md:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-border-subtle gap-4">
          <div>
            <p className="eyebrow">Explore Heirlooms</p>
            <h2 className="font-serif text-3xl md:text-4xl text-ink">Shop by Category</h2>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-widest text-ink hover:text-champagne-accessible transition-colors flex items-center gap-1 font-medium"
          >
            All Categories <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group block relative overflow-hidden bg-ivory-pure border border-border-subtle"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-ivory-muted">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover img-zoom"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-serif text-lg text-ink group-hover:text-champagne-accessible transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] uppercase tracking-wider text-ink-subtle mt-0.5">
                  {cat.count}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED COLLECTIONS (Bridal, Solitaire, Everyday Luxury) */}
      <section className="max-w-content mx-auto px-6 md:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-border-subtle gap-4">
          <div>
            <p className="eyebrow">Curated Editions</p>
            <h2 className="font-serif text-3xl md:text-4xl text-ink">Featured Collections</h2>
          </div>
          <Link
            href="/collections"
            className="text-xs uppercase tracking-widest text-ink hover:text-champagne-accessible transition-colors flex items-center gap-1 font-medium"
          >
            All Collections <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {COLLECTIONS.map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className="group block border border-border-subtle bg-ivory-pure hover:border-border-strong transition-all duration-300"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-ivory-muted">
                <Image
                  src={c.image}
                  alt={c.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover img-zoom"
                />
              </div>
              <div className="p-6">
                <p className="eyebrow text-[10px]">{c.subtitle}</p>
                <h3 className="font-serif text-2xl text-ink mt-1 group-hover:text-champagne-accessible transition-colors">
                  {c.title}
                </h3>
                <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-ink-muted mt-3 group-hover:text-ink font-medium">
                  Explore Edition <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. BESTSELLERS GRID (Image, Hover Second Image, Name, ₹ Price, Wishlist Heart) */}
      <section className="max-w-content mx-auto px-6 md:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-border-subtle gap-4">
          <div>
            <p className="eyebrow">Acclaimed Pieces</p>
            <h2 className="font-serif text-3xl md:text-4xl text-ink">Bestsellers</h2>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-widest text-ink hover:text-champagne-accessible transition-colors flex items-center gap-1 font-medium"
          >
            View All Pieces <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {bestsellers.map((product) => {
            const inWish = isInWishlist(product.slug);
            return (
              <div
                key={product.id}
                className="group relative flex flex-col justify-between border border-border-subtle bg-ivory-pure hover:border-border-medium transition-colors"
              >
                {/* Product Image Tile with Secondary Hover Image */}
                <div className="relative aspect-square overflow-hidden bg-ivory-muted">
                  <Link href={`/product/${product.slug}`} className="block w-full h-full">
                    {/* Primary Image */}
                    <Image
                      src={product.images[0]?.url || "/images/hero-emerald.jpg"}
                      alt={product.images[0]?.altText || product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover img-zoom transition-opacity duration-500 group-hover:opacity-0"
                    />
                    {/* Secondary Image on Hover */}
                    {product.images[1] && (
                      <Image
                        src={product.images[1].url}
                        alt={product.images[1].altText || product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover img-zoom absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      />
                    )}
                  </Link>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product.slug)}
                    aria-label={inWish ? "Remove from wishlist" : "Add to wishlist"}
                    className="absolute top-3 right-3 p-2 bg-ivory/80 backdrop-blur-sm rounded-full text-ink hover:text-champagne-accessible transition-all"
                  >
                    <Heart
                      size={16}
                      strokeWidth={1.5}
                      className={inWish ? "fill-champagne text-champagne" : ""}
                    />
                  </button>

                  {product.specs.diamondCarat && (
                    <span className="absolute bottom-3 left-3 bg-ivory/90 backdrop-blur-sm px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink font-medium">
                      {product.specs.diamondCarat}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <p className="text-[11px] text-ink-subtle uppercase tracking-wider">
                      {product.specs.metal}
                    </p>
                    <Link
                      href={`/product/${product.slug}`}
                      className="block font-serif text-base text-ink group-hover:text-champagne-accessible transition-colors leading-snug mt-1"
                    >
                      {product.name}
                    </Link>
                  </div>

                  <div className="pt-3 flex items-baseline justify-between">
                    <span className="text-sm font-medium text-ink">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-ink-subtle line-through">
                        ₹{product.originalPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. WHY ARYORA (Thin line icons, no heavy dark green) */}
      <section className="border-y border-border-subtle bg-ivory-muted/40 py-20">
        <div className="max-w-content mx-auto px-6 md:px-8">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <p className="eyebrow">The Aryora Standard</p>
            <h2 className="font-serif text-3xl md:text-4xl text-ink">
              Ethical Brilliance, Guaranteed
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed">
              Every detail is engineered to honor the heritage of Awadh while championing the conscious future of fine jewelry.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 md:gap-12 text-center">
            {WHY_ARYORA.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex flex-col items-center space-y-3.5">
                  <div className="w-12 h-12 rounded-full border border-champagne flex items-center justify-center text-champagne-accessible bg-ivory">
                    <Icon size={22} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-xl text-ink">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-xs">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. SHORT BRAND STORY WITH ONE IMAGE */}
      <section className="max-w-content mx-auto px-6 md:px-8">
        <div className="grid md:grid-cols-12 gap-12 md:gap-16 items-center">
          <div className="md:col-span-6 relative aspect-[4/3] md:aspect-[5/4] bg-ivory-muted overflow-hidden border border-border-subtle">
            <Image
              src="/images/craft-hands.jpg"
              alt="Aryora master goldsmith hand-setting lab diamonds"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="md:col-span-6 space-y-5">
            <p className="eyebrow">Atelier Heritage</p>
            <h2 className="font-serif text-3xl md:text-4xl text-ink leading-tight">
              Crafted in Lucknow. Cherished for Generations.
            </h2>
            <p className="text-ink-muted text-sm md:text-base leading-relaxed">
              Rooted in the historic city of Lucknow, Aryora unites age-old Indian goldsmithing with cutting-edge lab-grown diamond science.
            </p>
            <p className="text-ink-muted text-sm md:text-base leading-relaxed">
              We eliminate mining damage without compromising single-stone clarity, color, or heirloom durability. Light is no longer an environmental trade-off—it is an unapologetic statement of your values.
            </p>
            <div className="pt-2">
              <Link href="/about" className="btn-outline text-xs">
                Read Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. INSTAGRAM STRIP #AryoraLegacy */}
      <section className="max-w-content mx-auto px-6 md:px-8">
        <div className="text-center mb-10 space-y-2">
          <p className="eyebrow">The Editorial Gallery</p>
          <h2 className="font-serif text-3xl text-ink">#AryoraLegacy</h2>
          <p className="text-xs text-ink-muted">
            Share your moments wearing Aryora with our global circle on Instagram{" "}
            <a
              href="https://instagram.com/aryora.legacy"
              target="_blank"
              rel="noreferrer"
              className="text-ink underline hover:text-champagne-accessible"
            >
              @aryora.legacy
            </a>
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {INSTAGRAM_TILES.map((tile, i) => (
            <a
              key={i}
              href="https://instagram.com/aryora.legacy"
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-square bg-ivory-muted overflow-hidden border border-border-subtle block"
            >
              <Image
                src={tile.image}
                alt={tile.alt}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover img-zoom"
              />
              <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-ivory">
                <InstagramIcon size={24} />
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
