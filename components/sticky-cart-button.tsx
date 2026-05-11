'use client';

import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { useCartUiStore } from '@/lib/cart-ui-store';
import { formatItemCount } from '@/lib/format';

/**
 * Sticky cart button (FAB) — globally visible bottom-right per CONTEXT D-12 and
 * UI-SPEC §7. Renders on every page including the catalog and product detail.
 *
 * Behavior:
 * - Always renders the button (never hidden) per D-12 — returning visitors expect
 *   the cart in a fixed location even when empty.
 * - Badge counter = SUM of all item quantities (per CAT-09), hidden when count is 0
 *   OR while the cart is not yet hydrated (avoids SSR/CSR mismatch per D-07).
 * - Dynamic aria-label uses `formatItemCount` so the screen-reader announces the
 *   correct Greek plural (`1 τεμάχιο` vs `N τεμάχια`).
 * - Clicking calls `useCartUiStore.openDrawer()` — Plan 05 will wire the actual
 *   `<Sheet>` against `isDrawerOpen`. In this plan the click is effectively a no-op.
 */
export function StickyCartButton() {
  const isHydrated = useCartStore((s) => s.isHydrated);
  const count = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const openDrawer = useCartUiStore((s) => s.openDrawer);

  const displayCount = isHydrated ? count : 0;
  const showBadge = isHydrated && count > 0;
  const ariaLabel = showBadge
    ? `Άνοιγμα καλαθιού — ${formatItemCount(displayCount)}`
    : 'Άνοιγμα καλαθιού';

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={ariaLabel}
      className="fixed bottom-4 right-4 z-40 h-14 w-14 rounded-full bg-black text-white shadow-lg shadow-black/15 inline-flex items-center justify-center hover:bg-neutral-800 active:scale-95 transition-transform duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
    >
      <ShoppingBag size={22} aria-hidden />
      {showBadge && (
        <span
          className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full bg-white text-black text-xs font-semibold inline-flex items-center justify-center ring-2 ring-black px-1"
          aria-hidden
        >
          {displayCount}
        </span>
      )}
    </button>
  );
}
