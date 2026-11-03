"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, X } from "lucide-react";

export default function AntiScrapeFirewall() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. Console Security Warning
    console.log(
      "%c🛡️ AYOR DIGITAL FIREWALL ACTIVE\n%cAll jewellery designs, imagery, code, and catalog metadata are the exclusive intellectual property of AYOR Fine Jewellery. Unauthorized scraping, automated harvesting, or asset duplication is strictly prohibited and monitored.",
      "color: #0E382B; font-size: 16px; font-weight: bold; background: #F5F0EA; padding: 4px 8px; border-radius: 4px;",
      "color: #555555; font-size: 12px; line-height: 1.5;"
    );

    const showSecurityToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3500);
    };

    // 2. Intercept Right-Click Context Menu on images and catalog
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // If user right-clicks on an image, video, canvas, or catalog card
      if (
        target.tagName === "IMG" ||
        target.tagName === "PICTURE" ||
        target.tagName === "VIDEO" ||
        target.closest("img") ||
        target.closest("[data-protected]") ||
        target.closest(".group")
      ) {
        e.preventDefault();
        showSecurityToast("Protected Design: Image saving and right-click downloading are disabled by AYOR Security Shield.");
      }
    };

    // 3. Intercept Image Dragging
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG" || target.closest("img")) {
        e.preventDefault();
      }
    };

    // 4. Intercept DevTools and View Source Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
        showSecurityToast("Developer inspection tools are restricted on AYOR Fine Jewellery.");
        return;
      }

      // Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) {
        e.preventDefault();
        showSecurityToast("Source inspection is protected by AYOR Security Shield.");
        return;
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
        showSecurityToast("View source is protected by AYOR Security Shield.");
        return;
      }

      // Ctrl+S (Save Page)
      if (e.ctrlKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        showSecurityToast("Page offline saving is disabled.");
        return;
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("dragstart", handleDragStart);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!toastMessage) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] bg-[#1A1A1A] text-white border border-[#DDD8D0]/30 shadow-2xl rounded-xl p-3.5 flex items-center justify-between gap-3 animate-fadeIn"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#0E382B] text-[#EAF3DE] flex items-center justify-center flex-shrink-0">
          <ShieldAlert size={16} />
        </div>
        <p className="text-xs text-white/95 font-medium leading-snug">
          {toastMessage}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setToastMessage(null)}
        aria-label="Close security alert"
        className="text-white/60 hover:text-white p-1"
      >
        <X size={15} />
      </button>
    </aside>
  );
}

