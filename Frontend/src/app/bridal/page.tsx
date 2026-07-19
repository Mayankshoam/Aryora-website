"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function BridalPage() {
  const [form, setForm] = useState({ fullName: "", emailId: "", mobileNumber: "", customerNotes: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      await api.post("/leads/appointment", form);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-24">
      <p className="eyebrow mb-3">Bridal</p>
      <h1 className="font-display text-4xl mb-8">Heritage Bridal Collection</h1>
      <p className="text-ink/70 leading-relaxed mb-14">
        Book a private consultation with our bridal specialists to design a piece that carries your
        story — from solitaire selection to custom heirloom sets.
      </p>

      <h2 className="font-display text-xl mb-4">Book an Appointment</h2>
      {status === "done" ? (
        <p className="text-sm text-emerald">Appointment request received — we&rsquo;ll confirm a time shortly.</p>
      ) : (
        <form onSubmit={submit} className="space-y-4 max-w-md">
          <input required placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full border border-black/10 px-3 py-2 bg-transparent" />
          <input required type="email" placeholder="Email" value={form.emailId} onChange={(e) => setForm({ ...form, emailId: e.target.value })} className="w-full border border-black/10 px-3 py-2 bg-transparent" />
          <input required placeholder="Mobile Number" value={form.mobileNumber} onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })} className="w-full border border-black/10 px-3 py-2 bg-transparent" />
          <textarea placeholder="Tell us about the occasion" rows={3} value={form.customerNotes} onChange={(e) => setForm({ ...form, customerNotes: e.target.value })} className="w-full border border-black/10 px-3 py-2 bg-transparent" />
          {status === "error" && <p className="text-sm text-red-600">Something went wrong — please try again.</p>}
          <button type="submit" disabled={status === "sending"} className="btn-primary w-full">{status === "sending" ? "Sending…" : "Request Appointment"}</button>
        </form>
      )}
    </div>
  );
}
