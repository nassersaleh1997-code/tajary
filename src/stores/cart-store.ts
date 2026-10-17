"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // productId or variantId
  productId: string;
  variantId?: string | null;
  name: string;
  image?: string | null;
  price: number;
  compareAtPrice?: number | null;
  quantity: number;
  stock: number;
  storeId: string;
  storeName: string;
  vendorId: string;
  sku?: string | null;
}

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setCoupon: (code: string | null) => void;
  getSubtotal: () => number;
  getItemCount: () => number;
  getItemsByStore: () => Record<string, CartItem[]>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,

      addItem: (item) => {
        const items = get().items;
        const existing = items.find(
          (i) =>
            i.productId === item.productId &&
            i.variantId === (item.variantId || null)
        );

        if (existing) {
          const newQty = Math.min(
            existing.quantity + (item.quantity || 1),
            existing.stock
          );
          set({
            items: items.map((i) =>
              i.id === existing.id ? { ...i, quantity: newQty } : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                ...item,
                id: item.variantId || item.productId,
                quantity: Math.min(item.quantity || 1, item.stock),
                variantId: item.variantId || null,
              },
            ],
          });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id
              ? { ...i, quantity: Math.min(quantity, i.stock) }
              : i
          ),
        });
      },

      clearCart: () => set({ items: [], couponCode: null }),

      setCoupon: (code) => set({ couponCode: code }),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      getItemsByStore: () => {
        const grouped: Record<string, CartItem[]> = {};
        get().items.forEach((item) => {
          if (!grouped[item.storeId]) grouped[item.storeId] = [];
          grouped[item.storeId].push(item);
        });
        return grouped;
      },
    }),
    {
      name: "tajary-cart",
    }
  )
);
