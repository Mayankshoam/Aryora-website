"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "./data";

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  selectedMetal?: string;
}

interface AryoraStore {
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string, selectedMetal?: string) => void;
  removeFromCart: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartTotal: () => number;

  // Wishlist
  wishlist: string[]; // array of product slugs
  toggleWishlist: (slug: string) => void;
  isInWishlist: (slug: string) => boolean;

  // Recently Viewed
  recentlyViewed: string[]; // array of product slugs
  addRecentlyViewed: (slug: string) => void;

  // Modals & Drawers
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;

  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;

  isSizeGuideOpen: boolean;
  openSizeGuide: () => void;
  closeSizeGuide: () => void;

  isStoreLocatorOpen: boolean;
  openStoreLocator: () => void;
  closeStoreLocator: () => void;
}

export const useAryoraStore = create<AryoraStore>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      recentlyViewed: [],
      isCartOpen: false,
      isSearchOpen: false,
      isSizeGuideOpen: false,
      isStoreLocatorOpen: false,

      addToCart: (product, quantity = 1, size, selectedMetal) => {
        set((state) => {
          const metal = selectedMetal || product.metal;
          const existingIndex = state.cart.findIndex(
            (item) => item.product.id === product.id && item.size === size && item.selectedMetal === metal
          );
          if (existingIndex > -1) {
            const nextCart = [...state.cart];
            nextCart[existingIndex].quantity += quantity;
            return { cart: nextCart, isCartOpen: true };
          }
          return {
            cart: [...state.cart, { product, quantity, size, selectedMetal: metal }],
            isCartOpen: true,
          };
        });
      },

      removeFromCart: (productId, size) => {
        set((state) => ({
          cart: state.cart.filter(
            (item) => !(item.product.id === productId && item.size === size)
          ),
        }));
      },

      updateQuantity: (productId, quantity, size) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, size);
          return;
        }
        set((state) => ({
          cart: state.cart.map((item) =>
            item.product.id === productId && item.size === size
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => set({ cart: [] }),

      getCartCount: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0);
      },

      getCartTotal: () => {
        return get().cart.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      toggleWishlist: (slug) => {
        set((state) => {
          const exists = state.wishlist.includes(slug);
          return {
            wishlist: exists
              ? state.wishlist.filter((s) => s !== slug)
              : [...state.wishlist, slug],
          };
        });
      },

      isInWishlist: (slug) => {
        return get().wishlist.includes(slug);
      },

      addRecentlyViewed: (slug) => {
        set((state) => {
          const filtered = state.recentlyViewed.filter((s) => s !== slug);
          return {
            recentlyViewed: [slug, ...filtered].slice(0, 10),
          };
        });
      },

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      openSearch: () => set({ isSearchOpen: true }),
      closeSearch: () => set({ isSearchOpen: false }),

      openSizeGuide: () => set({ isSizeGuideOpen: true }),
      closeSizeGuide: () => set({ isSizeGuideOpen: false }),

      openStoreLocator: () => set({ isStoreLocatorOpen: true }),
      closeStoreLocator: () => set({ isStoreLocatorOpen: false }),
    }),
    {
      name: "aryora_store_v3",
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        recentlyViewed: state.recentlyViewed,
      }),
    }
  )
);
