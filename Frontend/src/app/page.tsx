import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[560px] w-full overflow-hidden">
        <Image
          src="/images/hero-emerald.jpg"
          alt="Woman wearing an emerald and diamond necklace"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-12 left-6 md:left-16 text-ivory max-w-md">
          <p className="eyebrow text-ivory/80 mb-2">Our Ethos</p>
          <h1 className="font-display text-3xl md:text-4xl leading-tight">
            &ldquo;Light isn&rsquo;t just jewellery. It&rsquo;s a statement of values.&rdquo;
          </h1>
        </div>
      </section>

      {/* Ethos */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="eyebrow mb-3">Our Ethos</p>
          <h2 className="font-display text-3xl md:text-4xl mb-6 leading-snug">
            Aryora — Ethical brilliance crafted for modern India.
          </h2>
          <p className="text-ink/70 leading-relaxed">
            We believe that true luxury should be as conscious as it is beautiful. Our lab-grown
            diamonds represent the pinnacle of modern technology and traditional heritage,
            offering carbon-neutral masterpieces that honor the earth while celebrating your most
            precious milestones.
          </p>
        </div>
        <div className="relative h-80">
          <Image src="/images/craft-hands.jpg" alt="Artisan hand-setting a diamond" fill className="object-cover" />
        </div>
      </section>

      {/* Featured Collections */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="eyebrow mb-2">Curated</p>
            <h2 className="font-display text-3xl">Featured Collections</h2>
          </div>
          <Link href="/collections" className="text-sm underline underline-offset-4">View All</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Bridal Collection", tag: "Heritage Pieces", href: "/bridal", img: "/images/collection-bridal.jpg" },
            { name: "Solitaire Collection", tag: "Timeless Brilliance", href: "/collections/solitaire", img: "/images/collection-solitaire.jpg" },
            { name: "Everyday Luxury", tag: "Conscious Radiance", href: "/collections/everyday", img: "/images/collection-everyday.jpg" },
          ].map((c) => (
            <Link key={c.name} href={c.href} className="group">
              <div className="relative h-72 overflow-hidden mb-3">
                <Image src={c.img} alt={c.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h3 className="font-display text-lg">{c.name}</h3>
              <p className="text-xs uppercase tracking-widest2 text-ink/50">{c.tag}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust pillars */}
      <section className="max-w-7xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-10 text-center">
        {[
          { title: "Certified Diamonds", desc: "Every stone is IGI certified, ensuring the highest standards of cut, clarity, and color." },
          { title: "Sustainable Luxury", desc: "Created with zero mining, our lab-grown diamonds leave a legacy of beauty, not environmental impact." },
          { title: "Lifetime Support", desc: "Complimentary cleaning, resizing, and concierge support for every Aryora piece." },
        ].map((p) => (
          <div key={p.title}>
            <div className="w-10 h-10 mx-auto mb-4 rounded-full border border-champagne flex items-center justify-center text-champagne">✦</div>
            <h3 className="font-display text-lg mb-2">{p.title}</h3>
            <p className="text-sm text-ink/60 leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </section>

      {/* Shop by essence */}
      <section className="bg-emerald text-ivory">
        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="eyebrow mb-2 text-champagne">Shop by Essence</p>
            <h2 className="font-display text-2xl mb-8">
              Select your category to explore pieces curated for specific expressions of elegance.
            </h2>
            <ul className="divide-y divide-ivory/15">
              {["Rings", "Earrings", "Pendants", "Necklaces"].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/shop?category=${cat.toLowerCase()}`}
                    className="flex justify-between items-center py-4 text-lg hover:text-champagne transition-colors"
                  >
                    {cat} <span>→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative h-80"><Image src="/images/essence-earrings.jpg" alt="Model wearing earrings" fill className="object-cover" /></div>
            <div className="relative h-80 mt-8"><Image src="/images/essence-necklace.jpg" alt="Layered necklaces" fill className="object-cover" /></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto text-center px-6 py-24">
        <p className="eyebrow mb-3">Join Us</p>
        <h2 className="font-display text-3xl mb-6">Share your brilliance on Instagram #AryoraLegacy</h2>
        <a href="https://instagram.com/aryora.legacy" target="_blank" rel="noreferrer" className="btn-outline inline-block">
          Follow @aryora.legacy
        </a>
      </section>
    </>
  );
}
