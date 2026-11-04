"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Sparkles, Phone, ShieldCheck, Tag } from "lucide-react";
import { loginWithMobile, isValidIndianMobile } from "@/lib/customerStore";

export default function LoginPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const clean = mobile.replace(/\D/g, "");
    if (!isValidIndianMobile(clean)) {
      setError("Kripya 10-digit ka valid Indian mobile number enter karein.");
      setLoading(false);
      return;
    }

    try {
      loginWithMobile(clean, name);
      router.push("/account");
    } catch (err: any) {
      setError(err.message || "Failed to sign in.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-content mx-auto px-6 md:px-8 py-8 md:py-16">
      <Breadcrumbs items={[{ label: "Sign In" }]} />

      <div className="max-w-md mx-auto my-12 border border-[#DDD8D0] bg-[#FAF7F2] p-8 md:p-10 shadow-sm rounded-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-[#FFFDF5] border border-[#C5A880] px-3 py-1 rounded-full text-[10px] font-bold text-[#0E382B]">
            <Tag size={11} className="text-[#C5A880]" />
            <span>Flat 10% Welcome Discount (AYOR10)</span>
          </div>
          <h1 className="font-serif text-3xl text-[#111111]">Client Portal Sign In</h1>
          <p className="text-xs text-[#666666]">
            Sign in with your mobile number to view orders, download invoices, and access your verified profile.
          </p>
        </div>

        <form onSubmit={handleMobileSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
              Mobile Number (10 Digits) *
            </label>
            <div className="flex items-center gap-2">
              <div className="bg-white border border-[#DDD8D0] px-3 py-2.5 rounded-lg text-xs font-semibold text-[#111111]">
                🇮🇳 +91
              </div>
              <input
                required
                type="tel"
                maxLength={10}
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value);
                  if (error) setError("");
                }}
                placeholder="9876543210"
                className="flex-1 px-3.5 py-2.5 text-xs border border-[#C5A880] rounded-lg bg-white text-[#111111] font-mono font-medium focus:outline-none focus:ring-1 focus:ring-[#0E382B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
              Full Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ananya Roy"
              className="w-full px-3.5 py-2.5 text-xs border border-[#DDD8D0] rounded-lg bg-white text-[#111111] focus:outline-none focus:border-[#0E382B]"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0E382B] hover:bg-[#144636] text-white text-xs uppercase tracking-wider font-semibold py-3.5 mt-2 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? "Signing In..." : "Instant Access (Without OTP)"}</span>
            <Sparkles size={14} className="text-[#C5A880]" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#DDD8D0] text-center space-y-2">
          <p className="text-[11px] text-[#666666]">
            New to Ayor? Logging in automatically generates your unique Customer ID and activates your 10% Welcome Discount.
          </p>
        </div>
      </div>
    </div>
  );
}
