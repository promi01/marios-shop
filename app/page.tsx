import { products } from '@/lib/inventory';
import { Hero } from '@/components/hero';
import { ProductGrid } from '@/components/product-grid';

export default function HomePage() {
  return (
    <>
      <Hero />
      <main>
        <ProductGrid products={products} />
      </main>
    </>
  );
}
