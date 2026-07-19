"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      await api.post("/leads/newsletter", { emailId: email });
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <footer className="bg-emerald text-ivory mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <h3 className="font-display text-xl mb-3">Aryora</h3>
          <p className="text-sm text-ivory/70">
            Conscious luxury for the modern era. Handcrafted heirlooms born from tradition and innovation.
          </p>
        </div>
        <div>
          <h4 className="eyebrow mb-3">Policies</h4>
          <ul className="text-sm space-y-2 text-ivory/80">
            <li><a href="/privacy" className="hover:text-champagne">Privacy Policy</a></li>
            <li><a href="/shipping" className="hover:text-champagne">Shipping Policy</a></li>
            <li><a href="/returns" className="hover:text-champagne">Returns</a></li>
            <li><a href="/terms" className="hover:text-champagne">Terms & Conditions</a></li>
          </ul>
        </div>
        <div>
          <h4 className="eyebrow mb-3">Concierge</h4>
          <ul className="text-sm space-y-2 text-ivory/80">
            <li>aryora.legacy@hotmail.com</li>
            <li>+91 8808828646</li>
            <li>Lucknow, Uttar Pradesh</li>
          </ul>
        </div>
        <div>
          <h4 className="eyebrow mb-3">Newsletter</h4>
          <p className="text-sm text-ivory/70 mb-3">Join the circle for exclusive previews and editorial stories.</p>
          <form onSubmit={subscribe} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="bg-transparent border-b border-ivory/40 flex-1 text-sm py-1 focus:outline-none focus:border-champagne"
            />
            <button type="submit" aria-label="Subscribe" className="text-champagne">→</button>
          </form>
          {status === "done" && <p className="text-xs text-champagne mt-2">Welcome to the Aryora Circle.</p>}
          {status === "error" && <p className="text-xs text-red-300 mt-2">Something went wrong — please try again.</p>}
        </div>
      </div>
      <div className="border-t border-ivory/10 py-6 text-xs text-center text-ivory/60">
        © {new Date().getFullYear()} Aryora. Light. Legacy. You.
      </div>
    </footer>
  );
}
