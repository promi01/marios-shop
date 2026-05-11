import Image from 'next/image';
import type { Product } from '@/lib/types';
import { BackLink } from '@/components/back-link';
import { VariantRow } from '@/components/variant-row';

export function ProductDetail({ product }: { product: Product }) {
  return (
    <main className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <BackLink />
      <div className="relative aspect-square md:aspect-[4/5] rounded-lg overflow-hidden bg-stone-50 mt-4 mb-6">
        <Image
          src={product.image_fallback_url}
          alt={`${product.brand} ${product.name}`}
          fill
          className="object-cover"
          sizes="(min-width: 768px) 768px, 100vw"
          unoptimized
          priority
        />
      </div>
      <header>
        <p className="text-sm text-neutral-600">{product.brand}</p>
        <h1 className="text-xl font-semibold text-neutral-950 mt-1">{product.name}</h1>
        {product.line && (
          <p className="text-sm text-neutral-600 mt-1">{product.line}</p>
        )}
      </header>
      {product.notes && (
        <p className="text-sm text-neutral-600 mt-3">{product.notes}</p>
      )}
      {product.description_gr && (
        <p className="text-sm text-neutral-950 leading-normal mt-4 whitespace-pre-line">
          {product.description_gr}
        </p>
      )}
      <ul className="mt-8 space-y-0">
        {product.variants.map((v) => (
          <VariantRow key={v.id} productId={product.id} variant={v} />
        ))}
      </ul>
      <div className="h-16" aria-hidden />
    </main>
  );
}
