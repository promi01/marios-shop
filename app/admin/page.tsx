import Link from 'next/link';
import Image from 'next/image';
import { Plus, EyeOff } from 'lucide-react';
import { fetchInventory } from '@/lib/inventory-server';
import { DeleteProductButton } from '@/components/admin/delete-product-button';
import { ToggleActiveButton } from '@/components/admin/toggle-active-button';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  const products = await fetchInventory();
  const totalProducts = products.length;
  const inactiveCount = products.filter((p) => p.active === false).length;
  const totalStock = products.reduce(
    (sum, p) => sum + p.variants.reduce((s, v) => s + v.stock, 0),
    0,
  );

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <header className="flex items-baseline justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-neutral-950">
            Προϊόντα
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            {totalProducts} αρώματα · {totalStock} τεμάχια σε στοκ
            {inactiveCount > 0 && (
              <>
                {' '}· <span className="text-amber-700 font-medium">{inactiveCount} ανενεργά</span>
              </>
            )}
          </p>
        </div>
      </header>

      <Link
        href="/admin/products/new"
        className="block mb-6 rounded-lg border-2 border-dashed border-neutral-300 hover:border-neutral-500 hover:bg-white transition-colors p-6 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
      >
        <div className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700">
          <Plus size={16} aria-hidden />
          Προσθήκη νέου αρώματος
        </div>
      </Link>

      {products.length === 0 ? (
        <div className="rounded-lg bg-white ring-1 ring-neutral-200 p-8 text-center">
          <p className="text-sm text-neutral-600">
            Δεν υπάρχουν προϊόντα ακόμα. Πάτα &quot;Προσθήκη νέου αρώματος&quot; για να ξεκινήσεις.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {products.map((product) => {
            const totalProductStock = product.variants.reduce((s, v) => s + v.stock, 0);
            const cover = product.images[0];
            const isInactive = product.active === false;
            return (
              <li
                key={product.id}
                className={`bg-white ring-1 rounded-lg p-3 md:p-4 flex items-center gap-3 md:gap-4 ${
                  isInactive ? 'ring-amber-300 bg-amber-50/30' : 'ring-neutral-200'
                }`}
              >
                <div className={`relative h-16 w-16 md:h-20 md:w-20 rounded-md bg-stone-100 overflow-hidden flex-shrink-0 ${isInactive ? 'opacity-50' : ''}`}>
                  {cover && (
                    <Image
                      src={cover}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                      unoptimized
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs text-neutral-500 truncate">{product.brand}</p>
                    {isInactive && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-medium uppercase tracking-wide">
                        <EyeOff size={10} aria-hidden />
                        Ανενεργό
                      </span>
                    )}
                  </div>
                  <p className={`text-sm md:text-base font-semibold truncate ${isInactive ? 'text-neutral-500' : 'text-neutral-950'}`}>
                    {product.name}
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">
                    {product.variants.length} variants · {totalProductStock} σε στοκ
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-stretch">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="inline-flex items-center justify-center h-8 px-3 rounded-md border border-neutral-300 text-xs font-medium text-neutral-700 hover:border-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
                  >
                    Επεξεργασία
                  </Link>
                  <ToggleActiveButton
                    id={product.id}
                    active={product.active !== false}
                    label={`${product.brand} ${product.name}`}
                  />
                  <DeleteProductButton id={product.id} label={`${product.brand} ${product.name}`} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
