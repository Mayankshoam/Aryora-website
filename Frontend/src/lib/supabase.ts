/**
 * Supabase Customer & Order Vault Integration
 * Synchronizes client registration and checkout orders to Supabase database,
 * with automated local fallback caching and Master Admin inspection.
 */

export interface CustomerRecord {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  source?: string;
  createdAt: string;
}

export interface OrderRecord {
  orderNumber: string;
  fullName: string;
  email: string;
  phone: string;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: Array<{
    id: string;
    name: string;
    metal: string;
    purity: string;
    price: number;
    quantity: number;
    size?: string;
  }>;
  subtotal: number;
  gst: number;
  totalAmount: number;
  paymentMode: "cod" | "upi" | "card" | "netbanking" | "whatsapp";
  paymentStatus: "confirmed_cod" | "pending_utr" | "utr_submitted" | "verified";
  utrNumber?: string;
  createdAt: string;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const LOCAL_STORAGE_CUSTOMERS = "ayor_supabase_customers";
const LOCAL_STORAGE_ORDERS = "ayor_supabase_orders";

/**
 * Checks whether active Supabase credentials are configured in the environment.
 */
export function isSupabaseConnected(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * Saves or updates a customer profile to Supabase and local cache.
 */
export async function saveCustomerToSupabase(customer: Omit<CustomerRecord, "createdAt">): Promise<boolean> {
  const record: CustomerRecord = {
    ...customer,
    createdAt: new Date().toISOString(),
  };

  // 1. Save to local fallback cache
  if (typeof window !== "undefined") {
    try {
      const existingRaw = localStorage.getItem(LOCAL_STORAGE_CUSTOMERS);
      const existing: CustomerRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
      const index = existing.findIndex((c) => c.email.toLowerCase() === record.email.toLowerCase());
      if (index > -1) {
        existing[index] = { ...existing[index], ...record };
      } else {
        existing.unshift(record);
      }
      localStorage.setItem(LOCAL_STORAGE_CUSTOMERS, JSON.stringify(existing));
    } catch (e) {
      console.warn("Local customer cache error", e);
    }
  }

  // 2. Sync to Supabase REST endpoint if configured
  if (isSupabaseConnected()) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify({
          full_name: record.fullName,
          email: record.email,
          phone: record.phone,
          address: record.address || "",
          city: record.city || "",
          state: record.state || "",
          pincode: record.pincode || "",
          updated_at: record.createdAt,
        }),
      });
      return response.ok;
    } catch (err) {
      console.error("Supabase customer sync failed:", err);
      return false;
    }
  }

  return true;
}

/**
 * Saves a new placed order to Supabase and local cache.
 */
export async function saveOrderToSupabase(order: OrderRecord): Promise<boolean> {
  // 1. Save to local fallback cache
  if (typeof window !== "undefined") {
    try {
      const existingRaw = localStorage.getItem(LOCAL_STORAGE_ORDERS);
      const existing: OrderRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
      existing.unshift(order);
      localStorage.setItem(LOCAL_STORAGE_ORDERS, JSON.stringify(existing));
    } catch (e) {
      console.warn("Local order cache error", e);
    }
  }

  // Also record customer from order
  await saveCustomerToSupabase({
    fullName: order.fullName,
    email: order.email,
    phone: order.phone,
    address: order.shippingAddress.address,
    city: order.shippingAddress.city,
    state: order.shippingAddress.state,
    pincode: order.shippingAddress.pincode,
    source: "checkout",
  });

  // 2. Sync to Supabase REST endpoint if configured
  if (isSupabaseConnected()) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          order_number: order.orderNumber,
          full_name: order.fullName,
          email: order.email,
          phone: order.phone,
          shipping_address: order.shippingAddress,
          items: order.items,
          subtotal: order.subtotal,
          gst: order.gst,
          total_amount: order.totalAmount,
          payment_mode: order.paymentMode,
          payment_status: order.paymentStatus,
          utr_number: order.utrNumber || null,
          created_at: order.createdAt,
        }),
      });
      return response.ok;
    } catch (err) {
      console.error("Supabase order sync failed:", err);
      return false;
    }
  }

  return true;
}

/**
 * Updates an order's UTR / RRN number after payment submission.
 */
export async function updateOrderUTR(orderNumber: string, utrNumber: string): Promise<boolean> {
  if (typeof window !== "undefined") {
    try {
      const existingRaw = localStorage.getItem(LOCAL_STORAGE_ORDERS);
      if (existingRaw) {
        const existing: OrderRecord[] = JSON.parse(existingRaw);
        const match = existing.find((o) => o.orderNumber === orderNumber);
        if (match) {
          match.utrNumber = utrNumber;
          match.paymentStatus = "utr_submitted";
          localStorage.setItem(LOCAL_STORAGE_ORDERS, JSON.stringify(existing));
        }
      }
    } catch (e) {
      console.warn("Failed to update UTR in localStorage", e);
    }
  }

  if (isSupabaseConnected()) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?order_number=eq.${encodeURIComponent(orderNumber)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            utr_number: utrNumber,
            payment_status: "utr_submitted",
            updated_at: new Date().toISOString(),
          }),
        }
      );
      return response.ok;
    } catch (err) {
      console.error("Failed to patch UTR in Supabase", err);
      return false;
    }
  }

  return true;
}

/**
 * Retrieves all stored customer profiles.
 */
export function getStoredCustomers(): CustomerRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CUSTOMERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Retrieves all stored orders.
 */
export function getStoredOrders(): OrderRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * SQL schema for user to run in Supabase SQL editor.
 */
export const SUPABASE_SQL_SCHEMA = `-- Supabase Schema for AYOR Atelier
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    shipping_address JSONB NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC NOT NULL,
    gst NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    payment_mode TEXT NOT NULL,
    payment_status TEXT NOT NULL,
    utr_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Row Level Security (Public Anonymous Insert Enabled)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated read" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read orders" ON public.orders FOR SELECT USING (true);
`;

