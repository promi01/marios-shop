import { LoginForm } from '@/components/admin/login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50 px-4 py-12">
      <div className="w-full max-w-sm rounded-lg bg-white ring-1 ring-neutral-200 shadow-sm p-6 md:p-8">
        <h1 className="text-xl font-semibold text-neutral-950">Διαχείριση</h1>
        <p className="text-sm text-neutral-600 mt-1">Εισάγετε τον κωδικό για να συνεχίσετε.</p>
        <LoginForm from={from ?? '/admin'} />
      </div>
    </main>
  );
}
