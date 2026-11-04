# Anti-Tarnish Jewellery Collection, Bulk Import Engine & Promotional Pop-up

This module adds a dedicated **Anti-Tarnish Jewellery Collection**, an **Admin Bulk Product Import Engine** (supporting both CSV/Excel uploads and 1-Click PRAO Catalog sync from `https://prao.com/`), and an **Intelligent Promotional Pop-up**.

---

## 1. Collection: `/collections/anti-tarnish`

- **Dedicated Page**: `/collections/anti-tarnish`
- **SEO Title & Metadata**: `Anti-Tarnish Waterproof Jewellery | Everyday Fine Shine | Ayor`
- **Hero Banner**:
  - Highlights **100% Waterproof**, **Sweat-Proof**, **Perfume-Safe**, and **Hypoallergenic** daily wear.
  - 316L Surgical Stainless Steel and 925 Sterling Silver with vacuum PVD 18K Gold Plating.
- **Product Cards**:
  - Displays product image with hover perspective swap.
  - Product name, metal & crystal specifications.
  - Active selling price (Rs. 499 to Rs. 2,999).
  - Strike-through MRP and discount badge (e.g. `₹1,400 (50% OFF)`).
  - Quick Add to Bag button and Wishlist heart.
- **Filters & Sorting**:
  - **Type**: All, Necklaces, Earrings, Rings, Bracelets, Anklets.
  - **Price Range**: ₹499 to ₹2,999 (quick buckets: All, Under ₹999, ₹1,000 – ₹1,999, ₹2,000 – ₹2,999).
  - **Sorting**: New Arrivals, Price: Low to High, Price: High to Low.

---

## 2. Bulk Product Import Engine (from https://prao.com/)

Admin location: `/admin` -> **Import Products** tab.

### CSV/Excel Specification
Columns accepted:
```csv
product_name,sku,category,price,mrp,description,image_urls,stock,tags,image_source
```
- `product_name`: Exact original product title (unmodified).
- `sku`: Unique SKU identifier. Re-importing updates the existing product without duplicates.
- `price`: Selling price within `[499, 2999]`, or auto-adjusted if enabled.
- `mrp`: Optional regular / compare-at price for strike-through display.
- `image_urls`: Comma- or pipe-separated image URLs.
- `image_source / license note`: Tracks distribution rights (e.g. `Imported from prao.com under catalog distribution license`).

### Features:
1. **Row-Level Live Validation**:
   - Detects missing product name, missing SKU, duplicate SKU within the file, or price violations.
   - Shows interactive status chips: `Valid (New)`, `Update SKU`, `Invalid`.
2. **Summary & Error Reporting**:
   - Displays counts: Total Rows, Valid, Updates, Errors.
   - Downloadable Error Report CSV with row numbers and exact rejection reasons.
3. **1-Click Live PRAO Sync**:
   - Fetches all 250 anti-tarnish products directly from `https://prao.com/products.json`.
   - Maps types: Necklaces, Bracelets, Earrings, Rings, Anklets.
   - Preserves exact titles, original descriptions, and CDN images.
4. **Sample Template Download**:
   - Downloadable template with 10 formatted sample rows available at `/templates/sample-anti-tarnish-import.csv`.

---

## 3. Price Rules & Auto-Adjust Engine

- **Price Bounds Config**:
  - `MIN_ANTI_TARNISH_PRICE = 499`
  - `MAX_ANTI_TARNISH_PRICE = 2999`
- **Strict Validation**: Rejects prices below ₹499 or above ₹2,999 with clear error messages when auto-adjust is disabled.
- **Auto-Adjust Mode**:
  - If a supplier / clearance price is provided (e.g. ₹99), calculates retail price from MRP or markup.
  - Clamps within `[499, 2999]`.
  - Rounds to nearest ₹9 ending (e.g. ₹599, ₹699, ₹799, ₹1,499).
  - Displays strike-through MRP and calculated discount percentage.

---

## 4. Promotional Pop-up

- **Creative Content**:
  - Heading: *"Anti-Tarnish Jewellery, Shine That Never Fades"*
  - Subtext: *"Starting Rs. 499 · 100% Waterproof, Sweat-Proof & Long-Lasting Shine"*
  - CTA Button: *"Shop Now"* linking to `/collections/anti-tarnish`
- **Smart Behavioral Triggers**:
  - Appears after **5 seconds** on initial visit.
  - Desktop **exit-intent** trigger (when cursor leaves viewport at `clientY <= 0`).
  - **Once per session** (tracked via `sessionStorage`).
  - **7-day cooldown** if dismissed via X, Esc, or click-outside (tracked via `localStorage`).
  - **30-day cooldown** if user clicks CTA.
  - **Strictly suppressed** on transactional routes: `/checkout`, `/cart`, `/login`, `/register`, `/admin`.
- **Accessibility & Design**:
  - Mobile bottom-sheet layout; desktop centered modal.
  - ARIA attributes: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`.
  - Zero layout shift.
- **Admin Management (`/admin` -> Promo Pop-up Tab)**:
  - Toggle live enabled/disabled status.
  - Edit heading, subtext, badge, image URL, CTA link, start and end dates.
  - Live KPI Analytics: Impressions, Clicks, CTR %, Dismissals.
- **Event Tracking**:
  - Tracks `popup_shown`, `popup_clicked`, `popup_closed` via `/api/analytics/popup`.

---

## 5. Verification & Tests

Run all unit tests:
```bash
npm test --prefix Frontend
```

Run TypeScript compilation:
```bash
node Frontend/node_modules/typescript/bin/tsc --noEmit -p Frontend/tsconfig.json
```

Run Next.js build:
```bash
npm run build --prefix Frontend
```
