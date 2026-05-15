'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCartStore } from '@/lib/cart-store';
import { useCartUiStore } from '@/lib/cart-ui-store';
import { getProductById, getVariant } from '@/lib/inventory';
import { formatPrice, formatItemCount } from '@/lib/format';
import { CartDrawerEmpty } from '@/components/cart-drawer-empty';
import { CartDrawerItem } from '@/components/cart-drawer-item';
import { CopyToMessengerButton } from '@/components/copy-to-messenger-button';
import { Button } from '@/components/ui/button';
import type { CartItem, Product, Variant } from '@/lib/types';

type ResolvedLine = {
  item: CartItem;
  product: Product;
  variant: Variant | null;
  unavailable: boolean;
};

export function CartDrawer() {
  const isDrawerOpen = useCartUiStore((s) => s.isDrawerOpen);
  const setDrawerOpen = useCartUiStore((s) => s.setDrawerOpen);
  const items = useCartStore((s) => s.items);
  const isHydrated = useCartStore((s) => s.isHydrated);
  const clearCart = useCartStore((s) => s.clearCart);

  // Phase 2 (CART-12): include lines whose variant has stock=0 OR whose
  // variant disappeared from inventory. They render as "Μη διαθέσιμο" rather
  // than silently dropped. Lines whose PRODUCT disappeared entirely are still
  // hidden — there's nothing to show.
  const resolved: ResolvedLine[] = items
    .map((item): ResolvedLine | null => {
      const product = getProductById(item.product_id);
      if (!product) return null; // product gone — drop silently
      const variant = getVariant(product, item.variant_id) ?? null;
      const unavailable = !variant || variant.stock <= 0;
      return { item, product, variant, unavailable };
    })
    .filter((x): x is ResolvedLine => x !== null);

  // Totals exclude unavailable lines.
  const availableLines = resolved.filter((r) => !r.unavailable && r.variant !== null);
  const totalItems = availableLines.reduce((sum, r) => sum + r.item.quantity, 0);
  const totalPrice = availableLines.reduce(
    (sum, r) => sum + (r.variant?.price ?? 0) * r.item.quantity,
    0,
  );
  const isEmpty = !isHydrated || resolved.length === 0;
  const hasUnavailable = resolved.some((r) => r.unavailable);

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent
        side="right"
        className="w-[85vw] sm:w-[420px] flex flex-col p-0 gap-0 bg-white"
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
            <>
              {hasUnavailable && (
                <div
                  role="status"
                  className="mb-4 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900"
                >
                  Κάποια προϊόντα δεν είναι πλέον διαθέσιμα. Θα εξαιρεθούν από
                  την αντιγραφή.
                </div>
              )}
              <ul className="space-y-4">
                {resolved.map((r) => (
                  <CartDrawerItem
                    key={`${r.item.product_id}::${r.item.variant_id}`}
                    item={r.item}
                    product={r.product}
                    variant={r.variant}
                    unavailable={r.unavailable}
                  />
                ))}
              </ul>
            </>
          )}
        </div>

        {!isEmpty && (
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
            <ClearCartControl onConfirm={clearCart} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ClearCartControl({ onConfirm }: { onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <p className="text-xs text-neutral-700 flex-1">Σίγουρα;</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setConfirming(false)}
          className="text-xs"
        >
          Άκυρο
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => {
            onConfirm();
            setConfirming(false);
          }}
          className="text-xs"
        >
          Καθαρισμός
        </Button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="w-full text-xs text-neutral-600 hover:text-neutral-950 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 rounded py-1"
    >
      Καθαρισμός καλαθιού
    </button>
  );
}
