import { notFound } from 'next/navigation';
import { fetchInventory } from '@/lib/inventory-server';
import { ProductDetail } from '@/components/product-detail';

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await fetchInventory();
  // Only pre-build pages for active products. Inactive products are still
  // accessible via /admin but their public URL returns 404.
  return products.filter((p) => p.active !== false).map((p) => ({ id: p.id }));
}

export const dynamicParams = true;

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const products = await fetchInventory();
  const product = products.find((p) => p.id === id);
  // 404 if product doesn't exist OR is deactivated. This prevents bookmarked
  // links from continuing to expose a product the owner hid.
  if (!product || product.active === false) notFound();
  return <ProductDetail product={product} />;
}
