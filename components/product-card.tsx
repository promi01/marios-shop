import Image from 'next/image';
import Link from 'next/link';
import type { Product, VariantType } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { VariantBadge } from '@/components/variant-badge';

function distinctInStockTypes(product: Product): VariantType[] {
  const seen = new Set<VariantType>();
  for (const v of product.variants) {
    if (v.stock > 0) seen.add(v.type);
  }
  const order: VariantType[] = ['sealed', 'opened', 'decant'];
  return order.filter((t) => seen.has(t));
}

function lowestInStockPrice(product: Product): number | null {
  const prices = product.variants
    .filter((v) => v.stock > 0)
    .map((v) => v.price);
  if (prices.length === 0) return null;
  return Math.min(...prices);
}

function priceLabel(product: Product): string {
  const inStock = product.variants.filter((v) => v.stock > 0);
  const lowest = lowestInStockPrice(product);
  if (lowest === null) {
    // All variants out of stock — show the cheapest known price without prefix.
    const min = Math.min(...product.variants.map((v) => v.price));
    return formatPrice(min);
  }
  return inStock.length > 1 ? `από ${formatPrice(lowest)}` : formatPrice(lowest);
}

export function ProductCard({ product }: { product: Product }) {
  const types = distinctInStockTypes(product);
  const imageSrc = product.images[0] ?? '/products/placeholder.svg';

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block rounded-lg bg-white shadow-sm md:hover:shadow-md transition-shadow duration-150 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-square bg-stone-50">
        <Image
          src={imageSrc}
          alt={`${product.brand} ${product.name}`}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          unoptimized
        />
      </div>
      <div className="p-4 space-y-1">
        <p className="text-base font-semibold text-neutral-950">{product.brand}</p>
        <p className="text-sm text-neutral-600 leading-snug line-clamp-1">
          {product.name}
        </p>
        <p className="text-base font-semibold text-neutral-950 mt-2">
          {priceLabel(product)}
        </p>
        {types.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {types.map((t) => (
              <VariantBadge key={t} type={t} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
