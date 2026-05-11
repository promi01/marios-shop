import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="p-6 max-w-3xl mx-auto text-center">
      <h1 className="text-xl font-semibold">Δεν βρέθηκε προϊόν</h1>
      <p className="text-sm text-neutral-600 mt-2">
        Το προϊόν που ψάχνετε δεν υπάρχει ή έχει αφαιρεθεί.
      </p>
      <Link href="/" className="inline-block mt-6 underline">
        Επιστροφή στον κατάλογο
      </Link>
    </main>
  );
}
