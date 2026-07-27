import Link from "next/link";

const TIMELINE = [
  {
    region: "America",
    year: "1954",
    text: "Scientists at General Electric in the United States successfully replicated the heat and pressure found deep within the earth, growing one of the first lab-created diamonds and opening the door to a new way of thinking about brilliance.",
  },
  {
    region: "Asia",
    year: "1960s–2000s",
    text: "Research across Asia advanced high-pressure, high-temperature (HPHT) and later chemical vapour deposition (CVD) techniques, steadily improving the size, clarity, and consistency of lab-grown stones.",
  },
  {
    region: "India",
    year: "2010s–Today",
    text: "India has since become one of the world's largest hubs for cutting, polishing, and setting lab-grown diamonds — combining generations of craftsmanship with a more conscious way to create fine jewellery.",
  },
];

const PROCESS = [
  {
    title: "Selecting the Seed",
    text: "A tiny slice of diamond, known as a seed, is placed inside a controlled chamber. This seed sets the foundation every layer of the diamond will grow from.",
  },
  {
    title: "Introducing Carbon",
    text: "Carbon-rich gas is introduced into the chamber. Under carefully controlled heat and pressure, carbon atoms begin to bond to the seed.",
  },
  {
    title: "Growing, Layer by Layer",
    text: "Over several weeks, carbon atoms crystallise onto the seed one atomic layer at a time, gradually forming a rough diamond with the same structure as one formed underground.",
  },
  {
    title: "Cutting & Polishing",
    text: "Master artisans study the rough stone's natural properties and cut it to maximise brilliance, fire, and scintillation — the same skill used on mined diamonds for centuries.",
  },
  {
    title: "Certification",
    text: "Every finished diamond is graded and certified by an independent gemological laboratory (IGI) for its cut, colour, clarity, and carat weight before it ever reaches an Aryora setting.",
  },
];

const VALUES = [
  {
    title: "Ethical Sourcing",
    text: "Grown in controlled environments rather than mined from the earth — the same brilliance, without the same footprint.",
  },
  {
    title: "Fair Production",
    text: "Advanced, transparent growing methods mean every diamond's origin can be traced with confidence.",
  },
  {
    title: "Sustainable Luxury",
    text: "Lab-grown diamonds significantly reduce the environmental disruption associated with traditional mining.",
  },
  {
    title: "Value With Integrity",
    text: "The same hardness, fire, and lifelong durability as a mined diamond — at a more accessible price.",
  },
];

export default function WorldOfLgdPage() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <p className="eyebrow mb-3">Education</p>
        <h1 className="font-display text-4xl md:text-5xl mb-6">The World of Lab-Grown Diamonds</h1>
        <p className="text-ink/70 leading-relaxed max-w-2xl mx-auto">
          For centuries, diamonds were rare treasures formed deep within the earth over billions of
          years. Today, science lets us grow that same brilliance above ground — with the same fire,
          hardness, and beauty, and a gentler footprint.
        </p>
      </section>

      {/* Timeline */}
      <section className="bg-emerald text-ivory">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <p className="eyebrow mb-2 text-champagne">A Brief History</p>
          <h2 className="font-display text-3xl mb-12">How Lab-Grown Diamonds Came to Be</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {TIMELINE.map((t) => (
              <div key={t.region}>
                <p className="text-xs uppercase tracking-widest2 text-champagne mb-2">{t.year}</p>
                <h3 className="font-display text-xl mb-3">{t.region}</h3>
                <p className="text-sm text-ivory/80 leading-relaxed">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Growing process */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <p className="eyebrow mb-2">From Seed to Setting</p>
        <h2 className="font-display text-3xl mb-14">The Diamond Growing Process</h2>
        <div className="space-y-10">
          {PROCESS.map((step, i) => (
            <div key={step.title} className="flex gap-6 md:gap-10">
              <span className="font-display text-3xl text-champagne flex-shrink-0 w-12">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-ink/70 leading-relaxed max-w-xl">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Values grid */}
      <section className="bg-ivory border-t border-black/10">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <p className="eyebrow mb-2">Why It Matters</p>
          <h2 className="font-display text-3xl mb-14">A Confluence of Innovation and Ethics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {VALUES.map((v) => (
              <div key={v.title}>
                <div className="w-10 h-10 mb-4 rounded-full border border-champagne flex items-center justify-center text-champagne">✦</div>
                <h3 className="font-display text-base mb-2">{v.title}</h3>
                <p className="text-sm text-ink/60 leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto text-center px-6 py-24">
        <p className="eyebrow mb-3">Ready to Explore?</p>
        <h2 className="font-display text-3xl mb-8">See lab-grown brilliance for yourself</h2>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="/shop" className="btn-primary">Shop the Collection</Link>
          <Link href="/customize" className="btn-outline">Build Your Own</Link>
        </div>
      </section>
    </div>
  );
}
