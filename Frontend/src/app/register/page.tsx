"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CheckCircle2 } from "lucide-react";
import { lookupPincode } from "@/lib/pincode";
import { saveCustomerToSupabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    pincode: "",
    city: "",
    state: "Uttar Pradesh",
  });
  const [isDetectingPin, setIsDetectingPin] = useState(false);
  const [pinDetectedMsg, setPinDetectedMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-detect City & State when 6-digit PIN code is typed
  useEffect(() => {
    const cleanPin = form.pincode.replace(/\D/g, "");
    if (cleanPin.length === 6) {
      setIsDetectingPin(true);
      lookupPincode(cleanPin).then((result) => {
        setIsDetectingPin(false);
        if (result) {
          setForm((prev) => ({
            ...prev,
            city: result.city,
            state: result.state,
          }));
          setPinDetectedMsg(`Auto-detected: ${result.city}, ${result.state}`);
        }
      });
    } else {
      setPinDetectedMsg("");
    }
  }, [form.pincode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Save customer profile to Supabase & local vault
      await saveCustomerToSupabase({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        source: "client_portal_register",
      });

      // 2. Dispatch to backend if available
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/register`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          }
        );
        const data = await res.json().catch(() => ({}));
        if (data.accessToken) {
          localStorage.setItem("aryora_token", data.accessToken);
        }
      } catch {
        localStorage.setItem("aryora_token", "demo_token_session");
      }

      router.push("/account");
    } catch {
      localStorage.setItem("aryora_token", "demo_token_session");
      router.push("/account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-content mx-auto px-6 md:px-8 py-8 md:py-16">
      <Breadcrumbs items={[{ label: "Register" }]} />

      <div className="max-w-lg mx-auto my-12 border border-[#DDD8D0] bg-[#FAF7F2] p-8 md:p-10 shadow-sm rounded-xl">
        <div className="text-center space-y-2 mb-8">
          <p className="eyebrow">Join The Circle</p>
          <h1 className="font-serif text-3xl text-[#111111]">Create an Account</h1>
          <p className="text-xs text-[#666666]">
            Enjoy priority access to private collections, saved wishlists, and seamless bespoke design tracking.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
              Full Name *
            </label>
            <input
              required
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="e.g. Priyanshu Sharma"
              className="w-full px-3.5 py-2.5 text-xs border border-[#DDD8D0] rounded-lg bg-white focus:outline-none focus:border-[#0E382B]"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
                Email Address *
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="priyanshu@example.com"
                className="w-full px-3.5 py-2.5 text-xs border border-[#DDD8D0] rounded-lg bg-white focus:outline-none focus:border-[#0E382B]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
                Mobile Number *
              </label>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 text-xs border border-[#DDD8D0] rounded-lg bg-white focus:outline-none focus:border-[#0E382B]"
              />
            </div>
          </div>

          {/* PIN code with Auto-detection */}
          <div className="border border-[#DDD8D0] p-3.5 rounded-lg bg-white space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E382B]">
                PIN Code (Auto-Detect City/State) *
              </label>
              {pinDetectedMsg && (
                <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={11} /> {pinDetectedMsg}
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <input
                  required
                  type="text"
                  maxLength={6}
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  placeholder="e.g. 226001"
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-[#C5A880] rounded bg-[#FFFDF5] focus:outline-none"
                />
              </div>
              <div className="col-span-1">
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="City"
                  className="w-full px-3 py-2 text-xs border border-[#DDD8D0] rounded bg-white focus:outline-none"
                />
              </div>
              <div className="col-span-1">
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="State"
                  className="w-full px-3 py-2 text-xs border border-[#DDD8D0] rounded bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
              Create Password *
            </label>
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 8 characters"
              className="w-full px-3.5 py-2.5 text-xs border border-[#DDD8D0] rounded-lg bg-white focus:outline-none focus:border-[#0E382B]"
            />
          </div>

          {error && <p className="text-xs text-[#B93826]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0E382B] hover:bg-[#144636] text-white text-xs uppercase tracking-wider font-semibold py-3.5 mt-2 rounded-lg shadow-sm transition-colors"
          >
            {loading ? "Creating Account & Syncing..." : "Create Account"}
          </button>
        </form>

        <p className="text-xs text-center text-[#666666] mt-6 pt-6 border-t border-[#DDD8D0]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#0E382B] underline font-medium hover:text-[#144636]">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
