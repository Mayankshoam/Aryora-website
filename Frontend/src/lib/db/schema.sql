-- ====================================================================
-- AYOR Fine Jewellery Atelier: Customer Accounts, KYC, Invoices & Wishlist Schema
-- Database: PostgreSQL 14+ / Supabase
-- ====================================================================

-- 1. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id VARCHAR(32) UNIQUE NOT NULL, -- e.g. CUST-000001 (Immutable)
    mobile VARCHAR(15) UNIQUE NOT NULL,      -- 10-digit Indian mobile
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    pan_number VARCHAR(100),                 -- Encrypted or plain text
    pan_hash VARCHAR(64) UNIQUE,             -- SHA256 hash to prevent duplicate PAN across accounts
    pan_image_url TEXT,                      -- Private storage path for uploaded PAN card
    pan_verified BOOLEAN DEFAULT FALSE,
    name_locked BOOLEAN DEFAULT FALSE,       -- Permanent lock once PAN is verified
    has_welcome_discount BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_mobile ON public.customers(mobile);
CREATE INDEX IF NOT EXISTS idx_customers_customer_id ON public.customers(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_pan_hash ON public.customers(pan_hash);

-- 2. OTP REQUESTS TABLE (Pluggable for SMS API)
CREATE TABLE IF NOT EXISTS public.otp_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mobile VARCHAR(15) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    attempts INT DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_mobile ON public.otp_requests(mobile);

-- 3. INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(64) UNIQUE NOT NULL, -- e.g. INV-2026-000001
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    customer_id VARCHAR(32) NOT NULL REFERENCES public.customers(customer_id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_mobile VARCHAR(15) NOT NULL,
    customer_address TEXT,
    customer_pan_masked VARCHAR(20),
    subtotal NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    taxable_amount NUMERIC(12, 2) NOT NULL,
    cgst NUMERIC(12, 2) NOT NULL,               -- 1.5%
    sgst NUMERIC(12, 2) NOT NULL,               -- 1.5%
    total_amount NUMERIC(12, 2) NOT NULL,
    total_in_words TEXT NOT NULL,
    payment_mode VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'Paid',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON public.invoices(customer_id);

-- 4. INVOICE ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    hsn_code VARCHAR(20) DEFAULT '7113',
    purity VARCHAR(50) NOT NULL,
    metal VARCHAR(50) NOT NULL,
    weight_grams NUMERIC(8, 3),
    quantity INT NOT NULL DEFAULT 1,
    rate NUMERIC(12, 2) NOT NULL,
    discount NUMERIC(12, 2) DEFAULT 0.00,
    taxable_value NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON public.invoice_items(invoice_id);

-- 5. WISHLIST ITEMS TABLE (Unique constraint on customer_id + product_id)
CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id VARCHAR(32) NOT NULL REFERENCES public.customers(customer_id) ON DELETE CASCADE,
    product_slug VARCHAR(120) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_customer_product UNIQUE (customer_id, product_slug)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_customer ON public.wishlist_items(customer_id);

-- 6. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id VARCHAR(32) NOT NULL,
    event_type VARCHAR(64) NOT NULL, -- 'PAN_SUBMITTED', 'NAME_LOCKED', 'INVOICE_GENERATED'
    description TEXT NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_customer ON public.audit_logs(customer_id);
