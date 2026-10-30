"use client";

import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Check, Phone, ShieldCheck, Ruler } from "lucide-react";

const SIZES = [
  { size: 4, mm: 14.01 },
  { size: 5, mm: 14.33 },
  { size: 6, mm: 14.65 },
  { size: 7, mm: 14.97 },
  { size: 8, mm: 15.29 },
  { size: 9, mm: 15.61 },
  { size: 10, mm: 15.92 },
  { size: 11, mm: 16.24 },
  { size: 12, mm: 16.56 },
  { size: 13, mm: 16.88 },
  { size: 14, mm: 17.20 },
  { size: 15, mm: 17.52 },
  { size: 16, mm: 17.83 },
  { size: 17, mm: 18.15 },
  { size: 18, mm: 18.47 },
  { size: 19, mm: 18.79 },
  { size: 20, mm: 19.11 },
  { size: 21, mm: 19.43 },
  { size: 22, mm: 19.75 },
  { size: 23, mm: 20.00 },
  { size: 24, mm: 20.36 },
  { size: 25, mm: 20.60 },
  { size: 26, mm: 21.02 },
  { size: 27, mm: 21.34 },
  { size: 28, mm: 21.60 },
];

const TIPS = [
  {
    title: "Time of Day",
    text: "Finger size expands slightly towards evening. For maximum accuracy, measure your finger at the end of the day.",
  },
  {
    title: "Temperature Effects",
    text: "Fingers contract in cold weather and expand in summer heat. Avoid measuring immediately after hot baths or cold exposure.",
  },
  {
    title: "Thicker Bands",
    text: "For rings wider than 4mm, we suggest choosing half to one size larger so the band slides comfortably over the knuckle.",
  },
  {
    title: "Complimentary Resizing",
    text: "Every Aryora ring includes one free resizing within 30 days of delivery, giving you total peace of mind.",
  },
];

export default function RingSizeGuidePage() {
  return (
    <div className="max-w-content mx-auto px-6 md:px-8 py-8 md:py-16">
      <Breadcrumbs items={[{ label: "Size Guide" }]} />

      <div className="max-w-2xl my-8 space-y-3">
        <p className="eyebrow">Client Care & Fit</p>
        <h1 className="font-serif text-3xl md:text-5xl text-ink">
          The Ring Size Guide
        </h1>
        <p className="text-sm text-ink-muted leading-relaxed">
          A properly sized ring ensures supreme comfort, stays centered, and lets the brilliance of your stone sit proudly.
        </p>
      </div>

      {/* Measurement Methods */}
      <div className="grid md:grid-cols-2 gap-8 my-12">
        <div className="border border-border-subtle bg-ivory-pure p-8 space-y-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-ink">
            <Ruler size={16} className="text-champagne-accessible" />
            <span>Method 1: Measure an Existing Ring</span>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            Take a ring that fits your intended finger comfortably. Place it on a flat surface and measure the internal diameter in millimeters straight across the widest point, edge-to-edge.
          </p>
          <p className="text-xs text-ink-muted leading-relaxed">
            Match that measurement with the Indian Ring Size Chart below. If your measurement falls between two sizes, choose the larger size.
          </p>
        </div>

        <div className="border border-border-subtle bg-ivory-pure p-8 space-y-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-ink">
            <Phone size={16} className="text-champagne-accessible" />
            <span>Method 2: Virtual Concierge Sizing</span>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            Our atelier specialists can guide you through sizing over a private WhatsApp video consultation, or dispatch a physical ring sizing tool directly to your doorstep in India.
          </p>
          <div className="pt-2">
            <a
              href="https://wa.me/918808828646?text=Hello%20Aryora%2C%20I%20need%20help%20determining%20my%20ring%20size."
              target="_blank"
              rel="noreferrer"
              className="btn-outline text-xs"
            >
              Consult Our Concierge
            </a>
          </div>
        </div>
      </div>

      {/* Indian Ring Size Chart Table */}
      <div className="my-16 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-ink">Standard Indian Ring Size Chart</h2>
          <span className="text-xs text-ink-subtle">All dimensions in millimeters</span>
        </div>

        <div className="overflow-x-auto border border-border-subtle bg-ivory-pure">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-muted border-b border-border-subtle uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="py-3 px-4 font-medium">Indian Size</th>
                <th className="py-3 px-4 font-medium">Diameter (mm)</th>
                <th className="py-3 px-4 font-medium">Circumference (mm)</th>
                <th className="py-3 px-4 font-medium">US Size Equivalent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {SIZES.map((s) => (
                <tr key={s.size} className="hover:bg-ivory-muted/40 transition-colors">
                  <td className="py-2.5 px-4 font-serif text-sm font-medium text-ink">
                    Size {s.size}
                  </td>
                  <td className="py-2.5 px-4 text-ink-muted">{s.mm.toFixed(2)} mm</td>
                  <td className="py-2.5 px-4 text-ink-muted">
                    {(s.mm * Math.PI).toFixed(2)} mm
                  </td>
                  <td className="py-2.5 px-4 text-ink-muted">
                    US {(s.size / 2 - 0.5).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sizing Tips Grid */}
      <div className="my-16 space-y-6">
        <h2 className="font-serif text-2xl text-ink">Essential Sizing Principles</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {TIPS.map((tip) => (
            <div
              key={tip.title}
              className="border border-border-subtle p-5 bg-ivory-pure space-y-2"
            >
              <h3 className="font-serif text-base text-ink font-medium">{tip.title}</h3>
              <p className="text-xs text-ink-muted leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
