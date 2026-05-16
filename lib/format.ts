import type { VariantType } from '@/lib/types';

/**
 * Format a price as Greek-style suffix euro: `180€` for integers, `179.50€` for decimals.
 * Per CONTEXT D-26 and UI-SPEC §Currency Format.
 */
export function formatPrice(n: number): string {
  const isInteger = Number.isInteger(n);
  return `${isInteger ? n : n.toFixed(2)}€`;
}

/**
 * Localize a variant type to its Greek label. Decant intentionally stays as-is (UI-SPEC).
 * Per CONTEXT D-25 and UI-SPEC §Copywriting Contract.
 */
export function formatTypeLabel(type: VariantType): string {
  switch (type) {
    case 'sealed':
      return 'Σφραγισμένο';
    case 'opened':
      return 'Ανοιγμένο';
    case 'decant':
      return 'Decant';
    case 'sample':
      return 'Sample';
  }
}

/**
 * Greek pluralization for "τεμάχιο" (item). Per UI-SPEC §Pluralization.
 */
export function formatItemCount(n: number): string {
  return n === 1 ? '1 τεμάχιο' : `${n} τεμάχια`;
}
