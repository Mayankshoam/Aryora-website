"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  Package,
  Heart,
  User,
  LogOut,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  Lock,
  UploadCloud,
  Printer,
  X,
  AlertCircle,
  Sparkles,
  Phone,
  Eye,
} from "lucide-react";
import {
  CustomerProfile,
  CustomerInvoice,
  getActiveCustomer,
  loginWithMobile,
  updateCustomerProfile,
  submitCustomerPAN,
  logoutCustomer,
  getCustomerInvoices,
  maskPAN,
  createCustomerInvoice,
} from "@/lib/customerStore";
import { lookupPincode } from "@/lib/pincode";
import { BUSINESS_CONFIG } from "@/lib/config/business";

export default function AccountPage() {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "invoices" | "orders">("profile");
  const [mobileInput, setMobileInput] = useState("");
  const [loginError, setLoginError] = useState("");

  // Profile Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");

  // PAN KYC States
  const [panNumber, setPanNumber] = useState("");
  const [panCardholderName, setPanCardholderName] = useState("");
  const [panFileBase64, setPanFileBase64] = useState<string | null>(null);
  const [panFileName, setPanFileName] = useState("");
  const [panMsg, setPanMsg] = useState("");
  const [panErr, setPanErr] = useState("");
  const [isSubmittingPan, setIsSubmittingPan] = useState(false);

  // Invoices
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoice | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load customer on mount and listen to changes
  useEffect(() => {
    const refreshCustomer = () => {
      const active = getActiveCustomer();
      setCustomer(active);
      if (active) {
        setName(active.name || "");
        setEmail(active.email || "");
        setAddress(active.address || "");
        setPincode(active.pincode || "");
        setCity(active.city || "");
        setState(active.state || "Uttar Pradesh");
        setInvoices(getCustomerInvoices(active.customerId));
      }
    };

    refreshCustomer();
    window.addEventListener("ayor_customer_changed", refreshCustomer);
    return () => window.removeEventListener("ayor_customer_changed", refreshCustomer);
  }, []);

  // Auto-detect City & State when 6-digit PIN code is typed
  useEffect(() => {
    const cleanPin = pincode.replace(/\D/g, "");
    if (cleanPin.length === 6) {
      lookupPincode(cleanPin).then((res) => {
        if (res) {
          setCity(res.city);
          setState(res.state);
        }
      });
    }
  }, [pincode]);

  // Login handler without OTP
  const handleMobileLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = loginWithMobile(mobileInput);
      setCustomer(res.customer);
      setMobileInput("");
    } catch (err: any) {
      setLoginError(err.message || "Failed to login with mobile.");
    }
  };

  const handleLogout = () => {
    logoutCustomer();
    setCustomer(null);
  };

  // Update Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg("");
    setProfileErr("");
    try {
      const updated = updateCustomerProfile({
        name,
        email,
        address,
        pincode,
        city,
        state,
      });
      setCustomer(updated);
      setProfileMsg("Profile updated successfully!");
      setTimeout(() => setProfileMsg(""), 3500);
    } catch (err: any) {
      setProfileErr(err.message || "Failed to update profile.");
    }
  };

  // Handle PAN File Upload (max 5 MB)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPanErr("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setPanErr("File size must be less than 5 MB.");
      return;
    }

    setPanFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPanFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit PAN with Mandatory Upload & Name-Lock
  const handleSubmitPAN = (e: React.FormEvent) => {
    e.preventDefault();
    setPanMsg("");
    setPanErr("");

    if (!panFileBase64) {
      setPanErr("PAN card document upload is mandatory. Please attach a photo or PDF of your PAN.");
      return;
    }

    setIsSubmittingPan(true);
    setTimeout(() => {
      try {
        const verified = submitCustomerPAN(panNumber, panFileBase64, panCardholderName || name);
        setCustomer(verified);
        setName(verified.name);
        setPanMsg("✓ PAN Verified Successfully! Official name has been locked to verified PAN record.");
        setIsSubmittingPan(false);
      } catch (err: any) {
        setPanErr(err.message || "PAN verification failed.");
        setIsSubmittingPan(false);
      }
    }, 600);
  };

  // Sample Invoice Generator for instant inspection if none exist
  const handleCreateSampleInvoice = () => {
    if (!customer) return;
    const inv = createCustomerInvoice({
      orderNumber: `ARY-${Date.now().toString().slice(-6)}`,
      customer,
      items: [
        {
          id: "solitaire-emerald-01",
          name: "Emerald Cut Solitaire Ring (1.50ct)",
          purity: "18K (750)",
          metal: "Yellow Gold",
          weightGrams: 4.8,
          price: 145000,
          quantity: 1,
        },
      ],
      subtotal: 145000,
      discountAmount: customer.hasWelcomeDiscount ? 14500 : 0,
      totalAmount: customer.hasWelcomeDiscount ? 134415 : 149350,
      paymentMode: "UPI / Bank Transfer",
    });
    setInvoices([inv, ...invoices]);
    setSelectedInvoice(inv);
  };

  // GUEST LOGIN SCREEN IF NO ACTIVE SESSION
  if (!customer) {
    return (
      <div className="max-w-content mx-auto px-6 md:px-8 py-12 md:py-20">
        <Breadcrumbs items={[{ label: "Account" }]} />

        <div className="max-w-md mx-auto my-10 border border-[#DDD8D0] bg-[#FAF7F2] p-8 md:p-10 rounded-2xl shadow-sm text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-[#0E382B] text-white flex items-center justify-center mx-auto shadow-md">
            <User size={24} />
          </div>

          <div className="space-y-1">
            <p className="eyebrow text-[10px]">Client Atelier Access</p>
            <h1 className="font-serif text-3xl text-[#111111]">Client Portal Sign In</h1>
            <p className="text-xs text-[#666666]">
              Enter your mobile number to view past orders, official tax invoices, and manage your verified KYC profile.
            </p>
          </div>

          <form onSubmit={handleMobileLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
                Mobile Number *
              </label>
              <div className="flex items-center gap-2">
                <div className="bg-white border border-[#DDD8D0] px-3 py-2.5 rounded-lg text-xs font-semibold text-[#111111]">
                  🇮🇳 +91
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  placeholder="9876543210"
                  value={mobileInput}
                  onChange={(e) => setMobileInput(e.target.value)}
                  className="flex-1 bg-white border border-[#DDD8D0] px-3.5 py-2.5 rounded-lg text-xs font-medium text-[#111111] focus:outline-none focus:border-[#0E382B]"
                />
              </div>
            </div>

            {loginError && <p className="text-xs text-red-600">{loginError}</p>}

            <button
              type="submit"
              className="w-full bg-[#0E382B] hover:bg-[#144636] text-white text-xs uppercase tracking-wider font-semibold py-3.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Instant Access (Without OTP)</span>
              <Sparkles size={14} className="text-[#C5A880]" />
            </button>
          </form>

          <p className="text-[11px] text-[#888888]">
            Instant access. All client transactions and invoices are strictly secured under Lucknow jurisdiction.
          </p>
        </div>
      </div>
    );
  }

  // AUTHENTICATED CLIENT DASHBOARD
  return (
    <div className="max-w-content mx-auto px-6 md:px-8 py-8 md:py-16">
      <Breadcrumbs items={[{ label: "Account" }]} />

      {/* Header with Customer ID Badge */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between my-6 pb-6 border-b border-[#DDD8D0] gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="bg-[#0E382B] text-white font-mono text-[11px] font-bold px-2.5 py-0.5 rounded shadow-2xs">
              {customer.customerId}
            </span>
            {customer.panVerified && (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 size={11} /> PAN Verified
              </span>
            )}
            {customer.hasWelcomeDiscount && (
              <span className="bg-[#FFFDF5] text-[#C5A880] border border-[#C5A880] text-[10px] font-bold px-2 py-0.5 rounded-full">
                10% Welcome Discount (AYOR10)
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-[#111111]">
            Welcome, {customer.name}
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Mobile: +91 {customer.mobile} • Member since {new Date(customer.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs uppercase tracking-wider text-[#666666] hover:text-red-700 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 md:gap-12 pt-2">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-4 py-3 text-xs uppercase tracking-wider font-medium border rounded-xl flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "profile"
                ? "border-[#0E382B] bg-[#0E382B] text-white shadow-sm"
                : "border-[#DDD8D0] bg-[#FAF7F2] text-[#444444] hover:text-[#111111]"
            }`}
          >
            <User size={15} /> Profile &amp; KYC (PAN)
          </button>

          <button
            onClick={() => setActiveTab("invoices")}
            className={`w-full text-left px-4 py-3 text-xs uppercase tracking-wider font-medium border rounded-xl flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "invoices"
                ? "border-[#0E382B] bg-[#0E382B] text-white shadow-sm"
                : "border-[#DDD8D0] bg-[#FAF7F2] text-[#444444] hover:text-[#111111]"
            }`}
          >
            <FileText size={15} /> Official Tax Invoices ({invoices.length})
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full text-left px-4 py-3 text-xs uppercase tracking-wider font-medium border rounded-xl flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "orders"
                ? "border-[#0E382B] bg-[#0E382B] text-white shadow-sm"
                : "border-[#DDD8D0] bg-[#FAF7F2] text-[#444444] hover:text-[#111111]"
            }`}
          >
            <Package size={15} /> Atelier Orders
          </button>

          <Link
            href="/wishlist"
            className="w-full text-left px-4 py-3 text-xs uppercase tracking-wider font-medium border border-[#DDD8D0] bg-[#FAF7F2] text-[#444444] hover:text-[#111111] rounded-xl flex items-center justify-between"
          >
            <span className="flex items-center gap-2.5">
              <Heart size={15} /> Saved Heirlooms
            </span>
          </Link>
        </aside>

        {/* Tab Content */}
        <div className="lg:col-span-9">
          {/* TAB 1: PROFILE & MANDATORY PAN KYC */}
          {activeTab === "profile" && (
            <div className="space-y-8">
              {/* Profile Details Form */}
              <div className="border border-[#DDD8D0] bg-white p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#EFEBE4]">
                  <div>
                    <h2 className="font-serif text-2xl text-[#111111]">Personal Profile Details</h2>
                    <p className="text-xs text-[#666666]">
                      Manage contact information and shipping destinations.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0E382B]">
                    ID: {customer.customerId}
                  </span>
                </div>

                {profileMsg && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg flex items-center gap-2">
                    <CheckCircle2 size={15} />
                    <span>{profileMsg}</span>
                  </div>
                )}

                {profileErr && (
                  <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={15} />
                    <span>{profileErr}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* NAME FIELD WITH STRICT NAME-LOCK BADGE */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111]">
                          Full Name *
                        </label>
                        {customer.nameLocked && (
                          <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                            <Lock size={10} /> Official Name Locked
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        disabled={customer.nameLocked}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full px-3.5 py-2.5 text-xs border rounded-lg focus:outline-none ${
                          customer.nameLocked
                            ? "bg-stone-100 border-stone-300 text-stone-700 cursor-not-allowed font-semibold"
                            : "bg-[#FAF7F2] border-[#DDD8D0] text-[#111111] focus:border-[#0E382B]"
                        }`}
                      />
                      {customer.nameLocked && (
                        <p className="text-[10px] text-stone-500">
                          Name has been permanently locked to match verified PAN documentation as required by law.
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111]">
                        Registered Mobile Number (Immutable)
                      </label>
                      <input
                        type="text"
                        disabled
                        value={`+91 ${customer.mobile}`}
                        className="w-full px-3.5 py-2.5 text-xs border border-stone-300 bg-stone-100 rounded-lg text-stone-700 cursor-not-allowed font-mono"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111]">
                        Email Address (for Digital Certificates &amp; Invoices)
                      </label>
                      <input
                        type="email"
                        placeholder="client@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs border border-[#DDD8D0] bg-[#FAF7F2] rounded-lg text-[#111111] focus:outline-none focus:border-[#0E382B]"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111]">
                        Street Address &amp; House/Suite No.
                      </label>
                      <input
                        type="text"
                        placeholder="Hazratganj Luxury Enclave"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs border border-[#DDD8D0] bg-[#FAF7F2] rounded-lg text-[#111111] focus:outline-none focus:border-[#0E382B]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111]">
                        PIN Code (Auto-Detect City/State)
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="226001"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs border border-[#C5A880] bg-[#FFFDF5] rounded-lg text-[#111111] font-mono font-semibold focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111]">
                        City &amp; State
                      </label>
                      <input
                        type="text"
                        value={`${city || ""}${state ? ", " + state : ""}`}
                        readOnly
                        placeholder="Auto-detected"
                        className="w-full px-3.5 py-2.5 text-xs border border-[#DDD8D0] bg-stone-100 rounded-lg text-stone-700"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="bg-[#0E382B] hover:bg-[#144636] text-white px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                </form>
              </div>

              {/* MANDATORY PAN CARD KYC SECTION */}
              <div className="border-2 border-[#C5A880]/60 bg-gradient-to-b from-[#FFFDF9] to-[#FAF7F2] p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
                <div className="flex items-start justify-between flex-wrap gap-2 pb-3 border-b border-[#EFEBE4]">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="text-[#0E382B]" size={20} />
                      <h2 className="font-serif text-2xl text-[#111111]">
                        Income Tax KYC · PAN Card Verification
                      </h2>
                    </div>
                    <p className="text-xs text-[#666666] mt-1">
                      Government of India Rule 114B: Quoting PAN is <strong>mandatory for jewellery purchases exceeding ₹2,00,000</strong>.
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                      customer.panVerified
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}
                  >
                    {customer.panVerified ? "✓ PAN Verified" : "Verification Pending"}
                  </span>
                </div>

                {panMsg && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>{panMsg}</span>
                  </div>
                )}

                {panErr && (
                  <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{panErr}</span>
                  </div>
                )}

                {customer.panVerified ? (
                  <div className="bg-white p-5 rounded-xl border border-[#DDD8D0] space-y-3 text-xs">
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <span className="text-[#888888] uppercase tracking-wider text-[10px]">Masked PAN Number:</span>
                        <p className="font-mono font-bold text-sm text-[#0E382B] mt-0.5">
                          {maskPAN(customer.panNumber)}
                        </p>
                      </div>
                      <div>
                        <span className="text-[#888888] uppercase tracking-wider text-[10px]">Official Legal Name:</span>
                        <p className="font-semibold text-sm text-[#111111] mt-0.5 flex items-center gap-1">
                          <span>{customer.name}</span>
                          <Lock size={12} className="text-amber-800" />
                        </p>
                      </div>
                      <div>
                        <span className="text-[#888888] uppercase tracking-wider text-[10px]">KYC Status:</span>
                        <p className="text-emerald-700 font-semibold text-xs mt-0.5">
                          Eligible for high-value orders (&gt; ₹2 Lakh)
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitPAN} className="space-y-4 text-xs">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block uppercase tracking-wider font-semibold text-[#111111]">
                          10-Digit PAN Number *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={10}
                          placeholder="e.g. ABCDE1234F"
                          value={panNumber}
                          onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                          className="w-full px-3.5 py-2.5 text-xs font-mono font-bold uppercase border border-[#C5A880] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#0E382B]"
                        />
                        <span className="text-[10px] text-[#888888]">Format: 5 letters, 4 numbers, 1 letter</span>
                      </div>

                      <div className="space-y-1">
                        <label className="block uppercase tracking-wider font-semibold text-[#111111]">
                          Cardholder Name as on PAN Card *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. PRIYANSHU SHARMA"
                          value={panCardholderName}
                          onChange={(e) => setPanCardholderName(e.target.value.toUpperCase())}
                          className="w-full px-3.5 py-2.5 text-xs border border-[#DDD8D0] rounded-lg bg-white focus:outline-none focus:border-[#0E382B]"
                        />
                        <span className="text-[10px] text-[#888888]">
                          This name will be locked permanently once verified.
                        </span>
                      </div>
                    </div>

                    {/* MANDATORY PAN CARD DOCUMENT UPLOAD */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block uppercase tracking-wider font-semibold text-[#0E382B]">
                          Upload PAN Card Document (Mandatory) *
                        </label>
                        <span className="text-[10px] text-red-700 bg-red-50 px-2 py-0.5 rounded font-semibold">
                          Required (JPG, PNG, PDF max 5 MB)
                        </span>
                      </div>

                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-[#C5A880] rounded-xl p-5 text-center bg-white hover:bg-[#FFFDF5] cursor-pointer transition-colors space-y-2"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <UploadCloud className="mx-auto text-[#C5A880]" size={28} />
                        <div>
                          <p className="font-semibold text-xs text-[#111111]">
                            {panFileName ? panFileName : "Click to select PAN Card file from device"}
                          </p>
                          <p className="text-[10px] text-[#888888] mt-0.5">
                            High resolution photo or scan of physical PAN card
                          </p>
                        </div>
                      </div>

                      {panFileBase64 && panFileBase64.startsWith("data:image") && (
                        <div className="mt-2 p-2 border border-[#DDD8D0] rounded-lg bg-white inline-block">
                          <p className="text-[10px] text-[#888888] mb-1 font-semibold">Uploaded Preview:</p>
                          <img src={panFileBase64} alt="PAN Preview" className="h-20 w-auto rounded object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="bg-[#FAF7F2] p-3 rounded-lg border border-[#DDD8D0] text-[11px] text-[#666666] leading-relaxed">
                      <strong>Legal Consent Note:</strong> By submitting, I declare that this PAN belongs to me. As per Indian Income Tax regulations, my official legal name will be permanently locked to this verified document.
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingPan}
                      className="w-full bg-[#0E382B] hover:bg-[#144636] text-white py-3 rounded-lg text-xs uppercase tracking-wider font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmittingPan ? (
                        "Verifying Document..."
                      ) : (
                        <>
                          <span>Submit &amp; Verify PAN Card</span>
                          <ShieldCheck size={15} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: OFFICIAL TAX INVOICES */}
          {activeTab === "invoices" && (
            <div className="border border-[#DDD8D0] bg-white p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#EFEBE4]">
                <div>
                  <h2 className="font-serif text-2xl text-[#111111]">Official Tax Invoices</h2>
                  <p className="text-xs text-[#666666]">
                    Download clean, print-ready A4 invoices with itemized HSN codes &amp; hallmark declarations.
                  </p>
                </div>
                {invoices.length === 0 && (
                  <button
                    type="button"
                    onClick={handleCreateSampleInvoice}
                    className="bg-[#FAF7F2] border border-[#DDD8D0] text-[#0E382B] hover:bg-[#EFEBE4] px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Generate Sample Invoice
                  </button>
                )}
              </div>

              {invoices.length === 0 ? (
                <div className="p-8 text-center bg-[#FAF7F2] rounded-xl border border-dashed border-[#DDD8D0] text-xs text-[#666666] space-y-3">
                  <FileText className="mx-auto text-[#C5A880]" size={32} />
                  <p>You do not have any invoices yet. Completed orders will automatically generate official tax invoices here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-[#DDD8D0] rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F2] border-b border-[#DDD8D0] text-[11px] uppercase tracking-wider text-[#666666]">
                      <tr>
                        <th className="p-3">Invoice No</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Items</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFEBE4]">
                      {invoices.map((inv) => (
                        <tr key={inv.invoiceNumber} className="hover:bg-[#FAF7F2]/50">
                          <td className="p-3 font-mono font-bold text-[#0E382B]">{inv.invoiceNumber}</td>
                          <td className="p-3 text-[#666666]">{inv.invoiceDate}</td>
                          <td className="p-3 font-medium text-[#111111]">
                            {inv.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                          </td>
                          <td className="p-3 font-serif font-bold text-[#111111]">
                            ₹{inv.totalAmount.toLocaleString("en-IN")}
                          </td>
                          <td className="p-3">
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              {inv.paymentStatus}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedInvoice(inv)}
                              className="bg-[#0E382B] text-white hover:bg-[#144636] px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye size={12} />
                              <span>View / Print PDF</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === "orders" && (
            <div className="border border-[#DDD8D0] bg-white p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
              <h2 className="font-serif text-2xl text-[#111111] pb-3 border-b border-[#EFEBE4]">
                Order History &amp; Dispatch Tracking
              </h2>
              <div className="border border-[#DDD8D0] bg-[#FAF7F2] p-5 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#0E382B]">REF: ARY-729104</span>
                  <span className="bg-[#E9F0EC] text-[#1B3B30] text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Clock size={11} /> In Crafting (Atelier Lucknow)
                  </span>
                </div>
                <p className="font-serif text-base font-semibold text-[#111111]">
                  Emerald Cut Solitaire Ring (1.50ct) • 18K Yellow Gold
                </p>
                <p className="text-[#666666]">
                  Dispatched in tamper-proof security box with physical IGI Dossier. Doorstep delivery: <strong>Lucknow, Uttar Pradesh</strong>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PRINT-READY A4 INVOICE MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white border border-[#DDD8D0] rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-10 space-y-6 shadow-2xl">
            {/* Modal Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-[#EFEBE4]">
              <span className="text-xs uppercase tracking-wider font-bold text-[#0E382B]">
                Official Tax Invoice Preview (A4 Printable)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-[#0E382B] hover:bg-[#144636] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="text-gray-400 hover:text-black p-1 text-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* A4 PRINT CONTAINER */}
            <div id="invoice-print-area" className="p-6 sm:p-8 border border-[#DDD8D0] rounded-xl bg-white space-y-6 text-xs text-[#111111]">
              {/* Header */}
              <div className="flex justify-between items-start gap-4 pb-4 border-b border-[#111111]">
                <div>
                  <h1 className="font-serif text-2xl font-bold tracking-wider text-[#0E382B]">
                    {BUSINESS_CONFIG.name}
                  </h1>
                  <p className="text-[11px] text-[#555555] max-w-sm mt-0.5">
                    {BUSINESS_CONFIG.address}
                  </p>
                  <p className="text-[11px] text-[#555555]">
                    Contact: {BUSINESS_CONFIG.phone} | {BUSINESS_CONFIG.email}
                  </p>
                  {/* GSTIN BLANK AS REQUESTED */}
                  <p className="text-[11px] font-semibold text-[#111111] mt-1">
                    GSTIN: <span className="font-normal italic text-[#777777]">[ Applied For / In Process ]</span>
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <span className="bg-[#0E382B] text-white font-mono text-xs font-bold px-3 py-1 rounded inline-block">
                    TAX INVOICE
                  </span>
                  <p className="font-mono font-bold text-sm text-[#111111] mt-1">
                    {selectedInvoice.invoiceNumber}
                  </p>
                  <p className="text-[11px] text-[#555555]">Date: {selectedInvoice.invoiceDate}</p>
                </div>
              </div>

              {/* Billed To */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#EFEBE4] text-[11px]">
                <div className="space-y-1">
                  <p className="font-bold uppercase tracking-wider text-[10px] text-[#888888]">Billed To Customer:</p>
                  <p className="font-semibold text-xs text-[#111111]">{selectedInvoice.customerName}</p>
                  <p className="text-[#555555]">{selectedInvoice.customerAddress}</p>
                  <p className="text-[#555555]">Mobile: +91 {selectedInvoice.customerMobile}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="font-bold uppercase tracking-wider text-[10px] text-[#888888]">Customer Details:</p>
                  <p className="font-mono">Customer ID: <strong>{selectedInvoice.customerId}</strong></p>
                  <p className="font-mono">PAN (Masked): <strong>{selectedInvoice.customerPanMasked || "N/A"}</strong></p>
                  <p>Payment Mode: <strong className="capitalize">{selectedInvoice.paymentMode}</strong></p>
                </div>
              </div>

              {/* Itemized Table */}
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] border-y border-[#DDD8D0] text-[10px] uppercase font-bold text-[#555555]">
                  <tr>
                    <th className="py-2.5 px-2">#</th>
                    <th className="py-2.5 px-2">Description of Jewellery</th>
                    <th className="py-2.5 px-2">HSN</th>
                    <th className="py-2.5 px-2">Purity</th>
                    <th className="py-2.5 px-2 text-right">Qty</th>
                    <th className="py-2.5 px-2 text-right">Rate (₹)</th>
                    <th className="py-2.5 px-2 text-right">Taxable (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEBE4]">
                  {selectedInvoice.items.map((it, idx) => (
                    <tr key={it.id}>
                      <td className="py-2.5 px-2 text-[#777777]">{idx + 1}</td>
                      <td className="py-2.5 px-2 font-medium">
                        {it.name}
                        {it.weightGrams ? ` (${it.weightGrams}g)` : ""}
                      </td>
                      <td className="py-2.5 px-2 font-mono text-[#555555]">{it.hsn}</td>
                      <td className="py-2.5 px-2">{it.purity}</td>
                      <td className="py-2.5 px-2 text-right">{it.quantity}</td>
                      <td className="py-2.5 px-2 text-right font-mono">₹{it.rate.toLocaleString("en-IN")}</td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold">₹{it.taxableValue.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals & Tax Breakup */}
              <div className="flex justify-between items-start pt-3 border-t border-[#111111] text-xs">
                <div className="max-w-md space-y-1">
                  <p className="font-semibold text-[11px] text-[#555555] uppercase tracking-wider">Amount in Words:</p>
                  <p className="font-serif italic font-bold text-[#0E382B]">{selectedInvoice.totalInWords}</p>
                </div>

                <div className="w-64 space-y-1.5 text-right">
                  <div className="flex justify-between text-[#555555]">
                    <span>Subtotal:</span>
                    <span className="font-mono">₹{selectedInvoice.subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  {selectedInvoice.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-800 font-semibold">
                      <span>Welcome Discount (10%):</span>
                      <span className="font-mono">-₹{selectedInvoice.discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#555555]">
                    <span>CGST (1.5%):</span>
                    <span className="font-mono">₹{selectedInvoice.cgst.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-[#555555]">
                    <span>SGST (1.5%):</span>
                    <span className="font-mono">₹{selectedInvoice.sgst.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#111111] font-bold text-sm text-[#0E382B]">
                    <span>Total Payable:</span>
                    <span className="font-mono">₹{selectedInvoice.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Signatures & Declarations */}
              <div className="pt-6 border-t border-[#DDD8D0] grid grid-cols-2 gap-6 text-[10px] text-[#666666]">
                <div>
                  <p className="font-bold text-[#111111] uppercase tracking-wider mb-1">Terms &amp; Conditions:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {selectedInvoice.terms.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div className="text-right space-y-12">
                  <p className="font-semibold text-[#111111]">For {BUSINESS_CONFIG.name}</p>
                  <p className="border-t border-[#DDD8D0] pt-1 font-serif italic inline-block w-48 text-center text-[#444444]">
                    Authorized Atelier Signatory
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
