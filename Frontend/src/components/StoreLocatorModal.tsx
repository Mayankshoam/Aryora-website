"use client";

import { useAryoraStore } from "@/lib/store";
import { X, MapPin, Phone, Clock, Calendar, MessageCircle } from "lucide-react";

export default function StoreLocatorModal() {
  const { isStoreLocatorOpen, closeStoreLocator } = useAryoraStore();

  if (!isStoreLocatorOpen) return null;

  const whatsappAppointmentUrl =
    "https://wa.me/918808828646?text=" +
    encodeURIComponent("Hello Aryora Boutique, I would like to book a private atelier visit in Lucknow.");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="store-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fadeIn"
      onClick={closeStoreLocator}
    >
      <div
        className="relative w-full max-w-lg bg-ivory-pure border border-border-subtle p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeStoreLocator}
          aria-label="Close boutique modal"
          className="absolute top-4 right-4 p-2 text-ink-muted hover:text-ink transition-colors"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        <div className="space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-champagne">
              Flagship Boutique & Atelier
            </p>
            <h2 id="store-modal-title" className="font-serif text-2xl md:text-3xl text-ink font-light">
              Visit Aryora in Lucknow
            </h2>
            <p className="text-xs text-ink-muted leading-relaxed">
              Experience the royal brilliance of IGI-certified lab-grown diamonds, bespoke bridal consults, and 18K solid gold in person.
            </p>
          </div>

          <div className="bg-ivory-warm/40 border border-border-subtle p-5 space-y-4">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-champagne-accessible mt-0.5 flex-shrink-0" />
              <div className="text-xs space-y-0.5">
                <p className="font-semibold text-ink">Aryora Haute Joaillerie Atelier</p>
                <p className="text-ink-muted">Hazratganj / Aliganj Fine Jewelry Enclave</p>
                <p className="text-ink-muted">Lucknow, Uttar Pradesh 226001, India</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone size={16} className="text-champagne-accessible flex-shrink-0" />
              <a href="tel:+918808828646" className="text-xs text-ink hover:underline font-medium">
                +91 8808828646
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Clock size={16} className="text-champagne-accessible flex-shrink-0" />
              <p className="text-xs text-ink-muted">
                Monday – Saturday: 11:00 AM – 8:00 PM IST (Sundays by Appointment)
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href={whatsappAppointmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#1B3B30] text-ivory hover:bg-[#122720] transition-colors py-3 px-4 text-xs uppercase tracking-wider font-semibold"
            >
              <MessageCircle size={16} />
              <span>Book Appointment via WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={closeStoreLocator}
              className="w-full py-2.5 text-xs text-ink-muted hover:text-ink font-medium"
            >
              Continue Exploring Online
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

