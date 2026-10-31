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
  whyAryora: Array<{
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
  return (productsData as Product[]).find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  const norm = category.toLowerCase();
  return (productsData as Product[]).filter(
    (p) => p.category.toLowerCase() === norm || p.subcategory.toLowerCase() === norm
  );
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

/** Transparent Price Breakup calculator matching Indian Gold & Diamond standards */
export function calculatePriceBreakup(product: Product) {
  const total = product.price;
  // Standard Indian jewellery breakup estimation:
  // 3% GST is included in the final price
  const baseBeforeGst = Math.round(total / 1.03);
  const gst = total - baseBeforeGst;
  
  // Gold 18kt approx ~55% of base, Diamond ~35%, Making ~10%
  const goldValue = Math.round(baseBeforeGst * 0.52);
  const diamondValue = Math.round(baseBeforeGst * 0.36);
  const makingCharges = baseBeforeGst - goldValue - diamondValue;

  return {
    goldValue,
    goldWeight: product.weightGrams,
    goldRatePerGram: Math.round(goldValue / (product.weightGrams || 1)),
    diamondValue,
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
