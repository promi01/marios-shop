import { notFound } from 'next/navigation';
import { fetchInventory } from '@/lib/inventory-server';
import { ProductForm } from '@/components/admin/product-form';
import { updateProductAction, type ProductFormState } from '@/app/admin/actions';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const products = await fetchInventory();
  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  // Bind the id into the update action so the form can call a 2-arg action
  // signature (prev, formData).
  const boundUpdate = async (
    prev: ProductFormState | null,
    formData: FormData,
  ): Promise<ProductFormState> => {
    'use server';
    return updateProductAction(id, prev, formData);
  };

  return <ProductForm mode="edit" action={boundUpdate} initial={product} />;
}
