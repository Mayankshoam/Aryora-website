# AYOR — Fine Jewellery & Solitaire Atelier
## Customer Accounts, KYC, Invoices & Wishlist Architecture

This module implements the complete customer onboarding, regulatory compliance (Rule 114B Income Tax PAN rules), tax invoice generation, and device-synced wishlist system for AYOR.

---

### 1. Mobile Registration & Frictionless Onboarding (No OTP)
- Customers onboard instantly using their 10-digit Indian mobile number (`/^[6-9]\d{9}$/`).
- Upon first login, a unique, immutable Customer ID is automatically assigned (`CUST-XXXXXX`).
- Instantly unlocks a **Flat 10% Welcome Discount** coupon: **`AYOR10`**.
- Full mock provider architecture is ready in `src/app/api/auth/send-otp` and `verify-otp` for future SMS gateway integration (e.g., MSG91, Twilio).

---

### 2. Customer Profile & Lifetime Name Lock
- Profile fields: `customerId`, `mobile`, `name`, `email`, `address`, `city`, `state`, `pincode`, `panNumber`, `panImageUrl`, `panVerified`, `nameLocked`, `createdAt`, `updatedAt`.
- Customers may modify their name freely **UNTIL** their PAN is submitted and verified.
- Once PAN details and card image are submitted:
  - Official name is fetched and updated from the PAN record.
  - `nameLocked = true`.
  - The name field becomes permanently read-only in both the UI and backend (`updateCustomerProfile` rejects any name alteration attempt).
  - Other contact fields (email, address) remain editable.

---

### 3. Rule 114B Income Tax PAN Verification & Document Upload
- **Mandatory Threshold**: Any order/bill $\ge$ **₹2,00,000** (configured via `BUSINESS_CONFIG.panThresholdINR` in `src/lib/config/business.ts`) strictly requires a verified PAN before checkout or order placement can proceed.
- **Enforcement**: Enforced both on the client checkout page and via the backend validation route `/api/checkout/validate`.
- **Mandatory Upload**: Customers must submit:
  1. A valid 10-character PAN number matching `^[A-Z]{5}[0-9]{4}[A-Z]$`.
  2. A clear document upload (JPG, PNG, or PDF, max 5 MB).
- **Privacy**: PAN number is masked as `ABCDE****F` in UI and invoice views.

---

### 4. Tax Invoices & Blank GSTIN Compliance
- Generates unique sequential invoices: `INV-2026-XXXXXX`.
- **GSTIN**: As explicitly configured, GSTIN is left blank (`""`) across business configurations and invoices.
- Features itemised HSN 7113 breakdown, 3% jewellery GST breakup (1.5% CGST + 1.5% SGST), total in numbers, and total in Indian Rupee words (e.g., *Rupees Two Lakh Fifty Thousand Only*).
- Printable, clean A4 layout view ready for client download and admin reprint.
- Strict authorization: Customers can view/download only their own invoices.

---

### 5. Multi-Device Synced Wishlist
- Persisted against `customerId` (preventing duplicates).
- If a guest clicks the heart icon on any product card or product detail page, it prompts the aesthetic Welcome popup; logging in automatically saves the queued item to their account.
- Dedicated `/wishlist` page allows customers to move items directly into their shopping bag or remove them.

---

### 6. Database Schema & Migrations
The PostgreSQL / Supabase migration schema is located at:
`Frontend/src/lib/db/schema.sql`
Includes tables and indexes for:
- `customers` (indexed by `mobile`, `customer_id`, `pan_hash`)
- `otp_requests`
- `invoices` & `invoice_items` (indexed by `invoice_number`, `customer_id`)
- `wishlist_items` (unique constraint on `customer_id` + `product_id`)
- `audit_logs`

---

### 7. Verification Tests
Run the comprehensive test suite verifying all 5 core business rules:
```bash
npm test --prefix Frontend
```
Output:
- ✔ [Config]: GSTIN is blank ("") and PAN threshold is Rs. 2,00,000.
- ✔ [Validation]: Indian 10-digit mobile and PAN regex validation pass.
- ✔ [Customer ID]: Sequential unique immutable Customer IDs generated successfully.
- ✔ [Name Lock]: Lifetime name-lock enforcement verified.
- ✔ [PAN Threshold]: Rule 114B mandatory PAN requirement for bills >= Rs. 2,00,000 verified.
- ✔ [Wishlist]: Customer wishlist duplicate prevention verified.
- ✔ [Invoices]: Generated unique invoice INV-2026-000042, GSTIN is blank, and access authorization verified.
