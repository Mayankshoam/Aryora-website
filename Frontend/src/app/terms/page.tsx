import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions governing purchases and services at Aryora Fine Jewellery.",
};

const TERMS = [
  "All pieces crafted by Aryora are guaranteed authentic, hallmarked, and accompanied by independent laboratory certification (IGI) where specified.",
  "Listed prices are inclusive of all applicable statutory taxes (including 3% GST across India).",
  "Orders are officially confirmed upon successful payment verification. Delivery times are subject to location logistics and custom manufacturing complexity.",
  "Returns are accepted within 7 days of delivery only if the piece is unworn, intact, and in original packaging. Bespoke engraved pieces carry exchange/buyback only.",
  "Refunds are credited to the original payment source within 7-10 business days following rigorous gemological inspection.",
  "Every jewel carries a 6-month warranty against manufacturing flaws. Damage arising from structural misuse or external trauma is repaired at nominal cost.",
  "Cancellations are permitted prior to dispatch. Once dispatched, standard return guidelines apply.",
  "All transactions and legal proceedings are subject to the exclusive jurisdiction of the courts of Lucknow, Uttar Pradesh, India.",
];

export default function TermsPage() {
  return (
    <div className="max-w-content mx-auto px-6 md:px-8 py-8 md:py-16">
      <Breadcrumbs items={[{ label: "Terms & Conditions" }]} />

      <div className="max-w-2xl my-6 space-y-2">
        <p className="eyebrow">Legal Framework</p>
        <h1 className="font-serif text-3xl md:text-5xl text-ink">Terms & Conditions</h1>
        <p className="text-sm text-ink-muted leading-relaxed">
          Please review the terms and policies governing purchases, bespoke commissions, and atelier services.
        </p>
      </div>

      <div className="border border-border-subtle bg-ivory-pure p-8 md:p-12 my-10 space-y-6">
        <ol className="space-y-6">
          {TERMS.map((term, i) => (
            <li key={i} className="flex gap-4 text-xs md:text-sm text-ink-muted leading-relaxed">
              <span className="font-serif text-base text-champagne-accessible font-medium flex-shrink-0 w-6">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{term}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
