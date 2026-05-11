'use client';

import { create } from 'zustand';

/**
 * Ephemeral cart UI store — drawer open/close state ONLY.
 *
 * Why a separate store from `lib/cart-store.ts`:
 * - Drawer state must NOT persist across refresh (a returning visitor should
 *   land on the page they bookmarked, not on a drawer they left open).
 * - Keeps the persistent cart store (Plan 01) focused on data; Plan 05 will
 *   simply consume `isDrawerOpen` + `setDrawerOpen` here to wire its `<Sheet>`.
 *
 * No persist middleware on purpose.
 */
interface CartUiStore {
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
}

export const useCartUiStore = create<CartUiStore>((set) => ({
  isDrawerOpen: false,
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  setDrawerOpen: (open) => set({ isDrawerOpen: open }),
}));
