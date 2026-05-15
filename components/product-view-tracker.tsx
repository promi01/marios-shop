'use client';

import { useEffect } from 'react';
import { trackProductViewed } from '@/lib/analytics';

/**
 * Fires the `product_viewed` analytics event once per product page mount.
 * Mounted invisibly inside ProductDetail so the event fires exactly when
 * the user lands on a product page (ANL-02).
 */
export function ProductViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    trackProductViewed(productId);
  }, [productId]);
  return null;
}
