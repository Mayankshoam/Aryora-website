"use client";

import { useState } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ChevronDown, MessageCircle, Phone, Mail } from "lucide-react";

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
        q: "Are lab-grown diamonds chemically and physically real diamonds?",
        a: "Yes. Lab-grown diamonds share the identical chemical (100% crystalline carbon), physical, and optical characteristics as mined diamonds. They display the identical refractive index (2.42), thermal conductivity, and hardness (10 on the Mohs scale). The only difference is their point of creation above ground rather than deep beneath the earth.",
      },
      {
        q: "Can a jeweler tell the difference between a mined and lab diamond?",
        a: "Not with the naked eye, loupe, or standard gemological microscope. Advanced spectroscopic laboratory machinery is required to read microscopic growth characteristics. Every Aryora diamond is certified by IGI and laser-inscribed on the girdle with its unique certification number for total transparency.",
      },
      {
        q: "Why are lab-grown diamonds more accessible in price?",
        a: "By growing diamonds under controlled conditions, we bypass hundreds of feet of heavy earth excavation, lengthy cartels, and multi-tier intermediary brokerage markups. That efficiency passes directly to you, typically 30% to 50% more accessible for comparable carat, cut, color, and clarity.",
      },
    ],
  },
  {
    title: "Certification & Authenticity",
    items: [
      {
        q: "Are all Aryora stones certified by independent gemological laboratories?",
        a: "Yes. Every center stone is independently certified by the International Gemological Institute (IGI). Your piece ships in a sealed heirloom presentation box containing the official laminated IGI dossier specifying precise 4Cs grading.",
      },
      {
        q: "What metal hallmark standards does Aryora use?",
        a: "Our yellow, white, and rose gold pieces are crafted in certified 18K (750 hallmark) or 14K gold. Our silver jewelry is crafted in authentic 92.5 sterling silver with tarnish-resistant rhodium plating.",
      },
    ],
  },
  {
    title: "Shipping & Delivery",
    items: [
      {
        q: "How is my jewelry shipped, and is it insured during transit?",
        a: "Every Aryora order includes complimentary 100% insured courier delivery across India via premier security logistics partners (BlueDart Apex / BVC Logistics). Your parcel is sealed in tamper-evident packaging and requires signature verification upon delivery.",
      },
      {
        q: "What is the standard delivery timeline?",
        a: "Ready-to-ship heirlooms dispatch within 2-4 business days and deliver within 4-7 business days across major Indian metros. Bespoke bridal and custom CAD pieces dispatch within 3-4 weeks from final design approval.",
      },
    ],
  },
  {
    title: "Returns, Resizing & Warranty",
    items: [
      {
        q: "What is Aryora's return and exchange policy?",
        a: "We offer a 7-day hassle-free return policy on standard unworn catalogue items in their original presentation packaging. Bespoke engraved or custom-fabricated pieces are not eligible for direct return, but carry our lifetime exchange and transparent buyback guarantee.",
      },
      {
        q: "Do you offer complimentary ring resizing?",
        a: "Yes. Every ring includes one complimentary resizing within 30 days of delivery. Simply reach out to our concierge team and we will coordinate return collection.",
      },
      {
        q: "What does the 6-Month Manufacturing Warranty cover?",
        a: "Our warranty covers manufacturing defects, loose prongs, and stone setting integrity. Wear and tear or accidental structural deformation is repaired at nominal atelier raw-material cost.",
      },
    ],
  },
  {
    title: "Custom Orders & Bridal",
    items: [
      {
        q: "Can I commission a bespoke design or alter an existing piece?",
        a: "Absolutely. Our 'Design Your Own' atelier allows you to pick your dream diamond shape, carat, setting style, and gold alloy. Our 3D CAD team works closely with you to finalize every millimeter.",
      },
    ],
  },
];

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // FAQPage JSON-LD schema for rich search results
  const allQuestions = CATEGORIES.flatMap((c) => c.items);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allQuestions.map((qa) => ({
      "@type": "Question",
      name: qa.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: qa.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="max-w-content mx-auto px-6 md:px-8 py-8 md:py-16">
        <Breadcrumbs items={[{ label: "Frequently Asked Questions" }]} />

        <div className="max-w-2xl my-8 space-y-3">
          <p className="eyebrow">Client Support & Clarifications</p>
          <h1 className="font-serif text-3xl md:text-5xl text-ink">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-ink-muted leading-relaxed">
            Everything you need to know about our IGI-certified lab-grown diamonds, shipping insurance, resizing, and craftsmanship standards.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 md:gap-14 pt-6">
          {/* Category Tabs */}
          <nav className="lg:col-span-4 space-y-1.5" aria-label="FAQ Categories">
            {CATEGORIES.map((cat, idx) => (
              <button
                key={cat.title}
                onClick={() => {
                  setActiveCategory(idx);
                  setOpenIndex(0);
                }}
                className={`w-full text-left px-5 py-3.5 text-xs uppercase tracking-wider font-medium border transition-all ${
                  activeCategory === idx
                    ? "border-ink bg-ivory-pure text-ink shadow-sm"
                    : "border-transparent text-ink-muted hover:text-ink hover:bg-ivory-muted/40"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </nav>

          {/* Accordion List */}
          <div className="lg:col-span-8">
            <h2 className="font-serif text-2xl text-ink mb-6 pb-2 border-b border-border-subtle">
              {CATEGORIES[activeCategory].title}
            </h2>

            <div className="divide-y divide-border-subtle border-b border-border-subtle">
              {CATEGORIES[activeCategory].items.map((item, i) => {
                const isOpen = openIndex === i;
                return (
                  <div key={item.q} className="py-4">
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="w-full flex items-center justify-between text-left gap-4 py-2 text-sm md:text-base font-serif text-ink hover:text-champagne-accessible transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        size={18}
                        className={`text-ink-subtle flex-shrink-0 transition-transform ${
                          isOpen ? "rotate-180 text-champagne-accessible" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="pt-2 pb-3 text-xs md:text-sm text-ink-muted leading-relaxed pr-6">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Direct Concierge Prompt */}
            <div className="mt-12 p-6 border border-border-subtle bg-ivory-pure space-y-3">
              <h3 className="font-serif text-lg text-ink">Have a specific question?</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Our Lucknow atelier concierge is available 7 days a week to answer gemstone specifications, quote custom orders, or assist with orders.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  href="https://wa.me/918808828646"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary text-xs flex items-center gap-2"
                >
                  <MessageCircle size={15} /> WhatsApp +91 8808828646
                </a>
                <a
                  href="mailto:aryora.legacy@hotmail.com"
                  className="btn-outline text-xs flex items-center gap-2"
                >
                  <Mail size={15} /> Email Concierge
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
