import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import { getAllProducts } from "@/lib/data";

interface Props {
  params: { slug: string };
}

const COLLECTION_META: Record<
  string,
  { title: string; subtitle: string; desc: string; heroImage: string; category: string }
> = {
  solitaire: {
    title: "Solitaire Collection",
    subtitle: "Timeless Brilliance",
    desc: "Single-stone lab-grown diamonds cut to supreme mathematical proportions. From classic round brilliants to architectural emerald cuts.",
    heroImage: "/site/cat-solitaires.svg",
    category: "Solitaires",
  },
  everyday: {
    title: "Everyday Luxury",
    subtitle: "Conscious Daily Radiance",
    desc: "Whisper-light pendants, fluid tennis bracelets, and sleek pavé bands designed to elevate everyday rituals.",
    heroImage: "/site/cat-bracelets.svg",
    category: "Bracelets",
  },
  bridal: {
    title: "Heritage Bridal",
    subtitle: "Awadhi Royal Heirloom",
    desc: "Regal chokers, layered diamond necklaces, and bespoke bridal suites paying homage to the Nawabi aesthetic of Lucknow.",
    heroImage: "/site/cat-bridal.svg",
    category: "Bridal",
  },
};

export async function generateMetadata({ params }: Props) {
  const meta = COLLECTION_META[params.slug] || {
    title: "Curated Collection",
    desc: "Discover Aryora curated fine jewellery.",
  };
  return {
    title: `${meta.title} | Aryora`,
    description: meta.desc,
  };
}

export default function CollectionDetailPage({ params }: Props) {
  const slug = params.slug;
  const meta = COLLECTION_META[slug] || {
    title: slug.charAt(0).toUpperCase() + slug.slice(1) + " Collection",
    subtitle: "Curated Edition",
    desc: "Handcrafted lab-grown diamond heirlooms by Aryora.",
    heroImage: "/site/hero-poster.svg",
    category: "Rings",
  };

  const allProducts = getAllProducts();
  const collectionProducts = allProducts.filter(
    (p) =>
      p.category.toLowerCase() === meta.category.toLowerCase() ||
      p.tags?.some((t) => t.toLowerCase() === slug.toLowerCase()) ||
      p.occasion.toLowerCase() === slug.toLowerCase()
  );

  const displayProducts = collectionProducts.length > 0 ? collectionProducts : allProducts.slice(0, 4);

  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-6 md:py-12 space-y-8">
      <Breadcrumbs
        items={[
          { label: "Collections", href: "/collections" },
          { label: meta.title },
        ]}
      />

      {/* Banner */}
      <div className="relative min-h-[220px] md:min-h-[300px] bg-[#FAF8F4] border border-border-subtle overflow-hidden p-6 md:p-10 flex items-center justify-between">
        <div className="max-w-xl space-y-3 relative z-10">
          <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-champagne">
            {meta.subtitle}
          </p>
          <h1 className="font-serif text-3xl md:text-5xl text-ink font-light">
            {meta.title}
          </h1>
          <p className="text-xs md:text-sm text-ink-muted leading-relaxed font-light">
            {meta.desc}
          </p>
        </div>

        <div className="relative w-40 h-40 md:w-56 md:h-56 flex-shrink-0 hidden sm:block p-4">
          <Image
            src={meta.heroImage}
            alt={meta.title}
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-4 pt-4">
        <div className="flex justify-between items-center text-xs text-ink-muted border-b border-border-subtle pb-3">
          <span>
            Showing <strong>{displayProducts.length}</strong> creations in this edition
          </span>
          <Link
            href="/shop"
            className="text-champagne-accessible font-semibold hover:underline"
          >
            Explore Full Catalogue &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {displayProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
