"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProductItem } from "./products";

export interface CartItem {
  product: ProductItem;
  quantity: number;
  size?: string;
}

interface AryoraStore {
  // Cart
  cart: CartItem[];
  addToCart: (product: ProductItem, quantity?: number, size?: string) => void;
  removeFromCart: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartTotal: () => number;

  // Wishlist
  wishlist: string[]; // array of product slugs
  toggleWishlist: (slug: string) => void;
  isInWishlist: (slug: string) => boolean;

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
}

export const useAryoraStore = create<AryoraStore>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      isCartOpen: false,
      isSearchOpen: false,
      isSizeGuideOpen: false,

      addToCart: (product, quantity = 1, size) => {
        set((state) => {
          const existingIndex = state.cart.findIndex(
            (item) => item.product.id === product.id && item.size === size
          );
          if (existingIndex > -1) {
            const nextCart = [...state.cart];
            nextCart[existingIndex].quantity += quantity;
            return { cart: nextCart, isCartOpen: true };
          }
          return {
            cart: [...state.cart, { product, quantity, size }],
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

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      openSearch: () => set({ isSearchOpen: true }),
      closeSearch: () => set({ isSearchOpen: false }),

      openSizeGuide: () => set({ isSizeGuideOpen: true }),
      closeSizeGuide: () => set({ isSizeGuideOpen: false }),
    }),
    {
      name: "aryora_store_v1",
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
      }),
    }
  )
);
