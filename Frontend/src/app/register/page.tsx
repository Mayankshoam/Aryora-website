"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "otp">("details");
  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitDetails(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post<{ userId: string }>("/auth/register", form);
      setUserId(res.userId);
      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post<{ accessToken: string }>("/auth/verify-otp", { userId, otp });
      localStorage.setItem("aryora_token", res.accessToken);
      router.push("/account");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <h1 className="font-display text-3xl mb-2">Create Your Account</h1>
      <p className="text-sm text-ink/60 mb-10">Join the Aryora Circle for early access and concierge care.</p>

      {step === "details" ? (
        <form onSubmit={submitDetails} className="space-y-5">
          <input required placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full border border-black/10 px-3 py-2 bg-transparent" />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-black/10 px-3 py-2 bg-transparent" />
          <input required placeholder="Mobile Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-black/10 px-3 py-2 bg-transparent" />
          <input required type="password" placeholder="Password (min 8 characters)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border border-black/10 px-3 py-2 bg-transparent" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Creating…" : "Create Account"}</button>
        </form>
      ) : (
        <form onSubmit={submitOtp} className="space-y-5">
          <p className="text-sm text-ink/60">We sent a 6-digit code to {form.email}.</p>
          <input required maxLength={6} placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full border border-black/10 px-3 py-2 bg-transparent tracking-widest text-center" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Verifying…" : "Verify & Continue"}</button>
        </form>
      )}
    </div>
  );
}
