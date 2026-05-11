import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

// NOTE: Google Fonts' Geist does not ship a 'greek' subset (only `cyrillic`,
// `latin`, `latin-ext`). Plan 01 §D-19 / UI-SPEC §Font Family Declaration mandate
// Greek subset; the runtime Google Fonts API rejects it. We load Geist with
// `latin` + `latin-ext` (covers Greek-adjacent typography) and rely on the
// browser's system-font fallback for Greek glyphs. The visual contract holds:
// Greek text renders cleanly in a fragrance-brand aesthetic. Documented as a
// Rule-1 deviation in SUMMARY.md.
const geist = Geist({
  // Geist on Google Fonts ships subsets: cyrillic, latin, latin-ext (no `greek` subset available)
  subsets: ['latin', 'latin-ext'], // greek glyphs render via system-font fallback (documented Rule-1 deviation in SUMMARY.md)
  variable: '--font-geist-sans',
});

export const metadata: Metadata = {
  title: 'Marios Shop — Επιλεγμένα αρώματα',
  description: 'Επιλεγμένα αρώματα από τη συλλογή μου',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="el" className={geist.variable}>
      <body className="font-sans antialiased bg-white text-neutral-950">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
