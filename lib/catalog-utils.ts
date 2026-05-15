import type { Product, VariantType } from '@/lib/types';

export type SortKey = 'recent' | 'brand-asc' | 'price-asc' | 'price-desc';

export interface CatalogFilters {
  types: Set<VariantType>;
  brands: Set<string>;
  search: string;
  sort: SortKey;
}

export const DEFAULT_FILTERS: CatalogFilters = {
  types: new Set(),
  brands: new Set(),
  search: '',
  sort: 'recent',
};

/**
 * Returns the unique brands found in inventory, sorted A→Z.
 */
export function uniqueBrands(products: Product[]): string[] {
  const set = new Set<string>();
  for (const p of products) set.add(p.brand);
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'el'));
}

/**
 * Returns the lowest in-stock price across a product's variants, or null if
 * everything is out of stock. Used by sort + card "από {N}€" label.
 */
export function lowestInStockPrice(product: Product): number | null {
  const prices = product.variants
    .filter((v) => v.stock > 0)
    .map((v) => v.price);
  if (prices.length === 0) return null;
  return Math.min(...prices);
}

/**
 * True when the product has at least one variant of the given type in stock.
 * Used for variant-type filtering — out-of-stock variants don't satisfy the
 * filter (a "decant" filter should hide products whose only decant has stock=0).
 */
function hasInStockType(product: Product, type: VariantType): boolean {
  return product.variants.some((v) => v.type === type && v.stock > 0);
}

/**
 * Free-text matcher: case-insensitive, matches brand, name, line, and notes.
 */
function matchesSearch(product: Product, q: string): boolean {
  if (!q) return true;
  const hay = [
    product.brand,
    product.name,
    product.line ?? '',
    product.notes ?? '',
  ]
    .join(' ')
    .toLocaleLowerCase('el');
  return hay.includes(q.toLocaleLowerCase('el'));
}

/**
 * Applies all filters in sequence. Returns a new array (does not mutate input).
 */
export function filterProducts(
  products: Product[],
  filters: CatalogFilters,
): Product[] {
  return products.filter((p) => {
    if (filters.types.size > 0) {
      const matches = Array.from(filters.types).some((t) => hasInStockType(p, t));
      if (!matches) return false;
    }
    if (filters.brands.size > 0 && !filters.brands.has(p.brand)) return false;
    if (!matchesSearch(p, filters.search)) return false;
    return true;
  });
}

/**
 * Sort a list of products by the given key. Preserves the original "recent"
 * order by relying on the inventory.json array order (most recently added at
 * the top — owner edits the JSON, no `added_at` timestamp tracked).
 */
export function sortProducts(products: Product[], sort: SortKey): Product[] {
  if (sort === 'recent') return products;
  const copy = [...products];
  if (sort === 'brand-asc') {
    return copy.sort((a, b) => {
      const byBrand = a.brand.localeCompare(b.brand, 'el');
      return byBrand !== 0 ? byBrand : a.name.localeCompare(b.name, 'el');
    });
  }
  if (sort === 'price-asc' || sort === 'price-desc') {
    return copy.sort((a, b) => {
      const pa = lowestInStockPrice(a) ?? Math.min(...a.variants.map((v) => v.price));
      const pb = lowestInStockPrice(b) ?? Math.min(...b.variants.map((v) => v.price));
      return sort === 'price-asc' ? pa - pb : pb - pa;
    });
  }
  return copy;
}
