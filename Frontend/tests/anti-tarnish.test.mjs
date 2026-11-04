/**
 * Anti-Tarnish Jewellery & Promotional Pop-up Test Suite
 * Tests price range rules, duplicate SKU handling, import validation, and pop-up frequency logic.
 */

import assert from "node:assert/strict";

// Configuration Constants
const MIN_ANTI_TARNISH_PRICE = 499;
const MAX_ANTI_TARNISH_PRICE = 2999;

function validateAntiTarnishPrice(price) {
  if (typeof price !== "number" || isNaN(price)) {
    return { valid: false, reason: "Price must be a valid number" };
  }
  if (price < MIN_ANTI_TARNISH_PRICE) {
    return {
      valid: false,
      reason: `Price ₹${price} is below minimum allowed ₹${MIN_ANTI_TARNISH_PRICE}`,
    };
  }
  if (price > MAX_ANTI_TARNISH_PRICE) {
    return {
      valid: false,
      reason: `Price ₹${price} exceeds maximum allowed ₹${MAX_ANTI_TARNISH_PRICE}`,
    };
  }
  return { valid: true };
}

function autoAdjustAntiTarnishPrice(rawPrice, mrp, markupPercent = 400) {
  const validRaw = typeof rawPrice === "number" && !isNaN(rawPrice) && rawPrice > 0 ? rawPrice : 299;
  
  let target = mrp && mrp > 0
    ? Math.round(mrp * 0.55)
    : Math.round(validRaw * (1 + markupPercent / 100));

  if (target < MIN_ANTI_TARNISH_PRICE) target = MIN_ANTI_TARNISH_PRICE;
  if (target > MAX_ANTI_TARNISH_PRICE) target = MAX_ANTI_TARNISH_PRICE;

  const roundedTo100 = Math.round(target / 100) * 100;
  let finalPrice = roundedTo100 - 1;

  if (finalPrice < MIN_ANTI_TARNISH_PRICE) finalPrice = MIN_ANTI_TARNISH_PRICE;
  if (finalPrice > MAX_ANTI_TARNISH_PRICE) finalPrice = MAX_ANTI_TARNISH_PRICE;

  let finalMrp = mrp && mrp > finalPrice ? mrp : Math.round(finalPrice * 1.8);
  finalMrp = Math.max(finalMrp, finalPrice + 200);

  return { price: finalPrice, mrp: finalMrp };
}

const DEFAULT_POPUP_CONFIG = {
  enabled: true,
  heading: "Anti-Tarnish Jewellery, Shine That Never Fades",
  subtext: "Starting Rs. 499 · 100% Waterproof, Sweat-Proof & Long-Lasting Shine",
  badge: "Waterproof Everyday Luxury",
  ctaText: "Shop Now",
  ctaLink: "/collections/anti-tarnish",
  imageUrl: "/site/cat-bracelets.svg",
};

const POPUP_RULES = {
  INITIAL_DELAY_MS: 5000,
  DISMISSED_COOLDOWN_DAYS: 7,
  CLICKED_COOLDOWN_DAYS: 30,
  SUPPRESSED_PATHS: [
    "/checkout",
    "/cart",
    "/login",
    "/register",
    "/admin",
  ],
};

function shouldShowAntiTarnishPopup(
  currentPath,
  sessionShown,
  dismissedAtMs,
  clickedAtMs,
  config = DEFAULT_POPUP_CONFIG
) {
  if (!config.enabled) {
    return { shouldShow: false, reason: "Popup disabled by admin" };
  }

  const now = Date.now();
  if (config.startDate && new Date(config.startDate).getTime() > now) {
    return { shouldShow: false, reason: "Campaign has not started yet" };
  }
  if (config.endDate && new Date(config.endDate).getTime() < now) {
    return { shouldShow: false, reason: "Campaign has ended" };
  }

  const isSuppressedPath = POPUP_RULES.SUPPRESSED_PATHS.some((path) =>
    currentPath.toLowerCase().startsWith(path.toLowerCase())
  );
  if (isSuppressedPath) {
    return { shouldShow: false, reason: `Suppressed on transactional path: ${currentPath}` };
  }

  if (sessionShown) {
    return { shouldShow: false, reason: "Already shown in current session" };
  }

  if (clickedAtMs) {
    const daysSinceClick = (now - clickedAtMs) / (1000 * 60 * 60 * 24);
    if (daysSinceClick < POPUP_RULES.CLICKED_COOLDOWN_DAYS) {
      return {
        shouldShow: false,
        reason: `Clicked cooldown active (${Math.ceil(POPUP_RULES.CLICKED_COOLDOWN_DAYS - daysSinceClick)} days remaining)`,
      };
    }
  }

  if (dismissedAtMs) {
    const daysSinceDismiss = (now - dismissedAtMs) / (1000 * 60 * 60 * 24);
    if (daysSinceDismiss < POPUP_RULES.DISMISSED_COOLDOWN_DAYS) {
      return {
        shouldShow: false,
        reason: `Dismiss cooldown active (${Math.ceil(POPUP_RULES.DISMISSED_COOLDOWN_DAYS - daysSinceDismiss)} days remaining)`,
      };
    }
  }

  return { shouldShow: true };
}

function validateImportRows(rows, existingProducts, autoAdjust = false) {
  const seenSkusInFile = new Set();
  const existingSkuMap = new Map();
  existingProducts.forEach((p) => {
    if (p.sku) existingSkuMap.set(p.sku.toUpperCase(), p);
  });

  const results = [];
  let validCount = 0;
  let updateCount = 0;
  let failedCount = 0;

  rows.forEach((row, idx) => {
    const rowErrors = [];
    const cleanSku = (row.sku || "").trim().toUpperCase();

    if (!row.product_name || !row.product_name.trim()) {
      rowErrors.push("Missing required field: product_name");
    }

    if (!cleanSku) {
      rowErrors.push("Missing required field: sku");
    } else if (seenSkusInFile.has(cleanSku)) {
      rowErrors.push(`Duplicate SKU '${cleanSku}' within import file`);
    } else {
      seenSkusInFile.add(cleanSku);
    }

    const rawPrice = parseFloat(String(row.price).replace(/[^0-9.]/g, ""));
    const rawMrp = parseFloat(String(row.mrp).replace(/[^0-9.]/g, ""));

    let finalPrice = rawPrice;
    let finalMrp = rawMrp;

    if (isNaN(rawPrice) || rawPrice <= 0) {
      rowErrors.push(`Invalid price '${row.price}': must be a positive number`);
    } else if (autoAdjust) {
      const adjusted = autoAdjustAntiTarnishPrice(rawPrice, rawMrp);
      finalPrice = adjusted.price;
      finalMrp = adjusted.mrp;
    } else {
      const priceVal = validateAntiTarnishPrice(rawPrice);
      if (!priceVal.valid) {
        rowErrors.push(priceVal.reason || "Price outside permitted range");
      }
    }

    const isUpdate = cleanSku ? existingSkuMap.has(cleanSku) : false;
    const isValid = rowErrors.length === 0;

    if (isValid) {
      validCount++;
      if (isUpdate) updateCount++;
    } else {
      failedCount++;
    }

    results.push({
      rowNumber: idx + 2,
      data: row,
      valid: isValid,
      isUpdate,
      errors: rowErrors,
      adjustedPrice: finalPrice,
      adjustedMrp: finalMrp,
    });
  });

  return {
    results,
    summary: {
      total: rows.length,
      valid: validCount,
      updates: updateCount,
      failed: failedCount,
    },
  };
}

console.log("==================================================");
console.log("  ANTI-TARNISH JEWELLERY & POPUP TEST SUITE       ");
console.log("==================================================");

// -------------------------------------------------------------------
// TEST 1: Price Range Validation & Constants
// -------------------------------------------------------------------
console.log("▶ TEST 1: Price Range Validation [Rs. 499 - Rs. 2,999]...");
assert.equal(MIN_ANTI_TARNISH_PRICE, 499, "Min price must be 499");
assert.equal(MAX_ANTI_TARNISH_PRICE, 2999, "Max price must be 2999");

const validPrice1 = validateAntiTarnishPrice(499);
assert.equal(validPrice1.valid, true, "Boundary 499 must be valid");

const validPrice2 = validateAntiTarnishPrice(2999);
assert.equal(validPrice2.valid, true, "Boundary 2999 must be valid");

const validPrice3 = validateAntiTarnishPrice(1499);
assert.equal(validPrice3.valid, true, "Interior price 1499 must be valid");

const tooLow = validateAntiTarnishPrice(99);
assert.equal(tooLow.valid, false, "Supplier clearance price 99 must be rejected");
assert(tooLow.reason.includes("below minimum"), "Rejection must specify below minimum");

const tooHigh = validateAntiTarnishPrice(5000);
assert.equal(tooHigh.valid, false, "Price 5000 must be rejected");
assert(tooHigh.reason.includes("exceeds maximum"), "Rejection must specify exceeds maximum");
console.log("  ✔ Price range validation tests passed.");

// -------------------------------------------------------------------
// TEST 2: Auto-Adjust Pricing & Rs. 9 Ending Rounding
// -------------------------------------------------------------------
console.log("▶ TEST 2: Auto-Adjust Pricing Engine & 9-Ending Rounding...");
const adjustedFrom99 = autoAdjustAntiTarnishPrice(99, 1400);
assert(
  adjustedFrom99.price >= MIN_ANTI_TARNISH_PRICE && adjustedFrom99.price <= MAX_ANTI_TARNISH_PRICE,
  "Auto-adjusted price must fall strictly within [499, 2999]"
);
assert.equal(adjustedFrom99.price % 10, 9, "Price must end in 9 (e.g. 599, 699, 799)");
assert(adjustedFrom99.mrp > adjustedFrom99.price, "MRP must be strictly greater than adjusted price");

// Check clamping at minimum
const clampedLow = autoAdjustAntiTarnishPrice(10, 0);
assert.equal(clampedLow.price, 499, "Low price must clamp to exactly 499");

// Check clamping at maximum
const clampedHigh = autoAdjustAntiTarnishPrice(10000, 15000);
assert.equal(clampedHigh.price, 2999, "High price must clamp to exactly 2999");
console.log("  ✔ Auto-adjust pricing and rounding tests passed.");

// -------------------------------------------------------------------
// TEST 3: Duplicate SKU Handling & Re-import Updates
// -------------------------------------------------------------------
console.log("▶ TEST 3: Duplicate SKU Handling & Catalog Re-import Updates...");
const existingCatalog = [
  { id: "1", sku: "6651PR", name: "Existing PRAO Necklace", price: 599 },
  { id: "2", sku: "6648PR", name: "Existing PRAO Silver Chain", price: 699 },
];

const batchWithUpdates = [
  { product_name: "PRAO Necklace Updated Price", sku: "6651PR", price: 799 },
  { product_name: "New PRAO Ring", sku: "9901PR", price: 499 },
];

const importCheck = validateImportRows(batchWithUpdates, existingCatalog, false);
assert.equal(importCheck.summary.valid, 2, "Both rows should be valid");
assert.equal(importCheck.summary.updates, 1, "SKU 6651PR must be flagged as an update");
assert.equal(importCheck.results[0].isUpdate, true, "Row 1 must be an update");
assert.equal(importCheck.results[1].isUpdate, false, "Row 2 must be a new product");
console.log("  ✔ Duplicate SKU handling & catalog update tests passed.");

// -------------------------------------------------------------------
// TEST 4: Import Error Reporting & Validation Failures
// -------------------------------------------------------------------
console.log("▶ TEST 4: Row-Level Import Error Reporting...");
const dirtyBatch = [
  { product_name: "", sku: "BAD-01", price: 599 }, // Missing name
  { product_name: "Valid Ring", sku: "", price: 599 }, // Missing SKU
  { product_name: "Bad Price Ring", sku: "BAD-02", price: 99 }, // Bad price (< 499 without autoAdjust)
  { product_name: "Dup Item 1", sku: "DUP-01", price: 699 }, // First instance
  { product_name: "Dup Item 2", sku: "DUP-01", price: 699 }, // Duplicate in file!
];

const errorReport = validateImportRows(dirtyBatch, existingCatalog, false);
assert.equal(errorReport.summary.total, 5, "Total rows must be 5");
assert.equal(errorReport.summary.valid, 1, "Only row 4 (Dup Item 1) should be valid");
assert.equal(errorReport.summary.failed, 4, "4 rows must fail validation");

assert(errorReport.results[0].errors.some((e) => e.includes("product_name")), "Must flag missing product_name");
assert(errorReport.results[1].errors.some((e) => e.includes("sku")), "Must flag missing SKU");
assert(errorReport.results[2].errors.some((e) => e.includes("below minimum")), "Must flag price below minimum");
assert(errorReport.results[4].errors.some((e) => e.includes("Duplicate SKU")), "Must flag duplicate SKU in file");
console.log("  ✔ Import error reporting tests passed.");

// -------------------------------------------------------------------
// TEST 5: Pop-up Frequency, Cooldown & Path Suppression Rules
// -------------------------------------------------------------------
console.log("▶ TEST 5: Promotional Pop-up Frequency & Transactional Suppression...");

// 1. Transactional path suppression
const checkoutEval = shouldShowAntiTarnishPopup("/checkout", false, null, null);
assert.equal(checkoutEval.shouldShow, false, "Must suppress popup on /checkout");

const cartEval = shouldShowAntiTarnishPopup("/cart", false, null, null);
assert.equal(cartEval.shouldShow, false, "Must suppress popup on /cart");

const loginEval = shouldShowAntiTarnishPopup("/login", false, null, null);
assert.equal(loginEval.shouldShow, false, "Must suppress popup on /login");

const adminEval = shouldShowAntiTarnishPopup("/admin", false, null, null);
assert.equal(adminEval.shouldShow, false, "Must suppress popup on /admin");

// 2. Allowed storefront pages
const homeEval = shouldShowAntiTarnishPopup("/", false, null, null);
assert.equal(homeEval.shouldShow, true, "Must allow popup on homepage");

const collectionEval = shouldShowAntiTarnishPopup("/collections/anti-tarnish", false, null, null);
assert.equal(collectionEval.shouldShow, true, "Must allow popup on collection page");

// 3. Session frequency check (once per session)
const sessionShownEval = shouldShowAntiTarnishPopup("/", true, null, null);
assert.equal(sessionShownEval.shouldShow, false, "Must not show again in the same session");

// 4. Dismissed cooldown (7 days)
const oneDayAgo = Date.now() - 1 * 24 * 60 * 60 * 1000;
const dismissedRecent = shouldShowAntiTarnishPopup("/", false, oneDayAgo, null);
assert.equal(dismissedRecent.shouldShow, false, "Must not show within 7 days of dismissal");

const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
const dismissedOld = shouldShowAntiTarnishPopup("/", false, eightDaysAgo, null);
assert.equal(dismissedOld.shouldShow, true, "Must re-show after 7 days if only dismissed");

// 5. Clicked cooldown (30 days)
const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
const clickedRecent = shouldShowAntiTarnishPopup("/", false, null, tenDaysAgo);
assert.equal(clickedRecent.shouldShow, false, "Must not show within 30 days if user clicked CTA");

// 6. Admin disable switch
const disabledConfig = { ...DEFAULT_POPUP_CONFIG, enabled: false };
const disabledEval = shouldShowAntiTarnishPopup("/", false, null, null, disabledConfig);
assert.equal(disabledEval.shouldShow, false, "Must respect admin toggle disabling popup");

console.log("  ✔ Pop-up frequency and suppression tests passed.");

console.log("==================================================");
console.log("🎉 ALL ANTI-TARNISH & POPUP TESTS PASSED (100%)!  ");
console.log("==================================================");
