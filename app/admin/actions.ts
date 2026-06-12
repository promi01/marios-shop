'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  clearSessionCookie,
  createSessionToken,
  isPasswordCorrect,
  setSessionCookie,
} from '@/lib/auth';
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from '@/lib/inventory-store';
import type { Product, Variant, VariantType } from '@/lib/types';

// ─────────────────────────────────────────────────────────────────────────
// Authentication
// ─────────────────────────────────────────────────────────────────────────

export async function loginAction(_prev: { error?: string } | null, formData: FormData) {
  const password = String(formData.get('password') ?? '');
  const from = String(formData.get('from') ?? '/admin');

  let ok: boolean;
  try {
    ok = isPasswordCorrect(password);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Configuration error' };
  }

  if (!ok) {
    return { error: 'Λάθος κωδικός' };
  }

  const token = await createSessionToken();
  await setSessionCookie(token);
  // Validate the redirect target is internal — prevent open redirect.
  const safeTarget = from.startsWith('/admin') ? from : '/admin';
  redirect(safeTarget);
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect('/admin/login');
}

// ─────────────────────────────────────────────────────────────────────────
// Product CRUD
// ─────────────────────────────────────────────────────────────────────────

export type ProductFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function slugify(input: string): string {
  // Greek → Latin-ish transliteration for slug generation.
  const greekMap: Record<string, string> = {
    α: 'a', β: 'b', γ: 'g', δ: 'd', ε: 'e', ζ: 'z', η: 'i', θ: 'th',
    ι: 'i', κ: 'k', λ: 'l', μ: 'm', ν: 'n', ξ: 'x', ο: 'o', π: 'p',
    ρ: 'r', σ: 's', ς: 's', τ: 't', υ: 'y', φ: 'f', χ: 'ch', ψ: 'ps', ω: 'o',
    ά: 'a', έ: 'e', ή: 'i', ί: 'i', ό: 'o', ύ: 'y', ώ: 'o', ϊ: 'i', ϋ: 'y', ΰ: 'y', ΐ: 'i',
  };
  return input
    .toLowerCase()
    .split('')
    .map((c) => greekMap[c] ?? c)
    .join('')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function parseProductFromForm(formData: FormData): { product: Product; error?: string } {
  const brand = String(formData.get('brand') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const line = String(formData.get('line') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim();
  const description_gr = String(formData.get('description_gr') ?? '').trim();
  const top_notes = String(formData.get('top_notes') ?? '').trim();
  const heart_notes = String(formData.get('heart_notes') ?? '').trim();
  const base_notes = String(formData.get('base_notes') ?? '').trim();
  const idInput = String(formData.get('id') ?? '').trim();
  const imagesRaw = String(formData.get('images') ?? '');

  if (!brand) return { product: {} as Product, error: 'Λείπει το brand' };
  if (!name) return { product: {} as Product, error: 'Λείπει το όνομα' };

  const images = imagesRaw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  if (images.length === 0) {
    return { product: {} as Product, error: 'Χρειάζεται τουλάχιστον 1 φωτογραφία' };
  }

  // Variants come from form as parallel arrays.
  const types = formData.getAll('variant_type') as string[];
  const sizes = formData.getAll('variant_size_ml') as string[];
  const prices = formData.getAll('variant_price') as string[];
  const stocks = formData.getAll('variant_stock') as string[];
  const fillPcts = formData.getAll('variant_fill_pct') as string[];

  if (types.length === 0) {
    return { product: {} as Product, error: 'Χρειάζεται τουλάχιστον 1 variant' };
  }

  const seenVariantIds = new Set<string>();
  const variants: Variant[] = [];
  for (let i = 0; i < types.length; i++) {
    const type = String(types[i] ?? '');
    if (type !== 'sealed' && type !== 'opened' && type !== 'decant' && type !== 'sample') {
      return { product: {} as Product, error: `Άκυρος τύπος στο variant ${i + 1}: ${type}` };
    }
    const sizeMl = Number(sizes[i]);
    if (!Number.isFinite(sizeMl) || sizeMl <= 0) {
      return { product: {} as Product, error: `Άκυρο μέγεθος στο variant ${i + 1}` };
    }
    const price = Number(prices[i]);
    if (!Number.isFinite(price) || price < 0) {
      return { product: {} as Product, error: `Άκυρη τιμή στο variant ${i + 1}` };
    }
    const stock = Number(stocks[i]);
    if (!Number.isInteger(stock) || stock < 0) {
      return { product: {} as Product, error: `Άκυρο stock στο variant ${i + 1}` };
    }

    const variantId = `${type}-${sizeMl}`;
    if (seenVariantIds.has(variantId)) {
      return { product: {} as Product, error: `Διπλό variant: ${variantId}` };
    }
    seenVariantIds.add(variantId);

    const variant: Variant = {
      id: variantId,
      type: type as VariantType,
      size_ml: sizeMl,
      price,
      stock,
    };
    if (type === 'opened') {
      const fp = Number(fillPcts[i]);
      if (Number.isFinite(fp) && fp >= 1 && fp <= 100) {
        variant.fill_pct = fp;
      }
    }
    variants.push(variant);
  }

  const id = idInput || `${slugify(brand)}-${slugify(name)}`;

  const product: Product = {
    id,
    brand,
    name,
    images,
    variants,
    ...(line ? { line } : {}),
    ...(notes ? { notes } : {}),
    ...(description_gr ? { description_gr } : {}),
    ...(top_notes ? { top_notes } : {}),
    ...(heart_notes ? { heart_notes } : {}),
    ...(base_notes ? { base_notes } : {}),
  };
  return { product };
}

export async function createProductAction(
  _prev: ProductFormState | null,
  formData: FormData,
): Promise<ProductFormState> {
  const { product, error } = parseProductFromForm(formData);
  if (error) return { error };
  try {
    await createProduct(product);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Σφάλμα αποθήκευσης' };
  }
  revalidatePath('/admin');
  redirect('/admin');
}

export async function updateProductAction(
  id: string,
  _prev: ProductFormState | null,
  formData: FormData,
): Promise<ProductFormState> {
  const { product, error } = parseProductFromForm(formData);
  if (error) return { error };
  try {
    // Preserve the active flag from the existing product — the edit form
    // doesn't expose it (toggle lives in the admin list). Without this
    // copy, editing an inactive product would silently re-activate it.
    const { loadInventory } = await import('@/lib/inventory-store');
    const existing = (await loadInventory()).find((p) => p.id === id);
    if (existing && existing.active !== undefined) {
      product.active = existing.active;
    }
    await updateProduct(id, product);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Σφάλμα αποθήκευσης' };
  }
  revalidatePath('/admin');
  revalidatePath(`/product/${id}`);
  redirect('/admin');
}

export async function deleteProductAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await deleteProduct(id);
  revalidatePath('/admin');
  revalidatePath('/');
}

/**
 * Toggle the `active` flag on a product. Used by the admin product list to
 * hide/show a listing from the public catalog without losing the entry
 * (photos, description, stock all preserved).
 */
export async function toggleProductActiveAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const nextActive = String(formData.get('active') ?? 'true') === 'true';
  if (!id) return;
  const { loadInventory: load } = await import('@/lib/inventory-store');
  const products = await load();
  const product = products.find((p) => p.id === id);
  if (!product) return;
  await updateProduct(id, { ...product, active: nextActive });
  revalidatePath('/admin');
  revalidatePath('/');
  revalidatePath(`/product/${id}`);
}
