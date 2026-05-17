'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cart-store';
import { getProductById, getVariant } from '@/lib/inventory';
import { formatTypeLabel } from '@/lib/format';
import { formatOrderText, type ResolvedItem } from '@/lib/copy-format';
import { copyToClipboard } from '@/lib/clipboard';
import { trackCartCopied } from '@/lib/analytics';

/**
 * Copy-to-Messenger CTA — the final step of the Phase 1 vertical.
 *
 * Behavior:
 * - Subscribes to `useCartStore.items` and `useCartStore.isHydrated`. Disabled
 *   whenever the cart is empty OR before persist rehydrates (COPY-08 + D-07).
 * - On click: resolves each persisted `{product_id, variant_id, quantity}` line
 *   into a display-ready `ResolvedItem` via `getProductById` + `getVariant`
 *   (CONTEXT D-06 — brand/name/price/size resolved fresh from inventory each
 *   render, never persisted). Greek variant label via `formatTypeLabel`
 *   (CONTEXT D-25 — copy text uses the SAME Greek labels as the badges).
 * - Calls `formatOrderText` then `copyToClipboard` (primary navigator.clipboard
 *   path with textarea fallback per D-24).
 * - On success: toast.success("Αντιγράφηκε!"). On failure: toast.error
 *   ("Δεν αντιγράφηκε — δοκιμάστε ξανά"). UI-SPEC §Copywriting Contract.
 *
 * Mounted as the replacement for Plan 05's `data-slot="copy-cta-placeholder"`
 * in `components/cart-drawer.tsx` footer. Preserves the locked label
 * `📋 Αντιγραφή για Messenger` — the ONE emoji in the entire Phase 1 UI per
 * UI-04 / COPY-01.
 */
export function CopyToMessengerButton() {
  const items = useCartStore((s) => s.items);
  const isHydrated = useCartStore((s) => s.isHydrated);

  // Disabled per COPY-08 (empty cart) and pre-hydration (avoid copying a
  // not-yet-rehydrated cart). Also disabled when every item is unavailable
  // (CART-12) — there's nothing to copy.
  const availableCount = items.filter((item) => {
    const product = getProductById(item.product_id);
    const variant = product ? getVariant(product, item.variant_id) : undefined;
    return Boolean(variant && variant.stock > 0);
  }).length;
  const isEmpty = !isHydrated || availableCount === 0;

  const handleCopy = async () => {
    // Resolve display data fresh per click (CONTEXT D-06). Defensive null
    // filter — Plan 01's onRehydrateStorage already drops stale items, but
    // a race could in theory leave a dangling reference between renders.
    // Phase 2 (CART-12): exclude unavailable items (missing variant OR
    // stock <= 0) — they appear flagged in the drawer but must NOT pollute
    // the Messenger copy.
    const resolved: ResolvedItem[] = items
      .map((item): ResolvedItem | null => {
        const product = getProductById(item.product_id);
        const variant = product ? getVariant(product, item.variant_id) : undefined;
        if (!product || !variant) return null;
        if (variant.stock <= 0) return null;
        if (product.active === false) return null; // inactive → exclude from copy
        return {
          brand: product.brand,
          name: product.name,
          typeLabel: formatTypeLabel(variant.type),
          size_ml: variant.size_ml,
          price: variant.price,
          quantity: item.quantity,
        };
      })
      .filter((x): x is ResolvedItem => x !== null);

    // Defensive — disabled={isEmpty} makes this branch unreachable in normal
    // usage, but if every item points to a deleted product, fail silently
    // instead of firing a misleading toast.
    if (resolved.length === 0) return;

    const text = formatOrderText(resolved);
    const ok = await copyToClipboard(text);

    if (ok) {
      toast.success('Αντιγράφηκε!');
      // ANL-04: track successful copy with aggregate value/count only (no PII).
      const totalValue = resolved.reduce((sum, r) => sum + r.price * r.quantity, 0);
      const itemCount = resolved.reduce((sum, r) => sum + r.quantity, 0);
      trackCartCopied(totalValue, itemCount);
    } else {
      toast.error('Δεν αντιγράφηκε — δοκιμάστε ξανά');
    }
  };

  return (
    <Button
      type="button"
      onClick={handleCopy}
      disabled={isEmpty}
      aria-disabled={isEmpty}
      className="w-full"
      data-slot="copy-cta"
    >
      📋 Αντιγραφή για Messenger
    </Button>
  );
}
