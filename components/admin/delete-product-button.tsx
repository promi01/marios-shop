'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { deleteProductAction } from '@/app/admin/actions';

export function DeleteProductButton({ id, label }: { id: string; label: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleConfirm = () => {
    const fd = new FormData();
    fd.set('id', id);
    startTransition(async () => {
      try {
        await deleteProductAction(fd);
        toast.success(`Διαγράφηκε: ${label}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Σφάλμα διαγραφής');
      }
    });
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="inline-flex items-center justify-center h-8 px-2 rounded-md border border-neutral-300 text-xs font-medium text-neutral-700 hover:border-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
        >
          Άκυρο
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={pending}
          className="inline-flex items-center justify-center h-8 px-2 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
        >
          {pending ? '...' : 'Διαγραφή'}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label={`Διαγραφή ${label}`}
      className="inline-flex items-center gap-1 justify-center h-8 px-3 rounded-md border border-red-200 text-xs font-medium text-red-700 hover:border-red-400 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
    >
      <Trash2 size={12} aria-hidden />
      Διαγραφή
    </button>
  );
}
