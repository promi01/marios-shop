import { products } from '@/lib/inventory';
import { Hero } from '@/components/hero';
import { CatalogClient } from '@/components/catalog-client';

export default function HomePage() {
  return (
    <>
      <Hero />
      <CatalogClient products={products} />
    </>
  );
}
