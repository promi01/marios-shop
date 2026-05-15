import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from '@/components/ui/sonner';
import { CartHydration } from '@/components/cart-hydration';
import { StickyCartButton } from '@/components/sticky-cart-button';
import { CartDrawer } from '@/components/cart-drawer';
import { InventoryRuntimeInit } from '@/components/inventory-runtime-init';
import { fetchInventory } from '@/lib/inventory-server';
import './globals.css';

const geist = Geist({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-geist-sans',
});

export const metadata: Metadata = {
  title: 'Marios Shop — Επιλεγμένα αρώματα',
  description: 'Επιλεγμένα αρώματα από τη συλλογή μου',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch inventory on the server (Vercel Blob in prod, local file in dev)
  // and seed the client runtime snapshot via InventoryRuntimeInit so cart
  // store + drawer can look up products synchronously.
  const products = await fetchInventory();

  return (
    <html lang="el" className={geist.variable}>
      <body className="font-sans antialiased bg-white text-neutral-950">
        <InventoryRuntimeInit products={products} />
        <CartHydration />
        {children}
        <StickyCartButton />
        <CartDrawer />
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
