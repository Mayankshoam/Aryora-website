export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-24">
      <p className="eyebrow mb-3">Legal</p>
      <h1 className="font-display text-4xl mb-8">Privacy Policy</h1>
      <div className="space-y-6 text-ink/70 leading-relaxed">
        <p>
          Customer details shared with Aryora — including name, contact information, address,
          and order history — are kept confidential and used only for processing orders,
          delivery, and occasional promotional updates.
        </p>
        <p>
          We do not sell or share your personal information with third parties beyond what is
          required to fulfil your order (such as courier partners for delivery).
        </p>
        <p>
          For any questions about how your data is used, reach us at{" "}
          <a href="mailto:aryora.legacy@hotmail.com" className="underline">aryora.legacy@hotmail.com</a>{" "}
          or +91 8808828646.
        </p>
      </div>
    </div>
  );
}
