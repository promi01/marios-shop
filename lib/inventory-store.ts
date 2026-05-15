import 'server-only';
import { put, del, list } from '@vercel/blob';
import { revalidateTag, revalidatePath } from 'next/cache';
import type { Product } from '@/lib/types';
import { fetchInventory, INVENTORY_BLOB_KEY, INVENTORY_TAG } from '@/lib/inventory-server';

/**
 * Inventory write-side API. Used exclusively by admin Server Actions.
 *
 * Atomicity model: every write reads-then-writes the WHOLE inventory.json
 * blob. The single-file approach trades a few KB of write amplification for
 * dead-simple data integrity — no partial writes, no schema drift, easy
 * rollback (Blob keeps version history).
 *
 * After every successful write we:
 *   1. revalidateTag('inventory') — invalidates the catalog page fetch cache
 *   2. revalidatePath('/') and revalidatePath('/product/[id]', 'page')
 *      so the new state is visible on the very next request, not after the
 *      60s fetch revalidate window.
 */

function ensureWritable(): void {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN not set. Configure Vercel Blob storage in your Vercel project.',
    );
  }
}

async function writeInventory(products: Product[]): Promise<void> {
  ensureWritable();
  await put(INVENTORY_BLOB_KEY, JSON.stringify(products, null, 2), {
    access: 'public',
    contentType: 'application/json',
    allowOverwrite: true,
    addRandomSuffix: false,
    cacheControlMaxAge: 0,
  });
  revalidateTag(INVENTORY_TAG);
  revalidatePath('/');
  revalidatePath('/product/[id]', 'page');
  revalidatePath('/admin');
}

export async function loadInventory(): Promise<Product[]> {
  return fetchInventory();
}

export async function createProduct(product: Product): Promise<void> {
  const products = await fetchInventory();
  if (products.some((p) => p.id === product.id)) {
    throw new Error(`Product id "${product.id}" already exists`);
  }
  await writeInventory([product, ...products]);
}

export async function updateProduct(id: string, product: Product): Promise<void> {
  const products = await fetchInventory();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error(`Product not found: ${id}`);
  const updated = [...products];
  // Replace the entry; product.id might change if the user edited brand/name,
  // but for now we keep ids immutable to avoid breaking URLs.
  updated[idx] = { ...product, id };
  await writeInventory(updated);
}

export async function deleteProduct(id: string): Promise<void> {
  const products = await fetchInventory();
  const target = products.find((p) => p.id === id);
  if (!target) return; // idempotent
  const remaining = products.filter((p) => p.id !== id);
  await writeInventory(remaining);
  // Best-effort: delete the product's Blob photos (we never delete photos
  // under /products/ that live in the repo — those have no blob URL).
  const blobUrls = target.images.filter((src) => src.startsWith('https://') && src.includes('blob.vercel-storage.com'));
  if (blobUrls.length > 0) {
    try {
      await del(blobUrls);
    } catch (err) {
      console.warn('[inventory-store] Failed to delete blob photos:', err);
    }
  }
}

export async function listBlobPhotos(prefix = 'products/'): Promise<Array<{ url: string; pathname: string }>> {
  ensureWritable();
  const { blobs } = await list({ prefix });
  return blobs.map((b) => ({ url: b.url, pathname: b.pathname }));
}
