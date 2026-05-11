import { ShoppingBag } from 'lucide-react';

/**
 * Empty cart state rendered inside the drawer's scrollable body when no items
 * are present (or before hydration completes).
 *
 * Anatomy locked by UI-SPEC §8d:
 *   - Container: flex flex-col items-center justify-center h-full text-center px-6 py-12
 *   - Lone icon: lucide ShoppingBag size=32, text-neutral-400
 *   - Heading: "Το καλάθι σας είναι άδειο" (text-base font-semibold)
 *   - Body:    "Προσθέστε αρώματα από τον κατάλογο για να ξεκινήσετε." (text-sm text-neutral-600)
 *   - No CTA — closing the drawer already returns to the catalog.
 */
export function CartDrawerEmpty() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
      <ShoppingBag size={32} className="text-neutral-400" aria-hidden />
      <p className="text-base font-semibold text-neutral-950 mt-4">
        Το καλάθι σας είναι άδειο
      </p>
      <p className="text-sm text-neutral-600 mt-1">
        Προσθέστε αρώματα από τον κατάλογο για να ξεκινήσετε.
      </p>
    </div>
  );
}
