'use client';

import { useState } from 'react';
import Image from 'next/image';

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const hasImages = images.length > 0;
  const currentSrc = hasImages ? images[activeIdx] : null;

  return (
    <div>
      <div className="relative aspect-square md:aspect-[4/5] rounded-lg overflow-hidden bg-stone-100 ring-1 ring-neutral-200">
        {currentSrc ? (
          <Image
            src={currentSrc}
            alt={alt}
            fill
            className="object-contain p-2 md:p-4"
            sizes="(min-width: 768px) 768px, 100vw"
            unoptimized
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-neutral-400">
            Δεν υπάρχει εικόνα
          </div>
        )}
      </div>

      {images.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
          {images.map((src, i) => {
            const isActive = i === activeIdx;
            return (
              <li key={src} className="snap-start">
                <button
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  aria-label={`Εικόνα ${i + 1}`}
                  aria-pressed={isActive}
                  className={`relative h-16 w-16 rounded-md overflow-hidden bg-stone-100 ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 ${
                    isActive
                      ? 'ring-2 ring-neutral-950'
                      : 'ring-neutral-200 hover:ring-neutral-400'
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
