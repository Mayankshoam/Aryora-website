"use client";

import { useEffect } from "react";
import { X, Check } from "lucide-react";
import { useAryoraStore } from "@/lib/store";

const RING_SIZES = [
  { size: 6, mm: 14.65, inches: 0.58 },
  { size: 8, mm: 15.29, inches: 0.60 },
  { size: 10, mm: 15.92, inches: 0.63 },
  { size: 12, mm: 16.56, inches: 0.65 },
  { size: 14, mm: 17.20, inches: 0.68 },
  { size: 16, mm: 17.83, inches: 0.70 },
  { size: 18, mm: 18.47, inches: 0.73 },
  { size: 20, mm: 19.11, inches: 0.75 },
  { size: 22, mm: 19.75, inches: 0.78 },
  { size: 24, mm: 20.36, inches: 0.80 },
];

export default function SizeGuideModal() {
  const { isSizeGuideOpen, closeSizeGuide } = useAryoraStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSizeGuideOpen) closeSizeGuide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSizeGuideOpen, closeSizeGuide]);

  if (!isSizeGuideOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Ring Size Guide"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/50 backdrop-blur-sm transition-opacity"
        onClick={closeSizeGuide}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-ivory text-ink shadow-2xl z-10 border border-border-subtle p-6 md:p-8 max-h-[90vh] overflow-y-auto animate-fadeIn">
        <div className="flex items-start justify-between pb-4 border-b border-border-subtle mb-6">
          <div>
            <p className="eyebrow">Client Care</p>
            <h2 className="font-serif text-2xl md:text-3xl text-ink">
              Indian Ring Size Chart
            </h2>
          </div>
          <button
            onClick={closeSizeGuide}
            className="p-2 text-ink hover:opacity-75 transition-opacity -mr-2"
            aria-label="Close size guide"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Measuring Tip Banner */}
        <div className="bg-champagne-subtle p-4 border border-champagne-light mb-6 text-xs text-ink-muted leading-relaxed space-y-1">
          <p className="font-medium text-ink flex items-center gap-1.5">
            <Check size={14} className="text-champagne-accessible" /> Complimentary 30-Day Resizing
          </p>
          <p>
            Every Aryora ring includes one complimentary resizing within 30 days of delivery. If you are between two sizes, we always advise selecting the larger size.
          </p>
        </div>

        {/* Size Table */}
        <div className="overflow-x-auto mb-8 border border-border-subtle">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-muted border-b border-border-subtle uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="py-3 px-4 font-medium">Standard Indian Size</th>
                <th className="py-3 px-4 font-medium">Inside Diameter (mm)</th>
                <th className="py-3 px-4 font-medium">Inside Diameter (in)</th>
                <th className="py-3 px-4 font-medium">US Size Equiv.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {RING_SIZES.map((item) => (
                <tr key={item.size} className="hover:bg-ivory-muted/40 transition-colors">
                  <td className="py-2.5 px-4 font-serif text-sm font-medium text-ink">
                    Size {item.size}
                  </td>
                  <td className="py-2.5 px-4 text-ink-muted">{item.mm} mm</td>
                  <td className="py-2.5 px-4 text-ink-muted">{item.inches}&quot;</td>
                  <td className="py-2.5 px-4 text-ink-muted">
                    US {(item.size / 2 - 0.5).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* How to Measure at Home */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg text-ink">How to Measure at Home</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-xs text-ink-muted leading-relaxed">
            <div className="border border-border-subtle p-4 bg-ivory-pure">
              <p className="font-medium text-ink mb-1">Option 1: Measure an Existing Ring</p>
              <p>
                Take a ring that already fits the intended finger well. Use a ruler to measure the internal diameter straight across in millimeters (edge-to-edge). Match with the chart above.
              </p>
            </div>
            <div className="border border-border-subtle p-4 bg-ivory-pure">
              <p className="font-medium text-ink mb-1">Option 2: Measure with Paper</p>
              <p>
                Wrap a narrow strip of paper snugly around your knuckle and finger base. Mark where the ends meet, measure the length in mm, and divide by 3.14 to calculate your diameter.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-border-subtle flex justify-end">
          <button onClick={closeSizeGuide} className="btn-primary text-xs">
            Got it, Thank You
          </button>
        </div>
      </div>
    </div>
  );
}
