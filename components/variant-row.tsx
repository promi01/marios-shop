import type { Variant } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { VariantBadge } from '@/components/variant-badge';
import { AddToCartButton } from '@/app/product/[id]/add-to-cart-button';
import { Button } from '@/components/ui/button';

export function VariantRow({
  productId,
  variant,
}: {
  productId: string;
  variant: Variant;
}) {
  const outOfStock = variant.stock <= 0;
  const isLowStock = !outOfStock && variant.stock <= 2;
  const showFillPct = variant.type === 'opened' && typeof variant.fill_pct === 'number';

  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <VariantBadge type={variant.type} />
          <span className="text-sm text-neutral-700 font-medium">{variant.size_ml}ml</span>
          {showFillPct && (
            <span className="text-xs text-neutral-500">· Γέμιση: {variant.fill_pct}%</span>
          )}
        </div>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-lg font-semibold text-neutral-950 leading-none">
            {formatPrice(variant.price)}
          </span>
          {isLowStock && (
            <span className="text-xs font-medium text-amber-700">
              Τελευταία τεμάχια
            </span>
          )}
        </div>
      </div>
      <div>
        {outOfStock ? (
          <Button
            disabled
            aria-disabled="true"
            variant="outline"
            className="text-neutral-400 cursor-not-allowed"
          >
            Εξαντλήθηκε
          </Button>
        ) : (
          <AddToCartButton productId={productId} variantId={variant.id} />
        )}
      </div>
    </li>
  );
}
