"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Package, Heart, User, LogOut, CheckCircle2, Clock, Truck } from "lucide-react";
import { useAryoraStore } from "@/lib/store";

export default function AccountPage() {
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");
  const { wishlist } = useAryoraStore();

  useEffect(() => {
    const t = localStorage.getItem("aryora_token");
    setToken(t);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("aryora_token");
    setToken(null);
  };

  return (
    <div className="max-w-content mx-auto px-6 md:px-8 py-8 md:py-16">
      <Breadcrumbs items={[{ label: "Account" }]} />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between my-8 pb-6 border-b border-border-subtle gap-4">
        <div>
          <p className="eyebrow">Client Portal</p>
          <h1 className="font-serif text-3xl md:text-5xl text-ink">My Aryora Atelier</h1>
        </div>

        {token && (
          <button
            onClick={handleLogout}
            className="text-xs uppercase tracking-wider text-ink-subtle hover:text-[#B93826] flex items-center gap-1.5 self-start sm:self-auto"
          >
            <LogOut size={14} /> Sign Out
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-8 md:gap-12 pt-4">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-2">
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full text-left px-4 py-3 text-xs uppercase tracking-wider font-medium border flex items-center gap-2.5 transition-all ${
              activeTab === "orders"
                ? "border-ink bg-ivory-pure text-ink shadow-sm"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            <Package size={15} /> Order History & Tracking
          </button>

          <Link
            href="/wishlist"
            className="w-full text-left px-4 py-3 text-xs uppercase tracking-wider font-medium border border-transparent text-ink-muted hover:text-ink flex items-center justify-between"
          >
            <span className="flex items-center gap-2.5">
              <Heart size={15} /> Saved Heirlooms
            </span>
            <span className="text-[11px] bg-ivory-muted px-2 py-0.5 font-sans">
              {wishlist.length}
            </span>
          </Link>

          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-4 py-3 text-xs uppercase tracking-wider font-medium border flex items-center gap-2.5 transition-all ${
              activeTab === "profile"
                ? "border-ink bg-ivory-pure text-ink shadow-sm"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            <User size={15} /> Personal Details
          </button>
        </aside>

        {/* Tab Content */}
        <div className="lg:col-span-9">
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="border border-border-subtle bg-ivory-pure p-6 md:p-8 space-y-4 shadow-sm">
                <div className="flex items-start justify-between flex-wrap gap-2 pb-4 border-b border-border-subtle">
                  <div>
                    <span className="eyebrow text-[10px]">Reference: ARY-729104</span>
                    <h3 className="font-serif text-lg text-ink mt-0.5">
                      Emerald Cut Solitaire Ring (1.50ct)
                    </h3>
                    <p className="text-xs text-ink-subtle">Ordered on 28 Oct 2026 • 18K Yellow Gold</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E9F0EC] text-[#1B3B30] text-xs font-medium">
                    <Clock size={12} /> In Crafting (Atelier Lucknow)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="py-2">
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] uppercase tracking-wider text-ink-subtle mb-2">
                    <span className="text-ink font-semibold">1. Confirmed</span>
                    <span className="text-ink font-semibold">2. Hand-Setting</span>
                    <span>3. IGI Dossier</span>
                    <span>4. Insured Transit</span>
                  </div>
                  <div className="h-1.5 w-full bg-ivory-muted rounded-full overflow-hidden">
                    <div className="h-full bg-[#1B3B30] w-1/2" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs text-ink-muted">
                  <span>Estimated Doorstep Delivery: <strong>4 Nov 2026</strong></span>
                  <a
                    href="https://wa.me/918808828646?text=Hello%20Aryora%2C%20checking%20status%20for%20order%20ARY-729104"
                    target="_blank"
                    rel="noreferrer"
                    className="text-champagne-accessible underline font-medium"
                  >
                    Track with Concierge
                  </a>
                </div>
              </div>

              {!token && (
                <div className="border border-border-subtle bg-ivory-pure p-6 text-center space-y-2">
                  <p className="font-serif text-lg text-ink">Have an existing Aryora account?</p>
                  <p className="text-xs text-ink-muted">
                    Sign in to see past orders across all devices and manage delivery addresses.
                  </p>
                  <div className="pt-2">
                    <Link href="/login" className="btn-outline text-xs">
                      Sign In to Account
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div className="border border-border-subtle bg-ivory-pure p-6 md:p-8 space-y-6 shadow-sm">
              <h2 className="font-serif text-2xl text-ink pb-3 border-b border-border-subtle">
                Personal Atelier Preferences
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-ink-subtle uppercase tracking-wider mb-1">Full Name</label>
                  <p className="font-medium text-ink">Aryora Private Client</p>
                </div>
                <div>
                  <label className="block text-ink-subtle uppercase tracking-wider mb-1">Contact Email</label>
                  <p className="font-medium text-ink">client@aryora.com</p>
                </div>
                <div>
                  <label className="block text-ink-subtle uppercase tracking-wider mb-1">Preferred Metal</label>
                  <p className="font-medium text-ink">18K Yellow Gold</p>
                </div>
                <div>
                  <label className="block text-ink-subtle uppercase tracking-wider mb-1">Standard Ring Size</label>
                  <p className="font-medium text-ink">Size 12 (Indian)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
