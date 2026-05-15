'use client';

import { useMemo, useState, useDeferredValue } from 'react';
import type { Product } from '@/lib/types';
import {
  DEFAULT_FILTERS,
  filterProducts,
  sortProducts,
  uniqueBrands,
} from '@/lib/catalog-utils';
import type { CatalogFilters } from '@/lib/catalog-utils';
import { CatalogFiltersBar } from '@/components/catalog-filters';
import { ProductGrid } from '@/components/product-grid';

/**
 * Client-side catalog wrapper — holds filter state and renders the grid.
 *
 * Uses `useDeferredValue` to debounce search input rendering (defers the
 * filter pass until React is idle, so typing stays responsive on slow
 * devices). Other filters apply immediately.
 */
export function CatalogClient({ products }: { products: Product[] }) {
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);
  const deferredSearch = useDeferredValue(filters.search);

  const brands = useMemo(() => uniqueBrands(products), [products]);

  const visible = useMemo(() => {
    const filtered = filterProducts(products, { ...filters, search: deferredSearch });
    return sortProducts(filtered, filters.sort);
  }, [products, filters, deferredSearch]);

  return (
    <>
      <CatalogFiltersBar
        brands={brands}
        filters={filters}
        onChange={setFilters}
        resultCount={visible.length}
      />
      <main>
        {visible.length === 0 ? (
          <EmptyState />
        ) : (
          <ProductGrid products={visible} />
        )}
      </main>
    </>
  );
}

function EmptyState() {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24 text-center">
      <p className="text-base font-semibold text-neutral-950">Δεν βρέθηκαν αρώματα</p>
      <p className="text-sm text-neutral-600 mt-2">
        Δοκίμασε να αφαιρέσεις κάποια φίλτρα ή να αλλάξεις την αναζήτηση.
      </p>
    </section>
  );
}
