/**
 * Anti-Tarnish Jewellery Configuration & Rules
 * Enforces price boundaries, auto-adjust rounding, and promotional pop-up parameters.
 */

// 1. Price Rules Configuration
export const MIN_ANTI_TARNISH_PRICE = 499;
export const MAX_ANTI_TARNISH_PRICE = 2999;

/**
 * Validates whether a price falls strictly within the Anti-Tarnish price bounds.
 */
export function validateAntiTarnishPrice(price: number): { valid: boolean; reason?: string } {
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

/**
 * Auto-adjusts a supplier / clearance price to an anti-tarnish price:
 * - Applies a configurable markup multiplier (or uses compare_at_price/MRP)
 * - Clamps within [MIN_ANTI_TARNISH_PRICE, MAX_ANTI_TARNISH_PRICE]
 * - Rounds to the nearest Rs. 9 ending (e.g. 599, 699, 799, 1299, 1499)
 */
export function autoAdjustAntiTarnishPrice(
  rawPrice: number,
  mrp?: number,
  markupPercent: number = 400
): { price: number; mrp: number } {
  const validRaw = typeof rawPrice === "number" && !isNaN(rawPrice) && rawPrice > 0 ? rawPrice : 299;
  
  let target = mrp && mrp > 0
    ? Math.round(mrp * 0.55) // Default to 45% off MRP if MRP is given
    : Math.round(validRaw * (1 + markupPercent / 100));

  // Clamp within configured range
  if (target < MIN_ANTI_TARNISH_PRICE) target = MIN_ANTI_TARNISH_PRICE;
  if (target > MAX_ANTI_TARNISH_PRICE) target = MAX_ANTI_TARNISH_PRICE;

  // Round to nearest Rs. 9 ending (e.g. 599, 699, 1499)
  const roundedTo100 = Math.round(target / 100) * 100;
  let finalPrice = roundedTo100 - 1; // e.g. 600 -> 599, 1500 -> 1499

  if (finalPrice < MIN_ANTI_TARNISH_PRICE) finalPrice = MIN_ANTI_TARNISH_PRICE; // exactly 499
  if (finalPrice > MAX_ANTI_TARNISH_PRICE) finalPrice = MAX_ANTI_TARNISH_PRICE; // exactly 2999

  // Ensure MRP is higher than selling price for discount display
  let finalMrp = mrp && mrp > finalPrice ? mrp : Math.round(finalPrice * 1.8);
  // Round MRP to neat 100 or 9 ending
  finalMrp = Math.max(finalMrp, finalPrice + 200);

  return { price: finalPrice, mrp: finalMrp };
}

// 2. Promotional Pop-up Configuration
export interface AntiTarnishPopupConfig {
  enabled: boolean;
  heading: string;
  subtext: string;
  badge: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  startDate?: string;
  endDate?: string;
}

export const DEFAULT_POPUP_CONFIG: AntiTarnishPopupConfig = {
  enabled: true,
  heading: "Anti-Tarnish Jewellery, Shine That Never Fades",
  subtext: "Starting Rs. 499 · 100% Waterproof, Sweat-Proof & Long-Lasting Shine",
  badge: "Waterproof Everyday Luxury",
  ctaText: "Shop Now",
  ctaLink: "/collections/anti-tarnish",
  imageUrl: "/site/cat-bracelets.svg",
};

// 3. Pop-up Frequency & Trigger Rules
export const POPUP_STORAGE_KEYS = {
  SESSION_SHOWN: "ayor_antitarnish_popup_session",
  DISMISSED_AT: "ayor_antitarnish_popup_dismissed_at",
  CLICKED_AT: "ayor_antitarnish_popup_clicked_at",
  CONFIG: "ayor_antitarnish_popup_config",
};

export const POPUP_RULES = {
  INITIAL_DELAY_MS: 5000, // 5 seconds after initial visit
  DISMISSED_COOLDOWN_DAYS: 7, // Re-show after 7 days if only closed
  CLICKED_COOLDOWN_DAYS: 30, // Don't show for 30 days if user clicked CTA
  SUPPRESSED_PATHS: [
    "/checkout",
    "/cart",
    "/login",
    "/register",
    "/admin",
  ],
};

/**
 * Checks whether the promotional popup should be displayed based on path, session, and cooldown.
 */
export function shouldShowAntiTarnishPopup(
  currentPath: string,
  sessionShown: boolean,
  dismissedAtMs: number | null,
  clickedAtMs: number | null,
  config: AntiTarnishPopupConfig = DEFAULT_POPUP_CONFIG
): { shouldShow: boolean; reason?: string } {
  if (!config.enabled) {
    return { shouldShow: false, reason: "Popup disabled by admin" };
  }

  // 1. Date window check
  const now = Date.now();
  if (config.startDate && new Date(config.startDate).getTime() > now) {
    return { shouldShow: false, reason: "Campaign has not started yet" };
  }
  if (config.endDate && new Date(config.endDate).getTime() < now) {
    return { shouldShow: false, reason: "Campaign has ended" };
  }

  // 2. Path suppression check
  const isSuppressedPath = POPUP_RULES.SUPPRESSED_PATHS.some((path) =>
    currentPath.toLowerCase().startsWith(path.toLowerCase())
  );
  if (isSuppressedPath) {
    return { shouldShow: false, reason: `Suppressed on transactional path: ${currentPath}` };
  }

  // 3. Session frequency check (shows once per session)
  if (sessionShown) {
    return { shouldShow: false, reason: "Already shown in current session" };
  }

  // 4. Clicked cooldown (30 days)
  if (clickedAtMs) {
    const daysSinceClick = (now - clickedAtMs) / (1000 * 60 * 60 * 24);
    if (daysSinceClick < POPUP_RULES.CLICKED_COOLDOWN_DAYS) {
      return {
        shouldShow: false,
        reason: `Clicked cooldown active (${Math.ceil(POPUP_RULES.CLICKED_COOLDOWN_DAYS - daysSinceClick)} days remaining)`,
      };
    }
  }

  // 5. Dismissed cooldown (7 days)
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
