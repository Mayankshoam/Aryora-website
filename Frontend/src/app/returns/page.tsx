import Breadcrumbs from "@/components/Breadcrumbs";
import { RotateCcw, ShieldCheck, RefreshCw, Award } from "lucide-react";

export const metadata = {
  title: "Returns, Buyback & Warranty",
  description:
    "Learn about Aryora's 7-day return policy, 6-month warranty, and lifetime transparent buyback terms.",
};

const POLICIES = [
  {
    icon: RotateCcw,
    title: "7-Day Hassle-Free Returns",
    text: "Returns are gladly accepted within 7 days of delivery, provided the piece is unworn, intact, and in its original presentation packaging accompanied by the original IGI certificate.",
  },
  {
    icon: RefreshCw,
    title: "30-Day Free Resizing",
    text: "All rings include one complimentary resizing within 30 days of delivery for most band architectures. Reach out to our concierge team to schedule safe doorstep collection.",
  },
  {
    icon: ShieldCheck,
    title: "6-Month Manufacturing Warranty",
    text: "Every Aryora jewel carries a 6-month atelier warranty covering manufacturing defects, loose prong tension, or clasp integrity. Accidental damage or rough wear is repaired at nominal cost.",
  },
  {
    icon: Award,
    title: "Transparent Lifetime Buyback",
    text: "We stand behind the enduring value of our lab-grown diamonds and certified gold. We offer a transparent buyback and upgrade policy based on prevailing metal rates and diamond valuation.",
  },
];

export default function ReturnsPage() {
  return (
    <div className="max-w-content mx-auto px-6 md:px-8 py-8 md:py-16">
      <Breadcrumbs items={[{ label: "Returns & Warranty" }]} />

      <div className="max-w-2xl my-6 space-y-2">
        <p className="eyebrow">Client Assurance</p>
        <h1 className="font-serif text-3xl md:text-5xl text-ink">Returns & Warranty</h1>
        <p className="text-sm text-ink-muted leading-relaxed">
          We want you to feel complete confidence in every heirloom you welcome from our atelier.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 my-10">
        {POLICIES.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.title}
              className="border border-border-subtle bg-ivory-pure p-8 space-y-3"
            >
              <div className="w-10 h-10 rounded-full border border-champagne flex items-center justify-center text-champagne-accessible bg-ivory">
                <Icon size={18} strokeWidth={1.5} />
              </div>
              <h2 className="font-serif text-xl text-ink">{p.title}</h2>
              <p className="text-xs text-ink-muted leading-relaxed">{p.text}</p>
            </div>
          );
        })}
      </div>

      <div className="border border-border-subtle bg-ivory-pure p-6 space-y-2 text-xs text-ink-muted">
        <p className="font-medium text-ink">How to Initiate a Return or Service Request:</p>
        <p>
          Send an email with your Order Number to{" "}
          <a href="mailto:aryora.legacy@hotmail.com" className="text-ink underline">
            aryora.legacy@hotmail.com
          </a>{" "}
          or WhatsApp +91 8808828646. Our concierge will dispatch a return waybill and guide you through packaging.
        </p>
      </div>
    </div>
  );
}
