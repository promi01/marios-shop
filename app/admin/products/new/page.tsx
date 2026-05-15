import { ProductForm } from '@/components/admin/product-form';
import { createProductAction } from '@/app/admin/actions';

export const dynamic = 'force-dynamic';

export default function NewProductPage() {
  return <ProductForm mode="create" action={createProductAction} />;
}
