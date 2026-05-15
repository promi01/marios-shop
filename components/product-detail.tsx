import type { Product } from '@/lib/types';
import { BackLink } from '@/components/back-link';
import { VariantRow } from '@/components/variant-row';
import { ProductGallery } from '@/components/product-gallery';
import { ProductViewTracker } from '@/components/product-view-tracker';

export function ProductDetail({ product }: { product: Product }) {
  return (
    <main className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10 pb-32">
      <ProductViewTracker productId={product.id} />
      <BackLink />

      <div className="mt-4">
        <ProductGallery
          images={product.images}
          alt={`${product.brand} ${product.name}`}
        />
      </div>

      <header className="mt-8">
        <p className="text-xs uppercase tracking-wider text-neutral-500 font-medium">
          {product.brand}
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold text-neutral-950 mt-2 leading-tight">
          {product.name}
        </h1>
        {product.line && (
          <p className="text-sm text-neutral-600 mt-1">{product.line}</p>
        )}
      </header>

      {product.notes && (
        <section className="mt-5 rounded-lg bg-stone-50 px-4 py-3 ring-1 ring-stone-200">
          <p className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-1">
            Νότες
          </p>
          <p className="text-sm text-neutral-800 leading-relaxed">
            {product.notes}
          </p>
        </section>
      )}

      {product.description_gr && (
        <section className="mt-5">
          <p className="text-sm md:text-base text-neutral-800 leading-relaxed whitespace-pre-line">
            {product.description_gr}
          </p>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-3">
          Διαθέσιμα
        </h2>
        <ul className="divide-y divide-neutral-200 rounded-lg ring-1 ring-neutral-200 bg-white overflow-hidden">
          {product.variants.map((v) => (
            <VariantRow key={v.id} productId={product.id} variant={v} />
          ))}
        </ul>
      </section>
    </main>
  );
}
