import inventoryData from '@/data/inventory.json';
import type { Product } from '@/lib/types';

export const products: Product[] = inventoryData as Product[];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getVariant(product: Product, variantId: string) {
  return product.variants.find((v) => v.id === variantId);
}
