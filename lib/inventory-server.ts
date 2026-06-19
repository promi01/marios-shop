import 'server-only';
import { list } from '@vercel/blob';
import type { Product } from '@/lib/types';
import enrichment from '@/data/note-enrichment.json';

/**
 * Server-side inventory fetcher.
 *
 * Source of truth: Vercel Blob — a single file `inventory.json` stored at the
 * blob root. On first deploy (or local dev without Blob), falls back to the
 * checked-in `data/inventory.json`.
 *
 * Enrichment layer: products may have empty descriptive fields (notes,
 * olfactory pyramid, accords, description) because they were added before the
 * AI-autofill feature, or never autofilled. `data/note-enrichment.json`
 * provides accurate, hand-curated defaults keyed by product id. The merge
 * fills ONLY empty fields, so anything the owner set in admin always wins; the
 * moment they autofill/edit a product, their Blob value overrides the seed.
 *
 * Caching: tagged with `inventory` so admin writes can invalidate via
 * `revalidateTag('inventory')` (see `lib/inventory-store.ts`).
 */

export const INVENTORY_BLOB_KEY = 'inventory.json';
export const INVENTORY_TAG = 'inventory';

type Enrichment = Record<
  string,
  Partial<
    Pick<
      Product,
      'notes' | 'top_notes' | 'heart_notes' | 'base_notes' | 'description_gr' | 'accords'
    >
  >
>;

const SEED = enrichment as Enrichment;

function isEmptyStr(v?: string): boolean {
  return !v || v.trim() === '';
}

/** Fill only-empty descriptive fields from the curated seed (admin values win). */
function enrich(products: Product[]): Product[] {
  return products.map((p) => {
    const seed = SEED[p.id];
    if (!seed) return p;
    const merged: Product = { ...p };
    if (isEmptyStr(merged.notes) && seed.notes) merged.notes = seed.notes;
    if (isEmptyStr(merged.top_notes) && seed.top_notes) merged.top_notes = seed.top_notes;
    if (isEmptyStr(merged.heart_notes) && seed.heart_notes) merged.heart_notes = seed.heart_notes;
    if (isEmptyStr(merged.base_notes) && seed.base_notes) merged.base_notes = seed.base_notes;
    if (isEmptyStr(merged.description_gr) && seed.description_gr) {
      merged.description_gr = seed.description_gr;
    }
    if ((!merged.accords || merged.accords.length === 0) && seed.accords?.length) {
      merged.accords = seed.accords;
    }
    return merged;
  });
}

export async function fetchInventory(): Promise<Product[]> {
  // Local dev / no Blob token configured → use checked-in file.
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return enrich(await fallbackToLocal());
  }

  try {
    const { blobs } = await list({ prefix: INVENTORY_BLOB_KEY, limit: 1 });
    if (blobs.length === 0) {
      return enrich(await fallbackToLocal());
    }
    const res = await fetch(blobs[0].url, {
      next: { revalidate: 60, tags: [INVENTORY_TAG] },
    });
    if (!res.ok) return enrich(await fallbackToLocal());
    const data = (await res.json()) as Product[];
    return enrich(Array.isArray(data) ? data : []);
  } catch (err) {
    console.warn('[inventory-server] Blob fetch failed, using local fallback:', err);
    return enrich(await fallbackToLocal());
  }
}

async function fallbackToLocal(): Promise<Product[]> {
  const local = (await import('@/data/inventory.json')).default;
  return local as Product[];
}
