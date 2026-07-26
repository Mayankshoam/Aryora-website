"use client";

import { useState } from "react";
import Link from "next/link";

interface QA {
  q: string;
  a: string;
}
interface Category {
  title: string;
  items: QA[];
}

const CATEGORIES: Category[] = [
  {
    title: "Lab-Grown Diamonds",
    items: [
      {
        q: "Are lab-grown diamonds real diamonds?",
        a: "Yes. Lab-grown diamonds share the same chemical, physical, and optical properties as mined diamonds — the only difference is where they're created. Aryora's diamonds are grown in a controlled lab environment rather than extracted from the earth.",
      },
      {
        q: "Can you tell the difference between a lab-grown and a mined diamond?",
        a: "No — not even with the naked eye or standard jeweller's tools. Specialised equipment is needed to identify the origin, and every Aryora diamond is laser-inscribed and certified so its origin is always transparent to you.",
      },
      {
        q: "Are lab-grown diamonds cheaper than mined diamonds?",
        a: "Yes, typically 30-50% less for a comparable cut, colour, and clarity — since lab-grown diamonds skip the environmental and supply-chain cost of mining.",
      },
      {
        q: "Are lab-grown diamonds eco-friendly and conflict-free?",
        a: "Yes. Aryora's diamonds are created without mining, making them a more sustainable and entirely conflict-free choice.",
      },
    ],
  },
  {
    title: "Certification & Quality",
    items: [
      {
        q: "Are Aryora's diamonds certified?",
        a: "Yes, every diamond is IGI certified, with documentation covering cut, colour, clarity, and carat weight — included with your piece at delivery.",
      },
      {
        q: "What quality checks does each piece go through?",
        a: "Every Aryora piece is inspected for stone setting, metal finish, and structural integrity before it leaves our studio, in addition to the independent certification on the diamond itself.",
      },
    ],
  },
  {
    title: "Orders & Payment",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept cash, card, and UPI. All listed prices are inclusive of applicable taxes.",
      },
      {
        q: "When is my order confirmed?",
        a: "Your order is confirmed once payment is received. You'll get a confirmation email with your order details right after.",
      },
      {
        q: "Can I cancel my order?",
        a: "Yes, cancellations are accepted any time before the order is dispatched. Once dispatched, our standard return policy applies instead.",
      },
    ],
  },
  {
    title: "Shipping & Delivery",
    items: [
      {
        q: "Do you ship across India?",
        a: "Yes, with fully insured shipping. Delivery timelines vary slightly by location — you'll see an estimated delivery date at checkout.",
      },
      {
        q: "How is my jewellery packaged?",
        a: "Every piece ships in tamper-proof, secure packaging. Please inspect your parcel carefully before signing for delivery.",
      },
    ],
  },
  {
    title: "Returns, Exchange & Warranty",
    items: [
      {
        q: "What is Aryora's return policy?",
        a: "Returns are accepted within 7 days of delivery, provided the piece is unused and in its original condition. Custom or made-to-order pieces are not eligible for return.",
      },
      {
        q: "How long do refunds take?",
        a: "Refunds are processed after the returned item is inspected, and typically take 7-10 working days.",
      },
      {
        q: "Is there a warranty on Aryora jewellery?",
        a: "Yes, every piece carries a 6-month warranty against manufacturing defects. Damage caused by misuse or normal wear is not covered.",
      },
      {
        q: "Do you offer resizing?",
        a: "Yes, one complimentary resizing is available within 30 days of delivery for most ring designs. Contact our concierge team before shipping a piece back for resizing.",
      },
    ],
  },
  {
    title: "Customization",
    items: [
      {
        q: "Can I design my own piece?",
        a: "Yes — visit our Build Your Ring page to choose a setting style, metal, and diamond shape. Our design concierge will follow up with a personalised quote.",
      },
      {
        q: "How long does a custom piece take to make?",
        a: "Custom timelines vary by design complexity; our concierge team will confirm an estimated timeline when you submit your design.",
      },
    ],
  },
  {
    title: "Care & Maintenance",
    items: [
      {
        q: "How do I clean my jewellery at home?",
        a: "Use a soft brush with mild soapy water, rinse, and pat dry with a lint-free cloth. Avoid harsh chemicals, chlorine, and ultrasonic cleaners unless recommended by our team for your specific piece.",
      },
      {
        q: "Do you offer cleaning or repair services?",
        a: "Yes — reach out to our concierge team at aryora.legacy@hotmail.com or +91 8808828646 to arrange cleaning, repair, or resizing.",
      },
    ],
  },
];

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <p className="eyebrow mb-3">Support</p>
      <h1 className="font-display text-4xl mb-4">Frequently Asked Questions</h1>
      <p className="text-ink/70 leading-relaxed mb-14 max-w-2xl">
        Answers to the questions we hear most, from how our lab-grown diamonds are made to
        shipping, returns, and care. Can't find what you're looking for?{" "}
        <Link href="/contact" className="underline text-emerald">Reach our concierge team</Link>.
      </p>

      <div className="grid md:grid-cols-[220px_1fr] gap-12">
        {/* Category nav */}
        <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.title}
              onClick={() => {
                setActiveCategory(i);
                setOpenIndex(0);
              }}
              className={`text-left whitespace-nowrap px-4 py-3 text-sm border-l-2 transition-colors ${
                activeCategory === i
                  ? "border-emerald text-emerald font-medium bg-emerald/5"
                  : "border-transparent text-ink/60 hover:text-ink"
              }`}
            >
              {cat.title}
            </button>
          ))}
        </nav>

        {/* Accordion */}
        <div>
          <h2 className="font-display text-xl mb-6">{CATEGORIES[activeCategory].title}</h2>
          <div className="divide-y divide-black/10 border-t border-b border-black/10">
            {CATEGORIES[activeCategory].items.map((item, i) => (
              <div key={item.q}>
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex justify-between items-center gap-4 py-5 text-left"
                >
                  <span className="font-display text-base">{item.q}</span>
                  <span className="text-champagne text-xl flex-shrink-0">{openIndex === i ? "−" : "+"}</span>
                </button>
                {openIndex === i && (
                  <p className="pb-5 text-sm text-ink/70 leading-relaxed pr-8">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-20 border-t border-black/10 pt-10 text-center">
        <p className="eyebrow mb-2">Still have questions?</p>
        <h3 className="font-display text-2xl mb-6">Talk to our concierge team</h3>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="/contact" className="btn-primary">Book a Consultation</Link>
          <a href="tel:+918808828646" className="btn-outline">Call +91 8808828646</a>
        </div>
      </div>
    </div>
  );
}
