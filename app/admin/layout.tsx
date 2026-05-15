import Link from 'next/link';
import { LogOut, Package, Plus } from 'lucide-react';
import { logoutAction } from '@/app/admin/actions';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Note: middleware also gates these routes; this is a defence-in-depth
  // check that ensures the layout itself renders only when authenticated.
  // The login page (/admin/login) has its own layout route that bypasses
  // this header (no auth needed).
  const store = await cookies();
  const isAuthed = await verifySessionToken(store.get(ADMIN_COOKIE)?.value);

  if (!isAuthed) {
    // Shouldn't happen — middleware redirects first — but render a minimal
    // shell rather than leak any admin UI.
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-950"
          >
            <Package size={16} aria-hidden />
            Διαχείριση
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-1 h-9 px-3 rounded-md bg-neutral-950 text-white text-xs font-medium hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
            >
              <Plus size={14} aria-hidden />
              Νέο
            </Link>
            <Link
              href="/"
              className="inline-flex items-center h-9 px-3 rounded-md border border-neutral-300 text-xs font-medium text-neutral-700 hover:border-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
            >
              Site
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1 h-9 px-3 rounded-md border border-neutral-300 text-xs font-medium text-neutral-700 hover:border-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
              >
                <LogOut size={14} aria-hidden />
                Έξοδος
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
