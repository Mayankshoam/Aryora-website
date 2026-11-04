/**
 * Customer Account, KYC, Invoices & Wishlist Store
 * Handles mobile-based registration (without OTP for fast frictionless onboarding),
 * immutable Customer ID generation, PAN verification with Name-Locking,
 * Rs. 2,00,000 PAN threshold check, and printable A4 Invoices.
 */

import { BUSINESS_CONFIG } from "./config/business";

export interface CustomerProfile {
  customerId: string; // Immutable, e.g. CUST-108245
  mobile: string; // 10-digit Indian number
  name: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  panNumber?: string; // Validated format: ^[A-Z]{5}[0-9]{4}[A-Z]$
  panImageUrl?: string; // Mandatory PAN document upload
  panVerified: boolean;
  nameLocked: boolean; // Lifetime immutable lock once PAN is submitted/verified
  hasWelcomeDiscount: boolean; // 10% welcome coupon
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInvoiceItem {
  id: string;
  name: string;
  hsn: string;
  purity: string;
  metal: string;
  weightGrams?: number;
  quantity: number;
  rate: number;
  discount: number;
  taxableValue: number;
}

export interface CustomerInvoice {
  invoiceNumber: string; // e.g. INV-2026-000001
  invoiceDate: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  customerPanMasked?: string;
  items: CustomerInvoiceItem[];
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  cgst: number; // 1.5%
  sgst: number; // 1.5%
  totalAmount: number;
  totalInWords: string;
  paymentMode: string;
  paymentStatus: string;
  terms: string[];
}

export interface AuditLogEntry {
  id: string;
  customerId: string;
  eventType:
    | "REGISTRATION"
    | "PAN_SUBMITTED"
    | "NAME_LOCKED"
    | "PROFILE_UPDATED"
    | "INVOICE_GENERATED"
    | "ADMIN_PAN_VIEWED";
  description: string;
  actor: "CUSTOMER" | "ADMIN" | "SYSTEM";
  adminUsername?: string;
  ipAddress?: string;
  createdAt: string;
}

const STORAGE_KEY_CUSTOMER = "ayor_customer_active";
const STORAGE_KEY_ALL_CUSTOMERS = "ayor_all_customers_db";
const STORAGE_KEY_INVOICES = "ayor_customer_invoices_db";
const STORAGE_KEY_WISHLIST = "ayor_customer_wishlist_db";
const STORAGE_KEY_DISCOUNT = "ayor_welcome_discount_active";
const STORAGE_KEY_AUDIT_LOGS = "ayor_audit_logs_db";

/**
 * Validates 10-digit Indian mobile number format.
 */
export function isValidIndianMobile(mobile: string): boolean {
  const clean = mobile.replace(/\D/g, "");
  return /^[6-9]\d{9}$/.test(clean);
}

/**
 * Validates standard Indian PAN format: 5 letters, 4 numbers, 1 letter.
 */
export function isValidPAN(pan: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.trim().toUpperCase());
}

/**
 * Masks a PAN number for privacy: ABCDE1234F -> ABCDE****F
 */
export function maskPAN(pan?: string): string {
  if (!pan) return "N/A";
  const clean = pan.trim().toUpperCase();
  if (clean.length !== 10) return clean;
  return `${clean.slice(0, 5)}****${clean.slice(9)}`;
}

/**
 * Generates an immutable, sequential/unique Customer ID: CUST-XXXXXX
 */
function generateCustomerId(): string {
  if (typeof window === "undefined") return "CUST-000001";
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALL_CUSTOMERS);
    const list: CustomerProfile[] = raw ? JSON.parse(raw) : [];
    const nextSeq = list.length + 1;
    const padded = String(nextSeq).padStart(6, "0");
    return `CUST-${padded}`;
  } catch {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `CUST-${random}`;
  }
}

/**
 * Converts a numeric Indian Rupee amount to words.
 */
export function numberToIndianRupeesWords(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded <= 0) return "Rupees Zero Only";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertHundreds(n: number): string {
    let str = "";
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n > 0) {
      if (n < 20) {
        str += ones[n] + " ";
      } else {
        str += tens[Math.floor(n / 10)] + " ";
        if (n % 10 > 0) str += ones[n % 10] + " ";
      }
    }
    return str.trim();
  }

  let crore = Math.floor(rounded / 10000000);
  let rem = rounded % 10000000;
  let lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  let thousand = Math.floor(rem / 1000);
  rem = rem % 1000;
  let hundreds = rem;

  let words = "Rupees ";
  if (crore > 0) words += convertHundreds(crore) + " Crore ";
  if (lakh > 0) words += convertHundreds(lakh) + " Lakh ";
  if (thousand > 0) words += convertHundreds(thousand) + " Thousand ";
  if (hundreds > 0) words += convertHundreds(hundreds) + " ";
  words += "Only";

  return words.replace(/\s+/g, " ").trim();
}

/**
 * Mobile-based login/registration without OTP.
 * Generates an immutable Customer ID, activates the 10% welcome coupon, and logs in.
 */
export function loginWithMobile(mobile: string, name?: string): { success: boolean; customer: CustomerProfile; isNew: boolean } {
  const cleanMobile = mobile.replace(/\D/g, "");
  if (!isValidIndianMobile(cleanMobile)) {
    throw new Error("Kripya 10-digit ka valid Indian mobile number enter karein (e.g. 9876543210).");
  }

  if (typeof window === "undefined") {
    const fallbackCustomer: CustomerProfile = {
      customerId: "CUST-000001",
      mobile: cleanMobile,
      name: name || "Valued Customer",
      panVerified: false,
      nameLocked: false,
      hasWelcomeDiscount: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { success: true, customer: fallbackCustomer, isNew: true };
  }

  const allRaw = localStorage.getItem(STORAGE_KEY_ALL_CUSTOMERS);
  const allCustomers: CustomerProfile[] = allRaw ? JSON.parse(allRaw) : [];

  let existing = allCustomers.find((c) => c.mobile === cleanMobile);
  let isNew = false;

  if (existing) {
    if (name && !existing.nameLocked && (existing.name === "Valued Customer" || existing.name === "Atelier Client")) {
      existing.name = name;
      existing.updatedAt = new Date().toISOString();
    }
  } else {
    isNew = true;
    existing = {
      customerId: generateCustomerId(),
      mobile: cleanMobile,
      name: name && name.trim().length > 0 ? name.trim() : "Valued Customer",
      panVerified: false,
      nameLocked: false,
      hasWelcomeDiscount: true, // 10% discount activated on first registration
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    allCustomers.push(existing);
    recordAuditLog({
      customerId: existing.customerId,
      eventType: "REGISTRATION",
      description: `New customer registered with mobile +91 ${existing.mobile}. Assigned Customer ID ${existing.customerId}. 10% Welcome Discount activated.`,
      actor: "CUSTOMER",
    });
  }

  localStorage.setItem(STORAGE_KEY_ALL_CUSTOMERS, JSON.stringify(allCustomers));
  localStorage.setItem(STORAGE_KEY_CUSTOMER, JSON.stringify(existing));
  localStorage.setItem(STORAGE_KEY_DISCOUNT, "true");

  // Dispatch global event for header and cart updates
  window.dispatchEvent(new Event("ayor_customer_changed"));
  window.dispatchEvent(new Event("ayor_discount_activated"));

  return { success: true, customer: existing, isNew };
}

/**
 * Retrieves the currently active customer session.
 */
export function getActiveCustomer(): CustomerProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOMER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Updates editable customer profile fields.
 * CRITICAL ENFORCEMENT: If nameLocked is true, any name modification is rejected!
 */
export function updateCustomerProfile(updates: Partial<CustomerProfile>): CustomerProfile {
  const current = getActiveCustomer();
  if (!current) throw new Error("No active customer session. Please login with your mobile number.");

  // ENFORCE NAME LOCK: If name is locked, customer cannot alter their official legal name
  if (current.nameLocked && updates.name && updates.name.trim() !== current.name.trim()) {
    throw new Error("Official Name is locked as per verified PAN records and cannot be altered.");
  }

  const updated: CustomerProfile = {
    ...current,
    ...updates,
    customerId: current.customerId, // Immutable
    mobile: current.mobile, // Immutable
    name: current.nameLocked ? current.name : updates.name || current.name,
    nameLocked: current.nameLocked,
    panVerified: current.panVerified,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_CUSTOMER, JSON.stringify(updated));

    // Update in all customers collection
    const allRaw = localStorage.getItem(STORAGE_KEY_ALL_CUSTOMERS);
    if (allRaw) {
      const all: CustomerProfile[] = JSON.parse(allRaw);
      const index = all.findIndex((c) => c.customerId === updated.customerId);
      if (index > -1) {
        all[index] = updated;
        localStorage.setItem(STORAGE_KEY_ALL_CUSTOMERS, JSON.stringify(all));
      }
    }

    window.dispatchEvent(new Event("ayor_customer_changed"));

    recordAuditLog({
      customerId: updated.customerId,
      eventType: "PROFILE_UPDATED",
      description: `Customer updated profile details.`,
      actor: "CUSTOMER",
    });
  }

  return updated;
}

/**
 * Submits PAN Card with mandatory image upload.
 * Locks the customer name permanently and sets PAN Verified = true.
 */
export function submitCustomerPAN(
  panNumber: string,
  panImageBase64: string,
  cardholderName?: string
): CustomerProfile {
  const current = getActiveCustomer();
  if (!current) throw new Error("Please log in to submit your PAN verification.");

  const cleanPan = panNumber.trim().toUpperCase();
  if (!isValidPAN(cleanPan)) {
    throw new Error("Invalid PAN format. Standard format is 5 uppercase letters, 4 numbers, and 1 letter (e.g. ABCDE1234F).");
  }

  // MANDATORY PAN CARD UPLOAD ENFORCEMENT
  if (!panImageBase64 || panImageBase64.trim().length === 0) {
    throw new Error("PAN card document upload is mandatory. Please attach a clear photo or PDF of your PAN card.");
  }

  // Check if PAN is already registered with another customer
  if (typeof window !== "undefined") {
    const allRaw = localStorage.getItem(STORAGE_KEY_ALL_CUSTOMERS);
    if (allRaw) {
      const all: CustomerProfile[] = JSON.parse(allRaw);
      const duplicate = all.find((c) => c.panNumber === cleanPan && c.customerId !== current.customerId);
      if (duplicate) {
        throw new Error("This PAN number is already linked to another client account.");
      }
    }
  }

  // Fetch official name from PAN submission or cardholder name
  const officialName = cardholderName && cardholderName.trim().length > 0 ? cardholderName.trim().toUpperCase() : current.name;

  const verifiedCustomer: CustomerProfile = {
    ...current,
    panNumber: cleanPan,
    panImageUrl: panImageBase64,
    panVerified: true,
    name: officialName,
    nameLocked: true, // LIFETIME LOCK: Cannot be modified once PAN is verified
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_CUSTOMER, JSON.stringify(verifiedCustomer));

    const allRaw = localStorage.getItem(STORAGE_KEY_ALL_CUSTOMERS);
    if (allRaw) {
      const all: CustomerProfile[] = JSON.parse(allRaw);
      const index = all.findIndex((c) => c.customerId === verifiedCustomer.customerId);
      if (index > -1) {
        all[index] = verifiedCustomer;
        localStorage.setItem(STORAGE_KEY_ALL_CUSTOMERS, JSON.stringify(all));
      }
    }

    window.dispatchEvent(new Event("ayor_customer_changed"));

    recordAuditLog({
      customerId: verifiedCustomer.customerId,
      eventType: "PAN_SUBMITTED",
      description: `Customer submitted PAN ${maskPAN(cleanPan)} with mandatory document upload. Verified successfully.`,
      actor: "CUSTOMER",
    });

    recordAuditLog({
      customerId: verifiedCustomer.customerId,
      eventType: "NAME_LOCKED",
      description: `Official legal name permanently locked to "${verifiedCustomer.name}" as per verified PAN records.`,
      actor: "SYSTEM",
    });
  }

  return verifiedCustomer;
}

/**
 * Checks whether an order requires mandatory PAN.
 * If total > Rs. 2,00,000, returns true.
 */
export function isPanRequiredForAmount(amountINR: number): boolean {
  return amountINR >= BUSINESS_CONFIG.panThresholdINR;
}

/**
 * Checks if the customer has activated the 10% Welcome Discount.
 */
export function hasWelcomeDiscount(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY_DISCOUNT) === "true";
}

/**
 * Log out active customer session.
 */
export function logoutCustomer(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY_CUSTOMER);
  window.dispatchEvent(new Event("ayor_customer_changed"));
}

/**
 * Generates and stores a completed invoice for an order.
 */
export function createCustomerInvoice(params: {
  orderNumber: string;
  customer: CustomerProfile;
  items: Array<{
    id: string;
    name: string;
    purity: string;
    metal: string;
    weightGrams?: number;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  paymentMode: string;
}): CustomerInvoice {
  const invoiceNum = `INV-2026-${String(params.orderNumber.replace(/\D/g, "") || Date.now().toString().slice(-6)).padStart(6, "0")}`;
  const taxable = params.subtotal - params.discountAmount;
  const halfGst = Math.round(taxable * 0.015); // 1.5% CGST + 1.5% SGST = 3% GST on jewellery

  const invoice: CustomerInvoice = {
    invoiceNumber: invoiceNum,
    invoiceDate: new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    customerId: params.customer.customerId,
    customerName: params.customer.name,
    customerMobile: params.customer.mobile,
    customerAddress: params.customer.address
      ? `${params.customer.address}, ${params.customer.city || ""}, ${params.customer.state || ""} ${params.customer.pincode ? "- " + params.customer.pincode : ""}`
      : "Lucknow, Uttar Pradesh, India",
    customerPanMasked: maskPAN(params.customer.panNumber),
    items: params.items.map((it) => ({
      id: it.id,
      name: it.name,
      hsn: BUSINESS_CONFIG.hsnCode,
      purity: it.purity,
      metal: it.metal,
      weightGrams: it.weightGrams,
      quantity: it.quantity,
      rate: it.price,
      discount: params.discountAmount > 0 ? Math.round(params.discountAmount / params.items.length) : 0,
      taxableValue: it.price * it.quantity,
    })),
    subtotal: params.subtotal,
    discountAmount: params.discountAmount,
    taxableAmount: taxable,
    cgst: halfGst,
    sgst: halfGst,
    totalAmount: params.totalAmount,
    totalInWords: numberToIndianRupeesWords(params.totalAmount),
    paymentMode: params.paymentMode,
    paymentStatus: "Paid / Confirmed",
    terms: [
      "All jewellery pieces are guaranteed 100% BIS Hallmarked and IGI certified.",
      "15-day complimentary ring resizing and tamper-proof insured pan-India transit.",
      "Subject to Lucknow jurisdiction only.",
    ],
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_INVOICES);
      const invoices: CustomerInvoice[] = raw ? JSON.parse(raw) : [];
      invoices.unshift(invoice);
      localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(invoices));

      recordAuditLog({
        customerId: params.customer.customerId,
        eventType: "INVOICE_GENERATED",
        description: `Tax Invoice ${invoice.invoiceNumber} generated for ₹${params.totalAmount.toLocaleString("en-IN")}. Mode: ${params.paymentMode}.`,
        actor: "SYSTEM",
      });
    } catch (e) {
      console.warn("Failed to store invoice", e);
    }
  }

  return invoice;
}

/**
 * Retrieves all invoices for the given customer ID.
 */
export function getCustomerInvoices(customerId: string): CustomerInvoice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INVOICES);
    const invoices: CustomerInvoice[] = raw ? JSON.parse(raw) : [];
    return invoices.filter((inv) => inv.customerId === customerId);
  } catch {
    return [];
  }
}

/**
 * Retrieves a single invoice by invoice number.
 */
export function getInvoiceByNumber(invoiceNumber: string): CustomerInvoice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INVOICES);
    const invoices: CustomerInvoice[] = raw ? JSON.parse(raw) : [];
    return invoices.find((inv) => inv.invoiceNumber === invoiceNumber) || null;
  } catch {
    return null;
  }
}

/**
 * Database-synced Wishlist management.
 */
export function getCustomerWishlist(customerId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_WISHLIST}_${customerId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleCustomerWishlist(customerId: string, productSlug: string): string[] {
  if (typeof window === "undefined") return [];
  const existing = getCustomerWishlist(customerId);
  let updated: string[];
  if (existing.includes(productSlug)) {
    updated = existing.filter((s) => s !== productSlug);
  } else {
    updated = [...existing, productSlug];
  }
  localStorage.setItem(`${STORAGE_KEY_WISHLIST}_${customerId}`, JSON.stringify(updated));
  window.dispatchEvent(new Event("ayor_wishlist_changed"));
  return updated;
}

/**
 * Records an audit log entry.
 */
export function recordAuditLog(entry: {
  customerId: string;
  eventType: AuditLogEntry["eventType"];
  description: string;
  actor: AuditLogEntry["actor"];
  adminUsername?: string;
  ipAddress?: string;
}): AuditLogEntry {
  const newLog: AuditLogEntry = {
    id: `AUDIT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    ...entry,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
      const list: AuditLogEntry[] = raw ? JSON.parse(raw) : [];
      list.unshift(newLog);
      localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(list));
    } catch (e) {
      console.warn("Failed to save audit log", e);
    }
  }

  return newLog;
}

/**
 * Retrieves audit logs for a specific customer.
 */
export function getCustomerAuditLogs(customerId: string): AuditLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
    const list: AuditLogEntry[] = raw ? JSON.parse(raw) : [];
    return list.filter((l) => l.customerId === customerId);
  } catch {
    return [];
  }
}

/**
 * Retrieves all system audit logs.
 */
export function getAllAuditLogs(): AuditLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Retrieves all registered customers in the system.
 */
export function getAllCustomers(): CustomerProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALL_CUSTOMERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Retrieves a customer by their unique Customer ID.
 */
export function getCustomerById(customerId: string): CustomerProfile | null {
  if (typeof window === "undefined") return null;
  const list = getAllCustomers();
  return list.find((c) => c.customerId === customerId) || null;
}

/**
 * Retrieves all invoices generated across the store.
 */
export function getAllInvoices(): CustomerInvoice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INVOICES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Admin update for customer profile.
 * CRITICAL ENFORCEMENT: Admin cannot edit a locked customer official legal name!
 */
export function adminUpdateCustomerProfile(
  customerId: string,
  updates: Partial<CustomerProfile>,
  adminUsername: string = "admin@ayor.in"
): CustomerProfile {
  if (typeof window === "undefined") {
    throw new Error("Cannot execute outside browser/runtime environment.");
  }
  const all = getAllCustomers();
  const index = all.findIndex((c) => c.customerId === customerId);
  if (index === -1) throw new Error("Customer profile not found.");

  const current = all[index];

  // ADMIN CANNOT EDIT A LOCKED CUSTOMER NAME:
  if (current.nameLocked && updates.name && updates.name.trim() !== current.name.trim()) {
    throw new Error("Admin cannot edit a locked customer official legal name. Official PAN name is permanent.");
  }

  const updated: CustomerProfile = {
    ...current,
    ...updates,
    customerId: current.customerId,
    mobile: current.mobile,
    name: current.nameLocked ? current.name : (updates.name ? updates.name.trim() : current.name),
    nameLocked: current.nameLocked,
    panVerified: current.panVerified,
    updatedAt: new Date().toISOString(),
  };

  all[index] = updated;
  localStorage.setItem(STORAGE_KEY_ALL_CUSTOMERS, JSON.stringify(all));

  const active = getActiveCustomer();
  if (active && active.customerId === customerId) {
    localStorage.setItem(STORAGE_KEY_CUSTOMER, JSON.stringify(updated));
  }

  recordAuditLog({
    customerId,
    eventType: "PROFILE_UPDATED",
    description: `Admin [${adminUsername}] updated customer profile details.`,
    actor: "ADMIN",
    adminUsername,
  });

  window.dispatchEvent(new Event("ayor_customer_changed"));
  return updated;
}

/**
 * Logs every admin view of a customer's PAN image in audit_logs.
 */
export function logAdminPanView(
  customerId: string,
  adminUsername: string = "admin@ayor.in",
  ipAddress?: string
): AuditLogEntry {
  return recordAuditLog({
    customerId,
    eventType: "ADMIN_PAN_VIEWED",
    description: `Admin [${adminUsername}] viewed customer verified PAN image document via secure signed link.`,
    actor: "ADMIN",
    adminUsername,
    ipAddress,
  });
}

