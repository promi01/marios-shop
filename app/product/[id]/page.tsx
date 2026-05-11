import { notFound } from 'next/navigation';
import { products, getProductById } from '@/lib/inventory';
import { AddToCartButton } from './add-to-cart-button';

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold">{product.brand}</h1>
      <p className="text-sm text-neutral-600">{product.name}</p>
      <div className="mt-6 space-y-3">
        {product.variants.map((v) => (
          <div key={v.id} className="flex items-center justify-between border-t border-neutral-200 py-3">
            <span className="text-sm">{v.type} · {v.size_ml}ml · {v.price}€</span>
            <AddToCartButton productId={product.id} variantId={v.id} disabled={v.stock <= 0} />
          </div>
        ))}
      </div>
    </main>
  );
}
