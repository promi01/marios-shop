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
  return (
    <li className="flex items-center justify-between gap-3 border-t border-neutral-200 py-3">
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <VariantBadge type={variant.type} />
          <span className="text-sm text-neutral-950">{variant.size_ml}ml</span>
        </div>
        <span className="text-base font-semibold text-neutral-950">
          {formatPrice(variant.price)}
        </span>
      </div>
      <div>
        {outOfStock ? (
          <Button
            disabled
            aria-disabled="true"
            className="disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed"
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
