import Breadcrumbs from "@/components/Breadcrumbs";
import { Truck, ShieldCheck, Clock, MapPin } from "lucide-react";

export const metadata = {
  title: "Shipping & Delivery Policy",
  description:
    "Learn about Aryora's complimentary, 100% insured courier shipping across India.",
};

const POINTS = [
  {
    icon: Truck,
    title: "Complimentary Insured Courier",
    text: "Every order across India ships free of charge via authorized high-value logistics partners (BlueDart Apex / BVC Logistics). Every shipment is 100% transit-insured by Aryora until the point of physical delivery.",
  },
  {
    icon: Clock,
    title: "Dispatch & Delivery Timelines",
    text: "Ready-to-ship fine jewellery is prepared, hallmarked, and dispatched within 2-4 business days. Metros typically receive delivery within 3-5 business days from dispatch. Non-metro pin codes may take 5-8 business days.",
  },
  {
    icon: ShieldCheck,
    title: "Tamper-Proof Security Packaging",
    text: "Your jewelry is housed in a plush velvet presentation box, encased within a sealed, tamper-evident security satchel with a serialized tracking bar. Please inspect that the exterior seal is unbroken before signing off.",
  },
  {
    icon: MapPin,
    title: "Nationwide Pan-India Coverage",
    text: "We service over 19,000 postal codes across India. If your pin code is remote or requires special coordination, our concierge team will reach out directly prior to dispatch.",
  },
];

export default function ShippingPage() {
  return (
    <div className="max-w-content mx-auto px-6 md:px-8 py-8 md:py-16">
      <Breadcrumbs items={[{ label: "Shipping Policy" }]} />

      <div className="max-w-2xl my-6 space-y-2">
        <p className="eyebrow">Client Assurance</p>
        <h1 className="font-serif text-3xl md:text-5xl text-ink">Shipping & Delivery</h1>
        <p className="text-sm text-ink-muted leading-relaxed">
          Transparent, fully insured, and secure doorstep transit from our Lucknow atelier to your hands.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 my-10">
        {POINTS.map((p) => {
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

      <div className="border-t border-border-subtle pt-8 text-xs text-ink-subtle">
        <p>
          For shipment inquiries or urgent dispatch requests, contact our concierge at{" "}
          <a href="mailto:aryora.legacy@hotmail.com" className="text-ink underline">
            aryora.legacy@hotmail.com
          </a>{" "}
          or WhatsApp +91 8808828646.
        </p>
      </div>
    </div>
  );
}
