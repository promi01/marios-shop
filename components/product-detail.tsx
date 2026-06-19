import type { Product } from '@/lib/types';
import { BackLink } from '@/components/back-link';
import { ProductBuyBox } from '@/components/product-buy-box';
import { ProductGallery } from '@/components/product-gallery';
import { ProductViewTracker } from '@/components/product-view-tracker';
import { MainAccords } from '@/components/main-accords';
import { OlfactoryPyramid } from '@/components/olfactory-pyramid';

export function ProductDetail({ product }: { product: Product }) {
  return (
    <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10 pb-32">
      <ProductViewTracker productId={product.id} />
      <BackLink />

      {/* Buy section — gallery left, buy-box right on desktop; stacked on mobile */}
      <div className="mt-4 md:grid md:grid-cols-2 md:gap-8 lg:gap-10 md:items-start">
        <ProductGallery
          images={product.images}
          alt={`${product.brand} ${product.name}`}
        />
        <div className="mt-6 md:mt-0">
          <ProductBuyBox product={product} />
        </div>
      </div>

      {/* Fragrance details — notes summary, accords, pyramid, description */}
      <div className="mt-10 max-w-3xl">
        {product.notes && (
          <section className="rounded-lg bg-stone-50 px-4 py-3 ring-1 ring-stone-200">
            <p className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-1">
              Νότες
            </p>
            <p className="text-sm text-neutral-800 leading-relaxed">
              {product.notes}
            </p>
          </section>
        )}

        <MainAccords product={product} />

        <OlfactoryPyramid product={product} />

        {product.description_gr && (
          <section className="mt-5">
            <p className="text-sm md:text-base text-neutral-800 leading-relaxed whitespace-pre-line">
              {product.description_gr}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
