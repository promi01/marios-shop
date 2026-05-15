'use server';

import { put } from '@vercel/blob';
import sharp from 'sharp';

/**
 * Image upload Server Action. Accepts one file at a time so the client can
 * show per-image progress + parallelize. Returns the public Blob URL.
 *
 * Pipeline per upload:
 *  1. Read the File from FormData
 *  2. If HEIC/HEIF, convert via sharp (libheif on Vercel's runtime)
 *  3. Auto-orient using EXIF, then resize to max 1600px on long side
 *  4. Encode JPEG at quality 85
 *  5. Upload to Vercel Blob under `products/<random-name>.jpg`
 *
 * Why JPEG and not WebP/AVIF: maximum compatibility (older Android browsers
 * from Facebook in-app viewer behave oddly with AVIF). Storage cost is
 * negligible — a few hundred KB per photo at most.
 */

const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB raw cap (HEIC files can be big)
const TARGET_LONG_EDGE = 1600;

export async function uploadPhotoAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { error: 'Δεν στάλθηκε αρχείο' };
  }
  if (file.size === 0) {
    return { error: 'Άδειο αρχείο' };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { error: `Πολύ μεγάλο αρχείο (>${Math.round(MAX_SIZE_BYTES / 1024 / 1024)}MB)` };
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { error: 'Δεν έχει ρυθμιστεί το Vercel Blob (BLOB_READ_WRITE_TOKEN)' };
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    // sharp handles HEIC via libheif when available; fall back to other formats.
    const processed = await sharp(bytes, { failOn: 'none' })
      .rotate() // honour EXIF orientation
      .resize(TARGET_LONG_EDGE, TARGET_LONG_EDGE, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();

    const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.jpg`;
    const blob = await put(filename, processed, {
      access: 'public',
      contentType: 'image/jpeg',
      addRandomSuffix: false,
    });

    return { url: blob.url };
  } catch (err) {
    console.error('[upload-action] Failed:', err);
    return {
      error:
        err instanceof Error
          ? `Αδυναμία επεξεργασίας: ${err.message}`
          : 'Αδυναμία επεξεργασίας εικόνας',
    };
  }
}
