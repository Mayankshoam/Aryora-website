"use client";

import { useState } from "react";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Check, Calendar, Phone, ShieldCheck } from "lucide-react";

export default function BridalPage() {
  const [form, setForm] = useState({
    fullName: "",
    emailId: "",
    mobileNumber: "",
    weddingDate: "",
    customerNotes: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/leads/appointment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      ).catch(() => null);
      setStatus("done");
    } catch {
      setStatus("done");
    }
  };

  return (
    <div className="max-w-content mx-auto px-6 md:px-8 py-8 md:py-16">
      <Breadcrumbs items={[{ label: "Bridal Heirloom" }]} />

      {/* Hero Banner */}
      <div className="grid lg:grid-cols-12 gap-12 items-center my-8 md:my-12">
        <div className="lg:col-span-6 space-y-4">
          <p className="eyebrow">Awadhi Royal Heirloom</p>
          <h1 className="font-serif text-4xl md:text-5xl text-ink leading-tight">
            Heritage Bridal Haute Joaillerie
          </h1>
          <p className="text-sm md:text-base text-ink-muted leading-relaxed">
            From regal solitaire engagement rings to multi-tier heirloom necklaces set with certified emeralds and diamonds, Aryora crafts one-of-a-kind wedding jewellery born to be passed down through generations.
          </p>
          <div className="pt-2 flex items-center gap-6 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5 font-medium text-ink">
              <ShieldCheck size={16} className="text-champagne-accessible" /> 100% IGI Certified
            </span>
            <span className="flex items-center gap-1.5 font-medium text-ink">
              <Calendar size={16} className="text-champagne-accessible" /> Bespoke 4-Week Delivery
            </span>
          </div>
        </div>

        <div className="lg:col-span-6 relative aspect-[4/3] bg-ivory-muted border border-border-subtle overflow-hidden">
          <Image
            src="/images/collection-bridal.jpg"
            alt="Aryora Heritage Bridal Collection"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* Bridal Consultation Booking Box */}
      <div className="max-w-2xl mx-auto my-16 border border-border-subtle bg-ivory-pure p-8 md:p-12 shadow-sm">
        <div className="text-center mb-8 space-y-2">
          <p className="eyebrow">Personalized Atelier Service</p>
          <h2 className="font-serif text-3xl text-ink">Book a Private Bridal Consultation</h2>
          <p className="text-xs text-ink-muted leading-relaxed">
            Meet our master gemologists either virtually or in-person at our Lucknow boutique to discuss your vision, stone selection, and custom motifs.
          </p>
        </div>

        {status === "done" ? (
          <div className="text-center py-12 space-y-3 bg-champagne-subtle p-6 border border-champagne-light">
            <div className="w-12 h-12 rounded-full bg-[#1B3B30] text-ivory flex items-center justify-center mx-auto">
              <Check size={20} />
            </div>
            <h3 className="font-serif text-2xl text-ink">Consultation Request Received</h3>
            <p className="text-xs text-ink-muted leading-relaxed max-w-sm mx-auto">
              Our bridal concierge will connect with you via WhatsApp/call within 24 hours to confirm your appointment time and share initial lookbooks.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-ink mb-1">
                  Full Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Radhika Verma"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-ink mb-1">
                  Mobile Number (WhatsApp) *
                </label>
                <input
                  required
                  type="tel"
                  placeholder="+91 9876543210"
                  value={form.mobileNumber}
                  onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-ink mb-1">
                  Email Address *
                </label>
                <input
                  required
                  type="email"
                  placeholder="radhika@example.com"
                  value={form.emailId}
                  onChange={(e) => setForm({ ...form, emailId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-ink mb-1">
                  Anticipated Wedding / Event Date
                </label>
                <input
                  type="text"
                  placeholder="e.g. December 2026"
                  value={form.weddingDate}
                  onChange={(e) => setForm({ ...form, weddingDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-ink mb-1">
                Tell us about your bridal vision (budget, stones, specific heirloom wishes)
              </label>
              <textarea
                rows={3}
                placeholder="Share any details or design inspirations you have in mind..."
                value={form.customerNotes}
                onChange={(e) => setForm({ ...form, customerNotes: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink"
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="btn-primary w-full text-xs font-semibold py-4"
            >
              {status === "sending" ? "Submitting Request..." : "Request Private Consultation"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
