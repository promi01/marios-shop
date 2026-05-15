import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-12">
      <p className="text-xs uppercase tracking-wider text-neutral-500 font-medium">
        404
      </p>
      <h1 className="text-2xl md:text-3xl font-semibold text-neutral-950 mt-3">
        Δεν βρέθηκε
      </h1>
      <p className="text-sm md:text-base text-neutral-600 mt-3 max-w-md">
        Η σελίδα που ψάχνεις δεν υπάρχει ή έχει αφαιρεθεί. Ίσως το άρωμα
        να πουλήθηκε ή ο σύνδεσμος να μην είναι σωστός.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Επιστροφή στον κατάλογο</Link>
      </Button>
    </main>
  );
}
