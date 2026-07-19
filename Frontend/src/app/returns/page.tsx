export default function ReturnsPage() {
  const points = [
    "Returns are accepted within 7 days of delivery, only if the product is unused and in its original condition.",
    "Custom or made-to-order pieces are not eligible for return.",
    "Refunds are processed after the returned product is inspected, and may take 7-10 working days.",
    "All Aryora jewellery carries a 6-month warranty against manufacturing defects. Damage caused by misuse is not covered.",
  ];
  return (
    <div className="max-w-3xl mx-auto px-6 py-24">
      <p className="eyebrow mb-3">Legal</p>
      <h1 className="font-display text-4xl mb-8">Returns & Warranty</h1>
      <ul className="space-y-4">
        {points.map((p, i) => (
          <li key={i} className="text-ink/70 leading-relaxed">• {p}</li>
        ))}
      </ul>
    </div>
  );
}
