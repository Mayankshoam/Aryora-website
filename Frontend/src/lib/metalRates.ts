export interface MetalRates {
  silver925PerGram: number; // ₹/g for 925 sterling silver
  gold24kPerGram: number;   // ₹/g for 24K pure gold
  gold22kPerGram: number;   // ₹/g for 22K gold (auto-calculated: 22/24)
  gold18kPerGram: number;   // ₹/g for 18K gold (auto-calculated: 18/24)
  gold14kPerGram: number;   // ₹/g for 14K gold (auto-calculated: 14/24)
  gold9kPerGram: number;    // ₹/g for 09K gold (auto-calculated: 09/24)
  diamondPerCarat: number;  // ₹/carat for lab-grown diamonds
  makingChargePercent: number; // % making charges
  gstPercent: number;       // 3% GST on fine jewellery
  lastUpdated: string;
}

/**
 * Standard Indian Hallmark Purity Multipliers:
 * 22K = 22/24 (91.67%)
 * 18K = 18/24 (75.00%)
 * 14K = 14/24 (58.33%)
 * 09K = 09/24 (37.50%)
 */
export function computePuritiesFrom24K(rate24k: number): {
  gold22k: number;
  gold18k: number;
  gold14k: number;
  gold9k: number;
} {
  const safe24k = Math.max(0, rate24k);
  return {
    gold22k: Math.round(safe24k * (22 / 24)),
    gold18k: Math.round(safe24k * (18 / 24)),
    gold14k: Math.round(safe24k * (14 / 24)),
    gold9k: Math.round(safe24k * (9 / 24)),
  };
}

const DEFAULT_24K = 7850;
const defaultCalculatedPurities = computePuritiesFrom24K(DEFAULT_24K);

export const DEFAULT_METAL_RATES: MetalRates = {
  silver925PerGram: 98,
  gold24kPerGram: DEFAULT_24K,
  gold22kPerGram: defaultCalculatedPurities.gold22k,
  gold18kPerGram: defaultCalculatedPurities.gold18k,
  gold14kPerGram: defaultCalculatedPurities.gold14k,
  gold9kPerGram: defaultCalculatedPurities.gold9k,
  diamondPerCarat: 45000,
  makingChargePercent: 18,
  gstPercent: 3,
  lastUpdated: "2026-11-03T19:00:00.000Z",
};

const STORAGE_KEY = "ayor_daily_metal_rates";

export function getDailyMetalRates(): MetalRates {
  if (typeof window === "undefined") {
    return DEFAULT_METAL_RATES;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_METAL_RATES;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_METAL_RATES, ...parsed };
  } catch {
    return DEFAULT_METAL_RATES;
  }
}

export function saveDailyMetalRates(rates: Partial<MetalRates>): MetalRates {
  const current = getDailyMetalRates();
  
  // If 24k rate is passed, ensure all derivative purities (22, 18, 14, 09) auto-update
  let autoPurities = {};
  if (rates.gold24kPerGram && rates.gold24kPerGram > 0) {
    const computed = computePuritiesFrom24K(rates.gold24kPerGram);
    autoPurities = {
      gold22kPerGram: rates.gold22kPerGram || computed.gold22k,
      gold18kPerGram: rates.gold18kPerGram || computed.gold18k,
      gold14kPerGram: rates.gold14kPerGram || computed.gold14k,
      gold9kPerGram: rates.gold9kPerGram || computed.gold9k,
    };
  }

  const updated: MetalRates = {
    ...current,
    ...rates,
    ...autoPurities,
    lastUpdated: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("ayor_metal_rates_updated"));
  }
  return updated;
}

/**
 * Dynamically computes a product's price based on:
 * - Metal weight (grams) × Daily metal rate for purity
 * - Diamond carat × Diamond rate
 * - Making charges
 * - 3% GST
 * Falls back to base price if weight is not specified.
 */
export function calculateDynamicPrice(
  product: {
    price: number;
    metal?: string;
    purity?: string;
    weightGrams?: number;
    carat?: number;
    makingCharges?: number;
  },
  rates: MetalRates = getDailyMetalRates()
): {
  finalPrice: number;
  breakdown: {
    metalValue: number;
    diamondValue: number;
    makingCharges: number;
    subtotal: number;
    gst: number;
  };
} {
  const metalStr = (product.metal || "").toLowerCase();
  const purityStr = (product.purity || "").toUpperCase();

  // Determine metal rate per gram
  let metalRate = 0;
  if (metalStr.includes("silver") || purityStr.includes("925")) {
    metalRate = rates.silver925PerGram;
  } else if (metalStr.includes("gold") || metalStr.includes("sona")) {
    if (purityStr.includes("24K") || purityStr.includes("999")) {
      metalRate = rates.gold24kPerGram;
    } else if (purityStr.includes("22K") || purityStr.includes("916")) {
      metalRate = rates.gold22kPerGram;
    } else if (purityStr.includes("14K") || purityStr.includes("585")) {
      metalRate = rates.gold14kPerGram;
    } else if (purityStr.includes("9K") || purityStr.includes("09K") || purityStr.includes("375")) {
      metalRate = rates.gold9kPerGram || Math.round(rates.gold24kPerGram * (9 / 24));
    } else {
      // Default to 18K (750)
      metalRate = rates.gold18kPerGram;
    }
  }

  // Weight & Carat
  const weight = product.weightGrams && product.weightGrams > 0 ? product.weightGrams : 0;
  const carat = product.carat && product.carat > 0 ? product.carat : 0;

  // Metal Value
  const metalValue = weight * metalRate;

  // Diamond Value
  const diamondValue = carat * rates.diamondPerCarat;

  // If both weight and carat are present or weight > 0, compute pure dynamic rate
  if (weight > 0) {
    const making = product.makingCharges && product.makingCharges > 0
      ? product.makingCharges
      : Math.round(metalValue * (rates.makingChargePercent / 100));

    const subtotal = metalValue + diamondValue + making;
    const gst = Math.round(subtotal * (rates.gstPercent / 100));
    const computed = Math.round(subtotal + gst);

    return {
      finalPrice: computed > 0 ? computed : product.price,
      breakdown: {
        metalValue: Math.round(metalValue),
        diamondValue: Math.round(diamondValue),
        makingCharges: Math.round(making),
        subtotal: Math.round(subtotal),
        gst: Math.round(gst),
      },
    };
  }

  // Fallback if weight is not specified
  const gst = Math.round(product.price * 0.03);
  return {
    finalPrice: product.price,
    breakdown: {
      metalValue: Math.round(product.price * 0.70),
      diamondValue: 0,
      makingCharges: Math.round(product.price * 0.27),
      subtotal: product.price - gst,
      gst,
    },
  };
}
