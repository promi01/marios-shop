'use client';

import type { Product } from '@/lib/types';

/**
 * Client-side inventory snapshot.
 *
 * The server fetches inventory from Vercel Blob (or the local fallback) for
 * each page render and passes it to `<InventoryRuntimeInit>`, which writes
 * it into this module-level array. Client modules (cart-store,
 * copy-to-messenger-button, cart-drawer) then read synchronously from here.
 *
 * Why module-level rather than React Context? cart-store cannot use hooks
 * (it's a Zustand store, not a component). A simple shared array is the
 * cheapest way to give the store synchronous access to the inventory.
 *
 * Timing caveat: during the *very first* client tick, the persist middleware
 * fires `onRehydrateStorage` BEFORE `<InventoryRuntimeInit>` has mounted.
 * cart-store's rehydrate handler therefore checks for an empty snapshot and
 * skips its stock-clamp pass — the cart-drawer's CART-12 flagging logic
 * picks up the validation on next render once the snapshot is populated.
 */

let _products: Product[] = [];

export function setRuntimeInventory(products: Product[]): void {
  _products = products;
}

export function getRuntimeInventory(): Product[] {
  return _products;
}

export function getProductById(id: string): Product | undefined {
  return _products.find((p) => p.id === id);
}

export function getVariant(product: Product, variantId: string) {
  return product.variants.find((v) => v.id === variantId);
}
