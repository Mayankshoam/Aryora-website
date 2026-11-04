"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Sparkles, Phone, ShieldCheck, Tag, ArrowRight } from "lucide-react";
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
      setError("Please enter a valid 10-digit Indian mobile number.");
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

      <div className="max-w-md mx-auto my-12 border border-[#E5E0D8] bg-[#FAF7F2] p-8 md:p-10 shadow-sm rounded-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-white border border-[#E5E0D8] px-3 py-1 rounded-full text-[10px] font-medium text-[#0E382B]">
            <Sparkles size={11} className="text-[#C09981]" />
            <span>Welcome Privilege · 10% First Order Benefit</span>
          </div>
          <h1 className="font-serif text-3xl text-[#111111]">Client Sign In</h1>
          <p className="text-xs text-[#666666]">
            Sign in with your mobile number to view orders, download invoices, and manage your account.
          </p>
        </div>

        <form onSubmit={handleMobileSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
              Mobile Number (10 Digits) *
            </label>
            <div className="flex items-center gap-2">
              <div className="bg-white border border-[#E5E0D8] px-3 py-2.5 rounded-xl text-xs font-medium text-[#111111]">
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
                className="flex-1 px-3.5 py-2.5 text-xs border border-[#E5E0D8] rounded-xl bg-white text-[#111111] font-mono focus:outline-none focus:border-[#0E382B]"
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
              className="w-full px-3.5 py-2.5 text-xs border border-[#E5E0D8] rounded-xl bg-white text-[#111111] focus:outline-none focus:border-[#0E382B]"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0E382B] hover:bg-[#144636] text-white text-xs uppercase tracking-wider font-medium py-3.5 mt-2 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? "Signing In..." : "Continue to Account"}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="pt-4 border-t border-[#E5E0D8] text-center space-y-2">
          <p className="text-[11px] text-[#666666]">
            Signing in automatically secures your customer account and applies your welcome privilege.
          </p>
        </div>
      </div>
    </div>
  );
}
