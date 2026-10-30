import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Earth, Sparkles, ShieldCheck, RefreshCw } from "lucide-react";

export const metadata = {
  title: "Sustainability & Ethics",
  description:
    "Learn about Aryora's commitment to zero-mining diamonds, recycled gold, conflict-free sourcing, and heirloom sustainability.",
};

const PILLARS = [
  {
    icon: Earth,
    title: "Zero Earth Mining",
    desc: "Traditional diamond mining displaces over 250 tons of earth per single carat. By creating diamonds in high-efficiency reactors, Aryora eliminates habitat disruption and groundwater contamination entirely.",
  },
  {
    icon: RefreshCw,
    title: "Recycled Precious Metals",
    desc: "Our 18K yellow, white, and rose gold alloys are cast using certified recycled precious metals, reducing the demand for newly mined ore while preserving strict 750 purity hallmarks.",
  },
  {
    icon: ShieldCheck,
    title: "100% Conflict-Free Supply Chain",
    desc: "Every diamond grown for Aryora can be pinpointed to its growing chamber and master lapidary, ensuring human rights dignity and completely transparent provenance.",
  },
  {
    icon: Sparkles,
    title: "Reusable Heirloom Packaging",
    desc: "Our presentation boxes are crafted from FSC-certified sustainable timber and plush organic cotton velvet, meant to safe-keep your jewelry across a lifetime rather than end up in a landfill.",
  },
];

export default function SustainabilityPage() {
  return (
    <div className="max-w-content mx-auto px-6 md:px-8 py-8 md:py-16 space-y-16 md:space-y-24">
      <Breadcrumbs items={[{ label: "Sustainability" }]} />

      <div className="max-w-3xl mx-auto text-center space-y-4">
        <p className="eyebrow">Conscious Luxury</p>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-ink leading-tight">
          Conscious by Design
        </h1>
        <p className="text-base md:text-lg text-ink-muted leading-relaxed font-light">
          True luxury should leave an enduring legacy of beauty, not environmental debt. Here is how Aryora crafts heirlooms with reverence for modern India and the earth.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-8">
        {PILLARS.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.title}
              className="border border-border-subtle bg-ivory-pure p-8 space-y-3"
            >
              <div className="w-10 h-10 rounded-full border border-champagne flex items-center justify-center text-champagne-accessible bg-ivory">
                <Icon size={18} strokeWidth={1.5} />
              </div>
              <h2 className="font-serif text-2xl text-ink">{p.title}</h2>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                {p.desc}
              </p>
            </div>
          );
        })}
      </div>

      <div className="border border-border-subtle bg-ivory-muted/40 p-8 md:p-12 text-center max-w-2xl mx-auto space-y-4">
        <p className="eyebrow">A Promise to Future Generations</p>
        <h3 className="font-serif text-3xl text-ink">Wear Your Values with Pride</h3>
        <p className="text-xs text-ink-muted leading-relaxed">
          When you wear an Aryora piece, you hold a symbol of human ingenuity that honors traditions without repeating the environmental costs of the past.
        </p>
        <div className="pt-2">
          <Link href="/shop" className="btn-primary text-xs">
            Explore Sustainable Heirlooms
          </Link>
        </div>
      </div>
    </div>
  );
}
