import Breadcrumbs from "@/components/Breadcrumbs";
import { Truck, ShieldCheck, Clock, MapPin, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Shipping & Delivery Policy",
  description:
    "Learn about AYOR's 24-48h dispatch, complimentary insured courier shipping, and pan-India transit terms.",
};

const POINTS = [
  {
    icon: Clock,
    title: "24–48 Hours Dispatch",
    text: "Orders for 925 Sterling Silver are processed and dispatched within 24 to 48 hours following strict quality checks, hallmarking verification, and protective wrapping.",
  },
  {
    icon: Truck,
    title: "Complimentary Insured Courier",
    text: "Every order across India ships via authorized high-value logistics partners (BlueDart Apex, Delhivery, BVC Logistics). Shipments are 100% transit-insured by AYOR until physical delivery.",
  },
  {
    icon: ShieldCheck,
    title: "Tamper-Evident Security Packaging",
    text: "Your jewellery is nestled in a luxury gift box, encased within a sealed, tamper-evident outer security satchel. Real-time tracking is sent automatically via SMS and WhatsApp.",
  },
  {
    icon: MapPin,
    title: "Nationwide Pan-India Coverage",
    text: "We service over 19,000 postal codes across India. Metros typically receive delivery in 3–5 business days, and other regions within 5–7 business days.",
  },
];

export default function ShippingPage() {
  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-16 space-y-10">
      <Breadcrumbs items={[{ label: "Shipping Policy" }]} />

      <div className="max-w-3xl space-y-3">
        <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[#C09981]">
          Reliable Pan-India Transit
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#111111] font-light">
          Shipping & Delivery Policy
        </h1>
        <p className="text-sm text-[#555555] leading-relaxed">
          Transparent, fully insured, and secure doorstep transit from our Lucknow atelier directly to your hands.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {POINTS.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.title}
              className="border border-[#DDD8D0] bg-white rounded-2xl p-7 space-y-3 shadow-sm"
            >
              <div className="w-10 h-10 rounded-full border border-[#DDD8D0] bg-[#FAF7F2] flex items-center justify-center text-[#0E382B]">
                <Icon size={18} strokeWidth={1.5} />
              </div>
              <h2 className="font-serif text-lg font-semibold text-[#111111]">{p.title}</h2>
              <p className="text-xs text-[#666666] leading-relaxed">{p.text}</p>
            </div>
          );
        })}
      </div>

      <div className="border border-[#DDD8D0] bg-[#FAF7F2] p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div>
          <p className="font-semibold text-sm text-[#111111]">Questions regarding shipment status or urgent courier?</p>
          <p className="text-[#666666]">Contact AYOR dispatch support via WhatsApp or email.</p>
        </div>
        <a
          href="https://wa.me/918808828646?text=Hello%20AYOR,%20I%20have%20a%20query%20about%20my%20order%20shipment."
          target="_blank"
          rel="noreferrer"
          className="bg-[#0E382B] text-white px-5 py-2.5 rounded-lg font-semibold uppercase tracking-wider hover:bg-[#144636] transition-colors"
        >
          Track with Dispatch Care
        </a>
      </div>
    </div>
  );
}
