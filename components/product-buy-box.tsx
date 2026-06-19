'use client';

import { useState } from 'react';
import type { Product, Variant, VariantType } from '@/lib/types';
import { formatPrice, formatTypeLabel } from '@/lib/format';
import { VariantBadge } from '@/components/variant-badge';
import { AddToCartButton } from '@/app/product/[id]/add-to-cart-button';
import { Button } from '@/components/ui/button';

/**
 * Tryasample-style buy box: brand/name + a SINGLE dynamic price that updates as
 * the buyer picks a size. The size is chosen via chips AND a mirrored dropdown
 * (both drive the same selection). The variant *type* (Σφραγισμένο / Ανοιγμένο /
 * Decant / Sample) and fill % show next to the price, not on the chips — so a
 * chip is just the size.
 *
 * One "Προσθήκη" button adds the currently selected variant. This replaces the
 * old one-row-per-variant list while keeping the exact cart/copy flow.
 *
 * Deliberately NO fake e-shop chrome (delivery promises, VAT lines, payment
 * icons, bonus points): this is a catalog people copy their order from, not a
 * real checkout.
 */

const TYPE_ORDER: Record<VariantType, number> = {
  sealed: 0,
  opened: 1,
  decant: 2,
  sample: 3,
};

/** Size selector order: ascending size, then by type. */
function sortVariants(variants: Variant[]): Variant[] {
  return [...variants].sort((a, b) => {
    if (a.size_ml !== b.size_ml) return a.size_ml - b.size_ml;
    return TYPE_ORDER[a.type] - TYPE_ORDER[b.type];
  });
}

/** ` · γέμιση 80%` for opened variants that carry a fill %, else empty. */
function fillSuffix(v: Variant): string {
  return v.type === 'opened' && typeof v.fill_pct === 'number'
    ? ` · γέμιση ${v.fill_pct}%`
    : '';
}

export function ProductBuyBox({ product }: { product: Product }) {
  const variants = sortVariants(product.variants);
  const firstInStock = variants.find((v) => v.stock > 0);
  const [selectedId, setSelectedId] = useState<string>(
    (firstInStock ?? variants[0]).id,
  );

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];

  // A size that appears on more than one variant can't be told apart by size
  // alone — disambiguate those chips with the type.
  const sizeCounts = variants.reduce<Record<number, number>>((acc, v) => {
    acc[v.size_ml] = (acc[v.size_ml] ?? 0) + 1;
    return acc;
  }, {});
  const chipLabel = (v: Variant) =>
    sizeCounts[v.size_ml] > 1
      ? `${v.size_ml}ml · ${formatTypeLabel(v.type)}`
      : `${v.size_ml}ml`;

  const outOfStock = selected.stock <= 0;
  const isLowStock = selected.stock > 0 && selected.stock <= 2;
  const showFillPct = selected.type === 'opened' && typeof selected.fill_pct === 'number';
  const multiple = variants.length > 1;

  return (
    <div className="md:pt-1">
      {/* Header */}
      <p className="text-xs uppercase tracking-wider text-neutral-500 font-medium">
        {product.brand}
      </p>
      <h1 className="text-2xl md:text-3xl font-semibold text-neutral-950 mt-2 leading-tight">
        {product.name}
      </h1>
      {product.line && <p className="text-sm text-neutral-600 mt-1">{product.line}</p>}

      {/* Dynamic price + type */}
      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-3xl font-bold text-neutral-950 leading-none">
          {formatPrice(selected.price)}
        </span>
        <VariantBadge type={selected.type} />
        {showFillPct && (
          <span className="text-xs text-neutral-500">Γέμιση: {selected.fill_pct}%</span>
        )}
      </div>
      {isLowStock && (
        <p className="mt-2 text-xs font-medium text-amber-700">Τελευταία τεμάχια</p>
      )}
      {outOfStock && (
        <p className="mt-2 text-xs font-medium text-neutral-500">Εξαντλήθηκε</p>
      )}

      {/* Size selector — chips + mirrored dropdown */}
      {multiple ? (
        <div className="mt-6 space-y-3">
          <p className="text-xs uppercase tracking-wider text-neutral-500 font-medium">
            Διάλεξε μέγεθος
          </p>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Μέγεθος">
            {variants.map((v) => {
              const isSel = v.id === selected.id;
              const vOut = v.stock <= 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedId(v.id)}
                  disabled={vOut}
                  aria-pressed={isSel}
                  title={`${formatTypeLabel(v.type)} — ${formatPrice(v.price)}`}
                  className={[
                    'inline-flex items-center rounded-md border px-3 h-9 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2',
                    isSel
                      ? 'border-neutral-950 bg-neutral-950 text-white'
                      : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-500',
                    vOut ? 'opacity-40 line-through cursor-not-allowed' : '',
                  ].join(' ')}
                >
                  {chipLabel(v)}
                </button>
              );
            })}
          </div>

          <label className="block">
            <span className="sr-only">Διάλεξε μέγεθος</span>
            <select
              value={selected.id}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950"
            >
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {`${v.size_ml}ml — ${formatTypeLabel(v.type)}${fillSuffix(v)} — ${formatPrice(v.price)}${v.stock <= 0 ? ' (εξαντλήθηκε)' : ''}`}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : (
        <p className="mt-4 text-sm text-neutral-600">Μέγεθος: {selected.size_ml}ml</p>
      )}

      {/* Add to cart (selected variant) */}
      <div className="mt-6">
        {outOfStock ? (
          <Button
            disabled
            aria-disabled="true"
            variant="outline"
            className="w-full text-neutral-400 cursor-not-allowed"
          >
            Εξαντλήθηκε
          </Button>
        ) : (
          <div className="[&>button]:w-full">
            <AddToCartButton productId={product.id} variantId={selected.id} />
          </div>
        )}
      </div>
    </div>
  );
}
