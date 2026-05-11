'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCartStore } from '@/lib/cart-store';
import { useCartUiStore } from '@/lib/cart-ui-store';
import { getProductById, getVariant } from '@/lib/inventory';
import { formatPrice, formatItemCount } from '@/lib/format';
import { CartDrawerEmpty } from '@/components/cart-drawer-empty';
import { CartDrawerItem } from '@/components/cart-drawer-item';
import { CopyToMessengerButton } from '@/components/copy-to-messenger-button';
import type { CartItem, Product, Variant } from '@/lib/types';

type ResolvedLine = { item: CartItem; product: Product; variant: Variant };

/**
 * Cart drawer surface — right-side shadcn <Sheet> mounted globally in
 * app/layout.tsx. Opens/closes via the ephemeral useCartUiStore (Plan 04);
 * displays items live from useCartStore (Plan 01) with brand/name/variant/
 * subtotal resolved fresh from inventory.json each render (CONTEXT D-06).
 *
 * Anatomy locked by UI-SPEC §8 + CONTEXT D-09:
 *   - side="right" on ALL viewports (no bottom-sheet variant).
 *   - Width: w-[85vw] on mobile, sm:w-[420px] on tablet+.
 *   - Three-section vertical layout (header / scroll-list / footer) with
 *     flex flex-col p-0 gap-0 to override shadcn defaults.
 *   - Header: "Καλάθι" via <SheetTitle id="cart-title">. Close button (X)
 *     is auto-rendered by shadcn <SheetContent>.
 *   - Body: empty state OR <ul> of <CartDrawerItem>. While !isHydrated the
 *     drawer treats the cart as empty (D-07 / CART-11) to avoid flicker.
 *   - Footer: "Σύνολο" label + {N} τεμάχια via formatItemCount + total €
 *     via formatPrice on the left/right (UI-SPEC §8c). Below it the
 *     <CopyToMessengerButton /> (Plan 06) — wires clipboard + Sonner toasts.
 *
 * Stale items: per CONTEXT D-08 the Plan 01 store's onRehydrateStorage
 * already auto-removes items whose variant no longer exists or has stock=0.
 * The .filter((x): x is ResolvedLine => x !== null) below is a defensive
 * second pass — if a race somehow leaves a dangling item, the drawer
 * renders gracefully instead of crashing.
 */
export function CartDrawer() {
  const isDrawerOpen = useCartUiStore((s) => s.isDrawerOpen);
  const setDrawerOpen = useCartUiStore((s) => s.setDrawerOpen);
  const items = useCartStore((s) => s.items);
  const isHydrated = useCartStore((s) => s.isHydrated);

  // Resolve display data fresh from inventory on every render (CONTEXT D-06).
  const resolved: ResolvedLine[] = items
    .map((item): ResolvedLine | null => {
      const product = getProductById(item.product_id);
      const variant = product ? getVariant(product, item.variant_id) : undefined;
      if (!product || !variant) return null;
      return { item, product, variant };
    })
    .filter((x): x is ResolvedLine => x !== null);

  const totalItems = resolved.reduce((sum, r) => sum + r.item.quantity, 0);
  const totalPrice = resolved.reduce(
    (sum, r) => sum + r.variant.price * r.item.quantity,
    0,
  );
  const isEmpty = !isHydrated || resolved.length === 0;

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent
        side="right"
        className="w-[85vw] sm:w-[420px] flex flex-col p-0 gap-0"
      >
        <SheetHeader className="px-5 py-4 border-b border-neutral-200">
          <SheetTitle
            id="cart-title"
            className="text-xl font-semibold text-neutral-950 text-left"
          >
            Καλάθι
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isEmpty ? (
            <CartDrawerEmpty />
          ) : (
            <ul className="space-y-4">
              {resolved.map((r) => (
                <CartDrawerItem
                  key={`${r.item.product_id}::${r.item.variant_id}`}
                  item={r.item}
                  product={r.product}
                  variant={r.variant}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-neutral-200 px-5 py-4 space-y-3 bg-white">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-sm text-neutral-600">Σύνολο</p>
              <p className="text-xs text-neutral-600">{formatItemCount(totalItems)}</p>
            </div>
            <p className="text-xl font-semibold text-neutral-950">
              {formatPrice(totalPrice)}
            </p>
          </div>
          <CopyToMessengerButton />
        </div>
      </SheetContent>
    </Sheet>
  );
}
