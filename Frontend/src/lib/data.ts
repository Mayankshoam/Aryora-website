import productsData from "../../data/products.json";
import siteData from "../../data/site.json";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory: string;
  metal: string;
  purity: string;
  stone: string;
  carat: number;
  shape: string;
  color: string;
  clarity: string;
  certificate: string;
  weightGrams: number;
  sizes: string[];
  occasion: string;
  gender: string;
  style: string;
  price: number;
  discountPercent: number;
  stock: number;
  images: string[];
  description: string;
  tags: string[];
  isBestseller: boolean;
  isNew: boolean;
  sku?: string;
  platings?: string[];
  caratOptions?: number[];
  isComingSoon?: boolean;
  availabilityNote?: string;
  makingCharges?: number;
  mrp?: number;
  image_source?: string;
  isAntiTarnish?: boolean;
  waterproof?: boolean;
}

export interface SiteConfig {
  brand: {
    name: string;
    tagline: string;
    city: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    instagram: string;
    instagramHandle: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaPrimary: { label: string; href: string };
    ctaSecondary: { label: string; href: string };
    videoDesktop: string;
    videoMobile: string;
    poster: string;
  };
  trustStrip: Array<{
    title: string;
    desc: string;
    badge: string;
    icon: string;
  }>;
  categoryTiles: Array<{
    name: string;
    href: string;
    image: string;
    count: string;
  }>;
  certifications: Array<{
    title: string;
    desc: string;
    image: string;
  }>;
  whyAyor: Array<{
    title: string;
    desc: string;
  }>;
  footerLinks: {
    shop: Array<{ label: string; href: string }>;
    discover: Array<{ label: string; href: string }>;
    assurance: Array<{ label: string; href: string }>;
  };
}

export function getAllProducts(): Product[] {
  return productsData as Product[];
}

export function getProductBySlug(slug: string): Product | undefined {
  const norm = slug.toLowerCase();
  return (productsData as Product[]).find((p) => p.slug.toLowerCase() === norm || p.id.toLowerCase() === norm);
}

export function getProductsByCategory(category: string): Product[] {
  const norm = category.toLowerCase();
  return (productsData as Product[]).filter(
    (p) => p.category.toLowerCase() === norm || p.subcategory.toLowerCase() === norm
  );
}

export function getAntiTarnishProducts(): Product[] {
  return (productsData as Product[]).filter((p) => {
    const isAnti =
      p.isAntiTarnish ||
      p.category?.toLowerCase() === "anti-tarnish" ||
      p.subcategory?.toLowerCase() === "anti-tarnish" ||
      p.tags?.some((t) => t.toLowerCase().includes("anti-tarnish") || t.toLowerCase().includes("waterproof")) ||
      p.name?.toLowerCase().includes("anti-tarnish");
    return isAnti;
  });
}

export function getBestsellers(limit = 8): Product[] {
  return (productsData as Product[]).filter((p) => p.isBestseller).slice(0, limit);
}

export function getNewArrivals(limit = 8): Product[] {
  return (productsData as Product[]).filter((p) => p.isNew).slice(0, limit);
}

export function getSiteConfig(): SiteConfig {
  return siteData as SiteConfig;
}

/** Formats an amount into Indian Currency notation, e.g. ₹ 68,500 */
export function formatPriceINR(amount: number): string {
  if (isNaN(amount)) return "₹ 0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Transparent Price Breakup calculator matching Indian Gold, Silver, and Anti-Tarnish standards */
export function calculatePriceBreakup(product: Product, overridePrice?: number) {
  const total = overridePrice || product.price;
  // 3% GST is included in the final price
  const baseBeforeGst = Math.round(total / 1.03);
  const gst = total - baseBeforeGst;

  const isAntiTarnish = Boolean(
    product.isAntiTarnish ||
    product.waterproof ||
    (product.category && product.category.toLowerCase().includes("anti-tarnish")) ||
    (product.subcategory && product.subcategory.toLowerCase().includes("anti-tarnish")) ||
    (product.purity && product.purity.toLowerCase().includes("pvd")) ||
    (product.metal && (product.metal.toLowerCase().includes("stainless") || product.metal.toLowerCase().includes("steel"))) ||
    (Array.isArray(product.tags) && product.tags.some(t => typeof t === "string" && (t.toLowerCase().includes("anti-tarnish") || t.toLowerCase().includes("waterproof"))))
  );

  if (isAntiTarnish) {
    return {
      metalLabel: "316L Surgical Stainless Steel",
      metalValue: Math.round(baseBeforeGst * 0.65),
      metalWeight: 0,
      stoneLabel: "Austrian Crystals / Waterproof Enamel",
      stoneValue: 0,
      stoneCarat: 0,
      goldValue: 0,
      goldWeight: 0,
      goldRatePerGram: 0,
      diamondValue: 0,
      diamondCarat: 0,
      makingCharges: Math.round(baseBeforeGst * 0.35),
      gst,
      total,
      isAntiTarnish: true,
    };
  }

  const isSilver = product.metal.toLowerCase().includes("silver") || product.purity.toLowerCase().includes("silver");

  let metalLabel = isSilver ? "925 Sterling Silver" : "18K Gold";
  let stoneLabel = isSilver ? "AAA+ Swiss Cubic Zirconia" : "IGI Lab Diamond";

  // Silver breakdown: silver weight ~35%, stone ~30%, artisan making ~35%
  // Gold breakdown: 18kt ~52%, diamond ~36%, making ~12%
  const metalRatio = isSilver ? 0.35 : 0.52;
  const stoneRatio = isSilver ? 0.32 : 0.36;

  const metalValue = Math.round(baseBeforeGst * metalRatio);
  const stoneValue = Math.round(baseBeforeGst * stoneRatio);
  const makingCharges = baseBeforeGst - metalValue - stoneValue;

  return {
    metalLabel,
    metalValue,
    metalWeight: product.weightGrams,
    stoneLabel,
    stoneValue,
    stoneCarat: product.carat,
    // Backwards-compatibility
    goldValue: metalValue,
    goldWeight: product.weightGrams,
    goldRatePerGram: Math.round(metalValue / (product.weightGrams || 1)),
    diamondValue: stoneValue,
    diamondCarat: product.carat,
    makingCharges,
    gst,
    total,
  };
}

/** Computes dynamic facet counts from the current product catalog */
export function getFilterFacets(products: Product[]) {
  const categories = new Map<string, number>();
  const metals = new Map<string, number>();
  const purities = new Map<string, number>();
  const shapes = new Map<string, number>();
  const occasions = new Map<string, number>();
  const styles = new Map<string, number>();
  const genders = new Map<string, number>();

  products.forEach((p) => {
    categories.set(p.category, (categories.get(p.category) || 0) + 1);
    metals.set(p.metal, (metals.get(p.metal) || 0) + 1);
    purities.set(p.purity, (purities.get(p.purity) || 0) + 1);
    shapes.set(p.shape, (shapes.get(p.shape) || 0) + 1);
    occasions.set(p.occasion, (occasions.get(p.occasion) || 0) + 1);
    styles.set(p.style, (styles.get(p.style) || 0) + 1);
    genders.set(p.gender, (genders.get(p.gender) || 0) + 1);
  });

  return {
    categories: Array.from(categories.entries()).map(([value, count]) => ({ value, count })),
    metals: Array.from(metals.entries()).map(([value, count]) => ({ value, count })),
    purities: Array.from(purities.entries()).map(([value, count]) => ({ value, count })),
    shapes: Array.from(shapes.entries()).map(([value, count]) => ({ value, count })),
    occasions: Array.from(occasions.entries()).map(([value, count]) => ({ value, count })),
    styles: Array.from(styles.entries()).map(([value, count]) => ({ value, count })),
    genders: Array.from(genders.entries()).map(([value, count]) => ({ value, count })),
  };
}

