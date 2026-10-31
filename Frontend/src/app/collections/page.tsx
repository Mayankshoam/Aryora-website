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
    name: "Solitaire Suite",
    slug: "solitaire",
    tag: "Timeless Brilliance",
    desc: "Single-stone lab-grown diamonds cut to supreme mathematical proportions. From classic round brilliants to architectural emerald cuts.",
    image: "/site/cat-solitaires.svg",
  },
  {
    name: "Heritage Bridal",
    slug: "bridal",
    tag: "Awadhi Royal Heirloom",
    desc: "Regal chokers, layered diamond necklaces, and bespoke bridal suites paying homage to the Nawabi aesthetic of Lucknow.",
    image: "/site/cat-bridal.svg",
  },
  {
    name: "Modern Everyday Radiance",
    slug: "everyday",
    tag: "Conscious Daily Luxury",
    desc: "Whisper-light pendants, fluid tennis bracelets, and sleek pavé bands designed to elevate everyday rituals.",
    image: "/site/cat-bracelets.svg",
  },
];

export default function CollectionsPage() {
  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-6 md:py-12 space-y-8">
      <Breadcrumbs items={[{ label: "Collections" }]} />

      <div className="text-center max-w-xl mx-auto my-8 space-y-2">
        <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-champagne">
          Curated Editions
        </p>
        <h1 className="font-serif text-3xl md:text-5xl text-ink font-light">
          Heirloom Collections
        </h1>
        <p className="text-xs md:text-sm text-ink-muted leading-relaxed font-light">
          Each Aryora collection expresses a distinct dimension of light, uniting ethical lab-grown diamonds with generational artisan craftsmanship.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {COLLECTIONS.map((c) => (
          <Link
            key={c.slug}
            href={`/collections/${c.slug}`}
            className="group block border border-border-subtle bg-ivory-pure hover:border-champagne/80 hover:shadow-md transition-all duration-300"
          >
            <div className="relative aspect-[3/4] bg-ivory-warm overflow-hidden p-6 flex items-center justify-center">
              <Image
                src={c.image}
                alt={c.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain group-hover:scale-105 transition-transform duration-500 p-8"
              />
            </div>
            <div className="p-6 space-y-2">
              <span className="text-[9px] uppercase tracking-widest font-semibold text-champagne-accessible">
                {c.tag}
              </span>
              <h2 className="font-serif text-xl text-ink group-hover:text-champagne-accessible transition-colors">
                {c.name}
              </h2>
              <p className="text-xs text-ink-muted leading-relaxed font-light">{c.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
