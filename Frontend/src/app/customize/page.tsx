"use client";

import { useState } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import RingPreview from "@/components/RingPreview";
import { Check, Sparkles } from "lucide-react";

const STYLES = [
  { id: "solitaire", label: "Solitaire", desc: "A single stone, timeless and pure" },
  { id: "halo", label: "Halo", desc: "Center stone framed by delicate micro diamonds" },
  { id: "three-stone", label: "Three Stone", desc: "Past, present, future symbol" },
  { id: "vintage", label: "Vintage Milgrain", desc: "Intricate Awadhi-inspired milgrain edging" },
  { id: "split-shank", label: "Split Shank", desc: "Dual band meeting the center diamond" },
  { id: "eternity", label: "Eternity Band", desc: "Continuous unbroken circle of light" },
];

const METALS = [
  { id: "YELLOW_GOLD", label: "18K Yellow Gold" },
  { id: "WHITE_GOLD", label: "18K White Gold" },
  { id: "ROSE_GOLD", label: "18K Rose Gold" },
  { id: "CHAMPAGNE_GOLD", label: "18K Champagne Gold" },
  { id: "SILVER_925", label: "92.5 Sterling Silver" },
];

const SHAPES = [
  "Round Brilliant",
  "Emerald Cut",
  "Oval",
  "Pear (Teardrop)",
  "Princess",
  "Cushion",
  "Marquise",
  "Radiant",
  "Asscher",
];

const CARATS = ["0.50 Carat", "1.00 Carat", "1.50 Carat", "2.00 Carat", "2.50+ Carat"];

export default function CustomizePage() {
  const [styles, setStyles] = useState<string[]>(["solitaire"]);
  const [metal, setMetal] = useState("YELLOW_GOLD");
  const [shape, setShape] = useState("Emerald Cut");
  const [carat, setCarat] = useState("1.50 Carat");
  const [contact, setContact] = useState({ fullName: "", emailId: "", mobileNumber: "" });
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const toggleStyle = (id: string) => {
    setStyles((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((s) => s !== id) : prev) : [...prev, id]
    );
  };

  const isComplete = Boolean(
    styles.length > 0 && metal && shape && carat && contact.fullName && contact.emailId && contact.mobileNumber
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) return;
    setStatus("sending");
    setError("");

    try {
      const summary = `Custom Ring Design — Styles: ${styles.join(", ")}, Metal: ${metal}, Shape: ${shape}, Carat: ${carat}. Client Notes: ${notes || "None"}`;
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/leads/enquiry`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: contact.fullName,
            emailId: contact.emailId,
            mobileNumber: contact.mobileNumber,
            customerNotes: summary,
          }),
        }
      ).catch(() => null);

      setStatus("done");
    } catch {
      setStatus("done");
    }
  };

  if (status === "done") {
    return (
      <div className="max-w-content mx-auto px-6 md:px-8 py-24 text-center">
        <div className="max-w-md mx-auto space-y-4 bg-ivory-pure border border-border-subtle p-8 md:p-12 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#1B3B30] text-ivory flex items-center justify-center mx-auto">
            <Check size={20} />
          </div>
          <p className="eyebrow">Design Received</p>
          <h1 className="font-serif text-3xl text-ink">Your Custom Blueprint is Logged</h1>
          <p className="text-xs text-ink-muted leading-relaxed">
            Our master gemologist will review your selected geometry ({shape}, {carat}, {metal}) and contact you via WhatsApp with a 3D CAD render and transparent quotation within 24 hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto px-6 md:px-8 py-8 md:py-16">
      <Breadcrumbs items={[{ label: "Design Your Own" }]} />

      <div className="max-w-2xl my-8 space-y-3">
        <p className="eyebrow">Atelier Studio</p>
        <h1 className="font-serif text-3xl md:text-5xl text-ink">Design Your Own Ring</h1>
        <p className="text-sm text-ink-muted leading-relaxed">
          Configure your setting style, precious metal, and lab diamond geometry. See your piece update in real-time 3D, then submit for a tailored atelier quote.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 pt-6">
        {/* Left: Configuration Steps */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-10">
          {/* 1. Style Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-ink">
                1. Select Setting Style
              </h2>
              <span className="text-[11px] text-ink-subtle">Combine one or more styles</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {STYLES.map((s) => {
                const active = styles.includes(s.id);
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => toggleStyle(s.id)}
                    className={`p-3.5 text-left border transition-all text-xs ${
                      active
                        ? "border-ink bg-ivory-pure shadow-sm"
                        : "border-border-subtle bg-ivory hover:border-ink/50"
                    }`}
                  >
                    <p className="font-serif text-sm font-medium text-ink">{s.label}</p>
                    <p className="text-[11px] text-ink-subtle mt-0.5 leading-snug">{s.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Metal Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-ink">
                2. Select Metal & Purity
              </h2>
              <span className="text-[11px] text-ink-subtle">18K Certified Gold or 92.5 Silver</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {METALS.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMetal(m.id)}
                  className={`px-4 py-2.5 text-xs border transition-all font-medium ${
                    metal === m.id
                      ? "border-ink bg-ink text-ivory"
                      : "border-border-subtle bg-ivory-pure text-ink hover:border-ink"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Diamond Shape */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-ink">
                3. Choose Center Stone Shape
              </h2>
              <span className="text-[11px] text-ink-subtle">IGI Certified Lab-Grown</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {SHAPES.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setShape(s)}
                  className={`px-4 py-2.5 text-xs border transition-all font-medium ${
                    shape === s
                      ? "border-ink bg-ink text-ivory"
                      : "border-border-subtle bg-ivory-pure text-ink hover:border-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Carat Weight */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-ink">
                4. Approximate Carat Weight
              </h2>
              <span className="text-[11px] text-ink-subtle">Custom sizes also available</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {CARATS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCarat(c)}
                  className={`px-4 py-2.5 text-xs border transition-all font-medium ${
                    carat === c
                      ? "border-ink bg-ink text-ivory"
                      : "border-border-subtle bg-ivory-pure text-ink hover:border-ink"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Contact Details */}
          <div className="space-y-4 pt-4 border-t border-border-subtle">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-ink">
              5. Your Details for Concierge Estimate
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                required
                type="text"
                placeholder="Full Name *"
                value={contact.fullName}
                onChange={(e) => setContact({ ...contact, fullName: e.target.value })}
                className="px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink"
              />
              <input
                required
                type="email"
                placeholder="Email Address *"
                value={contact.emailId}
                onChange={(e) => setContact({ ...contact, emailId: e.target.value })}
                className="px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink"
              />
              <input
                required
                type="tel"
                placeholder="Mobile Number (WhatsApp) *"
                value={contact.mobileNumber}
                onChange={(e) => setContact({ ...contact, mobileNumber: e.target.value })}
                className="sm:col-span-2 px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink"
              />
              <textarea
                rows={3}
                placeholder="Specific preferences (prong style, budget, engraving, target date)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="sm:col-span-2 px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink"
              />
            </div>
          </div>

          {error && <p className="text-xs text-[#B93826]">{error}</p>}

          <button
            type="submit"
            disabled={!isComplete || status === "sending"}
            className="btn-primary w-full text-xs font-semibold py-4"
          >
            {status === "sending" ? "Sending Design..." : "Submit My Custom Design"}
          </button>
        </form>

        {/* Right: Sticky 3D Preview */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28 border border-border-subtle bg-ivory-pure p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <p className="eyebrow">Real-Time 3D Stage</p>
              <span className="text-[11px] text-ink-subtle flex items-center gap-1">
                <Sparkles size={12} className="text-champagne-accessible" /> Interactive View
              </span>
            </div>

            <div className="aspect-square bg-ivory overflow-hidden relative border border-border-subtle">
              <RingPreview
                metal={metal}
                carat={carat}
                shape={shape}
                styles={styles}
              />
            </div>

            {/* Selection Summary Pill */}
            <div className="space-y-1.5 text-xs border-t border-border-subtle pt-3 text-ink-muted">
              <div className="flex justify-between">
                <span>Diamond Shape:</span>
                <span className="font-medium text-ink">{shape}</span>
              </div>
              <div className="flex justify-between">
                <span>Selected Metal:</span>
                <span className="font-medium text-ink">{metal.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between">
                <span>Carat Weight:</span>
                <span className="font-medium text-ink">{carat}</span>
              </div>
              <div className="flex justify-between">
                <span>Setting Style:</span>
                <span className="font-medium text-ink uppercase">{styles.join(" + ")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
