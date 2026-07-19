"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function ContactPage() {
  const [form, setForm] = useState({ fullName: "", emailId: "", mobileNumber: "", customerNotes: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      await api.post("/leads/enquiry", form);
      setStatus("done");
    } catch (err: any) {
      setStatus("error");
      setError(err.message);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-24">
      <p className="eyebrow mb-2">Contact</p>
      <h1 className="font-display text-3xl mb-3">Book a Consultation</h1>
      <p className="text-sm text-ink/60 mb-10">
        Reach our concierge at aryora.legacy@hotmail.com or +91 8808828646, or send an enquiry below.
      </p>

      {status === "done" ? (
        <p className="text-sm text-emerald">Thank you — our concierge team will reach out shortly.</p>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <input required placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full border border-black/10 px-3 py-2 bg-transparent" />
          <input required type="email" placeholder="Email" value={form.emailId} onChange={(e) => setForm({ ...form, emailId: e.target.value })} className="w-full border border-black/10 px-3 py-2 bg-transparent" />
          <input required placeholder="Mobile Number" value={form.mobileNumber} onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })} className="w-full border border-black/10 px-3 py-2 bg-transparent" />
          <textarea required placeholder="How can we help?" rows={4} value={form.customerNotes} onChange={(e) => setForm({ ...form, customerNotes: e.target.value })} className="w-full border border-black/10 px-3 py-2 bg-transparent" />
          {status === "error" && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={status === "sending"} className="btn-primary w-full">{status === "sending" ? "Sending…" : "Send Enquiry"}</button>
        </form>
      )}
    </div>
  );
}
