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
          <div className="w-12 h-12 rounded-full bg-[#108474] text-white flex items-center justify-center mx-auto shadow-sm">
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
        <p className="eyebrow">Custom Jewellery Studio</p>
        <h1 className="font-serif text-3xl md:text-5xl text-ink">Design Your Own Ring</h1>
        <p className="text-sm text-ink-muted leading-relaxed">
          Configure your setting style, precious metal, and lab diamond geometry. See your piece update in real-time 3D, then submit for a tailored jewellery quote.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 pt-6">
        {/* Left: Configuration Steps */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-10">
          {/* 1. Style Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E0D8]">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
                1. Select Setting Style
              </h2>
              <span className="text-[11px] text-[#666666]">Combine one or more styles</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {STYLES.map((s) => {
                const active = styles.includes(s.id);
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => toggleStyle(s.id)}
                    className={`p-3.5 text-left border rounded-xl transition-all text-xs cursor-pointer ${
                      active
                        ? "border-[#0E382B] bg-[#FAF7F2] shadow-sm ring-1 ring-[#0E382B]"
                        : "border-[#E5E0D8] bg-white hover:border-[#0E382B]/60"
                    }`}
                  >
                    <p className="font-serif text-sm font-medium text-[#111111]">{s.label}</p>
                    <p className="text-[11px] text-[#666666] mt-0.5 leading-snug">{s.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Metal Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E0D8]">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
                2. Select Precious Metal
              </h2>
              <span className="text-[11px] text-[#666666]">18K Certified Gold or 925 Silver</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {METALS.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMetal(m.id)}
                  className={`px-4 py-2.5 text-xs border rounded-xl transition-all font-medium cursor-pointer ${
                    metal === m.id
                      ? "border-[#0E382B] bg-[#0E382B] text-white shadow-sm"
                      : "border-[#E5E0D8] bg-white text-[#111111] hover:border-[#0E382B]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Diamond Shape */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E0D8]">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
                3. Choose Center Stone Shape
              </h2>
              <span className="text-[11px] text-[#666666]">IGI Certified Lab-Grown</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {SHAPES.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setShape(s)}
                  className={`px-4 py-2.5 text-xs border rounded-xl transition-all font-medium cursor-pointer ${
                    shape === s
                      ? "border-[#0E382B] bg-[#0E382B] text-white shadow-sm"
                      : "border-[#E5E0D8] bg-white text-[#111111] hover:border-[#0E382B]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Carat Weight */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E0D8]">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
                4. Approximate Carat Weight
              </h2>
              <span className="text-[11px] text-[#666666]">Custom sizes also available</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {CARATS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCarat(c)}
                  className={`px-4 py-2.5 text-xs border rounded-xl transition-all font-medium cursor-pointer ${
                    carat === c
                      ? "border-[#0E382B] bg-[#0E382B] text-white shadow-sm"
                      : "border-[#E5E0D8] bg-white text-[#111111] hover:border-[#0E382B]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Contact Details */}
          <div className="space-y-4 pt-4 border-t border-[#E5E0D8]">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
              5. Contact Details for Estimation & Blueprint
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                required
                type="text"
                placeholder="Full Name *"
                value={contact.fullName}
                onChange={(e) => setContact({ ...contact, fullName: e.target.value })}
                className="px-3.5 py-2.5 text-xs border border-[#E5E0D8] rounded-xl bg-white text-[#111111] focus:outline-none focus:border-[#0E382B]"
              />
              <input
                required
                type="email"
                placeholder="Email Address *"
                value={contact.emailId}
                onChange={(e) => setContact({ ...contact, emailId: e.target.value })}
                className="px-3.5 py-2.5 text-xs border border-[#E5E0D8] rounded-xl bg-white text-[#111111] focus:outline-none focus:border-[#0E382B]"
              />
              <input
                required
                type="tel"
                placeholder="Mobile Number (WhatsApp) *"
                value={contact.mobileNumber}
                onChange={(e) => setContact({ ...contact, mobileNumber: e.target.value })}
                className="sm:col-span-2 px-3.5 py-2.5 text-xs border border-[#E5E0D8] rounded-xl bg-white text-[#111111] focus:outline-none focus:border-[#0E382B]"
              />
              <textarea
                rows={3}
                placeholder="Specific preferences (prong style, budget, engraving, target date)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="sm:col-span-2 px-3.5 py-2.5 text-xs border border-[#E5E0D8] rounded-xl bg-white text-[#111111] focus:outline-none focus:border-[#0E382B]"
              />
            </div>
          </div>

          {error && <p className="text-xs text-[#B93826]">{error}</p>}

          <button
            type="submit"
            disabled={!isComplete || status === "sending"}
            className="w-full bg-[#0E382B] hover:bg-[#144636] text-white text-xs uppercase tracking-wider font-medium py-4 rounded-xl shadow-md transition-all cursor-pointer"
          >
            {status === "sending" ? "Sending Design..." : "Submit My Custom Design"}
          </button>
        </form>

        {/* Right: Sticky 3D Preview */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28 rounded-2xl border border-[#E5E0D8] bg-[#FAF7F2] p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#0E382B]">
                Real-Time 3D Stage
              </p>
              <span className="text-[11px] text-[#666666] flex items-center gap-1 font-medium">
                <Sparkles size={12} className="text-[#C09981]" /> 360° Studio View
              </span>
            </div>

            <div className="aspect-square bg-white rounded-xl overflow-hidden relative border border-[#E5E0D8] shadow-xs">
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
