import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Sparkles, Award, Atom, Earth, Check } from "lucide-react";

export const metadata = {
  title: "The World of Lab-Grown Diamonds",
  description:
    "Discover how science and nature converge to grow identical, conflict-free, IGI-certified diamonds above ground with zero earth excavation.",
};

const TIMELINE = [
  {
    region: "The Scientific Genesis",
    year: "1954",
    text: "Scientists at General Electric in the United States successfully replicated the immense heat and pressure found 100 miles beneath the mantle, crystallizing one of the world's first lab diamonds.",
  },
  {
    region: "CVD & HPHT Evolution",
    year: "1980s – 2010s",
    text: "Global research perfected Chemical Vapor Deposition (CVD) and High-Pressure High-Temperature (HPHT), allowing scientists to grow pure Type IIa diamonds with flawless optical transparency.",
  },
  {
    region: "India: The Diamond Capital",
    year: "Today",
    text: "India stands as the premier global powerhouse for lab-grown diamond growing, laser-cutting, and master polishing, uniting generational master lapidaries with ethical green power.",
  },
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Selecting the Type IIa Seed",
    text: "A microscopic slice of pure carbon diamond seed is placed inside a sealed vacuum reactor chamber.",
  },
  {
    step: "02",
    title: "Carbon Gas Ionization",
    text: "Carbon-rich gases (methane and hydrogen) are introduced and ionized into a glowing plasma cloud heated to solar temperatures.",
  },
  {
    step: "03",
    title: "Atomic Crystallization",
    text: "Over several weeks, pure carbon atoms descend onto the seed layer-by-layer, forming an authentic rough octahedron diamond crystal.",
  },
  {
    step: "04",
    title: "Master Lapidary Cutting",
    text: "Artisan cutters study each rough crystal using 3D laser mapping to maximize fire, brilliance, and light return.",
  },
  {
    step: "05",
    title: "Independent IGI Certification",
    text: "Every finished diamond is independently graded by gemologists for the 4Cs and micro-laser inscribed on its girdle.",
  },
];

export default function WorldOfLgdPage() {
  return (
    <div className="max-w-content mx-auto px-6 md:px-8 py-8 md:py-16 space-y-16 md:space-y-24">
      <Breadcrumbs items={[{ label: "The World of LGD" }]} />

      {/* Hero */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <p className="eyebrow">Gemological Innovation</p>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-ink leading-tight">
          The World of Lab-Grown Diamonds
        </h1>
        <p className="text-base md:text-lg text-ink-muted leading-relaxed font-light">
          Identical in chemistry, refractive brilliance, and lifelong durability to mined stones. Grown above ground with zero earth displacement.
        </p>
      </div>

      {/* Comparison Fact Box */}
      <div className="border border-border-subtle bg-ivory-pure p-8 md:p-12 shadow-sm">
        <div className="max-w-2xl mx-auto text-center mb-8 space-y-2">
          <p className="eyebrow">Scientific Truth</p>
          <h2 className="font-serif text-3xl text-ink">Mined vs. Lab-Grown Diamonds</h2>
          <p className="text-xs text-ink-muted">
            The Federal Trade Commission (FTC) recognizes lab-grown diamonds as real diamonds in every scientific dimension.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-ivory-muted uppercase tracking-wider text-ink-muted border-b border-border-subtle">
              <tr>
                <th className="py-3 px-4 font-medium">Property</th>
                <th className="py-3 px-4 font-medium text-ink">Aryora Lab-Grown</th>
                <th className="py-3 px-4 font-medium">Traditional Mined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              <tr>
                <td className="py-3 px-4 font-medium text-ink">Chemical Composition</td>
                <td className="py-3 px-4 text-ink font-semibold">100% Carbon (C)</td>
                <td className="py-3 px-4 text-ink-muted">100% Carbon (C)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-ink">Mohs Hardness Scale</td>
                <td className="py-3 px-4 text-ink font-semibold">10 / 10 (Hardest Known)</td>
                <td className="py-3 px-4 text-ink-muted">10 / 10</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-ink">Refractive Index</td>
                <td className="py-3 px-4 text-ink font-semibold">2.42 (Identical Brilliance)</td>
                <td className="py-3 px-4 text-ink-muted">2.42</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-ink">Independent Certification</td>
                <td className="py-3 px-4 text-ink font-semibold">IGI Dossier & Laser Girdle</td>
                <td className="py-3 px-4 text-ink-muted">GIA / IGI</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-ink">Ecological Impact</td>
                <td className="py-3 px-4 text-[#2A6E4E] font-medium">Zero Earth Mining Displacement</td>
                <td className="py-3 px-4 text-ink-muted">Significant Land Excavation</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* The 5-Step Process */}
      <div className="space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <p className="eyebrow">From Seed to Setting</p>
          <h2 className="font-serif text-3xl md:text-4xl text-ink">The Diamond Growing Process</h2>
          <p className="text-xs sm:text-sm text-ink-muted">
            How a tiny diamond seed blossoms into an eternal heirloom in our controlled laboratories.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {PROCESS_STEPS.map((step) => (
            <div
              key={step.step}
              className="border border-border-subtle bg-ivory-pure p-6 space-y-3 flex flex-col justify-between"
            >
              <div>
                <span className="font-serif text-2xl text-champagne-accessible">
                  {step.step}
                </span>
                <h3 className="font-serif text-lg text-ink mt-2 leading-snug">
                  {step.title}
                </h3>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Section without dark green */}
      <div className="border-t border-border-subtle pt-16 space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <p className="eyebrow">Historical Milestones</p>
          <h2 className="font-serif text-3xl text-ink">The History of Light</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TIMELINE.map((t) => (
            <div
              key={t.year}
              className="border border-border-subtle bg-ivory-pure p-6 space-y-2"
            >
              <span className="eyebrow">{t.year}</span>
              <h3 className="font-serif text-xl text-ink">{t.region}</h3>
              <p className="text-xs text-ink-muted leading-relaxed pt-1">
                {t.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center max-w-md mx-auto space-y-4 pt-6">
        <p className="eyebrow">Discover The Collection</p>
        <h3 className="font-serif text-3xl text-ink">Witness the Brilliance</h3>
        <div className="flex justify-center gap-4 pt-2">
          <Link href="/shop" className="btn-primary text-xs">
            Shop Diamond Jewellery
          </Link>
          <Link href="/customize" className="btn-outline text-xs">
            Design Your Own
          </Link>
        </div>
      </div>
    </div>
  );
}
