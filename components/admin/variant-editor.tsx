'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Variant, VariantType } from '@/lib/types';

interface DraftVariant {
  uid: string; // local key only — not posted
  type: VariantType;
  size_ml: string;
  price: string;
  stock: string;
  fill_pct: string;
}

function fromVariant(v: Variant): DraftVariant {
  return {
    uid: Math.random().toString(36).slice(2, 9),
    type: v.type,
    size_ml: String(v.size_ml),
    price: String(v.price),
    stock: String(v.stock),
    fill_pct: v.fill_pct !== undefined ? String(v.fill_pct) : '',
  };
}

function emptyVariant(): DraftVariant {
  return {
    uid: Math.random().toString(36).slice(2, 9),
    type: 'sealed',
    size_ml: '50',
    price: '',
    stock: '1',
    fill_pct: '',
  };
}

export function VariantEditor({ initial = [] }: { initial?: Variant[] }) {
  const [rows, setRows] = useState<DraftVariant[]>(
    initial.length > 0 ? initial.map(fromVariant) : [emptyVariant()],
  );

  const update = (uid: string, field: keyof DraftVariant, value: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.uid === uid
          ? { ...r, [field]: value, ...(field === 'type' && value !== 'opened' ? { fill_pct: '' } : {}) }
          : r,
      ),
    );
  };

  const addRow = () => setRows((prev) => [...prev, emptyVariant()]);
  const removeRow = (uid: string) => setRows((prev) => prev.filter((r) => r.uid !== uid));

  return (
    <div className="space-y-3">
      {rows.map((row, idx) => (
        <div
          key={row.uid}
          className="rounded-md bg-white ring-1 ring-neutral-200 p-3 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Variant {idx + 1}</span>
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(row.uid)}
                aria-label="Αφαίρεση variant"
                className="h-7 w-7 inline-flex items-center justify-center text-neutral-400 hover:text-red-700 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
              >
                <X size={14} aria-hidden />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <Field label="Τύπος">
              <select
                name="variant_type"
                value={row.type}
                onChange={(e) => update(row.uid, 'type', e.target.value)}
                className="w-full h-9 px-2 rounded-md border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent"
              >
                <option value="sealed">Σφραγισμένο</option>
                <option value="opened">Ανοιγμένο</option>
                <option value="decant">Decant</option>
              </select>
            </Field>
            <Field label="Μέγεθος (ml)">
              <input
                name="variant_size_ml"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={row.size_ml}
                onChange={(e) => update(row.uid, 'size_ml', e.target.value)}
                required
                className="w-full h-9 px-2 rounded-md border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent"
              />
            </Field>
            <Field label="Τιμή (€)">
              <input
                name="variant_price"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={row.price}
                onChange={(e) => update(row.uid, 'price', e.target.value)}
                required
                className="w-full h-9 px-2 rounded-md border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent"
              />
            </Field>
            <Field label="Stock">
              <input
                name="variant_stock"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={row.stock}
                onChange={(e) => update(row.uid, 'stock', e.target.value)}
                required
                className="w-full h-9 px-2 rounded-md border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent"
              />
            </Field>
          </div>

          {/* fill_pct field is always emitted (parallel arrays in FormData)
              but only meaningful for opened variants. */}
          <div className={row.type === 'opened' ? '' : 'hidden'}>
            <Field label="Γέμιση (%)">
              <input
                name="variant_fill_pct"
                type="number"
                inputMode="numeric"
                min="1"
                max="100"
                step="1"
                value={row.fill_pct}
                onChange={(e) => update(row.uid, 'fill_pct', e.target.value)}
                placeholder="π.χ. 85"
                className="w-full h-9 px-2 rounded-md border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent md:max-w-[160px]"
              />
            </Field>
          </div>
          {/* Always emit fill_pct as empty for non-opened rows so parallel arrays stay aligned */}
          {row.type !== 'opened' && (
            <input type="hidden" name="variant_fill_pct" value="" />
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="w-full inline-flex items-center justify-center gap-1 h-9 rounded-md border border-dashed border-neutral-300 text-xs font-medium text-neutral-700 hover:border-neutral-500 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
      >
        <Plus size={14} aria-hidden />
        Νέο variant
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-neutral-700 mb-1">{label}</span>
      {children}
    </label>
  );
}
