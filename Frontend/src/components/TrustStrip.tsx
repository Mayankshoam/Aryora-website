"use client";

import { RotateCcw, Award, ShieldCheck, CheckCircle, type LucideIcon } from "lucide-react";
import { getSiteConfig } from "@/lib/data";

const ICON_MAP: Record<string, LucideIcon> = {
  RotateCcw,
  Award,
  ShieldCheck,
  CheckCircle,
};

export default function TrustStrip() {
  const siteConfig = getSiteConfig();
  const items = siteConfig.trustStrip;

  return (
    <section
      aria-label="Aryora Client Assurances"
      className="bg-[#F9F6F0] border-y border-border-subtle"
    >
      <div className="max-w-content mx-auto px-4 md:px-8 py-5 md:py-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-border-subtle/80">
        {items.map((item, index) => {
          const Icon = ICON_MAP[item.icon] || Award;
          return (
            <div
              key={item.title}
              className={`flex items-center space-x-3.5 py-2 ${
                index > 0 ? "md:pl-6" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-champagne-accessible border border-champagne/40 flex-shrink-0 shadow-sm">
                <Icon size={18} strokeWidth={1.5} />
              </div>
              <div className="space-y-0.5">
                <p className="font-serif text-sm font-medium text-ink leading-tight">
                  {item.title}
                </p>
                <p className="text-[11px] text-ink-muted leading-tight">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
