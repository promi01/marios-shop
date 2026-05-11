import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-xl font-semibold text-neutral-950">Δεν βρέθηκε προϊόν</h1>
      <p className="text-sm text-neutral-600 mt-2">
        Το προϊόν που ψάχνετε δεν υπάρχει ή έχει αφαιρεθεί.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Επιστροφή στον κατάλογο</Link>
      </Button>
    </main>
  );
}
