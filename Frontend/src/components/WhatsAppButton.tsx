"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const phoneNumber = "918808828646";
  const defaultMessage = encodeURIComponent(
    "Hello Ayor Concierge, I would like to enquire about your fine jewellery collection."
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <aside aria-label="Customer Support">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Ayor Concierge on WhatsApp (+91 8808828646)"
        className="fixed bottom-24 md:bottom-8 right-5 md:right-8 z-30 flex items-center gap-2.5 bg-[#1A1A1A] text-white px-4 py-3 shadow-2xl hover:bg-[#353535] transition-all duration-300 group border border-white/10"
      >
        <MessageCircle size={18} strokeWidth={1.75} className="text-[#C09981] group-hover:scale-110 transition-transform" />
        <span className="text-xs uppercase tracking-luxury font-medium hidden sm:inline-block">
          Concierge
        </span>
      </a>
    </aside>
  );
}
