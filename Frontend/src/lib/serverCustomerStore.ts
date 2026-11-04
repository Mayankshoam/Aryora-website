/**
 * Server-Side Customer & Audit Store for Next.js Route Handlers
 * Persists and provides seed records for development and API routes.
 */

import { CustomerProfile, CustomerInvoice, AuditLogEntry, maskPAN } from "./customerStore";

// In-memory server state
let serverCustomers: CustomerProfile[] = [];
let serverInvoices: CustomerInvoice[] = [];
let serverAuditLogs: AuditLogEntry[] = [];
let serverWishlists: Record<string, string[]> = {};

/**
 * Initializes realistic default records if store is empty
 */
function ensureSeeded() {
  if (serverCustomers.length > 0) return;

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // 1. Seed Customers
  serverCustomers = [
    {
      customerId: "CUST-000001",
      mobile: "9876543210",
      name: "PRIYA AGARWAL",
      email: "priya.agarwal@example.com",
      address: "14 Hazratganj Commercial Enclave",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226001",
      panNumber: "ABCDE1234F",
      panImageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      panVerified: true,
      nameLocked: true, // Permanent lock
      hasWelcomeDiscount: true,
      createdAt: lastWeek.toISOString(),
      updatedAt: yesterday.toISOString(),
    },
    {
      customerId: "CUST-000002",
      mobile: "9876543211",
      name: "Rohan Khanna",
      email: "rohan.khanna@example.com",
      address: "B-42 Sector 18, Indira Nagar",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226016",
      panVerified: false,
      nameLocked: false, // Editable
      hasWelcomeDiscount: true,
      createdAt: yesterday.toISOString(),
      updatedAt: yesterday.toISOString(),
    },
    {
      customerId: "CUST-000003",
      mobile: "9876543212",
      name: "VIKRAMADITYA CHOUDHARY",
      email: "vikramaditya@example.com",
      address: "88 Gomti Nagar Vistar",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226010",
      panNumber: "BKZPC5678M",
      panImageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      panVerified: true,
      nameLocked: true,
      hasWelcomeDiscount: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ];

  // 2. Seed Wishlists
  serverWishlists = {
    "CUST-000001": ["solitaire-ring-01", "diamond-tennis-bracelet-01"],
    "CUST-000002": ["solitaire-ring-02"],
    "CUST-000003": ["emerald-cut-solitaire", "diamond-pendant-01"],
  };

  // 3. Seed Invoices
  serverInvoices = [
    {
      invoiceNumber: "INV-2026-000001",
      invoiceDate: "02 Nov 2026",
      customerId: "CUST-000001",
      customerName: "PRIYA AGARWAL",
      customerMobile: "9876543210",
      customerAddress: "14 Hazratganj Commercial Enclave, Lucknow, Uttar Pradesh - 226001",
      customerPanMasked: "ABCDE****F",
      items: [
        {
          id: "item-1",
          name: "Aura Round Brilliant Solitaire Ring (1.50ct)",
          hsn: "7113",
          purity: "18K Gold",
          metal: "Yellow Gold",
          weightGrams: 4.8,
          quantity: 1,
          rate: 220000,
          discount: 22000,
          taxableValue: 198000,
        },
      ],
      subtotal: 220000,
      discountAmount: 22000,
      taxableAmount: 198000,
      cgst: 2970, // 1.5%
      sgst: 2970, // 1.5%
      totalAmount: 203940,
      totalInWords: "Rupees Two Lakh Three Thousand Nine Hundred Forty Only",
      paymentMode: "Net Banking (UTR: HDFC09823471)",
      paymentStatus: "Paid / Confirmed",
      terms: [
        "100% BIS Hallmarked and IGI certified.",
        "Complimentary 15-day resizing.",
        "Lucknow jurisdiction only.",
      ],
    },
  ];

  // 4. Seed Audit Logs
  serverAuditLogs = [
    {
      id: "AUDIT-1001",
      customerId: "CUST-000001",
      eventType: "REGISTRATION",
      description: "Customer registered with mobile +91 9876543210. Assigned Customer ID CUST-000001.",
      actor: "CUSTOMER",
      createdAt: lastWeek.toISOString(),
    },
    {
      id: "AUDIT-1002",
      customerId: "CUST-000001",
      eventType: "PAN_SUBMITTED",
      description: "Customer submitted PAN ABCDE****F with mandatory document upload. Verified successfully.",
      actor: "CUSTOMER",
      createdAt: yesterday.toISOString(),
    },
    {
      id: "AUDIT-1003",
      customerId: "CUST-000001",
      eventType: "NAME_LOCKED",
      description: "Official legal name permanently locked to 'PRIYA AGARWAL' as per verified PAN records.",
      actor: "SYSTEM",
      createdAt: yesterday.toISOString(),
    },
    {
      id: "AUDIT-1004",
      customerId: "CUST-000001",
      eventType: "INVOICE_GENERATED",
      description: "Tax Invoice INV-2026-000001 generated for ₹2,03,940.",
      actor: "SYSTEM",
      createdAt: yesterday.toISOString(),
    },
  ];
}

export function getServerCustomers(): CustomerProfile[] {
  ensureSeeded();
  return serverCustomers;
}

export function getServerCustomerById(customerId: string): CustomerProfile | null {
  ensureSeeded();
  return serverCustomers.find((c) => c.customerId === customerId) || null;
}

export function updateServerCustomer(
  customerId: string,
  updates: Partial<CustomerProfile>,
  adminUsername: string = "admin@ayor.in"
): CustomerProfile {
  ensureSeeded();
  const index = serverCustomers.findIndex((c) => c.customerId === customerId);
  if (index === -1) throw new Error("Customer profile not found.");

  const current = serverCustomers[index];

  // ENFORCE: ADMIN CANNOT EDIT LOCKED CUSTOMER NAME
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

  serverCustomers[index] = updated;

  recordServerAuditLog({
    customerId,
    eventType: "PROFILE_UPDATED",
    description: `Admin [${adminUsername}] updated customer profile details.`,
    actor: "ADMIN",
    adminUsername,
  });

  return updated;
}

export function getServerInvoices(): CustomerInvoice[] {
  ensureSeeded();
  return serverInvoices;
}

export function getServerCustomerWishlist(customerId: string): string[] {
  ensureSeeded();
  return serverWishlists[customerId] || [];
}

export function getServerAuditLogs(customerId?: string): AuditLogEntry[] {
  ensureSeeded();
  if (customerId) {
    return serverAuditLogs.filter((l) => l.customerId === customerId);
  }
  return serverAuditLogs;
}

export function recordServerAuditLog(entry: {
  customerId: string;
  eventType: AuditLogEntry["eventType"];
  description: string;
  actor: AuditLogEntry["actor"];
  adminUsername?: string;
  ipAddress?: string;
}): AuditLogEntry {
  ensureSeeded();
  const newLog: AuditLogEntry = {
    id: `AUDIT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    ...entry,
    createdAt: new Date().toISOString(),
  };
  serverAuditLogs.unshift(newLog);
  return newLog;
}

