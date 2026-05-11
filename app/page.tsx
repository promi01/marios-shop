import Link from 'next/link';
import { products } from '@/lib/inventory';

export default function HomePage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Marios Shop</h1>
      <ul className="space-y-2">
        {products.map((product) => (
          <li key={product.id}>
            <Link href={`/product/${product.id}`} className="underline">
              {product.brand} — {product.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
