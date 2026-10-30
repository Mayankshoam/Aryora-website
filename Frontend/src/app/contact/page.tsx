"use client";

import { useState } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Mail, Phone, MapPin, MessageCircle, Check } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    fullName: "",
    emailId: "",
    mobileNumber: "",
    customerNotes: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/leads/enquiry`,
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
      <Breadcrumbs items={[{ label: "Concierge & Contact" }]} />

      <div className="max-w-xl my-6 space-y-2">
        <p className="eyebrow">Client Support & Concierge</p>
        <h1 className="font-serif text-3xl md:text-5xl text-ink">Connect with Aryora</h1>
        <p className="text-sm text-ink-muted leading-relaxed">
          Whether inquiring about a bespoke bridal commission, IGI grading verification, or boutique visit, our Lucknow atelier is at your service.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 pt-6">
        {/* Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-border-subtle bg-ivory-pure p-8 space-y-6 shadow-sm">
            <h2 className="font-serif text-2xl text-ink pb-3 border-b border-border-subtle">
              Atelier Information
            </h2>

            <div className="space-y-4 text-xs md:text-sm text-ink-muted">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-champagne-accessible flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-ink">Boutique & Atelier</p>
                  <p>Lucknow, Uttar Pradesh, India</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={18} className="text-champagne-accessible flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-ink">Concierge Direct</p>
                  <a href="tel:+918808828646" className="hover:text-ink underline">
                    +91 8808828646
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={18} className="text-champagne-accessible flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-ink">Email Correspondence</p>
                  <a href="mailto:aryora.legacy@hotmail.com" className="hover:text-ink underline">
                    aryora.legacy@hotmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border-subtle">
              <a
                href="https://wa.me/918808828646?text=Hello%20Aryora%2C%20I%20would%20like%20to%20speak%20with%20your%20design%20concierge."
                target="_blank"
                rel="noreferrer"
                className="btn-primary w-full text-xs flex items-center justify-center gap-2"
              >
                <MessageCircle size={15} /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Enquiry Form */}
        <div className="lg:col-span-7">
          <div className="border border-border-subtle bg-ivory-pure p-8 space-y-6 shadow-sm">
            <h2 className="font-serif text-2xl text-ink pb-3 border-b border-border-subtle">
              Send an Enquiry
            </h2>

            {status === "done" ? (
              <div className="text-center py-12 space-y-3 bg-champagne-subtle p-6 border border-champagne-light">
                <div className="w-12 h-12 rounded-full bg-[#1B3B30] text-ivory flex items-center justify-center mx-auto">
                  <Check size={20} />
                </div>
                <h3 className="font-serif text-2xl text-ink">Enquiry Dispatched</h3>
                <p className="text-xs text-ink-muted max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out. Our concierge will review your message and reply via WhatsApp or email within a few hours.
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
                      placeholder="Your Name"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-medium text-ink mb-1">
                      Mobile Number *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="+91 88088 28646"
                      value={form.mobileNumber}
                      onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium text-ink mb-1">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="email@example.com"
                    value={form.emailId}
                    onChange={(e) => setForm({ ...form, emailId: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium text-ink mb-1">
                    How can we assist you? *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about the piece you are considering or your timeline..."
                    value={form.customerNotes}
                    onChange={(e) => setForm({ ...form, customerNotes: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-border-subtle bg-ivory focus:outline-none focus:border-ink"
                  />
                </div>

                {error && <p className="text-xs text-[#B93826]">{error}</p>}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="btn-primary w-full text-xs font-semibold py-4"
                >
                  {status === "sending" ? "Dispatching..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
