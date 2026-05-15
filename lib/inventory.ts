/**
 * Public re-export of the CLIENT-SIDE inventory accessor.
 *
 * The old static array (`export const products`) is gone — inventory is now
 * runtime-fetched on the server (see `lib/inventory-server.ts`) and pushed
 * into the client snapshot via `<InventoryRuntimeInit>` mounted in
 * `app/layout.tsx`. Client modules that need to look up a product by id
 * keep importing from here unchanged.
 */
export { getProductById, getVariant, getRuntimeInventory } from '@/lib/inventory-runtime';
