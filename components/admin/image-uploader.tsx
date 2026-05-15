'use client';

import { useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { Camera, X, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { uploadPhotoAction } from '@/app/admin/upload-action';

/**
 * Multi-image uploader for the product form.
 *
 * - Click "Προσθήκη φωτο" → file picker (camera on mobile via capture attr)
 * - User can select multiple files; each is uploaded in parallel
 * - HEIC files are accepted (server converts to JPG)
 * - Thumbnails show after upload; X removes, up/down reorders
 * - The component renders a hidden textarea `name="images"` whose value is
 *   the newline-separated list of URLs — that's what the parent form posts
 */
export function ImageUploader({ initial = [] }: { initial?: string[] }) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [pendingCount, setPendingCount] = useState(0);
  const [, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    setPendingCount((c) => c + list.length);
    list.forEach((file) => {
      const fd = new FormData();
      fd.set('file', file);
      startTransition(async () => {
        try {
          const result = await uploadPhotoAction(fd);
          if (result.url) {
            setUrls((prev) => [...prev, result.url!]);
          } else if (result.error) {
            toast.error(result.error);
          }
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Σφάλμα ανεβάσματος');
        } finally {
          setPendingCount((c) => Math.max(0, c - 1));
        }
      });
    });
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAt = (i: number) => {
    setUrls((prev) => prev.filter((_, idx) => idx !== i));
  };

  const move = (i: number, dir: -1 | 1) => {
    setUrls((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  return (
    <div>
      {/* Hidden field that carries the value into the form */}
      <textarea name="images" value={urls.join('\n')} readOnly hidden aria-hidden />

      <div className="grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-5">
        {urls.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="relative aspect-square rounded-md overflow-hidden bg-stone-100 ring-1 ring-neutral-200 group"
          >
            <Image src={src} alt="" fill className="object-cover" sizes="120px" unoptimized />
            {i === 0 && (
              <span className="absolute top-1 left-1 inline-flex items-center px-1.5 py-0.5 rounded-full bg-neutral-950/80 text-white text-[10px] font-medium">
                Cover
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/40 backdrop-blur-sm px-1 py-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Μετακίνηση πάνω"
                className="h-6 w-6 inline-flex items-center justify-center text-white disabled:opacity-30 rounded"
              >
                <ArrowUp size={12} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === urls.length - 1}
                aria-label="Μετακίνηση κάτω"
                className="h-6 w-6 inline-flex items-center justify-center text-white disabled:opacity-30 rounded"
              >
                <ArrowDown size={12} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label="Αφαίρεση φωτογραφίας"
                className="h-6 w-6 inline-flex items-center justify-center text-white hover:text-red-300 rounded"
              >
                <X size={12} aria-hidden />
              </button>
            </div>
          </div>
        ))}

        {Array.from({ length: pendingCount }).map((_, i) => (
          <div
            key={`pending-${i}`}
            className="aspect-square rounded-md bg-stone-100 ring-1 ring-neutral-200 flex items-center justify-center"
          >
            <Loader2 size={20} className="animate-spin text-neutral-400" aria-hidden />
          </div>
        ))}

        <label className="aspect-square rounded-md ring-1 ring-dashed ring-neutral-300 hover:ring-neutral-500 hover:bg-white cursor-pointer flex flex-col items-center justify-center gap-1 text-neutral-600 hover:text-neutral-950 transition-colors focus-within:ring-2 focus-within:ring-neutral-950">
          <Camera size={18} aria-hidden />
          <span className="text-[10px] font-medium">Προσθήκη φωτο</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            capture="environment"
            onChange={(e) => handleFiles(e.target.files)}
            className="sr-only"
            aria-label="Επιλογή φωτογραφιών"
          />
        </label>
      </div>

      <p className="text-xs text-neutral-500 mt-2">
        Πρώτη φωτογραφία = cover (αυτή που φαίνεται στο grid). HEIC και JPG υποστηρίζονται.
      </p>
    </div>
  );
}
