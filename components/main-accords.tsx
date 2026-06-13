import type { Product } from '@/lib/types';
import { prepareAccords } from '@/lib/accords';

/**
 * Fragrantica-style "main accords": colored horizontal bars, one per accord,
 * sorted strongest-first. Each bar's width is relative to the strongest accord
 * (strongest fills the row), the color is the accord's fixed family color, and
 * the Greek label sits centered on the bar (white or dark text by contrast).
 *
 * Renders nothing when the product has no accords (e.g. older products whose
 * AI autofill ran before this field existed).
 */
export function MainAccords({ product }: { product: Product }) {
  if (!product.accords || product.accords.length === 0) return null;
  const bars = prepareAccords(product.accords);
  if (bars.length === 0) return null;

  return (
    <section className="mt-5 rounded-lg ring-1 ring-neutral-200 bg-white overflow-hidden">
      <p className="text-xs uppercase tracking-wider text-neutral-500 font-medium px-4 pt-3 pb-3">
        Κύριες συγχορδίες
      </p>
      <div className="px-4 pb-4 space-y-1.5">
        {bars.map((b) => (
          <div key={b.name} className="w-full">
            <div
              className="h-8 rounded-md flex items-center justify-center px-2"
              style={{ width: `${b.widthPct}%`, backgroundColor: b.color }}
            >
              <span
                className="text-[13px] font-medium whitespace-nowrap"
                style={{ color: b.darkText ? '#3A3A38' : '#ffffff' }}
              >
                {b.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
