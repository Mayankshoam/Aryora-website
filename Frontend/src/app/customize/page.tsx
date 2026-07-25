"use client";

import { useState } from "react";
import { api } from "@/lib/api";

const STYLES = [
  { id: "solitaire", label: "Solitaire", desc: "A single stone, timeless and clean" },
  { id: "halo", label: "Halo", desc: "Centre stone framed by a circle of smaller diamonds" },
  { id: "three-stone", label: "Three Stone", desc: "Past, present, future — three stones in a row" },
  { id: "vintage", label: "Vintage", desc: "Intricate, heritage-inspired detailing" },
  { id: "split-shank", label: "Split Shank", desc: "Band splits into two as it meets the centre stone" },
  { id: "eternity", label: "Eternity", desc: "Diamonds set continuously around the band" },
];

const METALS = [
  { id: "YELLOW_GOLD", label: "Yellow Gold" },
  { id: "WHITE_GOLD", label: "White Gold" },
  { id: "ROSE_GOLD", label: "Rose Gold" },
  { id: "CHAMPAGNE_GOLD", label: "Champagne Gold" },
  { id: "SILVER_925", label: "92.5 Silver" },
];

const SHAPES = ["Round", "Princess", "Emerald", "Oval", "Pear", "Cushion", "Marquise", "Radiant"];

const CARATS = ["Below 0.5ct", "0.5ct – 1ct", "1ct – 2ct", "2ct and above", "Not sure yet"];

export default function CustomizePage() {
  const [style, setStyle] = useState("");
  const [metal, setMetal] = useState("");
  const [shape, setShape] = useState("");
  const [carat, setCarat] = useState("");
  const [contact, setContact] = useState({ fullName: "", emailId: "", mobileNumber: "" });
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const complete = style && metal && shape && carat && contact.fullName && contact.emailId && contact.mobileNumber;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!complete) return;
    setStatus("sending");
    setError("");
    try {
      const summary = `Custom Ring Enquiry — Style: ${STYLES.find((s) => s.id === style)?.label}, Metal: ${METALS.find((m) => m.id === metal)?.label}, Diamond Shape: ${shape}, Carat Range: ${carat}.${notes ? " Notes: " + notes : ""}`;
      await api.post("/leads/enquiry", {
        fullName: contact.fullName,
        emailId: contact.emailId,
        mobileNumber: contact.mobileNumber,
        customerNotes: summary,
      });
      setStatus("done");
    } catch (err: any) {
      setStatus("error");
      setError(err.message);
    }
  }

  if (status === "done") {
    return (
      <div className="max-w-xl mx-auto px-6 py-32 text-center">
        <p className="eyebrow mb-3">Design Received</p>
        <h1 className="font-display text-3xl mb-4">Thank you for designing with Aryora</h1>
        <p className="text-ink/70 leading-relaxed">
          Our design concierge will review your selections and reach out within 24 hours with a
          quote and next steps.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="eyebrow mb-3">Design Your Own</p>
      <h1 className="font-display text-4xl mb-4">Build Your Ring</h1>
      <p className="text-ink/70 leading-relaxed mb-14 max-w-2xl">
        Choose a setting, metal, and diamond shape below. Our design concierge will follow up with
        a personalised quote — no two Aryora pieces are made the same way twice.
      </p>

      <form onSubmit={submit} className="space-y-14">
        {/* Style */}
        <div>
          <h2 className="font-display text-lg mb-1">1. Choose a Setting Style</h2>
          <p className="text-xs text-ink/50 mb-5">Select the overall shape of your ring</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {STYLES.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`text-left border p-4 transition-colors ${
                  style === s.id ? "border-emerald bg-emerald/5" : "border-black/10 hover:border-black/30"
                }`}
              >
                <p className="font-display text-sm mb-1">{s.label}</p>
                <p className="text-xs text-ink/50 leading-snug">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Metal */}
        <div>
          <h2 className="font-display text-lg mb-1">2. Choose a Metal</h2>
          <p className="text-xs text-ink/50 mb-5">All metals available in 18K unless noted</p>
          <div className="flex flex-wrap gap-3">
            {METALS.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => setMetal(m.id)}
                className={`px-4 py-2 text-sm border transition-colors ${
                  metal === m.id ? "border-emerald bg-emerald text-ivory" : "border-black/10 hover:border-black/30"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Diamond shape */}
        <div>
          <h2 className="font-display text-lg mb-1">3. Choose a Diamond Shape</h2>
          <p className="text-xs text-ink/50 mb-5">Lab-grown, IGI certified</p>
          <div className="flex flex-wrap gap-3">
            {SHAPES.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setShape(s)}
                className={`px-4 py-2 text-sm border transition-colors ${
                  shape === s ? "border-emerald bg-emerald text-ivory" : "border-black/10 hover:border-black/30"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Carat range */}
        <div>
          <h2 className="font-display text-lg mb-1">4. Approximate Carat Weight</h2>
          <p className="text-xs text-ink/50 mb-5">A rough range is fine — we'll confirm exact weight together</p>
          <div className="flex flex-wrap gap-3">
            {CARATS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setCarat(c)}
                className={`px-4 py-2 text-sm border transition-colors ${
                  carat === c ? "border-emerald bg-emerald text-ivory" : "border-black/10 hover:border-black/30"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Contact + notes */}
        <div>
          <h2 className="font-display text-lg mb-1">5. Your Details</h2>
          <p className="text-xs text-ink/50 mb-5">So our design concierge can reach you with a quote</p>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              required
              placeholder="Full Name"
              value={contact.fullName}
              onChange={(e) => setContact({ ...contact, fullName: e.target.value })}
              className="border border-black/10 px-3 py-2 text-sm bg-transparent"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={contact.emailId}
              onChange={(e) => setContact({ ...contact, emailId: e.target.value })}
              className="border border-black/10 px-3 py-2 text-sm bg-transparent"
            />
            <input
              required
              placeholder="Mobile Number"
              value={contact.mobileNumber}
              onChange={(e) => setContact({ ...contact, mobileNumber: e.target.value })}
              className="md:col-span-2 border border-black/10 px-3 py-2 text-sm bg-transparent"
            />
            <textarea
              placeholder="Anything else you'd like us to know (budget, occasion, inspiration)?"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="md:col-span-2 border border-black/10 px-3 py-2 text-sm bg-transparent"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={!complete || status === "sending"} className="btn-primary w-full max-w-sm disabled:opacity-40">
          {status === "sending" ? "Sending…" : "Submit My Design"}
        </button>
        {!complete && <p className="text-xs text-ink/40">Complete all selections and your details to submit.</p>}
      </form>
    </div>
  );
}
