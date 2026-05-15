'use client';

import { useRef, useEffect } from 'react';
import type { Product } from '@/lib/types';
import { setRuntimeInventory } from '@/lib/inventory-runtime';

/**
 * Mounted at the top of the React tree in app/layout.tsx, immediately after
 * the server fetches the inventory snapshot. Pushes the snapshot into the
 * module-level cache so client modules (cart-store, copy-to-messenger, the
 * drawer's resolver) can read it synchronously.
 *
 * Calls the setter both during render (so the snapshot is populated BEFORE
 * any descendant client effects fire) and again in useEffect (so prop
 * changes from React Refresh / cache revalidation propagate).
 */
export function InventoryRuntimeInit({ products }: { products: Product[] }) {
  const ranOnce = useRef(false);
  if (!ranOnce.current) {
    setRuntimeInventory(products);
    ranOnce.current = true;
  }
  useEffect(() => {
    setRuntimeInventory(products);
  }, [products]);
  return null;
}
