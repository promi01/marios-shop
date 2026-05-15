'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import { getProductById, getVariant } from '@/lib/inventory';
import { trackAddedToCart } from '@/lib/analytics';
import type { CartItem } from '@/lib/types';

interface CartStore {
  items: CartItem[];
  isHydrated: boolean;
  addItem: (product_id: string, variant_id: string) => void;
  removeItem: (product_id: string, variant_id: string) => void;
  setQuantity: (product_id: string, variant_id: string, qty: number) => void;
  clearCart: () => void;
  itemCount: () => number;
  setHydrated: () => void;
}

/**
 * Cart store.
 *
 * Phase 2 changes vs Phase 1 (D-08 superseded):
 * - onRehydrateStorage NO LONGER auto-removes items whose variant disappeared
 *   or has stock=0. Items stay; the drawer flags them visually as "Μη
 *   διαθέσιμο" so the buyer notices what dropped before sending the order
 *   (CART-12).
 * - addItem and setQuantity surface a Sonner toast when stock-clamping
 *   (CART-04). This was silent in Phase 1 per D-11.
 * - New setQuantity for the drawer's +/- stepper (CART-07).
 * - New clearCart for the "Καθαρισμός" button (CART-10).
 */
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,
      addItem: (product_id, variant_id) => {
        const product = getProductById(product_id);
        const variant = product ? getVariant(product, variant_id) : undefined;
        if (!product || !variant) return;
        if (variant.stock <= 0) {
          toast.error('Εξαντλήθηκε');
          return;
        }

        const existing = get().items.find(
          (i) => i.product_id === product_id && i.variant_id === variant_id,
        );
        if (existing) {
          const next = Math.min(existing.quantity + 1, variant.stock);
          if (next === existing.quantity) {
            // Clamped — already at max stock.
            toast.error('Δεν υπάρχει επαρκές stock');
            return;
          }
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
        // ANL-03: track successful add (after the set, so analytics only fires on a real state change).
        trackAddedToCart(product_id, variant_id, variant.price);
      },
      removeItem: (product_id, variant_id) => {
        set({
          items: get().items.filter(
            (i) => !(i.product_id === product_id && i.variant_id === variant_id),
          ),
        });
      },
      setQuantity: (product_id, variant_id, qty) => {
        if (qty <= 0) {
          // Treat as remove — consumer should normally call removeItem
          // explicitly, but be defensive.
          get().removeItem(product_id, variant_id);
          return;
        }
        const product = getProductById(product_id);
        const variant = product ? getVariant(product, variant_id) : undefined;
        if (!product || !variant) return; // unavailable items can't have qty changed
        const clamped = Math.min(qty, variant.stock);
        if (clamped < qty) {
          toast.error('Δεν υπάρχει επαρκές stock');
        }
        if (clamped <= 0) {
          get().removeItem(product_id, variant_id);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.product_id === product_id && i.variant_id === variant_id
              ? { ...i, quantity: clamped }
              : i,
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'marios-shop-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      // Phase 2 (CART-12): items whose variant became unavailable are NOT
      // silently dropped on rehydrate. They surface in the drawer as flagged
      // "Μη διαθέσιμο" so the buyer can review before sending the order.
      // We still clamp valid items down to current stock to avoid lying to
      // the buyer about quantities that no longer exist.
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.items = state.items.map((item) => {
          const product = getProductById(item.product_id);
          const variant = product ? getVariant(product, item.variant_id) : undefined;
          if (!variant) return item; // unavailable — kept for flagging
          if (variant.stock <= 0) return item; // unavailable — kept for flagging
          return { ...item, quantity: Math.min(item.quantity, variant.stock) };
        });
      },
    },
  ),
);
