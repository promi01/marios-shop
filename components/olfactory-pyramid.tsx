import type { Product } from '@/lib/types';
import { noteImage, noteInitial } from '@/lib/note-images';

/**
 * Fragrantica-style olfactory pyramid: each note rendered as a circular
 * REAL ingredient photo with the note name beneath it, grouped by layer
 * (Κορυφή / Καρδιά / Βάση). No emoji. Notes without a matched ingredient
 * photo fall back to a neutral serif-monogram tile so the row stays tidy.
 *
 * Reads the existing comma-separated note strings (top/heart/base_notes) —
 * no schema change, no data migration. Renders nothing if the product has
 * no pyramid data.
 */

function parseNotes(s?: string): string[] {
  return (s ?? '')
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean);
}

const LAYERS = [
  { key: 'top' as const, label: 'Κορυφή', sub: 'πρώτες νότες' },
  { key: 'heart' as const, label: 'Καρδιά', sub: 'καρδιά αρώματος' },
  { key: 'base' as const, label: 'Βάση', sub: 'νότες βάσης' },
];

export function OlfactoryPyramid({ product }: { product: Product }) {
  const byLayer = {
    top: parseNotes(product.top_notes),
    heart: parseNotes(product.heart_notes),
    base: parseNotes(product.base_notes),
  };

  const layers = LAYERS.filter((l) => byLayer[l.key].length > 0);
  if (layers.length === 0) return null;

  return (
    <section className="mt-5 rounded-lg ring-1 ring-neutral-200 bg-white overflow-hidden">
      <p className="text-xs uppercase tracking-wider text-neutral-500 font-medium px-4 pt-3 pb-2">
        Οσφρητική πυραμίδα
      </p>
      <div className="divide-y divide-neutral-100">
        {layers.map((layer) => (
          <div key={layer.key} className="px-4 py-4">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-sm font-medium text-neutral-800">{layer.label}</span>
              <span className="text-[11px] text-neutral-400">{layer.sub}</span>
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-4">
              {byLayer[layer.key].map((note) => (
                <NoteTile key={note} note={note} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function NoteTile({ note }: { note: string }) {
  const src = noteImage(note);
  return (
    <li className="flex flex-col items-center gap-1.5 w-[70px]">
      <div className="h-[64px] w-[64px] rounded-full overflow-hidden ring-1 ring-neutral-200 bg-stone-100 flex items-center justify-center">
        {src ? (
          // Local /public image; the project builds with images.unoptimized,
          // so a plain <img> is the lightest correct choice here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={note}
            width={64}
            height={64}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="text-lg font-serif text-neutral-400 select-none"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {noteInitial(note)}
          </span>
        )}
      </div>
      <span className="text-[11px] text-neutral-700 text-center leading-tight">
        {note}
      </span>
    </li>
  );
}
