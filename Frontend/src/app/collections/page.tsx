import Link from "next/link";

const COLLECTIONS = [
  { name: "Solitaire Collection", slug: "solitaire", tag: "Timeless Brilliance" },
  { name: "Everyday Luxury", slug: "everyday", tag: "Conscious Radiance" },
  { name: "Heritage Bridal", slug: "bridal", tag: "Heirloom Pieces" },
];

export default function CollectionsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <p className="eyebrow mb-3">Curated</p>
      <h1 className="font-display text-4xl mb-12">Collections</h1>
      <div className="grid md:grid-cols-3 gap-8">
        {COLLECTIONS.map((c) => (
          <Link key={c.slug} href={`/shop?collection=${c.slug}`} className="border border-black/10 p-8 hover:border-emerald transition-colors">
            <h2 className="font-display text-xl mb-2">{c.name}</h2>
            <p className="text-xs uppercase tracking-widest2 text-ink/50">{c.tag}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
