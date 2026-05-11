'use client';

import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cart-store';

export function AddToCartButton({
  productId,
  variantId,
  disabled,
}: {
  productId: string;
  variantId: string;
  disabled?: boolean;
}) {
  const addItem = useCartStore((s) => s.addItem);
  return (
    <Button onClick={() => addItem(productId, variantId)} disabled={disabled}>
      Προσθήκη
    </Button>
  );
}
