export default function ShippingPage() {
  const points = [
    "Prices are inclusive of all taxes. Payment accepted via cash, card, and UPI.",
    "Orders are confirmed only after payment is received. Delivery time may vary by location.",
    "Cancellations are allowed any time before the order is dispatched. Once dispatched, our return policy applies instead.",
    "Aryora is not liable for delays caused by courier partners or for indirect damages arising from shipping.",
  ];
  return (
    <div className="max-w-3xl mx-auto px-6 py-24">
      <p className="eyebrow mb-3">Legal</p>
      <h1 className="font-display text-4xl mb-8">Shipping Policy</h1>
      <ul className="space-y-4">
        {points.map((p, i) => (
          <li key={i} className="text-ink/70 leading-relaxed">• {p}</li>
        ))}
      </ul>
    </div>
  );
}
