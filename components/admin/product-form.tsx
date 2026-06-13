'use client';

import { useActionState, useState, useTransition } from 'react';
import Link from 'next/link';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ImageUploader } from '@/components/admin/image-uploader';
import { VariantEditor } from '@/components/admin/variant-editor';
import { autofillFragranceAction } from '@/app/admin/autofill-action';
import type { Product } from '@/lib/types';
import type { ProductFormState } from '@/app/admin/actions';

type Action = (
  prev: ProductFormState | null,
  formData: FormData,
) => Promise<ProductFormState>;

export function ProductForm({
  mode,
  action,
  initial,
}: {
  mode: 'create' | 'edit';
  action: Action;
  initial?: Product;
}) {
  const [state, formAction, pending] = useActionState<ProductFormState | null, FormData>(
    action,
    null,
  );

  // Controlled text fields so the AI autofill can populate them.
  const [brand, setBrand] = useState(initial?.brand ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [line, setLine] = useState(initial?.line ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [descriptionGr, setDescriptionGr] = useState(initial?.description_gr ?? '');
  const [topNotes, setTopNotes] = useState(initial?.top_notes ?? '');
  const [heartNotes, setHeartNotes] = useState(initial?.heart_notes ?? '');
  const [baseNotes, setBaseNotes] = useState(initial?.base_notes ?? '');
  const [accords, setAccords] = useState<Array<{ name: string; intensity: number }>>(
    initial?.accords ?? [],
  );

  const [autofillPending, startAutofill] = useTransition();

  const handleAutofill = () => {
    if (!brand.trim() || !name.trim()) {
      toast.error('Συμπλήρωσε πρώτα Brand και Όνομα');
      return;
    }
    const fd = new FormData();
    fd.set('brand', brand);
    fd.set('name', name);
    startAutofill(async () => {
      try {
        const result = await autofillFragranceAction(fd);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        if (result.data) {
          // Fill only — never overwrite something the owner already typed.
          if (!line.trim() && result.data.line) setLine(result.data.line);
          if (!notes.trim() && result.data.notes) setNotes(result.data.notes);
          if (!descriptionGr.trim() && result.data.description_gr)
            setDescriptionGr(result.data.description_gr);
          if (!topNotes.trim() && result.data.top_notes) setTopNotes(result.data.top_notes);
          if (!heartNotes.trim() && result.data.heart_notes)
            setHeartNotes(result.data.heart_notes);
          if (!baseNotes.trim() && result.data.base_notes) setBaseNotes(result.data.base_notes);
          if (accords.length === 0 && result.data.accords && result.data.accords.length > 0) {
            setAccords(result.data.accords);
          }
          toast.success('Συμπληρώθηκε — έλεγξε τα στοιχεία πριν την αποθήκευση');
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Σφάλμα autofill');
      }
    });
  };

  return (
    <form action={formAction} className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-950">
          {mode === 'create' ? 'Νέο άρωμα' : 'Επεξεργασία'}
        </h1>
        {mode === 'edit' && initial && (
          <p className="text-sm text-neutral-600 mt-1">
            {initial.brand} — {initial.name}
          </p>
        )}
      </header>

      <Section title="Βασικά">
        <Row>
          <Field label="Brand" required>
            <input
              name="brand"
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
              className="form-input"
              placeholder="π.χ. Tom Ford"
            />
          </Field>
          <Field label="Όνομα" required>
            <input
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-input"
              placeholder="π.χ. Tobacco Vanille"
            />
          </Field>
        </Row>

        <button
          type="button"
          onClick={handleAutofill}
          disabled={autofillPending}
          className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md border border-violet-300 bg-violet-50 text-sm font-medium text-violet-800 hover:border-violet-500 hover:bg-violet-100 disabled:opacity-60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2"
        >
          {autofillPending ? (
            <>
              <Loader2 size={15} className="animate-spin" aria-hidden />
              Αναζήτηση στοιχείων...
            </>
          ) : (
            <>
              <Sparkles size={15} aria-hidden />
              Αυτόματη συμπλήρωση (νότες, πυραμίδα, περιγραφή)
            </>
          )}
        </button>

        <Field label="Σειρά / collection (προαιρετικό)">
          <input
            name="line"
            type="text"
            value={line}
            onChange={(e) => setLine(e.target.value)}
            className="form-input"
            placeholder="π.χ. Private Blend"
          />
        </Field>
        <Field label="Νότες — σύνοψη (προαιρετικό)">
          <input
            name="notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="form-input"
            placeholder="π.χ. καπνός, βανίλια, μπαχαρικά"
          />
        </Field>
        <Field label="Περιγραφή (προαιρετικό)">
          <textarea
            name="description_gr"
            rows={3}
            value={descriptionGr}
            onChange={(e) => setDescriptionGr(e.target.value)}
            className="form-input min-h-[80px]"
            placeholder="Σύντομη περιγραφή στα Ελληνικά."
          />
        </Field>
        {mode === 'edit' && initial && (
          <input type="hidden" name="id" value={initial.id} />
        )}
      </Section>

      <Section title="Οσφρητική πυραμίδα (προαιρετικό)">
        <Field label="Νότες κορυφής">
          <input
            name="top_notes"
            type="text"
            value={topNotes}
            onChange={(e) => setTopNotes(e.target.value)}
            className="form-input"
            placeholder="π.χ. περγαμόντο, πιπέρι"
          />
        </Field>
        <Field label="Νότες καρδιάς">
          <input
            name="heart_notes"
            type="text"
            value={heartNotes}
            onChange={(e) => setHeartNotes(e.target.value)}
            className="form-input"
            placeholder="π.χ. τριαντάφυλλο, κανέλα"
          />
        </Field>
        <Field label="Νότες βάσης">
          <input
            name="base_notes"
            type="text"
            value={baseNotes}
            onChange={(e) => setBaseNotes(e.target.value)}
            className="form-input"
            placeholder="π.χ. oud, βανίλια, μόσχος"
          />
        </Field>
      </Section>

      <Section title="Κύριες συγχορδίες (προαιρετικό)">
        {/* Hidden field carries the JSON into the server action */}
        <input type="hidden" name="accords" value={JSON.stringify(accords)} />
        {accords.length === 0 ? (
          <p className="text-xs text-neutral-500">
            Συμπληρώνονται αυτόματα με την «Αυτόματη συμπλήρωση». Μπορείς μετά να πειράξεις τις εντάσεις.
          </p>
        ) : (
          <div className="space-y-2">
            {accords.map((a, idx) => (
              <div key={`${a.name}-${idx}`} className="flex items-center gap-2">
                <span className="flex-1 text-sm text-neutral-700">{a.name}</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={a.intensity}
                  onChange={(e) => {
                    const v = Math.max(0, Math.min(100, Number(e.target.value)));
                    setAccords((prev) =>
                      prev.map((x, i) => (i === idx ? { ...x, intensity: v } : x)),
                    );
                  }}
                  className="form-input w-20"
                  aria-label={`Ένταση ${a.name}`}
                />
                <button
                  type="button"
                  onClick={() => setAccords((prev) => prev.filter((_, i) => i !== idx))}
                  aria-label={`Αφαίρεση ${a.name}`}
                  className="h-9 w-9 inline-flex items-center justify-center text-neutral-400 hover:text-red-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Φωτογραφίες">
        <ImageUploader initial={initial?.images ?? []} />
      </Section>

      <Section title="Variants (μεγέθη / τιμές / stock)">
        <VariantEditor initial={initial?.variants} />
      </Section>

      {state?.error && (
        <div role="alert" className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <div className="flex items-center gap-2 sticky bottom-0 bg-stone-50 -mx-4 md:-mx-6 px-4 md:px-6 py-3 border-t border-neutral-200">
        <Button type="submit" disabled={pending} className="flex-1">
          {pending ? 'Αποθήκευση...' : 'Αποθήκευση'}
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin">Άκυρο</Link>
        </Button>
      </div>

      <style>{`
        .form-input {
          width: 100%;
          height: 2.5rem;
          padding: 0 0.75rem;
          border-radius: 0.375rem;
          border: 1px solid rgb(212 212 212);
          background: #fff;
          font-size: 0.875rem;
          color: rgb(10 10 10);
          outline: none;
        }
        .form-input:focus {
          border-color: transparent;
          box-shadow: 0 0 0 2px rgb(10 10 10);
        }
        textarea.form-input {
          height: auto;
          padding: 0.5rem 0.75rem;
          line-height: 1.4;
        }
      `}</style>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs uppercase tracking-wider text-neutral-500 font-medium">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>;
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-neutral-700 mb-1">
        {label}
        {required && <span className="text-red-600 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}
