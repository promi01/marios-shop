'use client';

import Image from 'next/image';
import { Trash2, Minus, Plus } from 'lucide-react';
import type { CartItem, Product, Variant } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { VariantBadge } from '@/components/variant-badge';
import { useCartStore } from '@/lib/cart-store';

/**
 * Single line item inside the cart drawer's scrollable list.
 *
 * Phase 2 (CART-07 + CART-12):
 *   - +/- quantity stepper replaces the static "{N} ×" label
 *   - When `unavailable` is true (variant missing or stock=0), the row is
 *     greyed out, has a "Μη διαθέσιμο" badge, and the stepper is hidden;
 *     only the remove button works
 *
 * Stock-clamp toast (CART-04) is fired from `useCartStore.setQuantity`.
 */
export function CartDrawerItem({
  item,
  product,
  variant,
  unavailable,
}: {
  item: CartItem;
  product: Product;
  variant: Variant | null;
  unavailable: boolean;
}) {
  const removeItem = useCartStore((s) => s.removeItem);
  const setQuantity = useCartStore((s) => s.setQuantity);

  const unitPrice = variant?.price ?? 0;
  const subtotal = unitPrice * item.quantity;
  const atMax = variant ? item.quantity >= variant.stock : true;
  const atMin = item.quantity <= 1;

  return (
    <li className={`flex gap-3 items-start ${unavailable ? 'opacity-60' : ''}`}>
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
        <div className="flex items-center gap-2 text-xs text-neutral-600 mt-1 flex-wrap">
          {variant && <VariantBadge type={variant.type} />}
          {variant && <span>{variant.size_ml}ml</span>}
          {unavailable && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-medium">
              Μη διαθέσιμο
            </span>
          )}
        </div>
        {!unavailable && variant && (
          <div className="flex items-center gap-3 mt-2">
            <div className="inline-flex items-center rounded-md border border-neutral-300">
              <button
                type="button"
                onClick={() =>
                  setQuantity(item.product_id, item.variant_id, item.quantity - 1)
                }
                disabled={atMin}
                aria-label="Μείωση ποσότητας"
                className="h-8 w-8 inline-flex items-center justify-center text-neutral-700 hover:text-neutral-950 disabled:text-neutral-300 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-inset rounded-l-md"
              >
                <Minus size={14} aria-hidden />
              </button>
              <span
                className="h-8 min-w-8 px-2 inline-flex items-center justify-center text-sm font-medium text-neutral-950 border-x border-neutral-300"
                aria-live="polite"
                aria-label={`Ποσότητα ${item.quantity}`}
              >
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity(item.product_id, item.variant_id, item.quantity + 1)
                }
                disabled={atMax}
                aria-label="Αύξηση ποσότητας"
                className="h-8 w-8 inline-flex items-center justify-center text-neutral-700 hover:text-neutral-950 disabled:text-neutral-300 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-inset rounded-r-md"
              >
                <Plus size={14} aria-hidden />
              </button>
            </div>
            <span className="text-xs text-neutral-600">× {formatPrice(unitPrice)}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col items-end gap-2">
        {!unavailable && (
          <span className="text-sm font-semibold text-neutral-950">
            {formatPrice(subtotal)}
          </span>
        )}
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
