"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  ShieldCheck,
  Lock,
  Check,
  Truck,
  ArrowRight,
  QrCode,
  Copy,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Building2,
  CreditCard,
  Wallet,
  Banknote,
  Sparkles,
} from "lucide-react";
import { useAryoraStore } from "@/lib/store";
import { lookupPincode } from "@/lib/pincode";
import { saveOrderToSupabase, updateOrderUTR, OrderRecord } from "@/lib/supabase";

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useAryoraStore();
  const total = getCartTotal();
  const gst = Math.round(total * 0.03);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "Uttar Pradesh",
    pincode: "",
    paymentMethod: "upi" as "cod" | "upi" | "card" | "netbanking",
    utrNumber: "",
  });

  const [isDetectingPin, setIsDetectingPin] = useState(false);
  const [pinDetectedMsg, setPinDetectedMsg] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);
  const [orderComplete, setOrderComplete] = useState<OrderRecord | null>(null);
  const [utrInputModal, setUtrInputModal] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Auto-detect City & State when 6-digit PIN code is typed
  useEffect(() => {
    const cleanPin = form.pincode.replace(/\D/g, "");
    if (cleanPin.length === 6) {
      setIsDetectingPin(true);
      lookupPincode(cleanPin).then((result) => {
        setIsDetectingPin(false);
        if (result) {
          setForm((prev) => ({
            ...prev,
            city: result.city,
            state: result.state,
          }));
          setPinDetectedMsg(`Auto-detected: ${result.city}, ${result.state}`);
        }
      });
    } else {
      setPinDetectedMsg("");
    }
  }, [form.pincode]);

  // Build formatted WhatsApp message with complete cart and customer details
  const generateWhatsAppMessage = (orderNum: string, currentUtr?: string) => {
    const itemsList = cart
      .map(
        (item) =>
          `• ${item.product.name} (Qty: ${item.quantity}) - ₹${(
            item.product.price * item.quantity
          ).toLocaleString("en-IN")} [${item.selectedMetal || item.product.metal} ${
            item.product.purity
          }]`
      )
      .join("\n");

    const text = `*NAMASTE AYOR ATELIER* 🙏
I would like to place and confirm my Jewellery Order.

*Order Reference:* ${orderNum}
*Cart Items (${cart.length}):*
${itemsList}

*Order Total:* ₹${total.toLocaleString("en-IN")} (incl. 3% GST & Insured Shipping)
*Payment Mode:* ${
      form.paymentMethod === "cod"
        ? "Cash on Delivery (COD)"
        : form.paymentMethod === "upi"
        ? "UPI / QR Payment"
        : form.paymentMethod === "netbanking"
        ? "Online Net Banking"
        : "Credit/Debit Card"
    }
${currentUtr ? `*Payment UTR / RRN:* ${currentUtr}\n` : "*Payment UTR / RRN:* (Sharing screenshot / UTR in this chat)\n"}
*Delivery Address:*
${form.fullName}
${form.address}
${form.city}, ${form.state} - ${form.pincode}
Contact: ${form.phone} | Email: ${form.email}

Please verify the payment and confirm my dispatch!`;

    return encodeURIComponent(text);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText("ayorjewellery@okaxis");
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Main order placement handler
  const handlePlaceOrder = async (e?: React.FormEvent, forceMode?: "cod" | "whatsapp_confirm") => {
    if (e) e.preventDefault();

    if (!form.fullName || !form.phone || !form.email || !form.address || !form.pincode) {
      alert("Please fill all mandatory contact and shipping fields.");
      return;
    }

    // STRICT PAYMENT RULE: If Online Payment, must have UTR number entered, unless confirming via WhatsApp
    const isOnline = form.paymentMethod !== "cod";
    if (isOnline && !form.utrNumber.trim() && forceMode !== "whatsapp_confirm") {
      alert(
        "Kripya Payment UTR / RRN number enter karein ya 'Pay & Share on WhatsApp' par click karein. Online orders bina payment UTR number ke confirm nahi ho sakte."
      );
      return;
    }

    setIsPlacing(true);
    const orderNum = `ARY-${Date.now().toString().slice(-6)}`;

    const orderRecord: OrderRecord = {
      orderNumber: orderNum,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      shippingAddress: {
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      },
      items: cart.map((i) => ({
        id: i.product.id,
        name: i.product.name,
        metal: i.selectedMetal || i.product.metal,
        purity: i.product.purity,
        price: i.product.price,
        quantity: i.quantity,
        size: i.size,
      })),
      subtotal: total - gst,
      gst: gst,
      totalAmount: total,
      paymentMode: form.paymentMethod,
      paymentStatus:
        form.paymentMethod === "cod"
          ? "confirmed_cod"
          : form.utrNumber.trim()
          ? "utr_submitted"
          : "pending_utr",
      utrNumber: form.utrNumber.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    // 1. Save to Supabase and Local Storage Vault
    await saveOrderToSupabase(orderRecord);

    // 2. Dispatch automated email notification API
    try {
      await fetch("/api/order-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderRecord),
      });
    } catch (err) {
      console.warn("Order email notification background trigger", err);
    }

    // 3. If WhatsApp redirect requested
    if (forceMode === "whatsapp_confirm") {
      const waUrl = `https://wa.me/918808828882?text=${generateWhatsAppMessage(
        orderNum,
        form.utrNumber
      )}`;
      window.open(waUrl, "_blank");
    }

    setOrderComplete(orderRecord);
    clearCart();
    setIsPlacing(false);
  };

  // Handler to update UTR on completed order screen
  const handleUpdateOrderUTR = async () => {
    if (!utrInputModal.trim() || !orderComplete) return;
    await updateOrderUTR(orderComplete.orderNumber, utrInputModal.trim());
    setOrderComplete({
      ...orderComplete,
      utrNumber: utrInputModal.trim(),
      paymentStatus: "utr_submitted",
    });
    alert(`UTR Number ${utrInputModal.trim()} saved successfully! Your order is now confirmed.`);
    setUtrInputModal("");
  };

  // ORDER COMPLETE / SUCCESS SCREEN
  if (orderComplete) {
    const isCod = orderComplete.paymentMode === "cod";
    const hasUtr = Boolean(orderComplete.utrNumber);

    return (
      <div className="max-w-content mx-auto px-6 md:px-8 py-16 md:py-24 text-center">
        <div className="max-w-2xl mx-auto border border-[#DDD8D0] bg-[#FAF7F2] p-8 md:p-12 space-y-6 shadow-sm rounded-2xl">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
              isCod || hasUtr ? "bg-[#0E382B] text-white" : "bg-amber-600 text-white"
            }`}
          >
            <Check size={32} />
          </div>

          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-widest font-semibold text-[#888888]">
              {isCod
                ? "Cash On Delivery Confirmed"
                : hasUtr
                ? "Payment Verified & Order Confirmed"
                : "Order Awaiting Payment Verification"}
            </p>
            <h1 className="font-serif text-3xl md:text-4xl text-[#111111]">
              Thank You for Choosing Ayor
            </h1>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#DDD8D0] text-left space-y-3 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-[#EFEBE4]">
              <span className="text-[#666666]">Order Reference:</span>
              <strong className="text-sm font-mono text-[#0E382B] font-bold">
                {orderComplete.orderNumber}
              </strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#666666]">Order Total:</span>
              <strong className="text-sm font-serif text-[#111111]">
                ₹{orderComplete.totalAmount.toLocaleString("en-IN")}
              </strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#666666]">Payment Mode:</span>
              <span className="font-medium capitalize text-[#111111]">
                {orderComplete.paymentMode === "cod"
                  ? "Cash on Delivery"
                  : orderComplete.paymentMode.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#666666]">Payment Status:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-semibold uppercase text-[10px] ${
                  isCod || hasUtr
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {isCod
                  ? "Confirmed (COD)"
                  : hasUtr
                  ? `Confirmed (UTR: ${orderComplete.utrNumber})`
                  : "Pending UTR / RRN"}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[#EFEBE4]">
              <span className="text-[#666666]">Dispatched To:</span>
              <span className="text-[#111111] text-right font-medium">
                {orderComplete.shippingAddress.address}, {orderComplete.shippingAddress.city},{" "}
                {orderComplete.shippingAddress.state} - {orderComplete.shippingAddress.pincode}
              </span>
            </div>
          </div>

          {/* If Online payment but UTR is missing: Prompt for UTR update */}
          {!isCod && !hasUtr && (
            <div className="bg-amber-50 border border-amber-300 p-5 rounded-xl text-left space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                <AlertCircle size={16} />
                <span>Enter Your 12-Digit Bank UTR / UPI Ref / RRN Number:</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Aapke order ko final dispatch approve karne ke liye bank transaction UTR number zaroori hai.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 412389123456 (12 digits)"
                  value={utrInputModal}
                  onChange={(e) => setUtrInputModal(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-amber-400 rounded-lg bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleUpdateOrderUTR}
                  className="bg-[#0E382B] hover:bg-[#144636] text-white px-4 py-2 rounded-lg text-xs font-semibold"
                >
                  Confirm Order
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#DDD8D0]">
            <a
              href={`https://wa.me/918808828882?text=${encodeURIComponent(
                `Namaste AYOR Atelier! My Order is ${orderComplete.orderNumber} for ₹${orderComplete.totalAmount.toLocaleString(
                  "en-IN"
                )}. Status: ${orderComplete.paymentStatus}. Customer: ${orderComplete.fullName}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#25D366] hover:bg-[#20ba59] text-white px-6 py-3.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <MessageCircle size={16} />
              <span>Track / Verify on WhatsApp</span>
            </a>

            <Link
              href="/shop"
              className="flex-1 bg-[#0E382B] hover:bg-[#144636] text-white px-6 py-3.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <span>Return to Boutique</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOnline = form.paymentMethod !== "cod";
  const hasEnteredUtr = form.utrNumber.trim().length >= 6;

  return (
    <div className="max-w-content mx-auto px-6 md:px-8 py-8 md:py-16">
      <Breadcrumbs items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />

      <div className="max-w-xl my-6 space-y-2">
        <p className="eyebrow">Secure Indian Atelier Checkout</p>
        <h1 className="font-serif text-3xl md:text-5xl text-[#111111]">Express Checkout</h1>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 pt-4">
        {/* Form */}
        <form onSubmit={(e) => handlePlaceOrder(e)} className="lg:col-span-7 space-y-8">
          {/* Contact Details */}
          <div className="border border-[#DDD8D0] bg-white p-6 md:p-8 space-y-4 rounded-xl shadow-sm">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-[#111111] pb-2 border-b border-[#EFEBE4]">
              1. Contact Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#666666] mb-1">
                  Full Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Ananya Roy"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#DDD8D0] rounded-lg bg-[#FAF7F2] focus:outline-none focus:border-[#0E382B]"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#666666] mb-1">
                  Mobile Number (for Courier SMS & WhatsApp) *
                </label>
                <input
                  required
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#DDD8D0] rounded-lg bg-[#FAF7F2] focus:outline-none focus:border-[#0E382B]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-wider text-[#666666] mb-1">
                  Email Address (for IGI Dossier Certificate & Invoice) *
                </label>
                <input
                  required
                  type="email"
                  placeholder="ananya@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#DDD8D0] rounded-lg bg-[#FAF7F2] focus:outline-none focus:border-[#0E382B]"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address with Instant Pincode Auto-Fetch */}
          <div className="border border-[#DDD8D0] bg-white p-6 md:p-8 space-y-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFEBE4]">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
                2. Delivery Address in India
              </h2>
              {pinDetectedMsg && (
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 animate-fadeIn">
                  <CheckCircle2 size={12} /> {pinDetectedMsg}
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#666666] mb-1">
                  Street Address & House / Flat No. *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Flat 4B, Heritage Enclave, Hazratganj"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#DDD8D0] rounded-lg bg-[#FAF7F2] focus:outline-none focus:border-[#0E382B]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs uppercase tracking-wider text-[#666666] mb-1 flex items-center justify-between">
                    <span>PIN Code *</span>
                    {isDetectingPin && (
                      <span className="text-[10px] text-[#C5A880] animate-pulse">Detecting...</span>
                    )}
                  </label>
                  <input
                    required
                    type="text"
                    maxLength={6}
                    placeholder="226001"
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-[#C5A880] font-semibold rounded-lg bg-[#FFFDF5] focus:outline-none focus:ring-1 focus:ring-[#0E382B]"
                  />
                  <span className="text-[10px] text-[#888888] block mt-0.5">
                    City/State auto-fetch
                  </span>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#666666] mb-1">
                    City *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Lucknow"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-[#DDD8D0] rounded-lg bg-[#FAF7F2] focus:outline-none focus:border-[#0E382B]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#666666] mb-1">
                    State *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-[#DDD8D0] rounded-lg bg-[#FAF7F2] focus:outline-none focus:border-[#0E382B]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method & UTR / RRN Logic */}
          <div className="border border-[#DDD8D0] bg-white p-6 md:p-8 space-y-4 rounded-xl shadow-sm">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-[#111111] pb-2 border-b border-[#EFEBE4] flex items-center justify-between">
              <span>3. Payment Mode & Security Verification</span>
              <span className="text-[11px] text-[#888888] flex items-center gap-1">
                <Lock size={12} /> 256-Bit SSL Encrypted
              </span>
            </h2>

            <div className="space-y-3">
              {/* Option 1: Cash on Delivery (COD) */}
              <label
                className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                  form.paymentMethod === "cod"
                    ? "border-[#0E382B] bg-[#F5F9F6]"
                    : "border-[#DDD8D0] hover:bg-[#FAF7F2]"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={form.paymentMethod === "cod"}
                  onChange={() => setForm({ ...form, paymentMethod: "cod" })}
                  className="accent-[#0E382B] mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Banknote size={16} className="text-[#0E382B]" />
                    <span className="text-xs font-semibold text-[#111111]">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.2 rounded">
                      Instant Confirmation
                    </span>
                  </div>
                  <p className="text-[11px] text-[#666666] mt-0.5">
                    Pay via cash or UPI directly to our trusted courier delivery partner at your doorstep.
                  </p>
                </div>
              </label>

              {/* Option 2: Online UPI / QR Payment */}
              <label
                className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                  form.paymentMethod === "upi"
                    ? "border-[#0E382B] bg-[#F5F9F6]"
                    : "border-[#DDD8D0] hover:bg-[#FAF7F2]"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={form.paymentMethod === "upi"}
                  onChange={() => setForm({ ...form, paymentMethod: "upi" })}
                  className="accent-[#0E382B] mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Wallet size={16} className="text-[#0E382B]" />
                    <span className="text-xs font-semibold text-[#111111]">
                      Online UPI / QR Payment (GPay, PhonePe, Paytm)
                    </span>
                    <span className="text-[10px] bg-[#0E382B] text-white font-semibold px-2 py-0.2 rounded">
                      Fastest
                    </span>
                  </div>
                  <p className="text-[11px] text-[#666666] mt-0.5">
                    Scan boutique QR code or pay to UPI ID. Enter 12-digit UTR/RRN to confirm order.
                  </p>
                </div>
              </label>

              {/* Option 3: Online Net Banking */}
              <label
                className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                  form.paymentMethod === "netbanking"
                    ? "border-[#0E382B] bg-[#F5F9F6]"
                    : "border-[#DDD8D0] hover:bg-[#FAF7F2]"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={form.paymentMethod === "netbanking"}
                  onChange={() => setForm({ ...form, paymentMethod: "netbanking" })}
                  className="accent-[#0E382B] mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-[#0E382B]" />
                    <span className="text-xs font-semibold text-[#111111]">
                      Online Net Banking (IMPS / NEFT / RTGS)
                    </span>
                  </div>
                  <p className="text-[11px] text-[#666666] mt-0.5">
                    Direct transfer to AYOR Atelier official current account.
                  </p>
                </div>
              </label>

              {/* Option 4: Debit / Credit Card */}
              <label
                className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                  form.paymentMethod === "card"
                    ? "border-[#0E382B] bg-[#F5F9F6]"
                    : "border-[#DDD8D0] hover:bg-[#FAF7F2]"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={form.paymentMethod === "card"}
                  onChange={() => setForm({ ...form, paymentMethod: "card" })}
                  className="accent-[#0E382B] mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-[#0E382B]" />
                    <span className="text-xs font-semibold text-[#111111]">
                      Debit / Credit Card (Visa, Mastercard, RuPay)
                    </span>
                  </div>
                  <p className="text-[11px] text-[#666666] mt-0.5">
                    Secure card gateway. Enter transaction authorization RRN after payment.
                  </p>
                </div>
              </label>
            </div>

            {/* EXPANDABLE SECTION: Online Payment Details + UTR Input + WhatsApp Bridge */}
            {isOnline && (
              <div className="mt-4 pt-4 border-t border-[#DDD8D0] space-y-4 bg-[#FAF7F2] p-5 rounded-xl border">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#DDD8D0]">
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-[#111111] flex items-center gap-1.5">
                      <QrCode size={15} className="text-[#C5A880]" />
                      <span>Atelier Official UPI ID:</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono font-bold bg-[#FAF7F2] px-2 py-1 rounded text-[#0E382B] border border-[#DDD8D0]">
                        ayorjewellery@okaxis
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="text-[11px] text-[#0E382B] hover:underline flex items-center gap-0.5 font-medium"
                      >
                        <Copy size={12} />
                        <span>{copiedUpi ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-[#666666]">
                      Amount to Pay: <strong>₹{total.toLocaleString("en-IN")}</strong>
                    </p>
                  </div>

                  <div className="text-center bg-white p-2 border border-[#DDD8D0] rounded-lg shadow-2xs">
                    {/* SVG Stylized QR Code for visual luxury */}
                    <div className="w-24 h-24 bg-[#FAF7F2] border border-[#DDD8D0] rounded flex flex-col items-center justify-center text-center p-1">
                      <QrCode size={40} className="text-[#0E382B]" />
                      <span className="text-[9px] font-bold text-[#0E382B] mt-1">Scan to Pay</span>
                    </div>
                  </div>
                </div>

                {/* MANDATORY UTR / RRN NUMBER INPUT BOX */}
                <div className="bg-white p-4 rounded-xl border-2 border-[#C5A880] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs uppercase tracking-wider font-bold text-[#0E382B]">
                      Enter Payment UTR / RRN / Transaction Number *
                    </label>
                    <span className="text-[9px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-semibold uppercase">
                      Mandatory for Online Orders
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 412890123456 (12 digits from GPay / PhonePe / Bank)"
                    value={form.utrNumber}
                    onChange={(e) => setForm({ ...form, utrNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-mono font-semibold border border-[#DDD8D0] rounded-lg bg-[#FFFDF5] focus:outline-none focus:ring-1 focus:ring-[#0E382B]"
                  />
                  <p className="text-[11px] text-[#666666]">
                    Jab tak payment UTR number nahi dalenge ya Cash on Delivery choose nahi karenge, tab tak order confirm nahi hoga.
                  </p>
                </div>

                {/* WHATSAPP CONCIERGE BRIDGE */}
                <div className="bg-[#EAF3DE] border border-[#C5DDA8] p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#1B3B30]">
                    <MessageCircle size={16} className="text-[#25D366]" />
                    <span>Or Confirm Directly on WhatsApp:</span>
                  </div>
                  <p className="text-[11px] text-[#2D5A47]">
                    Agar aapne payment kar di hai aur direct WhatsApp par screenshot/RRN bhejna chahte hain, to neeche click karein. Aapka cart aur details automatic transfer ho jayenge:
                  </p>
                  <button
                    type="button"
                    onClick={() => handlePlaceOrder(undefined, "whatsapp_confirm")}
                    disabled={isPlacing || cart.length === 0}
                    className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <MessageCircle size={15} />
                    <span>Pay & Share Cart on WhatsApp (चैट पर ऑर्डर करें)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isPlacing || cart.length === 0}
            className={`w-full py-4 text-xs uppercase tracking-wider font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 ${
              form.paymentMethod === "cod" || hasEnteredUtr
                ? "bg-[#0E382B] hover:bg-[#144636] text-white cursor-pointer"
                : "bg-stone-300 text-stone-600 cursor-not-allowed"
            }`}
          >
            {isPlacing ? (
              "Securing Your Atelier Order..."
            ) : form.paymentMethod === "cod" ? (
              <>
                <span>Confirm Order via Cash on Delivery (₹{total.toLocaleString("en-IN")})</span>
                <ArrowRight size={14} />
              </>
            ) : hasEnteredUtr ? (
              <>
                <span>
                  Confirm Order with UTR #{form.utrNumber.slice(0, 4)}... (₹
                  {total.toLocaleString("en-IN")})
                </span>
                <CheckCircle2 size={14} />
              </>
            ) : (
              <>
                <span>Enter UTR/RRN Number to Confirm Order</span>
                <Lock size={14} />
              </>
            )}
          </button>
        </form>

        {/* Right Summary */}
        <div className="lg:col-span-5">
          <div className="border border-[#DDD8D0] bg-white p-6 md:p-8 space-y-6 lg:sticky lg:top-28 shadow-sm rounded-xl">
            <h2 className="font-serif text-2xl text-[#111111] pb-3 border-b border-[#EFEBE4]">
              Items in Order ({cart.length})
            </h2>

            <div className="divide-y divide-[#EFEBE4] max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-serif text-sm font-medium text-[#111111]">
                      {item.product.name}
                    </p>
                    <p className="text-[11px] text-[#666666]">
                      {item.selectedMetal || item.product.metal} ({item.product.purity})
                      {item.size ? ` • Size: ${item.size}` : ""} • Qty {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium text-[#111111]">
                    ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-[#EFEBE4] text-xs text-[#666666]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{(total - gst).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Applicable GST (3%)</span>
                <span>₹{gst.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Insured Courier Delivery</span>
                <span className="text-[#0E382B] font-medium">Free</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#EFEBE4] text-sm font-serif font-semibold text-[#111111]">
                <span>Total Amount</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="p-4 bg-[#FAF7F2] border border-[#DDD8D0] rounded-lg space-y-2 text-[11px] text-[#666666]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#C5A880]" />
                <span>IGI Certificate and BIS Hallmark guarantees enclosed.</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={14} className="text-[#C5A880]" />
                <span>Dispatched within 3-5 days in tamper-proof security box.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
