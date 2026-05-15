'use client';

import { Search, X } from 'lucide-react';
import type { VariantType } from '@/lib/types';
import type { CatalogFilters, SortKey } from '@/lib/catalog-utils';

const TYPE_OPTIONS: Array<{ value: VariantType; label: string }> = [
  { value: 'sealed', label: 'Σφραγισμένα' },
  { value: 'opened', label: 'Ανοιγμένα' },
  { value: 'decant', label: 'Decants' },
];

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'recent', label: 'Πιο πρόσφατα' },
  { value: 'brand-asc', label: 'Brand A→Ω' },
  { value: 'price-asc', label: 'Τιμή: χαμηλή → υψηλή' },
  { value: 'price-desc', label: 'Τιμή: υψηλή → χαμηλή' },
];

export function CatalogFiltersBar({
  brands,
  filters,
  onChange,
  resultCount,
}: {
  brands: string[];
  filters: CatalogFilters;
  onChange: (next: CatalogFilters) => void;
  resultCount: number;
}) {
  const toggleType = (t: VariantType) => {
    const next = new Set(filters.types);
    if (next.has(t)) next.delete(t);
    else next.add(t);
    onChange({ ...filters, types: next });
  };

  const toggleBrand = (b: string) => {
    const next = new Set(filters.brands);
    if (next.has(b)) next.delete(b);
    else next.add(b);
    onChange({ ...filters, brands: next });
  };

  const setSearch = (v: string) => onChange({ ...filters, search: v });
  const setSort = (s: SortKey) => onChange({ ...filters, sort: s });

  const hasActive =
    filters.types.size > 0 ||
    filters.brands.size > 0 ||
    filters.search.length > 0 ||
    filters.sort !== 'recent';

  const clearAll = () =>
    onChange({ types: new Set(), brands: new Set(), search: '', sort: 'recent' });

  return (
    <div className="border-b border-neutral-200 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4 space-y-3">
        {/* Row 1: Search + Sort */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              aria-hidden
            />
            <input
              type="search"
              inputMode="search"
              placeholder="Αναζήτηση brand, ονόματος, νοτών..."
              value={filters.search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-9 rounded-md border border-neutral-300 bg-white text-sm text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent"
              aria-label="Αναζήτηση"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Καθαρισμός αναζήτησης"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 inline-flex items-center justify-center text-neutral-400 hover:text-neutral-700 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
              >
                <X size={14} aria-hidden />
              </button>
            )}
          </div>
          <label className="sr-only" htmlFor="catalog-sort">Ταξινόμηση</label>
          <select
            id="catalog-sort"
            value={filters.sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-10 px-3 rounded-md border border-neutral-300 bg-white text-sm text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Row 2: Type chips */}
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((t) => {
            const active = filters.types.has(t.value);
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => toggleType(t.value)}
                aria-pressed={active}
                className={`px-3 h-8 rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-1 ${
                  active
                    ? 'bg-neutral-950 text-white border border-neutral-950'
                    : 'bg-white text-neutral-700 border border-neutral-300 hover:border-neutral-500'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Row 3: Brand chips (horizontal scroll on mobile) */}
        {brands.length > 1 && (
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex gap-2 pb-1 min-w-max md:flex-wrap md:min-w-0">
              {brands.map((b) => {
                const active = filters.brands.has(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleBrand(b)}
                    aria-pressed={active}
                    className={`px-3 h-8 rounded-full text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-1 ${
                      active
                        ? 'bg-neutral-950 text-white border border-neutral-950'
                        : 'bg-white text-neutral-700 border border-neutral-300 hover:border-neutral-500'
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Result count + clear */}
        <div className="flex items-center justify-between text-xs text-neutral-600" aria-live="polite">
          <span>
            {resultCount} {resultCount === 1 ? 'άρωμα' : 'αρώματα'}
          </span>
          {hasActive && (
            <button
              type="button"
              onClick={clearAll}
              className="text-neutral-700 hover:text-neutral-950 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 rounded"
            >
              Καθαρισμός φίλτρων
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
