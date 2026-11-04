"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CheckCircle2, Sparkles, Tag, ShieldCheck, ArrowRight } from "lucide-react";
import { loginWithMobile, isValidIndianMobile } from "@/lib/customerStore";
import { lookupPincode } from "@/lib/pincode";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const clean = form.mobile.replace(/\D/g, "");
    if (!isValidIndianMobile(clean)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      setLoading(false);
      return;
    }

    try {
      loginWithMobile(clean, form.fullName);
      router.push("/account");
    } catch (err: any) {
      setError(err.message || "Registration failed.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-content mx-auto px-6 md:px-8 py-8 md:py-16">
      <Breadcrumbs items={[{ label: "Register" }]} />

      <div className="max-w-lg mx-auto my-12 border border-[#E5E0D8] bg-[#FAF7F2] p-8 md:p-10 shadow-sm rounded-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-white border border-[#E5E0D8] px-3 py-1 rounded-full text-[10px] font-medium text-[#0E382B]">
            <Sparkles size={11} className="text-[#C09981]" />
            <span>Welcome Privilege · 10% First Order Benefit</span>
          </div>
          <h1 className="font-serif text-3xl text-[#111111]">Create Customer Account</h1>
          <p className="text-xs text-[#666666]">
            Fast mobile registration to unlock your unique Customer ID and member privileges.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                placeholder="9876543210"
                className="flex-1 px-3.5 py-2.5 text-xs border border-[#E5E0D8] rounded-xl bg-white text-[#111111] font-mono focus:outline-none focus:border-[#0E382B]"
              />
            </div>
          </div>

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
              className="w-full px-3.5 py-2.5 text-xs border border-[#E5E0D8] rounded-xl bg-white focus:outline-none focus:border-[#0E382B]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
              Email Address (Optional)
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="priyanshu@example.com"
              className="w-full px-3.5 py-2.5 text-xs border border-[#E5E0D8] rounded-xl bg-white focus:outline-none focus:border-[#0E382B]"
            />
          </div>

          {/* PIN code with Auto-detection */}
          <div className="border border-[#E5E0D8] p-3.5 rounded-xl bg-white space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E382B]">
                PIN Code (Auto-Detect City/State)
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
                  type="text"
                  maxLength={6}
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  placeholder="226001"
                  className="w-full px-3 py-2 text-xs font-mono font-medium border border-[#E5E0D8] rounded-lg bg-[#FAF7F2] focus:outline-none focus:border-[#0E382B]"
                />
              </div>
              <div className="col-span-1">
                <input
                  type="text"
                  value={form.city}
                  readOnly
                  placeholder="City"
                  className="w-full px-3 py-2 text-xs border border-[#E5E0D8] rounded-lg bg-stone-50 text-stone-700"
                />
              </div>
              <div className="col-span-1">
                <input
                  type="text"
                  value={form.state}
                  readOnly
                  placeholder="State"
                  className="w-full px-3 py-2 text-xs border border-[#E5E0D8] rounded-lg bg-stone-50 text-stone-700"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0E382B] hover:bg-[#144636] text-white text-xs uppercase tracking-wider font-medium py-3.5 mt-2 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? "Creating Account..." : "Create Customer Account"}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <p className="text-xs text-center text-[#666666] pt-4 border-t border-[#E5E0D8]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#0E382B] underline font-medium hover:text-[#144636]">
            Sign In with Mobile
          </Link>
        </p>
      </div>
    </div>
  );
}
