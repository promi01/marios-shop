'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cart-store';
import { getProductById } from '@/lib/inventory';

/**
 * Add-to-cart client island.
 *
 * SIGNATURE CONTRACT — DO NOT CHANGE:
 *   AddToCartButton({ productId, variantId, disabled }): JSX.Element
 *
 * Plan 01 created this file with the signature above. Plan 03's
 * `<VariantRow>` imports the symbol; renaming or reshaping the props would
 * break Plan 03's caller. Plan 04 (this revision) only enriches the click
 * handler with Sonner toast feedback — the exported function, prop names,
 * and prop types are FROZEN.
 *
 * Behavior:
 * - On click, snapshot the variant's quantity before + after addItem().
 * - If quantity actually increased, fire a Sonner success toast with the
 *   exact text `Προστέθηκε: {brand} — {name}` (UI-SPEC §Copywriting Contract
 *   Toast — add success + CONTEXT D-10).
 * - If quantity did NOT increase (silent stock clamp per D-11), no toast.
 *   Phase 2's CART-04 will replace the silent clamp with a warning toast.
 * - The drawer does NOT auto-open (D-10) — the toast + the StickyCartButton
 *   badge are the only feedback. User stays on the catalog/product page.
 */
export function AddToCartButton({
  productId,
  variantId,
  disabled,
}: {
  productId: string;
  variantId: string;
  disabled?: boolean;
}) {
  const handleClick = () => {
    const product = getProductById(productId);
    if (!product) return;

    // Imperative reads/calls inside an event handler — no subscribe, no extra re-render.
    const itemsBefore = useCartStore.getState().items;
    const before = itemsBefore.find(
      (i) => i.product_id === productId && i.variant_id === variantId,
    );
    const beforeQty = before?.quantity ?? 0;

    useCartStore.getState().addItem(productId, variantId);

    const itemsAfter = useCartStore.getState().items;
    const after = itemsAfter.find(
      (i) => i.product_id === productId && i.variant_id === variantId,
    );
    const afterQty = after?.quantity ?? 0;

    if (afterQty > beforeQty) {
      toast.success(`Προστέθηκε: ${product.brand} — ${product.name}`);
    }
    // Per D-11: silent stock clamp — no toast when the add was rejected.
    // CART-04 (stock-clamp warning toast) is Phase 2.
  };

  return (
    <Button onClick={handleClick} disabled={disabled}>
      Προσθήκη
    </Button>
  );
}
