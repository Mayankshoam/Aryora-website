import Breadcrumbs from "@/components/Breadcrumbs";
import {
  RotateCcw,
  ShieldCheck,
  Truck,
  Video,
  Clock,
  AlertTriangle,
  CheckCircle2,
  PackageCheck,
  FileText,
} from "lucide-react";

export const metadata = {
  title: "Silver Return, Refund & Exchange Policy",
  description:
    "Official 7-day return, refund and exchange policy for AYOR 925 Sterling Silver Jewellery.",
};

export default function ReturnsPage() {
  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-16 space-y-10">
      <Breadcrumbs items={[{ label: "Shipping, Return & Refund Policy" }]} />

      <div className="max-w-3xl space-y-3">
        <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[#C09981]">
          925 Sterling Silver Assurance
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#111111] font-light">
          Shipping, Return & Refund Policy
        </h1>
        <p className="text-sm text-[#555555] leading-relaxed">
          At AYOR Fine Jewellery, we are committed to delivering the finest silver and fine jewellery with complete transparency and care. Please review our policies regarding order processing, transit, returns, and refunds.
        </p>
      </div>

      {/* Policy Highlights Cards */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: Clock,
            title: "24–48h Dispatch",
            desc: "Rigorous quality check & secure packaging within 24 to 48 hours.",
          },
          {
            icon: RotateCcw,
            title: "7-Day Easy Return",
            desc: "7-day return window for unworn, unused items with tags intact.",
          },
          {
            icon: Video,
            title: "360° Unboxing Video",
            desc: "Mandatory unboxing video required for missing or transit damage claims.",
          },
          {
            icon: PackageCheck,
            title: "48h Fast Refund",
            desc: "Refund initiated within 48 hours of warehouse inspection.",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-white border border-[#DDD8D0] p-5 rounded-xl space-y-2.5 shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#DDD8D0] text-[#0E382B] flex items-center justify-center">
                <Icon size={18} strokeWidth={1.5} />
              </div>
              <h2 className="font-serif text-base font-semibold text-[#111111]">{item.title}</h2>
              <p className="text-xs text-[#666666] leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* In-Depth Policy Articles */}
      <div className="space-y-8 bg-white border border-[#DDD8D0] rounded-2xl p-6 sm:p-10 shadow-sm divide-y divide-[#EFEBE4]">
        {/* 1. Order Processing & Fulfilment */}
        <div className="space-y-3 pt-6 first:pt-0">
          <h2 className="font-serif text-xl sm:text-2xl text-[#111111] font-medium flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0E382B] text-white text-xs flex items-center justify-center">1</span>
            <span>Order Processing & Fulfilment Policy</span>
          </h2>
          <div className="text-xs sm:text-sm text-[#555555] space-y-2 leading-relaxed">
            <p>
              Every AYOR order undergoes multi-stage quality verification, hallmark authentication check, and tamper-evident packaging before dispatch.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Processing Time:</strong> Orders are usually processed within 24 hours. During peak festive/wedding seasons, processing may take up to 48 hours due to high order volume and meticulous inspection.
              </li>
              <li>
                <strong>Real-Time Tracking:</strong> Once your parcel is processed and handed over to logistics partners (BlueDart / Delhivery / BVC Logistics), your tracking ID is automatically generated and communicated via SMS, Email, and WhatsApp.
              </li>
              <li>
                <strong>Product Availability:</strong> If an ordered silver piece is momentarily out of stock, our team will promptly notify you on WhatsApp. You may opt for an alternative design or an immediate full refund.
              </li>
            </ul>
          </div>
        </div>

        {/* 2. Domestic & Insured Shipping */}
        <div className="space-y-3 pt-6">
          <h2 className="font-serif text-xl sm:text-2xl text-[#111111] font-medium flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0E382B] text-white text-xs flex items-center justify-center">2</span>
            <span>Domestic Shipping & Transit Security</span>
          </h2>
          <div className="text-xs sm:text-sm text-[#555555] space-y-2 leading-relaxed">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Complimentary Insured Shipping:</strong> Complimentary transit insurance covers all orders across India until doorstep handover.
              </li>
              <li>
                <strong>Estimated Delivery:</strong> Metros typically receive delivery within 3–5 business days from dispatch. Tier 2 and Tier 3 cities receive delivery within 5–7 business days.
              </li>
              <li>
                <strong>Undelivered Parcels:</strong> In case a parcel is returned due to incorrect contact details, address issues, or client unavailability, re-shipping will be coordinated through customer support.
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Return & Replacement Policy */}
        <div className="space-y-3 pt-6">
          <h2 className="font-serif text-xl sm:text-2xl text-[#111111] font-medium flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0E382B] text-white text-xs flex items-center justify-center">3</span>
            <span>Return & Replacement Policy (7-Day Window)</span>
          </h2>
          <div className="text-xs sm:text-sm text-[#555555] space-y-2 leading-relaxed">
            <p>
              We want you to love your AYOR pieces. We offer a <strong>7-Day Return Policy</strong> from the date of physical delivery for unused, unworn items.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Eligible Condition:</strong> The silver jewellery must be in original unworn condition with all authenticity tags, security seals, and premium presentation boxes intact.
              </li>
              <li>
                <strong>Non-Returnable Exclusions:</strong> Custom-engraved jewellery, personalised pieces, silver coins, and hygiene-sensitive items (unless arriving defective) are non-returnable.
              </li>
              <li>
                <strong>Missing Return Items:</strong> If any component (presentation box, authenticity card, or accompanying free gift) is omitted in return, the value will be deducted from the refund.
              </li>
            </ul>
          </div>
        </div>

        {/* 4. Mandatory 360° Unboxing Video Rule */}
        <div className="space-y-3 pt-6 bg-[#FAF7F2] p-5 rounded-xl border border-[#DDD8D0]">
          <h2 className="font-serif text-lg sm:text-xl text-[#0E382B] font-semibold flex items-center gap-2">
            <AlertTriangle className="text-amber-600" size={18} />
            <span>Mandatory 360° Unboxing Video Requirement</span>
          </h2>
          <div className="text-xs sm:text-sm text-[#444444] space-y-2 leading-relaxed">
            <p>
              To protect customers against courier tampering, any claims regarding <strong>damaged, defective, missing, or incorrect items</strong> must be reported within <strong>24 to 48 hours of delivery</strong>.
            </p>
            <p className="font-semibold text-[#111111]">
              ⚠️ A clear, uncut 360° unboxing video showing the outer sealed package, the label, and the initial unboxing is mandatory for transit claims. Claims without video proof cannot be entertained.
            </p>
          </div>
        </div>

        {/* 5. Refund Timelines & Process */}
        <div className="space-y-3 pt-6">
          <h2 className="font-serif text-xl sm:text-2xl text-[#111111] font-medium flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0E382B] text-white text-xs flex items-center justify-center">4</span>
            <span>Refund Timelines & Return Address</span>
          </h2>
          <div className="text-xs sm:text-sm text-[#555555] space-y-2 leading-relaxed">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Inspection & Processing:</strong> Refunds are initiated within <strong>48 hours</strong> of the returned piece reaching our Lucknow studio and passing quality inspection.
              </li>
              <li>
                <strong>Credit Timeline:</strong> The refund will reflect in your original payment method (Bank account, UPI, Card) within <strong>5–7 business days</strong> depending on your banking provider.
              </li>
              <li>
                <strong>Studio Return Address:</strong> AYOR Fine Jewellery Studio, Lucknow, Uttar Pradesh, India — 226001.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Need Assistance Bar */}
      <div className="bg-[#FAF7F2] border border-[#DDD8D0] p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div>
          <p className="font-semibold text-sm text-[#111111]">Need assistance with a return or order?</p>
          <p className="text-[#666666]">Our Customer Care is available Monday to Saturday, 10 AM to 7 PM IST.</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/918808828646?text=Hello%20AYOR,%20I%20need%20assistance%20with%20returns%20or%20shipping."
            target="_blank"
            rel="noreferrer"
            className="bg-[#0E382B] text-white px-5 py-2.5 rounded-lg font-semibold uppercase tracking-wider hover:bg-[#144636] transition-colors"
          >
            WhatsApp Support
          </a>
          <a
            href="mailto:ayor.legacy@hotmail.com"
            className="border border-[#111111] text-[#111111] px-5 py-2.5 rounded-lg font-semibold uppercase tracking-wider hover:bg-[#111111] hover:text-white transition-colors"
          >
            Email Support
          </a>
        </div>
      </div>
    </div>
  );
}
