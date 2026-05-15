'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ImageUploader } from '@/components/admin/image-uploader';
import { VariantEditor } from '@/components/admin/variant-editor';
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
              defaultValue={initial?.brand}
              required
              className="form-input"
              placeholder="π.χ. Tom Ford"
            />
          </Field>
          <Field label="Όνομα" required>
            <input
              name="name"
              type="text"
              defaultValue={initial?.name}
              required
              className="form-input"
              placeholder="π.χ. Tobacco Vanille"
            />
          </Field>
        </Row>
        <Field label="Σειρά / collection (προαιρετικό)">
          <input
            name="line"
            type="text"
            defaultValue={initial?.line}
            className="form-input"
            placeholder="π.χ. Private Blend"
          />
        </Field>
        <Field label="Νότες (προαιρετικό)">
          <input
            name="notes"
            type="text"
            defaultValue={initial?.notes}
            className="form-input"
            placeholder="π.χ. καπνός, βανίλια, μπαχαρικά"
          />
        </Field>
        <Field label="Περιγραφή (προαιρετικό)">
          <textarea
            name="description_gr"
            rows={3}
            defaultValue={initial?.description_gr}
            className="form-input min-h-[80px]"
            placeholder="Σύντομη περιγραφή στα Ελληνικά."
          />
        </Field>
        {/* Slug: editable in advanced cases; auto-generated server-side when blank */}
        {mode === 'edit' && initial && (
          <input type="hidden" name="id" value={initial.id} />
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
