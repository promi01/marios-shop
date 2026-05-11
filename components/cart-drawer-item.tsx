'use client';

import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import type { CartItem, Product, Variant } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { VariantBadge } from '@/components/variant-badge';
import { useCartStore } from '@/lib/cart-store';

/**
 * Single line item inside the cart drawer's scrollable list.
 *
 * - Receives `product` and `variant` as PROPS — resolved fresh from
 *   inventory.json by the parent <CartDrawer /> per CONTEXT D-06 (only ids+qty
 *   are persisted; display fields are never persisted to avoid stale prices
 *   after a redeploy).
 * - Calls `useCartStore.removeItem(productId, variantId)` from the remove
 *   button (CART-08).
 * - No quantity stepper in Phase 1 (D-11 / UI-SPEC §8b-i) — quantity is
 *   read-only as "{N} × {unit_price}€"; CART-07's stepper is Phase 2.
 *
 * Anatomy locked by UI-SPEC §8b-i:
 *   - Wrapper: <li> (drawer list is a <ul>, per §Accessibility Minimums).
 *   - Layout: flex gap-3 items-start with three columns:
 *       1) thumbnail 56×56 (h-14 w-14 rounded-md bg-stone-50)
 *       2) text block (brand / name / variant row with badge + size + qty×price)
 *       3) right column with subtotal + remove button (44×44 tap area)
 *   - Remove button: 44×44 hit area (h-11 w-11) with negative margin (-m-3)
 *     so the visible icon sits flush in the column while the tap target
 *     extends beyond. lucide Trash2 size=16. Resting color text-neutral-400,
 *     hover text-red-700 per UI-SPEC §Interaction States Matrix.
 *   - aria-label: "Αφαίρεση {brand} {name}" per §Copywriting Contract.
 */
export function CartDrawerItem({
  item,
  product,
  variant,
}: {
  item: CartItem;
  product: Product;
  variant: Variant;
}) {
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = variant.price * item.quantity;

  return (
    <li className="flex gap-3 items-start">
      <div className="relative h-14 w-14 rounded-md bg-stone-50 overflow-hidden flex-shrink-0">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt=""
            fill
            className="object-cover"
            sizes="56px"
            unoptimized
          />
        ) : null}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-semibold text-neutral-950 truncate">{product.brand}</p>
        <p className="text-sm text-neutral-600 truncate">{product.name}</p>
        <div className="flex items-center gap-2 text-xs text-neutral-600 mt-1">
          <VariantBadge type={variant.type} />
          <span>{variant.size_ml}ml</span>
          <span aria-hidden>·</span>
          <span>
            {item.quantity} × {formatPrice(variant.price)}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="text-sm font-semibold text-neutral-950">
          {formatPrice(subtotal)}
        </span>
        <button
          type="button"
          onClick={() => removeItem(item.product_id, item.variant_id)}
          aria-label={`Αφαίρεση ${product.brand} ${product.name}`}
          className="h-11 w-11 -m-3 inline-flex items-center justify-center text-neutral-400 hover:text-red-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
        >
          <Trash2 size={16} aria-hidden />
        </button>
      </div>
    </li>
  );
}
