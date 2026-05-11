'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/lib/cart-store';

/**
 * Side-effect-only client component that flips `useCartStore.isHydrated` to true
 * on mount, after `zustand/persist` has rehydrated from localStorage.
 *
 * Per CONTEXT D-07 + CART-11: rendering this once at the root layout level keeps
 * SSR/CSR markup identical — `<StickyCartButton />` (and Plan 05's drawer) read
 * `isHydrated` and render `0` / no-badge until this effect runs on the client.
 *
 * Returns `null` — does NOT inject any DOM.
 */
export function CartHydration() {
  const setHydrated = useCartStore((s) => s.setHydrated);
  useEffect(() => {
    setHydrated();
  }, [setHydrated]);
  return null;
}
