"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  Save,
  CheckCircle2,
  Eye,
  Sliders,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  MousePointerClick,
  XCircle,
} from "lucide-react";
import {
  DEFAULT_POPUP_CONFIG,
  AntiTarnishPopupConfig,
} from "@/lib/antiTarnishConfig";

export default function PopupManagerAdmin() {
  const [config, setConfig] = useState<AntiTarnishPopupConfig>(DEFAULT_POPUP_CONFIG);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [analytics, setAnalytics] = useState<{ shown: number; clicked: number; closed: number }>({
    shown: 0,
    clicked: 0,
    closed: 0,
  });

  // Load configuration and analytics
  useEffect(() => {
    fetch("/api/admin/popup-config")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setConfig(data.config);
        }
      })
      .catch(() => null);

    fetch("/api/analytics/popup")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.counts) {
          setAnalytics(data.counts);
        }
      })
      .catch(() => null);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch("/api/admin/popup-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert(`Failed to save: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const ctr = analytics.shown > 0 ? ((analytics.clicked / analytics.shown) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-8">
      {/* 1. Header & Live Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5E0D8]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E382B]/10 text-[#0E382B] text-[10px] uppercase tracking-wider font-semibold mb-2">
            <Sparkles size={12} />
            <span>Anti-Tarnish Collection Marketing</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-[#111111]">
            Promotional Pop-up Manager
          </h2>
          <p className="text-xs text-[#666666] mt-1 max-w-xl">
            Configure promotional pop-up triggers, copy, images, and date windows without modifying code. Appears after 5s or exit-intent, limited to once per session with 7-day dismissal cooldown.
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
              config.enabled
                ? "bg-[#EAF5EF] text-[#0E382B] border border-[#108474]/30"
                : "bg-[#F5F2EC] text-[#777777] border border-[#E5E0D8]"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                config.enabled ? "bg-[#108474] animate-pulse" : "bg-[#999999]"
              }`}
            />
            <span>{config.enabled ? "Active & Live" : "Disabled"}</span>
          </span>
        </div>
      </div>

      {/* 2. Analytics KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E5E0D8] space-y-1 shadow-2xs">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[#777777] flex items-center gap-1">
            <Eye size={12} />
            <span>Pop-up Impressions</span>
          </p>
          <p className="font-serif text-2xl font-bold text-[#111111]">{analytics.shown}</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5E0D8] space-y-1 shadow-2xs">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[#777777] flex items-center gap-1">
            <MousePointerClick size={12} className="text-[#0E382B]" />
            <span>Total Clicks (Shop Now)</span>
          </p>
          <p className="font-serif text-2xl font-bold text-[#0E382B]">{analytics.clicked}</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5E0D8] space-y-1 shadow-2xs">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[#777777] flex items-center gap-1">
            <TrendingUp size={12} className="text-[#108474]" />
            <span>Click-Through Rate (CTR)</span>
          </p>
          <p className="font-serif text-2xl font-bold text-[#108474]">{ctr}%</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5E0D8] space-y-1 shadow-2xs">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[#777777] flex items-center gap-1">
            <XCircle size={12} />
            <span>Dismissed / Closed</span>
          </p>
          <p className="font-serif text-2xl font-bold text-[#777777]">{analytics.closed}</p>
        </div>
      </div>

      {/* 3. Form & Live Preview Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left: Configuration Form */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E5E0D8] space-y-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
              Pop-up Content & Settings
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-[#555555]">Enable Pop-up</span>
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="w-4 h-4 accent-[#0E382B] rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="space-y-4 text-xs">
            {/* Heading */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#111111]">
                Heading Text
              </label>
              <input
                type="text"
                required
                value={config.heading}
                onChange={(e) => setConfig({ ...config, heading: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#E5E0D8] rounded-xl focus:outline-none focus:border-[#0E382B]"
              />
            </div>

            {/* Subtext */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#111111]">
                Subtext & Value Proposition
              </label>
              <input
                type="text"
                required
                value={config.subtext}
                onChange={(e) => setConfig({ ...config, subtext: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#E5E0D8] rounded-xl focus:outline-none focus:border-[#0E382B]"
              />
            </div>

            {/* Badge */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#111111]">
                Top Pill Badge
              </label>
              <input
                type="text"
                value={config.badge}
                onChange={(e) => setConfig({ ...config, badge: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#E5E0D8] rounded-xl focus:outline-none focus:border-[#0E382B]"
              />
            </div>

            {/* CTA Label & Link */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#111111]">
                  CTA Button Label
                </label>
                <input
                  type="text"
                  value={config.ctaText}
                  onChange={(e) => setConfig({ ...config, ctaText: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E5E0D8] rounded-xl focus:outline-none focus:border-[#0E382B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#111111]">
                  CTA Destination URL
                </label>
                <input
                  type="text"
                  value={config.ctaLink}
                  onChange={(e) => setConfig({ ...config, ctaLink: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E5E0D8] rounded-xl focus:outline-none focus:border-[#0E382B]"
                />
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#111111]">
                Banner Graphic Path
              </label>
              <input
                type="text"
                value={config.imageUrl}
                onChange={(e) => setConfig({ ...config, imageUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#E5E0D8] rounded-xl focus:outline-none focus:border-[#0E382B]"
              />
            </div>

            {/* Start & End Dates */}
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#111111] flex items-center gap-1">
                  <Calendar size={12} />
                  <span>Start Date (Optional)</span>
                </label>
                <input
                  type="date"
                  value={config.startDate || ""}
                  onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E5E0D8] rounded-xl focus:outline-none focus:border-[#0E382B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#111111] flex items-center gap-1">
                  <Calendar size={12} />
                  <span>End Date (Optional)</span>
                </label>
                <input
                  type="date"
                  value={config.endDate || ""}
                  onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E5E0D8] rounded-xl focus:outline-none focus:border-[#0E382B]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E5E0D8]">
            {saved ? (
              <span className="text-xs text-[#108474] font-medium flex items-center gap-1">
                <CheckCircle2 size={14} /> Saved & Active Live!
              </span>
            ) : (
              <span className="text-[11px] text-[#777777]">Changes apply instantly across site.</span>
            )}

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#0E382B] hover:bg-[#154a3a] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Save size={13} />
              <span>{loading ? "Saving..." : "Save Configuration"}</span>
            </button>
          </div>
        </form>

        {/* Right: Live Interactive Mock Preview */}
        <div className="lg:col-span-5 space-y-3">
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#777777]">
            Live Customer Preview
          </p>
          <div className="bg-[#FAF8F5] rounded-2xl border border-[#E5E0D8] overflow-hidden shadow-lg p-0">
            {/* Mock Modal Header */}
            <div className="relative h-36 bg-gradient-to-r from-[#0E382B] via-[#144636] to-[#0A261D] p-5 flex items-center justify-between">
              <div className="space-y-1.5 text-white max-w-[65%]">
                <span className="inline-block bg-white/20 text-[#ECD078] px-2 py-0.5 rounded-full text-[8px] font-semibold uppercase tracking-wider">
                  {config.badge}
                </span>
                <p className="font-serif text-lg font-light leading-snug">
                  Shine That Never Fades.
                </p>
              </div>
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={config.imageUrl || "/site/cat-bracelets.svg"}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Mock Modal Body */}
            <div className="p-5 bg-white space-y-4">
              <div className="space-y-1">
                <h4 className="font-serif text-xl font-medium text-[#111111]">
                  {config.heading}
                </h4>
                <p className="text-xs text-[#666666] leading-relaxed">
                  {config.subtext}
                </p>
              </div>

              <div className="w-full bg-[#0E382B] text-white py-2.5 rounded-xl text-center text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm">
                <span>{config.ctaText}</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
