'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { toggleProductActiveAction } from '@/app/admin/actions';

/**
 * Toggle button shown next to each product in the admin list.
 *
 * Active products get an "Απενεργοποίηση" button (hides the product from
 * the public catalog). Inactive products get an "Ενεργοποίηση" button
 * (publishes again).
 *
 * Posts to `toggleProductActiveAction` via a useTransition so the row
 * stays interactive while the write happens.
 */
export function ToggleActiveButton({ id, active, label }: { id: string; active: boolean; label: string }) {
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    const next = !active;
    const fd = new FormData();
    fd.set('id', id);
    fd.set('active', String(next));
    startTransition(async () => {
      try {
        await toggleProductActiveAction(fd);
        toast.success(next ? `Ενεργοποιήθηκε: ${label}` : `Απενεργοποιήθηκε: ${label}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Σφάλμα');
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={active ? `Απενεργοποίηση ${label}` : `Ενεργοποίηση ${label}`}
      className={`inline-flex items-center gap-1 justify-center h-8 px-3 rounded-md border text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
        active
          ? 'border-neutral-300 text-neutral-700 hover:border-neutral-500 focus-visible:ring-neutral-950'
          : 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:border-emerald-500 focus-visible:ring-emerald-600'
      } disabled:opacity-60`}
    >
      {active ? <EyeOff size={12} aria-hidden /> : <Eye size={12} aria-hidden />}
      {pending ? '...' : active ? 'Απόκρυψη' : 'Εμφάνιση'}
    </button>
  );
}
