"use client";

import Image from "next/image";

// Indian ring sizes with diameter — matches industry-standard charts.
const SIZES = [
  { size: 4, mm: 14.01 },
  { size: 5, mm: 14.33 },
  { size: 6, mm: 14.65 },
  { size: 7, mm: 14.97 },
  { size: 8, mm: 15.29 },
  { size: 9, mm: 15.61 },
  { size: 10, mm: 15.92 },
  { size: 11, mm: 16.24 },
  { size: 12, mm: 16.56 },
  { size: 13, mm: 16.88 },
  { size: 14, mm: 17.2 },
  { size: 15, mm: 17.52 },
  { size: 16, mm: 17.83 },
  { size: 17, mm: 18.15 },
  { size: 18, mm: 18.47 },
  { size: 19, mm: 18.79 },
  { size: 20, mm: 19.11 },
  { size: 21, mm: 19.43 },
  { size: 22, mm: 19.75 },
  { size: 23, mm: 20.0 },
  { size: 24, mm: 20.36 },
  { size: 25, mm: 20.6 },
  { size: 26, mm: 21.02 },
  { size: 27, mm: 21.34 },
  { size: 28, mm: 21.6 },
];

// A handful of reference circles for the visual scale strip (not to exact print scale on screen).
const SCALE_SAMPLES = [8, 12, 16, 20, 24];

const TIPS = [
  {
    img: "/images/size-guide/tip-time.jpg",
    title: "Time of Day",
    text: "Finger size is typically largest in the evening. For the most accurate measurement, size your finger then.",
  },
  {
    img: "/images/size-guide/tip-temperature.jpg",
    title: "Temperature Effects",
    text: "Fingers contract in cold and expand in heat. Avoid measuring when your hands are unusually cold or warm.",
  },
  {
    img: "/images/size-guide/tip-factors.jpg",
    title: "Other Factors",
    text: "Exercise, pregnancy, water retention, and ageing can cause fingers to swell. Weight loss and cold weather may reduce size.",
  },
  {
    img: "/images/size-guide/tip-bands.jpg",
    title: "Thicker Bands",
    text: "For bands wider than 6mm, we recommend choosing half to one size larger for a comfortable, everyday fit.",
  },
];

export default function RingSizeGuidePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[360px] w-full overflow-hidden">
        <Image src="/images/size-guide/hero-ring-sizing.jpg" alt="Finding your ring size" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-ivory px-6">
          <p className="eyebrow text-ivory/80 mb-3">Client Care</p>
          <h1 className="font-display text-4xl md:text-5xl">The Ring Size Guide</h1>
          <p className="mt-4 max-w-xl text-ivory/80 text-sm leading-relaxed">
            Choosing the correct size ensures comfort, minimises the risk of loss, and lets every
            piece sit exactly as it was designed to.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-20">
        {/* Visual scale strip */}
        <section className="mb-20">
          <p className="eyebrow mb-2 text-center">Relative Scale</p>
          <h2 className="font-display text-2xl text-center mb-10">A Visual Sense of Size</h2>
          <div className="flex items-end justify-center gap-8 flex-wrap">
            {SCALE_SAMPLES.map((sizeNum) => {
              const entry = SIZES.find((s) => s.size === sizeNum)!;
              const px = entry.mm * 4; // purely relative, not print-accurate on screen
              return (
                <div key={sizeNum} className="flex flex-col items-center gap-3">
                  <svg width={px + 20} height={px + 20} viewBox={`0 0 ${px + 20} ${px + 20}`}>
                    <circle
                      cx={(px + 20) / 2}
                      cy={(px + 20) / 2}
                      r={px / 2}
                      fill="none"
                      stroke="#0B3D2E"
                      strokeWidth={2}
                    />
                  </svg>
                  <p className="text-sm font-display">Size {sizeNum}</p>
                  <p className="text-xs text-ink/50">{entry.mm}mm</p>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-ink/40 text-center mt-8 max-w-lg mx-auto">
            These circles show relative scale between sizes only — screen sizes vary, so this is
            not a print-accurate measuring tool. For precision, visit an Aryora boutique or compare
            against a ring you already own using the chart below.
          </p>
        </section>

        {/* How to measure */}
        <section className="mb-20 grid md:grid-cols-2 gap-12">
          <div>
            <p className="eyebrow mb-2">Method One</p>
            <h2 className="font-display text-xl mb-4">Using a Ring You Already Own</h2>
            <ol className="space-y-3 text-sm text-ink/70 leading-relaxed">
              <li><span className="font-display text-champagne mr-2">01</span>Take a ring that already fits the intended finger.</li>
              <li><span className="font-display text-champagne mr-2">02</span>Measure its inner diameter in millimetres, edge to edge.</li>
              <li><span className="font-display text-champagne mr-2">03</span>Match that measurement to the closest size in the chart below.</li>
              <li><span className="font-display text-champagne mr-2">04</span>If you're between two sizes, we recommend sizing up for comfort.</li>
            </ol>
          </div>
          <div>
            <p className="eyebrow mb-2">Method Two</p>
            <h2 className="font-display text-xl mb-4">Visit an Aryora Boutique</h2>
            <p className="text-sm text-ink/70 leading-relaxed mb-4">
              For the most accurate fit, our concierge team can size your finger in person at our
              Lucknow boutique, or guide you through the process over a call.
            </p>
            <a href="/contact" className="btn-outline inline-block text-xs">Book a Consultation</a>
          </div>
        </section>

        {/* Size chart table */}
        <section className="mb-20">
          <p className="eyebrow mb-2 text-center">Reference Chart</p>
          <h2 className="font-display text-2xl text-center mb-10">Indian Ring Size Chart</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-black/10 text-left text-ink/50 uppercase text-xs tracking-widest2">
                  <th className="py-3 pr-4">Ring Size</th>
                  <th className="py-3 pr-4">Diameter (mm)</th>
                  <th className="py-3">Diameter (inches)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {SIZES.map((s) => (
                  <tr key={s.size}>
                    <td className="py-2.5 pr-4 font-display">{s.size}</td>
                    <td className="py-2.5 pr-4 text-ink/70">{s.mm.toFixed(2)} mm</td>
                    <td className="py-2.5 text-ink/70">{(s.mm / 25.4).toFixed(2)}&quot;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Tips */}
        <section>
          <p className="eyebrow mb-2 text-center">Good to Know</p>
          <h2 className="font-display text-2xl text-center mb-10">Additional Sizing Tips</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TIPS.map((tip) => (
              <div key={tip.title}>
                <div className="relative aspect-square mb-3 bg-black/5">
                  <Image src={tip.img} alt={tip.title} fill className="object-cover" />
                </div>
                <h3 className="font-display text-sm mb-1">{tip.title}</h3>
                <p className="text-xs text-ink/60 leading-relaxed">{tip.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
