'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getProductById, getVariant } from '@/lib/inventory';
import type { CartItem } from '@/lib/types';

interface CartStore {
  items: CartItem[];
  isHydrated: boolean;
  addItem: (product_id: string, variant_id: string) => void;
  removeItem: (product_id: string, variant_id: string) => void;
  itemCount: () => number;
  setHydrated: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,
      addItem: (product_id, variant_id) => {
        const product = getProductById(product_id);
        const variant = product ? getVariant(product, variant_id) : undefined;
        if (!product || !variant || variant.stock <= 0) return;

        const existing = get().items.find(
          (i) => i.product_id === product_id && i.variant_id === variant_id,
        );
        if (existing) {
          const next = Math.min(existing.quantity + 1, variant.stock);
          if (next === existing.quantity) return; // silent clamp per D-11
          set({
            items: get().items.map((i) =>
              i.product_id === product_id && i.variant_id === variant_id
                ? { ...i, quantity: next }
                : i,
            ),
          });
        } else {
          set({ items: [...get().items, { product_id, variant_id, quantity: 1 }] });
        }
      },
      removeItem: (product_id, variant_id) => {
        set({
          items: get().items.filter(
            (i) => !(i.product_id === product_id && i.variant_id === variant_id),
          ),
        });
      },
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'marios-shop-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        // Auto-remove items whose variant is missing or out of stock (D-08).
        if (state) {
          const valid = state.items.filter((item) => {
            const product = getProductById(item.product_id);
            const variant = product ? getVariant(product, item.variant_id) : undefined;
            return Boolean(variant && variant.stock > 0);
          });
          // Mutate the rehydrated state in place; persist will write back on next mutation.
          state.items = valid.map((item) => {
            const product = getProductById(item.product_id)!;
            const variant = getVariant(product, item.variant_id)!;
            return { ...item, quantity: Math.min(item.quantity, variant.stock) };
          });
        }
      },
    },
  ),
);
