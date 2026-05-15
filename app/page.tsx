import { fetchInventory } from '@/lib/inventory-server';
import { Hero } from '@/components/hero';
import { CatalogClient } from '@/components/catalog-client';

export const revalidate = 60;

export default async function HomePage() {
  const products = await fetchInventory();
  return (
    <>
      <Hero />
      <CatalogClient products={products} />
    </>
  );
}
