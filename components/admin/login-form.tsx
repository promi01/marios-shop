'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { loginAction } from '@/app/admin/actions';

export function LoginForm({ from }: { from: string }) {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="mt-5 space-y-3">
      <input type="hidden" name="from" value={from} />
      <div>
        <label htmlFor="password" className="block text-xs font-medium text-neutral-700 mb-1">
          Κωδικός
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="w-full h-10 px-3 rounded-md border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent"
        />
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Σύνδεση...' : 'Σύνδεση'}
      </Button>
    </form>
  );
}
