"use client";

import { useState, useEffect, useRef } from "react";
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
  Tag,
  UploadCloud,
  FileText,
} from "lucide-react";
import { useAryoraStore } from "@/lib/store";
import { lookupPincode } from "@/lib/pincode";
import { saveOrderToSupabase, updateOrderUTR, OrderRecord } from "@/lib/supabase";
import {
  getActiveCustomer,
  isPanRequiredForAmount,
  hasWelcomeDiscount,
  submitCustomerPAN,
  createCustomerInvoice,
  CustomerProfile,
  maskPAN,
} from "@/lib/customerStore";
import { BUSINESS_CONFIG } from "@/lib/config/business";

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useAryoraStore();

  const [customer, setCustomer] = useState<CustomerProfile | null>(null);

  // Load active customer session
  useEffect(() => {
    const cust = getActiveCustomer();
    setCustomer(cust);
    if (cust) {
      setForm((prev) => ({
        ...prev,
        fullName: cust.name && cust.name !== "Atelier Client" ? cust.name : prev.fullName,
        phone: cust.mobile || prev.phone,
        email: cust.email || prev.email,
        address: cust.address || prev.address,
        pincode: cust.pincode || prev.pincode,
        city: cust.city || prev.city,
        state: cust.state || prev.state,
      }));
    }
  }, []);

  // Discount & Totals calculation
  const isDiscountActive = hasWelcomeDiscount() || (customer && customer.hasWelcomeDiscount);
  const rawSubtotal = cart.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  const discountAmount = isDiscountActive ? Math.round(rawSubtotal * 0.1) : 0;
  const taxableAmount = Math.max(0, rawSubtotal - discountAmount);
  const gst = Math.round(taxableAmount * 0.03);
  const finalTotal = taxableAmount + gst;

  // PAN Check
  const isHighValue = isPanRequiredForAmount(finalTotal);
  const isPanCompliant = !isHighValue || Boolean(customer?.panVerified);

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

  // Quick PAN Upload modal state in checkout if high value
  const [showPanModal, setShowPanModal] = useState(false);
  const [checkoutPanNum, setCheckoutPanNum] = useState("");
  const [checkoutPanFile, setCheckoutPanFile] = useState<string | null>(null);
  const [checkoutPanFileName, setCheckoutPanFileName] = useState("");
  const [panSubmitError, setPanSubmitError] = useState("");
  const panInputRef = useRef<HTMLInputElement>(null);

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

  const handleCopyUpi = () => {
    navigator.clipboard.writeText("ayorjewellery@okaxis");
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCheckoutPanFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCheckoutPanFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCheckoutPanFile(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCheckoutPan = (e: React.FormEvent) => {
    e.preventDefault();
    setPanSubmitError("");
    if (!checkoutPanFile) {
      setPanSubmitError("PAN card document file upload is mandatory.");
      return;
    }

    try {
      const verified = submitCustomerPAN(checkoutPanNum, checkoutPanFile, form.fullName);
      setCustomer(verified);
      setShowPanModal(false);
    } catch (err: any) {
      setPanSubmitError(err.message || "Failed to verify PAN.");
    }
  };

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

*Order Total:* ₹${finalTotal.toLocaleString("en-IN")}${
      discountAmount > 0 ? ` (Includes 10% Discount -₹${discountAmount})` : ""
    }
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

  // Main order placement handler
  const handlePlaceOrder = async (e?: React.FormEvent, forceMode?: "cod" | "whatsapp_confirm") => {
    if (e) e.preventDefault();

    if (!form.fullName || !form.phone || !form.email || !form.address || !form.pincode) {
      alert("Please fill all mandatory contact and shipping fields.");
      return;
    }

    // MANDATORY PAN ENFORCEMENT FOR ORDERS >= RS. 2,00,000
    if (isHighValue && !isPanCompliant) {
      setShowPanModal(true);
      alert(
        `Orders of ₹${BUSINESS_CONFIG.panThresholdINR.toLocaleString(
          "en-IN"
        )} or above require a verified PAN Card as per Government of India Rule 114B. Please upload your PAN card to proceed.`
      );
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
      subtotal: taxableAmount,
      gst: gst,
      totalAmount: finalTotal,
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

    // 2. Generate Official Invoice for customer
    if (customer) {
      createCustomerInvoice({
        orderNumber: orderNum,
        customer,
        items: cart.map((i) => ({
          id: i.product.id,
          name: i.product.name,
          purity: i.product.purity,
          metal: i.selectedMetal || i.product.metal,
          price: i.product.price,
          quantity: i.quantity,
        })),
        subtotal: rawSubtotal,
        discountAmount: discountAmount,
        totalAmount: finalTotal,
        paymentMode: form.paymentMethod.toUpperCase(),
      });
    }

    // 3. Dispatch automated email notification API
    try {
      await fetch("/api/order-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderRecord),
      });
    } catch (err) {
      console.warn("Order email notification background trigger", err);
    }

    // 4. If WhatsApp redirect requested
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

  // ORDER COMPLETE SCREEN
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

          {/* If Online payment but UTR is missing */}
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
            <Link
              href="/account"
              className="flex-1 bg-[#FAF7F2] border border-[#DDD8D0] hover:bg-[#EFEBE4] text-[#0E382B] px-6 py-3.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <FileText size={16} />
              <span>View Invoice in Account</span>
            </Link>

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

      {/* MANDATORY PAN CARD ALERT BANNER IF ORDER >= RS. 2,00,000 */}
      {isHighValue && !isPanCompliant && (
        <div className="bg-amber-50 border-2 border-amber-400 p-5 rounded-2xl mb-8 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertCircle size={18} className="text-amber-700" />
            <span>Government of India Compliance Alert (Rule 114B)</span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            Your order value is <strong>₹{finalTotal.toLocaleString("en-IN")}</strong>. As per Income Tax Rule 114B, quoting and uploading a verified PAN card is <strong>mandatory for jewellery purchases of ₹2,00,000 or above</strong>.
          </p>
          <button
            type="button"
            onClick={() => setShowPanModal(true)}
            className="bg-[#0E382B] hover:bg-[#144636] text-white px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider mt-1 cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck size={14} />
            <span>Upload PAN Card Now</span>
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-12 pt-2">
        {/* Form */}
        <form onSubmit={(e) => handlePlaceOrder(e)} className="lg:col-span-7 space-y-8">
          {/* Contact Details */}
          <div className="border border-[#DDD8D0] bg-white p-6 md:p-8 space-y-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFEBE4]">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
                1. Contact Information
              </h2>
              {customer && (
                <span className="text-[11px] font-mono text-[#0E382B] font-bold">
                  {customer.customerId}
                </span>
              )}
            </div>
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
                  Mobile Number *
                </label>
                <input
                  required
                  type="tel"
                  placeholder="9876543210"
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

          {/* Shipping Address */}
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

          {/* Payment Method */}
          <div className="border border-[#DDD8D0] bg-white p-6 md:p-8 space-y-4 rounded-xl shadow-sm">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-[#111111] pb-2 border-b border-[#EFEBE4] flex items-center justify-between">
              <span>3. Payment Mode & Security Verification</span>
              <span className="text-[11px] text-[#888888] flex items-center gap-1">
                <Lock size={12} /> 256-Bit SSL Encrypted
              </span>
            </h2>

            <div className="space-y-3">
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
                  </div>
                  <p className="text-[11px] text-[#666666] mt-0.5">
                    Scan boutique QR code or pay to UPI ID. Enter 12-digit UTR/RRN to confirm order.
                  </p>
                </div>
              </label>
            </div>

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
                        className="text-[11px] text-[#0E382B] hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
                      >
                        <Copy size={12} />
                        <span>{copiedUpi ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-[#666666]">
                      Amount to Pay: <strong>₹{finalTotal.toLocaleString("en-IN")}</strong>
                    </p>
                  </div>

                  <div className="text-center bg-white p-2 border border-[#DDD8D0] rounded-lg shadow-2xs">
                    <div className="w-24 h-24 bg-[#FAF7F2] border border-[#DDD8D0] rounded flex flex-col items-center justify-center text-center p-1">
                      <QrCode size={40} className="text-[#0E382B]" />
                      <span className="text-[9px] font-bold text-[#0E382B] mt-1">Scan to Pay</span>
                    </div>
                  </div>
                </div>

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
                </div>

                <div className="bg-[#EAF3DE] border border-[#C5DDA8] p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#1B3B30]">
                    <MessageCircle size={16} className="text-[#25D366]" />
                    <span>Or Confirm Directly on WhatsApp:</span>
                  </div>
                  <p className="text-[11px] text-[#2D5A47]">
                    Agar aapne payment kar di hai aur direct WhatsApp par screenshot/RRN bhejna chahte hain, to neeche click karein:
                  </p>
                  <button
                    type="button"
                    onClick={() => handlePlaceOrder(undefined, "whatsapp_confirm")}
                    disabled={isPlacing || cart.length === 0}
                    className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <MessageCircle size={15} />
                    <span>Pay &amp; Share Cart on WhatsApp (चैट पर ऑर्डर करें)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isPlacing || cart.length === 0 || (isHighValue && !isPanCompliant)}
            className={`w-full py-4 text-xs uppercase tracking-wider font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 ${
              isHighValue && !isPanCompliant
                ? "bg-amber-600 text-white cursor-pointer"
                : form.paymentMethod === "cod" || hasEnteredUtr
                ? "bg-[#0E382B] hover:bg-[#144636] text-white cursor-pointer"
                : "bg-stone-300 text-stone-600 cursor-not-allowed"
            }`}
          >
            {isPlacing ? (
              "Securing Your Atelier Order..."
            ) : isHighValue && !isPanCompliant ? (
              <>
                <span>Upload PAN Card to Proceed (Order ≥ ₹2 Lakh)</span>
                <ShieldCheck size={14} />
              </>
            ) : form.paymentMethod === "cod" ? (
              <>
                <span>Confirm Order via Cash on Delivery (₹{finalTotal.toLocaleString("en-IN")})</span>
                <ArrowRight size={14} />
              </>
            ) : hasEnteredUtr ? (
              <>
                <span>
                  Confirm Order with UTR #{form.utrNumber.slice(0, 4)}... (₹
                  {finalTotal.toLocaleString("en-IN")})
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
                <span>₹{rawSubtotal.toLocaleString("en-IN")}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                  <span className="flex items-center gap-1">
                    <Tag size={12} />
                    <span>Welcome Privilege (10% OFF - AYOR10):</span>
                  </span>
                  <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}

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
                <span>₹{finalTotal.toLocaleString("en-IN")}</span>
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

      {/* QUICK PAN UPLOAD MODAL */}
      {showPanModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white border border-[#DDD8D0] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEBE4]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#0E382B]" />
                <h3 className="font-serif text-lg font-bold text-[#111111]">
                  Upload PAN Card (Rule 114B)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPanModal(false)}
                className="text-gray-400 hover:text-black p-1 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#555555]">
              As per Government of India regulations, quoting and uploading a verified PAN card is mandatory for purchases of ₹2,00,000 or above.
            </p>

            {panSubmitError && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {panSubmitError}
              </p>
            )}

            <form onSubmit={handleSaveCheckoutPan} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">
                  10-Digit PAN Number *
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="ABCDE1234F"
                  value={checkoutPanNum}
                  onChange={(e) => setCheckoutPanNum(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-[#C5A880] rounded-lg uppercase font-mono font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">
                  Upload PAN Document (Mandatory) *
                </label>
                <div
                  onClick={() => panInputRef.current?.click()}
                  className="border-2 border-dashed border-[#C5A880] rounded-xl p-4 text-center cursor-pointer hover:bg-[#FFFDF5]"
                >
                  <input
                    ref={panInputRef}
                    type="file"
                    accept="image/png,image/jpeg,application/pdf"
                    onChange={handleCheckoutPanFile}
                    className="hidden"
                  />
                  <UploadCloud className="mx-auto text-[#C5A880]" size={24} />
                  <p className="text-xs font-semibold text-[#111111] mt-1">
                    {checkoutPanFileName || "Click to select PAN Card file"}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0E382B] hover:bg-[#144636] text-white py-2.5 rounded-lg font-semibold uppercase tracking-wider mt-2 cursor-pointer"
              >
                Verify PAN &amp; Continue Order
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
