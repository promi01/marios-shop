import { formatPrice, formatItemCount } from '@/lib/format';

/**
 * Display-resolved cart line. The cart store persists only
 * `{product_id, variant_id, quantity}` (CONTEXT D-06); the caller resolves
 * brand/name/typeLabel/size_ml/price fresh from inventory.json each render and
 * passes that resolved shape here. Greek typeLabel matches the variant badges
 * per CONTEXT D-25 (Σφραγισμένο / Ανοιγμένο / Decant).
 *
 * `fill_pct` is intentionally NOT part of this interface — per CONTEXT D-25
 * the copy text stays compact for Messenger and never surfaces fill_pct.
 */
export interface ResolvedItem {
  brand: string;
  name: string;
  /** Greek variant label per CONTEXT D-25 — matches the badges. */
  typeLabel: string;
  size_ml: number;
  /** Unit price (per single bottle/decant). */
  price: number;
  quantity: number;
}

/**
 * Format the cart as Messenger-ready plain text per UI-SPEC §Copy-to-Messenger
 * Format. Output shape:
 *
 *   Παραγγελία — Marios Shop
 *
 *   1. {brand} — {name}
 *      {TypeLabelGr} {size_ml}ml — {price}€ × {qty} = {subtotal}€
 *
 *   2. {brand} — {name}
 *      ...
 *
 *   Σύνολο: {total}€ — {N} τεμάχια
 *
 * Returns "" for an empty list — defensive, since the Copy button is disabled
 * when the cart is empty (COPY-08). Currency formatting via formatPrice uses
 * `{N}€` suffix (CONTEXT D-26); pluralization via formatItemCount handles the
 * singular `1 τεμάχιο` vs plural `{N} τεμάχια` Greek form.
 */
export function formatOrderText(items: ResolvedItem[]): string {
  if (items.length === 0) return '';

  const header = 'Παραγγελία — Marios Shop';

  const itemBlocks = items.map((item, index) => {
    const subtotal = item.price * item.quantity;
    const firstLine = `${index + 1}. ${item.brand} — ${item.name}`;
    const secondLine = `   ${item.typeLabel} ${item.size_ml}ml — ${formatPrice(item.price)} × ${item.quantity} = ${formatPrice(subtotal)}`;
    return `${firstLine}\n${secondLine}`;
  });

  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const footer = `Σύνολο: ${formatPrice(totalPrice)} — ${formatItemCount(totalQty)}`;

  // Interleave a blank line after each item block; the trailing empty string
  // becomes the separator between the last item and the footer.
  return [header, '', ...itemBlocks.flatMap((b) => [b, '']), footer].join('\n');
}
