import { fetchInventory } from '@/lib/inventory-server';
import { Hero } from '@/components/hero';
import { CatalogClient } from '@/components/catalog-client';

export const revalidate = 60;

export default async function HomePage() {
  const all = await fetchInventory();
  // Hide products marked as inactive. Missing `active` field is treated as
  // active for backward compatibility with the original 12 starter products.
  const visible = all.filter((p) => p.active !== false);
  return (
    <>
      <Hero />
      <CatalogClient products={visible} />
    </>
  );
}
