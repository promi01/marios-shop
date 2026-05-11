import { notFound } from 'next/navigation';
import { products, getProductById } from '@/lib/inventory';
import { ProductDetail } from '@/components/product-detail';

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
