import 'server-only';
import { list } from '@vercel/blob';
import type { Product } from '@/lib/types';

/**
 * Server-side inventory fetcher.
 *
 * Source of truth: Vercel Blob — a single file `inventory.json` stored at the
 * blob root. On first deploy (or local dev without Blob), falls back to the
 * checked-in `data/inventory.json`.
 *
 * Caching: tagged with `inventory` so admin writes can invalidate via
 * `revalidateTag('inventory')` (see `lib/inventory-store.ts`).
 *
 * Revalidation: 60s for catalog pages so visitors see admin changes within
 * a minute even without an explicit revalidate call.
 */

export const INVENTORY_BLOB_KEY = 'inventory.json';
export const INVENTORY_TAG = 'inventory';

export async function fetchInventory(): Promise<Product[]> {
  // Local dev / no Blob token configured → use checked-in file.
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return fallbackToLocal();
  }

  try {
    const { blobs } = await list({ prefix: INVENTORY_BLOB_KEY, limit: 1 });
    if (blobs.length === 0) {
      return fallbackToLocal();
    }
    const res = await fetch(blobs[0].url, {
      next: { revalidate: 60, tags: [INVENTORY_TAG] },
    });
    if (!res.ok) return fallbackToLocal();
    const data = (await res.json()) as Product[];
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('[inventory-server] Blob fetch failed, using local fallback:', err);
    return fallbackToLocal();
  }
}

async function fallbackToLocal(): Promise<Product[]> {
  const local = (await import('@/data/inventory.json')).default;
  return local as Product[];
}
