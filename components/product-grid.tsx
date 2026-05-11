import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
