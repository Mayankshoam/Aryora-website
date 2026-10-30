import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = {
  title: "Curated Collections",
  description:
    "Explore Aryora's thematic fine jewellery collections: Heritage Bridal, Solitaire Brilliance, and Everyday Luxury.",
};

const COLLECTIONS = [
  {
    name: "Solitaire Collection",
    slug: "solitaire",
    tag: "Timeless Brilliance",
    desc: "Single-stone lab-grown diamonds cut to supreme mathematical proportions. From classic round brilliants to architectural emerald cuts.",
    image: "/images/collection-solitaire.jpg",
  },
  {
    name: "Heritage Bridal",
    slug: "bridal",
    tag: "Awadhi Royal Heirloom",
    desc: "Regal chokers, layered diamond necklaces, and bespoke bridal suites paying homage to the Nawabi aesthetic of Lucknow.",
    image: "/images/collection-bridal.jpg",
  },
  {
    name: "Everyday Luxury",
    slug: "everyday",
    tag: "Conscious Daily Radiance",
    desc: "Whisper-light pendants, fluid tennis necklaces, and sleek pavé bands designed to elevate everyday rituals.",
    image: "/images/collection-everyday.jpg",
  },
];

export default function CollectionsPage() {
  return (
    <div className="max-w-content mx-auto px-6 md:px-8 py-8 md:py-16">
      <Breadcrumbs items={[{ label: "Collections" }]} />

      <div className="text-center max-w-xl mx-auto my-12 space-y-3">
        <p className="eyebrow">Editions</p>
        <h1 className="font-serif text-3xl md:text-5xl text-ink">
          Curated Heirlooms
        </h1>
        <p className="text-sm text-ink-muted leading-relaxed">
          Each Aryora collection expresses a distinct dimension of light, uniting ethical lab-grown stones with generational artisan craftsmanship.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {COLLECTIONS.map((c) => (
          <Link
            key={c.slug}
            href={`/shop?collection=${c.slug}`}
            className="group block border border-border-subtle bg-ivory-pure hover:border-border-strong transition-all duration-300"
          >
            <div className="relative aspect-[3/4] bg-ivory-muted overflow-hidden">
              <Image
                src={c.image}
                alt={c.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover img-zoom"
              />
            </div>
            <div className="p-6 space-y-2">
              <p className="eyebrow text-[10px]">{c.tag}</p>
              <h2 className="font-serif text-2xl text-ink group-hover:text-champagne-accessible transition-colors">
                {c.name}
              </h2>
              <p className="text-xs text-ink-muted leading-relaxed">
                {c.desc}
              </p>
              <span className="inline-block pt-3 text-xs uppercase tracking-widest text-ink font-medium group-hover:text-champagne-accessible">
                View Collection →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
