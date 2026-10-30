import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = {
  title: "Privacy Policy",
  description: "How Aryora protects and manages your personal client data.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-content mx-auto px-6 md:px-8 py-8 md:py-16">
      <Breadcrumbs items={[{ label: "Privacy Policy" }]} />

      <div className="max-w-2xl my-6 space-y-2">
        <p className="eyebrow">Client Confidentiality</p>
        <h1 className="font-serif text-3xl md:text-5xl text-ink">Privacy Policy</h1>
        <p className="text-sm text-ink-muted leading-relaxed">
          Aryora respects the absolute privacy of our patrons. Here is how your personal information is protected.
        </p>
      </div>

      <div className="border border-border-subtle bg-ivory-pure p-8 md:p-12 my-10 space-y-6 text-xs md:text-sm text-ink-muted leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-ink">1. Information We Collect</h2>
          <p>
            When you commission a custom design, book a bridal consultation, or acquire a piece from Aryora, we collect essential details such as your name, contact telephone, delivery address, and payment confirmation details.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-ink">2. How Your Data is Utilized</h2>
          <p>
            Your information is utilized solely to process your orders, arrange insured courier deliveries, issue laser-inscribed IGI certificates, and maintain your lifetime service history. We never sell, lease, or monetize client data with external marketing brokers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-ink">3. Secure Payment Processing</h2>
          <p>
            Payment transactions are routed through bank-grade, PCI-DSS compliant gateways (such as Razorpay). Aryora never stores credit/debit card numbers or confidential bank passwords on our servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-ink">4. Concierge Data Requests</h2>
          <p>
            You may request an update or deletion of your personal contact records at any time by contacting our atelier concierge at{" "}
            <a href="mailto:aryora.legacy@hotmail.com" className="text-ink underline">
              aryora.legacy@hotmail.com
            </a>{" "}
            or +91 8808828646.
          </p>
        </section>
      </div>
    </div>
  );
}
