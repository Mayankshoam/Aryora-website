"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  Unlock,
  Coins,
  TrendingUp,
  Package,
  Edit,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
  Trash2,
  Search,
  Filter,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  LogOut,
  Sparkles,
  Users,
  Database,
  ExternalLink,
  Copy,
  ShoppingBag,
  FileText,
} from "lucide-react";
import {
  getStoredCustomers,
  getStoredOrders,
  isSupabaseConnected,
  SUPABASE_SQL_SCHEMA,
  CustomerRecord,
  OrderRecord,
} from "@/lib/supabase";
import {
  getDailyMetalRates,
  saveDailyMetalRates,
  calculateDynamicPrice,
  computePuritiesFrom24K,
  DEFAULT_METAL_RATES,
  MetalRates,
} from "@/lib/metalRates";
import { getAllProducts, Product } from "@/lib/data";
import CustomerKycAdmin from "@/components/admin/CustomerKycAdmin";
import InvoicesAdmin from "@/components/admin/InvoicesAdmin";
import { CustomerInvoice } from "@/lib/customerStore";

const MASTER_PIN = "ayor2026";
const MASTER_PIN_ALT = "880882";

export default function MasterAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState("admin@ayor.in");
  const [usernameInput, setUsernameInput] = useState("admin@ayor.in");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Active Master Tab
  const [activeTab, setActiveTab] = useState<
    "CUSTOMERS" | "INVOICES" | "RATES" | "CATALOGUE" | "ORDERS"
  >("CUSTOMERS");

  // Invoice to view/reprint across tabs
  const [viewingInvoice, setViewingInvoice] = useState<CustomerInvoice | null>(null);

  // Metal Rates
  const [rates, setRates] = useState<MetalRates>(DEFAULT_METAL_RATES);
  const [ratesSaved, setRatesSaved] = useState(false);

  // Products & Editing
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "SILVER" | "GOLD_DIAMOND" | "COMING_SOON">("ALL");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saveProductSuccess, setSaveProductSuccess] = useState(false);

  // Supabase Customers & Orders
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [copiedSql, setCopiedSql] = useState(false);

  // Initialize
  useEffect(() => {
    // Check session
    const auth = sessionStorage.getItem("ayor_master_authenticated");
    const storedToken = sessionStorage.getItem("ayor_admin_token");
    const storedUser = sessionStorage.getItem("ayor_admin_username");
    if (auth === "true") {
      setIsAuthenticated(true);
      if (storedToken) setAdminToken(storedToken);
      if (storedUser) setAdminUsername(storedUser);
    }
    setRates(getDailyMetalRates());
    setProducts(getAllProducts());
    setCustomers(getStoredCustomers());
    setOrders(getStoredOrders());
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError("");
    setLoginLoading(true);

    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPin = pinInput.trim();

    try {
      // 1. Try Authenticating via Protected Admin API with Rate Limiting
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUser, password: cleanPin }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.role === "admin") {
        setIsAuthenticated(true);
        setAdminToken(data.token);
        setAdminUsername(cleanUser);
        sessionStorage.setItem("ayor_master_authenticated", "true");
        sessionStorage.setItem("ayor_admin_token", data.token);
        sessionStorage.setItem("ayor_admin_username", cleanUser);
        sessionStorage.setItem("ayor_admin_role", "admin");
        setPinInput("");
        return;
      }

      // Fallback check for direct client access with valid PIN
      if (cleanPin === MASTER_PIN || cleanPin === MASTER_PIN_ALT) {
        setIsAuthenticated(true);
        setAdminUsername(cleanUser);
        sessionStorage.setItem("ayor_master_authenticated", "true");
        sessionStorage.setItem("ayor_admin_username", cleanUser);
        sessionStorage.setItem("ayor_admin_role", "admin");
        setPinInput("");
        return;
      }

      setPinError(data.error || "Invalid Admin credentials or unauthorized role.");
    } catch {
      // Fallback in offline/sandbox mode
      if (cleanPin === MASTER_PIN || cleanPin === MASTER_PIN_ALT) {
        setIsAuthenticated(true);
        sessionStorage.setItem("ayor_master_authenticated", "true");
        sessionStorage.setItem("ayor_admin_username", cleanUser);
        sessionStorage.setItem("ayor_admin_role", "admin");
        setPinInput("");
      } else {
        setPinError("Invalid Master Access PIN / Credentials.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("ayor_master_authenticated");
    sessionStorage.removeItem("ayor_admin_token");
    sessionStorage.removeItem("ayor_admin_username");
    sessionStorage.removeItem("ayor_admin_role");
  };

  const handleGold24kChange = (val: number) => {
    const computed = computePuritiesFrom24K(val);
    setRates((prev) => ({
      ...prev,
      gold24kPerGram: val,
      gold22kPerGram: computed.gold22k,
      gold18kPerGram: computed.gold18k,
      gold14kPerGram: computed.gold14k,
      gold9kPerGram: computed.gold9k,
    }));
  };

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveDailyMetalRates(rates);
    setRates(updated);
    setRatesSaved(true);
    setTimeout(() => setRatesSaved(false), 3500);
  };

  // Product Editing Handlers
  const handleEditClick = (p: Product) => {
    setEditingProduct({ ...p });
    setSaveProductSuccess(false);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    // Update in products list
    const updated = products.map((p) =>
      p.id === editingProduct.id ? editingProduct : p
    );
    setProducts(updated);

    // Save to localStorage for persistent runtime override
    if (typeof window !== "undefined") {
      localStorage.setItem("ayor_custom_products", JSON.stringify(updated));
    }

    setSaveProductSuccess(true);
    setTimeout(() => {
      setSaveProductSuccess(false);
      setEditingProduct(null);
    }, 1200);
  };

  const handleAddImageUrl = (url: string) => {
    if (!editingProduct || !url.trim()) return;
    setEditingProduct({
      ...editingProduct,
      images: [...editingProduct.images, url.trim()],
    });
  };

  const handleRemoveImage = (index: number) => {
    if (!editingProduct) return;
    const updatedImages = editingProduct.images.filter((_, i) => i !== index);
    setEditingProduct({
      ...editingProduct,
      images: updatedImages,
    });
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedFilter === "SILVER") {
      return (
        p.metal.toLowerCase().includes("silver") ||
        p.purity.includes("925")
      );
    }
    if (selectedFilter === "GOLD_DIAMOND") {
      return (
        p.metal.toLowerCase().includes("gold") ||
        p.stone.toLowerCase().includes("diamond") ||
        p.category === "Solitaires"
      );
    }
    if (selectedFilter === "COMING_SOON") {
      return p.isComingSoon;
    }
    return true;
  });

  // Calculate sample dynamic prices for preview
  const silverSample = calculateDynamicPrice(
    { price: 1999, metal: "925 Sterling Silver", weightGrams: 10, makingCharges: 350 },
    rates
  );
  const goldSample = calculateDynamicPrice(
    { price: 65000, metal: "18K Gold", purity: "18K", weightGrams: 5, carat: 0.5, makingCharges: 4500 },
    rates
  );

  // 1. PIN LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDFBF9] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white border border-[#DDD8D0] shadow-xl rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#0E382B]/10 text-[#0E382B] flex items-center justify-center">
              <Lock size={26} strokeWidth={1.5} />
            </div>
            <h1 className="font-serif text-2xl md:text-3xl text-[#111111] font-light">
              AYOR Administrator Portal
            </h1>
            <p className="text-xs text-[#666666]">
              Secure administrator access for Customer Accounts, Rule 114B KYC, Invoices &amp; Bullion Pricing.
            </p>
            <div className="inline-flex items-center gap-1.5 bg-[#FAF7F2] border border-[#DDD8D0] px-3 py-1 rounded-full text-[11px] font-semibold text-[#0E382B]">
              <ShieldAlert size={12} className="text-[#C5A880]" />
              <span>Role Protected: Administrator Only</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1.5">
                Admin Username / Email
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => {
                  setUsernameInput(e.target.value);
                  setPinError("");
                }}
                placeholder="admin@ayor.in"
                className="w-full h-11 px-3.5 bg-[#FAF7F2] border border-[#DDD8D0] rounded-lg text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#0E382B] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1.5">
                Administrator PIN / Password
              </label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError("");
                }}
                placeholder="Enter PIN (e.g. ayor2026)"
                className="w-full h-11 px-3.5 bg-[#FAF7F2] border border-[#DDD8D0] rounded-lg text-sm text-[#111111] focus:outline-none focus:border-[#0E382B] transition-colors"
                autoFocus
                required
              />
              {pinError && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={13} /> {pinError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full h-11 bg-[#0E382B] hover:bg-[#144636] disabled:opacity-50 text-white font-medium text-xs uppercase tracking-wider rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock size={14} />
              <span>{loginLoading ? "Verifying Role & Session..." : "Sign In to Admin Console"}</span>
            </button>

            <p className="text-[11px] text-center text-[#888888]">
              Default Admin Key: <code className="bg-[#FAF7F2] px-1 py-0.5 rounded font-mono">ayor2026</code> (Username: <code className="bg-[#FAF7F2] px-1 py-0.5 rounded font-mono">admin@ayor.in</code>)
            </p>
          </form>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED MASTER DASHBOARD
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#111111] pb-24">
      {/* Top Bar */}
      <div className="bg-[#0E382B] text-white px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-6 w-20 relative flex items-center">
            <Image
              src="/site/ayor-logo-white.svg"
              alt="AYOR"
              width={80}
              height={24}
              className="object-contain"
            />
          </div>
          <span className="text-xs uppercase tracking-widest bg-white/15 px-2.5 py-0.5 rounded-full font-mono">
            Admin Console · Role: Administrator
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="hidden md:inline text-white/80">
            Signed in as: <strong>{adminUsername}</strong>
          </span>
          <Link
            href="/"
            target="_blank"
            className="hover:underline flex items-center gap-1 text-white/90"
          >
            <Eye size={13} />
            <span>View Storefront</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1 text-red-200 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* LUXURY ADMIN TABS NAVIGATION */}
      <div className="bg-white border-b border-[#DDD8D0] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex items-center gap-2 overflow-x-auto py-2">
          <button
            type="button"
            onClick={() => setActiveTab("CUSTOMERS")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "CUSTOMERS"
                ? "bg-[#0E382B] text-white shadow-xs"
                : "text-[#666666] hover:text-[#111111] hover:bg-[#FAF7F2]"
            }`}
          >
            <Users size={14} className={activeTab === "CUSTOMERS" ? "text-[#C5A880]" : ""} />
            <span>Customers &amp; KYC Vault</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("INVOICES")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "INVOICES"
                ? "bg-[#0E382B] text-white shadow-xs"
                : "text-[#666666] hover:text-[#111111] hover:bg-[#FAF7F2]"
            }`}
          >
            <FileText size={14} className={activeTab === "INVOICES" ? "text-[#C5A880]" : ""} />
            <span>Invoices &amp; Tax Bills</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("RATES")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "RATES"
                ? "bg-[#0E382B] text-white shadow-xs"
                : "text-[#666666] hover:text-[#111111] hover:bg-[#FAF7F2]"
            }`}
          >
            <Coins size={14} className={activeTab === "RATES" ? "text-[#C5A880]" : ""} />
            <span>Bullion Metal Rates</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("CATALOGUE")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "CATALOGUE"
                ? "bg-[#0E382B] text-white shadow-xs"
                : "text-[#666666] hover:text-[#111111] hover:bg-[#FAF7F2]"
            }`}
          >
            <Package size={14} className={activeTab === "CATALOGUE" ? "text-[#C5A880]" : ""} />
            <span>Catalogue &amp; Inventory</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ORDERS")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "ORDERS"
                ? "bg-[#0E382B] text-white shadow-xs"
                : "text-[#666666] hover:text-[#111111] hover:bg-[#FAF7F2]"
            }`}
          >
            <ShoppingBag size={14} className={activeTab === "ORDERS" ? "text-[#C5A880]" : ""} />
            <span>Live Orders &amp; UTR ({orders.length})</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-8">
        {/* TAB 1: CUSTOMERS & KYC VAULT */}
        {activeTab === "CUSTOMERS" && (
          <CustomerKycAdmin
            adminToken={adminToken}
            adminUsername={adminUsername}
            onViewInvoice={(inv) => {
              setViewingInvoice(inv);
              setActiveTab("INVOICES");
            }}
          />
        )}

        {/* TAB 2: INVOICES & TAX BILLS */}
        {activeTab === "INVOICES" && (
          <InvoicesAdmin
            selectedInvoice={viewingInvoice}
            onCloseInvoiceModal={() => setViewingInvoice(null)}
          />
        )}

        {/* TAB 3: DAILY METAL PRICING CONTROL BOARD */}
        {activeTab === "RATES" && (
        <section className="bg-white border border-[#DDD8D0] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFEBE4]">
            <div>
              <div className="flex items-center gap-2">
                <Coins className="text-[#C09981]" size={22} />
                <h2 className="font-serif text-2xl text-[#111111] font-medium">
                  Daily Metal Rates & Auto-Pricing Engine
                </h2>
              </div>
              <p className="text-xs text-[#666666] mt-1">
                Edit today&apos;s bullion rates for Silver, Gold & Lab-Grown Diamonds. The store automatically recalculates retail prices across all jewellery based on metal gram weight and purity.
              </p>
            </div>

            {ratesSaved && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#108474] bg-[#EAF3DE] px-3 py-1.5 rounded-full animate-fadeIn">
                <CheckCircle2 size={15} />
                <span>Live Rates Applied Across Store!</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveRates} className="space-y-6">
            <div className="bg-[#FAF7F2] border border-[#C5A880]/50 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles size={16} className="text-[#C5A880]" />
                <span className="text-xs font-semibold text-[#111111]">
                  Auto-Purity Calculation Enabled: Enter only the 24K Gold rate below — 22K, 18K, 14K &amp; 09K will auto-calculate automatically based on standard BIS hallmark percentages!
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {/* 1. Gold 24K Rate (MASTER INPUT) */}
              <div className="space-y-1.5 bg-[#FFFDF5] p-3 rounded-xl border-2 border-[#C5A880] shadow-sm">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-[#0E382B]">
                    Gold 24K (₹/g)
                  </label>
                  <span className="text-[9px] bg-[#0E382B] text-white px-1.5 py-0.2 rounded font-semibold uppercase">
                    Master
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#888888]">₹</span>
                  <input
                    type="number"
                    step="1"
                    value={rates.gold24kPerGram}
                    onChange={(e) => handleGold24kChange(Number(e.target.value))}
                    className="w-full h-9 pl-6 pr-2 bg-white border border-[#C5A880] rounded-lg text-sm font-bold text-[#0E382B] focus:outline-none focus:ring-1 focus:ring-[#0E382B]"
                    required
                  />
                </div>
                <span className="text-[10px] text-[#0E382B] font-medium block">Pure 999 Bullion</span>
              </div>

              {/* 2. Gold 22K Rate (AUTO: 22/24) */}
              <div className="space-y-1.5 bg-[#FAF7F2] p-3 rounded-xl border border-[#DDD8D0]">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#111111]">
                    Gold 22K (₹/g)
                  </label>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-mono">
                    91.6%
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#888888]">₹</span>
                  <input
                    type="number"
                    step="1"
                    value={rates.gold22kPerGram}
                    onChange={(e) => setRates({ ...rates, gold22kPerGram: Number(e.target.value) })}
                    className="w-full h-9 pl-6 pr-2 bg-white border border-[#DDD8D0] rounded-lg text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#0E382B]"
                    required
                  />
                </div>
                <span className="text-[10px] text-[#888888] block">Auto (22/24 of 24K)</span>
              </div>

              {/* 3. Gold 18K Rate (AUTO: 18/24) */}
              <div className="space-y-1.5 bg-[#FAF7F2] p-3 rounded-xl border border-[#DDD8D0]">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#111111]">
                    Gold 18K (₹/g)
                  </label>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-mono">
                    75.0%
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#888888]">₹</span>
                  <input
                    type="number"
                    step="1"
                    value={rates.gold18kPerGram}
                    onChange={(e) => setRates({ ...rates, gold18kPerGram: Number(e.target.value) })}
                    className="w-full h-9 pl-6 pr-2 bg-white border border-[#DDD8D0] rounded-lg text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#0E382B]"
                    required
                  />
                </div>
                <span className="text-[10px] text-[#888888] block">Auto (18/24 of 24K)</span>
              </div>

              {/* 4. Gold 14K Rate (AUTO: 14/24) */}
              <div className="space-y-1.5 bg-[#FAF7F2] p-3 rounded-xl border border-[#DDD8D0]">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#111111]">
                    Gold 14K (₹/g)
                  </label>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-mono">
                    58.3%
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#888888]">₹</span>
                  <input
                    type="number"
                    step="1"
                    value={rates.gold14kPerGram}
                    onChange={(e) => setRates({ ...rates, gold14kPerGram: Number(e.target.value) })}
                    className="w-full h-9 pl-6 pr-2 bg-white border border-[#DDD8D0] rounded-lg text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#0E382B]"
                    required
                  />
                </div>
                <span className="text-[10px] text-[#888888] block">Auto (14/24 of 24K)</span>
              </div>

              {/* 5. Gold 09K Rate (AUTO: 09/24) */}
              <div className="space-y-1.5 bg-[#FAF7F2] p-3 rounded-xl border border-[#DDD8D0]">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#111111]">
                    Gold 09K (₹/g)
                  </label>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-mono">
                    37.5%
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#888888]">₹</span>
                  <input
                    type="number"
                    step="1"
                    value={rates.gold9kPerGram || Math.round(rates.gold24kPerGram * (9 / 24))}
                    onChange={(e) => setRates({ ...rates, gold9kPerGram: Number(e.target.value) })}
                    className="w-full h-9 pl-6 pr-2 bg-white border border-[#DDD8D0] rounded-lg text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#0E382B]"
                    required
                  />
                </div>
                <span className="text-[10px] text-[#888888] block">Auto (09/24 of 24K)</span>
              </div>

              {/* 6. Silver 925 Rate */}
              <div className="space-y-1.5 bg-[#FAF7F2] p-3 rounded-xl border border-[#DDD8D0]">
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#111111]">
                  Silver 925 (₹/g)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#888888]">₹</span>
                  <input
                    type="number"
                    step="0.5"
                    value={rates.silver925PerGram}
                    onChange={(e) => setRates({ ...rates, silver925PerGram: Number(e.target.value) })}
                    className="w-full h-9 pl-6 pr-2 bg-white border border-[#DDD8D0] rounded-lg text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#0E382B]"
                    required
                  />
                </div>
                <span className="text-[10px] text-[#888888] block">Pure 925 Silver</span>
              </div>

              {/* 7. Diamond Rate per Carat */}
              <div className="space-y-1.5 bg-[#FAF7F2] p-3 rounded-xl border border-[#DDD8D0]">
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#111111]">
                  Diamond (₹/ct)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#888888]">₹</span>
                  <input
                    type="number"
                    step="500"
                    value={rates.diamondPerCarat}
                    onChange={(e) => setRates({ ...rates, diamondPerCarat: Number(e.target.value) })}
                    className="w-full h-9 pl-6 pr-2 bg-white border border-[#DDD8D0] rounded-lg text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#0E382B]"
                    required
                  />
                </div>
                <span className="text-[10px] text-[#888888] block">Lab Solitaire Base</span>
              </div>
            </div>

            {/* Live Pricing Simulation Preview */}
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#DDD8D0] grid sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-semibold text-[#111111] uppercase tracking-wider text-[11px] mb-1">
                  💡 Live Calculation Preview: 10g 925 Silver Piece
                </p>
                <p className="text-[#666666]">
                  Metal Value: ₹{silverSample.breakdown.metalValue.toLocaleString("en-IN")} + Making: ₹{silverSample.breakdown.makingCharges.toLocaleString("en-IN")} + GST (3%): ₹{silverSample.breakdown.gst.toLocaleString("en-IN")}
                </p>
                <p className="text-sm font-serif font-bold text-[#0E382B] mt-0.5">
                  Calculated Store Price: ₹{silverSample.finalPrice.toLocaleString("en-IN")}
                </p>
              </div>

              <div>
                <p className="font-semibold text-[#111111] uppercase tracking-wider text-[11px] mb-1">
                  💡 Live Calculation Preview: 5g 18K Gold + 0.50ct Diamond
                </p>
                <p className="text-[#666666]">
                  Gold: ₹{goldSample.breakdown.metalValue.toLocaleString("en-IN")} + Diamond: ₹{goldSample.breakdown.diamondValue.toLocaleString("en-IN")} + Making: ₹{goldSample.breakdown.makingCharges.toLocaleString("en-IN")} + GST
                </p>
                <p className="text-sm font-serif font-bold text-[#0E382B] mt-0.5">
                  Calculated Store Price: ₹{goldSample.finalPrice.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-[#0E382B] hover:bg-[#144636] text-white px-7 py-3 rounded-lg text-xs uppercase tracking-wider font-semibold shadow-sm transition-colors flex items-center gap-2"
              >
                <Save size={15} />
                <span>Save & Broadcast Daily Rates</span>
              </button>
            </div>
          </form>
        </section>
        )}

        {/* TAB 4: PRODUCT MANAGEMENT & IMAGE MODIFIER */}
        {activeTab === "CATALOGUE" && (
        <section className="bg-white border border-[#DDD8D0] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFEBE4]">
            <div>
              <div className="flex items-center gap-2">
                <Package className="text-[#0E382B]" size={22} />
                <h2 className="font-serif text-2xl text-[#111111] font-medium">
                  Catalogue & Inventory Master Control
                </h2>
              </div>
              <p className="text-xs text-[#666666] mt-1">
                Edit product details, modify images (2-4 images), manage gram weight, or toggle between &quot;Readily Available&quot; (Silver) and &quot;Coming Soon&quot; (Gold/Diamond).
              </p>
            </div>

            <div className="text-xs font-semibold text-[#111111]">
              Total Products: <span className="text-[#0E382B]">{products.length}</span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" size={15} />
              <input
                type="text"
                placeholder="Search products by title, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 bg-[#FAF7F2] border border-[#DDD8D0] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#0E382B]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {[
                { key: "ALL", label: "All Items" },
                { key: "SILVER", label: "Silver (In Stock)" },
                { key: "GOLD_DIAMOND", label: "Gold & Diamond" },
                { key: "COMING_SOON", label: "Coming Soon Items" },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setSelectedFilter(f.key as any)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                    selectedFilter === f.key
                      ? "bg-[#0E382B] text-white border-[#0E382B]"
                      : "bg-[#FAF7F2] text-[#4A4A4A] border-[#DDD8D0] hover:text-[#111111]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product List Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#DDD8D0] text-[#555555] uppercase tracking-wider text-[11px] bg-[#FAF7F2]/60">
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Metal / Purity</th>
                  <th className="py-3 px-3">Weight (g)</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEBE4]">
                {filteredProducts.slice(0, 50).map((p) => {
                  const dynamic = calculateDynamicPrice(p, rates);
                  return (
                    <tr key={p.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                      {/* Product Thumbnail & Title */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#FAF7F2] flex-shrink-0 border border-[#DDD8D0]">
                            {p.images[0] ? (
                              <Image
                                src={p.images[0]}
                                alt={p.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                                No img
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[#111111] line-clamp-1 max-w-[240px]">
                              {p.name}
                            </p>
                            <p className="text-[10px] text-[#888888] font-mono">{p.sku || p.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-[#555555]">{p.category}</td>

                      {/* Metal & Purity */}
                      <td className="py-3 px-3 font-medium">
                        <span className="block text-[#111111]">{p.metal}</span>
                        <span className="text-[10px] text-[#888888]">{p.purity}</span>
                      </td>

                      {/* Weight */}
                      <td className="py-3 px-3 text-[#111111] font-mono">
                        {p.weightGrams ? `${p.weightGrams}g` : "—"}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3 font-semibold text-[#0E382B]">
                        ₹{dynamic.finalPrice.toLocaleString("en-IN")}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        {p.isComingSoon ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                            Coming Soon
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleEditClick(p)}
                          className="inline-flex items-center gap-1 text-xs text-[#0E382B] hover:text-[#144636] font-semibold underline px-2 py-1"
                        >
                          <Edit size={13} />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
        )}

        {/* TAB 5: SUPABASE CUSTOMER VAULT & LIVE ORDERS */}
        {activeTab === "ORDERS" && (
        <section className="bg-white border border-[#DDD8D0] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFEBE4]">
            <div>
              <div className="flex items-center gap-2">
                <Database className="text-[#0E382B]" size={22} />
                <h2 className="font-serif text-2xl text-[#111111] font-medium">
                  Supabase Customer Vault &amp; Live Orders
                </h2>
              </div>
              <p className="text-xs text-[#666666] mt-1">
                Real-time synchronized client profiles with PIN code auto-detected cities/states, order UTR numbers, and WhatsApp verification.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                  isSupabaseConnected()
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-[#FFFDF5] text-[#C5A880] border border-[#C5A880]"
                }`}
              >
                <Database size={13} />
                <span>{isSupabaseConnected() ? "Connected to Supabase Cloud" : "Local Vault Active (Config Ready)"}</span>
              </span>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 2500);
                }}
                className="bg-[#FAF7F2] hover:bg-[#EFEBE4] text-[#111111] border border-[#DDD8D0] text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Copy size={13} />
                <span>{copiedSql ? "Copied SQL Schema!" : "Copy Supabase SQL"}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#DDD8D0]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-[#666666]">Total Customers</span>
                <Users size={16} className="text-[#0E382B]" />
              </div>
              <p className="font-serif text-2xl font-bold text-[#111111] mt-1">{customers.length}</p>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#DDD8D0]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-[#666666]">Total Orders</span>
                <ShoppingBag size={16} className="text-[#0E382B]" />
              </div>
              <p className="font-serif text-2xl font-bold text-[#111111] mt-1">{orders.length}</p>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#DDD8D0]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-[#666666]">Cash on Delivery</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">COD</span>
              </div>
              <p className="font-serif text-2xl font-bold text-[#0E382B] mt-1">
                {orders.filter((o) => o.paymentMode === "cod").length}
              </p>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#DDD8D0]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-[#666666]">UTR Verified / Online</span>
                <CheckCircle2 size={16} className="text-emerald-700" />
              </div>
              <p className="font-serif text-2xl font-bold text-emerald-800 mt-1">
                {orders.filter((o) => Boolean(o.utrNumber)).length}
              </p>
            </div>
          </div>

          {/* Orders Table */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-[#111111] flex items-center justify-between">
              <span>Incoming Customer Orders &amp; Payment UTR Status</span>
              <span className="text-[11px] font-normal text-[#666666]">
                Orders cannot be dispatched without Verified UTR or COD
              </span>
            </h3>

            {orders.length === 0 ? (
              <div className="p-8 text-center bg-[#FAF7F2] rounded-xl border border-dashed border-[#DDD8D0] text-xs text-[#666666]">
                No customer orders received yet. Placed orders with payment UTR numbers will automatically appear here.
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#DDD8D0] rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] border-b border-[#DDD8D0] text-[11px] uppercase tracking-wider text-[#666666]">
                    <tr>
                      <th className="p-3">Order Ref</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Destination</th>
                      <th className="p-3">Payment Mode</th>
                      <th className="p-3">UTR / RRN Status</th>
                      <th className="p-3">Total (₹)</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFEBE4]">
                    {orders.map((ord) => (
                      <tr key={ord.orderNumber} className="hover:bg-[#FAF7F2]/50">
                        <td className="p-3 font-mono font-bold text-[#0E382B]">{ord.orderNumber}</td>
                        <td className="p-3">
                          <p className="font-semibold text-[#111111]">{ord.fullName}</p>
                          <p className="text-[11px] text-[#666666]">{ord.phone} • {ord.email}</p>
                        </td>
                        <td className="p-3 text-[11px]">
                          {ord.shippingAddress.city}, {ord.shippingAddress.state} ({ord.shippingAddress.pincode})
                        </td>
                        <td className="p-3 capitalize font-medium">{ord.paymentMode}</td>
                        <td className="p-3">
                          {ord.utrNumber ? (
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-semibold text-[10px]">
                              UTR: {ord.utrNumber}
                            </span>
                          ) : ord.paymentMode === "cod" ? (
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold text-[10px]">
                              COD Confirmed
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold text-[10px]">
                              Pending UTR Number
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-serif font-bold text-[#111111]">
                          ₹{ord.totalAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 text-right">
                          <a
                            href={`https://wa.me/91${ord.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                              `Namaste ${ord.fullName}! Regarding your AYOR Atelier order ${ord.orderNumber} (₹${ord.totalAmount}).`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[#25D366] hover:underline font-semibold"
                          >
                            WhatsApp <ExternalLink size={11} />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Customers Vault Table */}
          <div className="space-y-3 pt-4 border-t border-[#EFEBE4]">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
              Registered Customer Vault ({customers.length})
            </h3>
            {customers.length === 0 ? (
              <div className="p-8 text-center bg-[#FAF7F2] rounded-xl border border-dashed border-[#DDD8D0] text-xs text-[#666666]">
                No customer profiles synced yet. Visitors who register or checkout will automatically sync here and to Supabase.
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#DDD8D0] rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] border-b border-[#DDD8D0] text-[11px] uppercase tracking-wider text-[#666666]">
                    <tr>
                      <th className="p-3">Customer Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Mobile</th>
                      <th className="p-3">Auto-Detected City &amp; State</th>
                      <th className="p-3">PIN Code</th>
                      <th className="p-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFEBE4]">
                    {customers.map((c, i) => (
                      <tr key={i} className="hover:bg-[#FAF7F2]/50">
                        <td className="p-3 font-semibold text-[#111111]">{c.fullName}</td>
                        <td className="p-3 text-[#666666]">{c.email}</td>
                        <td className="p-3 font-mono text-[11px]">{c.phone || "N/A"}</td>
                        <td className="p-3">
                          <span className="font-medium">{c.city || "N/A"}</span>
                          {c.state ? `, ${c.state}` : ""}
                        </td>
                        <td className="p-3 font-mono font-bold text-[#0E382B]">{c.pincode || "N/A"}</td>
                        <td className="p-3 text-[11px] text-[#888888]">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN") : "Today"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
        )}

        {/* MODAL: PRODUCT DETAIL & IMAGE EDITOR */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-white border border-[#DDD8D0] shadow-2xl rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#EFEBE4]">
                <div>
                  <h3 className="font-serif text-xl font-medium text-[#111111]">
                    Edit Product & Images
                  </h3>
                  <p className="text-xs text-[#666666]">
                    Product ID: <code className="font-mono text-[#0E382B]">{editingProduct.id}</code>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="text-gray-400 hover:text-black text-lg p-1"
                >
                  ✕
                </button>
              </div>

              {saveProductSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Product details and images successfully updated!</span>
                </div>
              )}

              <form onSubmit={handleSaveProduct} className="space-y-6">
                {/* 1. Basic Info */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-[#111111]">
                      Product Title
                    </label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="w-full h-10 px-3 bg-[#FAF7F2] border border-[#DDD8D0] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0E382B]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-[#111111]">
                      Category
                    </label>
                    <input
                      type="text"
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full h-10 px-3 bg-[#FAF7F2] border border-[#DDD8D0] rounded-lg text-xs focus:outline-none focus:border-[#0E382B]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-[#111111]">
                      Metal Type
                    </label>
                    <input
                      type="text"
                      value={editingProduct.metal}
                      onChange={(e) => setEditingProduct({ ...editingProduct, metal: e.target.value })}
                      className="w-full h-10 px-3 bg-[#FAF7F2] border border-[#DDD8D0] rounded-lg text-xs focus:outline-none focus:border-[#0E382B]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-[#111111]">
                      Metal Weight in Grams
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingProduct.weightGrams || ""}
                      onChange={(e) => setEditingProduct({ ...editingProduct, weightGrams: Number(e.target.value) })}
                      className="w-full h-10 px-3 bg-[#FAF7F2] border border-[#DDD8D0] rounded-lg text-xs focus:outline-none focus:border-[#0E382B]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-[#111111]">
                      Base Retail Price (₹)
                    </label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      className="w-full h-10 px-3 bg-[#FAF7F2] border border-[#DDD8D0] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0E382B]"
                      required
                    />
                  </div>
                </div>

                {/* 2. Availability Switch: Readily Available vs Coming Soon */}
                <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#DDD8D0] space-y-2">
                  <span className="block text-xs uppercase tracking-wider font-semibold text-[#111111]">
                    Availability Mode (Gold & Diamond Coming Soon Rule)
                  </span>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="radio"
                        name="availability"
                        checked={!editingProduct.isComingSoon}
                        onChange={() => setEditingProduct({ ...editingProduct, isComingSoon: false, stock: 15 })}
                        className="text-[#0E382B]"
                      />
                      <span className="font-medium text-emerald-800">
                        Readily Available (Add to Cart / Instant Checkout)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="radio"
                        name="availability"
                        checked={Boolean(editingProduct.isComingSoon)}
                        onChange={() => setEditingProduct({ ...editingProduct, isComingSoon: true, stock: 0 })}
                        className="text-[#0E382B]"
                      />
                      <span className="font-medium text-amber-800">
                        Coming Soon (Notify Me / Enquiry Only)
                      </span>
                    </label>
                  </div>
                </div>

                {/* 3. Product Images (2-4 images as requested) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
                      Product Images Gallery ({editingProduct.images.length} images)
                    </label>
                    <span className="text-[11px] text-[#666666]">
                      First image is the primary storefront cover
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {editingProduct.images.map((img, i) => (
                      <div key={i} className="relative group border border-[#DDD8D0] rounded-xl overflow-hidden bg-[#FAF7F2] p-1">
                        <div className="relative aspect-square w-full rounded-lg overflow-hidden">
                          <Image src={img} alt={`Photo ${i + 1}`} fill sizes="120px" className="object-cover" />
                        </div>
                        <div className="flex items-center justify-between p-1 text-[10px]">
                          <span className="text-[#666666] font-mono">Image {i + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(i)}
                            className="text-red-500 hover:text-red-700 p-0.5"
                            title="Remove image"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Image Input */}
                  <div className="flex gap-2">
                    <input
                      id="new-image-url-input"
                      type="url"
                      placeholder="Paste image URL (https://cdn.shopify.com/... or /products/...)"
                      className="flex-1 h-9 px-3 bg-[#FAF7F2] border border-[#DDD8D0] rounded-lg text-xs focus:outline-none focus:border-[#0E382B]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById("new-image-url-input") as HTMLInputElement;
                        if (input && input.value) {
                          handleAddImageUrl(input.value);
                          input.value = "";
                        }
                      }}
                      className="bg-[#0E382B] text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                    >
                      <Plus size={13} />
                      <span>Add Image</span>
                    </button>
                  </div>
                </div>

                {/* 4. Description */}
                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-[#111111]">
                    Product Description
                  </label>
                  <textarea
                    rows={3}
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full p-3 bg-[#FAF7F2] border border-[#DDD8D0] rounded-lg text-xs focus:outline-none focus:border-[#0E382B]"
                  />
                </div>

                {/* Submit & Cancel */}
                <div className="flex justify-end gap-3 pt-3 border-t border-[#EFEBE4]">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-5 py-2.5 border border-[#DDD8D0] rounded-lg text-xs font-semibold text-[#555555] hover:text-[#111111]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#0E382B] hover:bg-[#144636] text-white px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider font-semibold shadow-sm transition-colors flex items-center gap-2"
                  >
                    <Save size={14} />
                    <span>Save Product Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
