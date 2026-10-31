import { getAllProducts, getProductBySlug as getBySlug, formatPriceINR as formatPrice, Product } from "./data";

export type { Product as ProductItem };

export const PRODUCTS = getAllProducts();

export function getProductBySlug(slug: string) {
  return getBySlug(slug);
}

export function getRelatedProducts(currentSlug: string, limit = 4) {
  const current = getBySlug(currentSlug);
  const all = getAllProducts();
  if (!current) return all.slice(0, limit);
  return all.filter((p) => p.id !== current.id && p.category === current.category).slice(0, limit);
}

export function getBestsellers(limit = 4) {
  return getAllProducts().filter((p) => p.isBestseller).slice(0, limit);
}

export function formatPriceINR(amount: number) {
  return formatPrice(amount);
}
