export default function TermsPage() {
  const terms = [
    "All products are guaranteed genuine and undergo strict quality checks.",
    "Prices are inclusive of all taxes. Payment accepted via cash, card, UPI.",
    "Orders are confirmed after payment. Delivery time may vary by location.",
    "Returns accepted within 7 days only if unused and in original condition. Custom orders are not returnable.",
    "Refunds processed after product inspection; may take 7-10 working days.",
    "6-month warranty on manufacturing defects. Damage due to misuse is not covered.",
    "Cancellation allowed before dispatch. After dispatch, return policy applies.",
    "Customer details are confidential and used only for orders or promotional updates.",
    "Aryora is not liable for courier delays or indirect damages.",
    "All disputes are subject to Lucknow jurisdiction.",
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-24">
      <p className="eyebrow mb-3">Legal</p>
      <h1 className="font-display text-4xl mb-10">Terms & Conditions</h1>
      <ol className="space-y-5">
        {terms.map((term, i) => (
          <li key={i} className="flex gap-4 text-ink/70 leading-relaxed">
            <span className="font-display text-champagne flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
            <span>{term}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
