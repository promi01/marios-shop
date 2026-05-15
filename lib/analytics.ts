'use client';

import { track } from '@vercel/analytics';

/**
 * Custom event wrappers for Vercel Analytics.
 *
 * Privacy contract (ANL-05): payloads contain ONLY ids, prices, and counts —
 * no PII, no free-form text (no brand/name strings, no notes/descriptions,
 * no search queries, no cart contents beyond aggregate counts).
 *
 * No-op in development by default — @vercel/analytics auto-detects production
 * via NEXT_PUBLIC_VERCEL_ENV.
 */

export function trackProductViewed(productId: string) {
  track('product_viewed', { product_id: productId });
}

export function trackAddedToCart(productId: string, variantId: string, price: number) {
  track('added_to_cart', {
    product_id: productId,
    variant_id: variantId,
    price,
  });
}

export function trackCartCopied(totalValue: number, itemCount: number) {
  track('cart_copied', {
    total_value: totalValue,
    item_count: itemCount,
  });
}
