import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PRODUCTS } from "@/lib/products";

interface Props {
  params: { slug: string };
}

const COLLECTION_META: Record<
  string,
  { title: string; subtitle: string; desc: string; heroImage: string }
> = {
  solitaire: {
    title: "Solitaire Collection",
    subtitle: "Timeless Brilliance",
    desc: "Single-stone lab-grown diamonds cut to supreme mathematical proportions. From classic round brilliants to architectural emerald cuts.",
    heroImage: "/images/collection-solitaire.jpg",
  },
  everyday: {
    title: "Everyday Luxury",
    subtitle: "Conscious Daily Radiance",
    desc: "Whisper-light pendants, fluid tennis necklaces, and sleek pavé bands designed to elevate everyday rituals.",
    heroImage: "/images/collection-everyday.jpg",
  },
  bridal: {
    title: "Heritage Bridal",
    subtitle: "Awadhi Royal Heirloom",
    desc: "Regal chokers, layered diamond necklaces, and bespoke bridal suites paying homage to the Nawabi aesthetic of Lucknow.",
    heroImage: "/images/collection-bridal.jpg",
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
    heroImage: "/images/hero-emerald.jpg",
  };

  const collectionProducts = PRODUCTS.filter(
    (p) => p.collection === slug || p.category === slug
  );

  const displayProducts = collectionProducts.length > 0 ? collectionProducts : PRODUCTS.slice(0, 4);

  return (
    <div className="max-w-content mx-auto px-6 md:px-8 py-8 md:py-16">
      <Breadcrumbs
        items={[
          { label: "Collections", href: "/collections" },
          { label: meta.title },
        ]}
      />

      <div className="relative aspect-[21/9] min-h-[260px] md:min-h-[380px] bg-ivory-muted border border-border-subtle overflow-hidden my-8 flex items-end">
        <Image
          src={meta.heroImage}
          alt={meta.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/20 to-transparent" />
        <div className="relative z-10 p-6 md:p-12 text-ivory max-w-xl space-y-2">
          <p className="eyebrow text-champagne-light">{meta.subtitle}</p>
          <h1 className="font-serif text-3xl md:text-5xl text-ivory">{meta.title}</h1>
          <p className="text-xs md:text-sm text-ivory/85 leading-relaxed font-light">
            {meta.desc}
          </p>
        </div>
      </div>

      <div className="pt-8">
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-8">
          <p className="eyebrow text-[11px]">{displayProducts.length} Heirlooms in this Edition</p>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-wider text-ink hover:text-champagne-accessible underline font-medium"
          >
            Browse All Heirlooms →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {displayProducts.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="group block border border-border-subtle bg-ivory-pure hover:border-border-medium transition-colors"
            >
              <div className="relative aspect-square bg-ivory-muted overflow-hidden">
                <Image
                  src={p.images[0]?.url || "/images/hero-emerald.jpg"}
                  alt={p.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover img-zoom"
                />
              </div>
              <div className="p-4">
                <p className="text-[11px] text-ink-subtle uppercase tracking-wider">
                  {p.specs.metal}
                </p>
                <h3 className="font-serif text-base text-ink group-hover:text-champagne-accessible transition-colors truncate mt-1">
                  {p.name}
                </h3>
                <p className="text-sm font-medium text-ink mt-2">
                  ₹{p.price.toLocaleString("en-IN")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
