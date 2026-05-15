import { notFound } from 'next/navigation';
import { fetchInventory } from '@/lib/inventory-server';
import { ProductDetail } from '@/components/product-detail';

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await fetchInventory();
  return products.map((p) => ({ id: p.id }));
}

// `dynamicParams: true` lets new products (added via admin) be rendered
// on-demand without a rebuild. The `notFound()` branch covers genuinely
// missing ids.
export const dynamicParams = true;

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const products = await fetchInventory();
  const product = products.find((p) => p.id === id);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
