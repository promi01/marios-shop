'use client';

import type { Product, VariantType } from '@/lib/types';

type CategoryKey = 'all' | VariantType;

const TABS: Array<{ key: CategoryKey; label: string }> = [
  { key: 'all', label: 'Όλα' },
  { key: 'sealed', label: 'Σφραγισμένα' },
  { key: 'opened', label: 'Ανοιγμένα' },
  { key: 'decant', label: 'Decants' },
  { key: 'sample', label: 'Samples' },
];

function countByCategory(products: Product[]): Record<CategoryKey, number> {
  const counts: Record<CategoryKey, number> = {
    all: products.length,
    sealed: 0,
    opened: 0,
    decant: 0,
    sample: 0,
  };
  for (const p of products) {
    const types = new Set<VariantType>();
    for (const v of p.variants) {
      if (v.stock > 0) types.add(v.type);
    }
    for (const t of types) counts[t]++;
  }
  return counts;
}

/**
 * Prominent category navigation at the top of the catalog. Mobile-first,
 * scrolls horizontally if it doesn't fit. Active tab is filled black, the
 * others are outlined.
 *
 * Selected types Set comes from CatalogClient — a tab is "active" when its
 * type is the only one in the set. The "Όλα" tab is active when the set is
 * empty. Clicking a tab REPLACES the set (not toggles) so the categories
 * are mutually exclusive in the UX sense (multi-select chips were confusing
 * the user — they want clear single-category tabs).
 */
export function CategoryTabs({
  products,
  selectedTypes,
  onChange,
}: {
  products: Product[];
  selectedTypes: Set<VariantType>;
  onChange: (types: Set<VariantType>) => void;
}) {
  const counts = countByCategory(products);

  const activeKey: CategoryKey =
    selectedTypes.size === 0
      ? 'all'
      : selectedTypes.size === 1
        ? (Array.from(selectedTypes)[0] as CategoryKey)
        : 'all';

  const setCategory = (key: CategoryKey) => {
    if (key === 'all') onChange(new Set());
    else onChange(new Set([key as VariantType]));
  };

  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <div
            role="tablist"
            aria-label="Κατηγορίες"
            className="flex gap-2 min-w-max md:min-w-0"
          >
            {TABS.map((tab) => {
              const isActive = tab.key === activeKey;
              const count = counts[tab.key];
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setCategory(tab.key)}
                  className={`inline-flex items-center gap-2 h-11 px-4 md:px-5 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 ${
                    isActive
                      ? 'bg-neutral-950 text-white border border-neutral-950'
                      : 'bg-white text-neutral-700 border border-neutral-300 hover:border-neutral-500'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full text-xs font-semibold ${
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
