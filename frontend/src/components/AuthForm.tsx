'use client';

import { useState } from 'react';

type Props = {
  title: string;
  submitLabel: string;
  onSubmit: (values: { email: string; password: string }) => Promise<void>;
};

export function AuthForm({ title, submitLabel, onSubmit }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="mx-auto mt-20 w-full max-w-md rounded-xl bg-white p-6 shadow">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <form
        className="mt-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setSubmitting(true);
          setError(null);
          try {
            await onSubmit({ email, password });
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <input
          className="w-full rounded border border-slate-300 px-3 py-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full rounded border border-slate-300 px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          className="w-full rounded bg-brand-500 py-2 font-medium text-white disabled:opacity-50"
          disabled={submitting}
          type="submit"
        >
          {submitting ? 'Please wait...' : submitLabel}
        </button>
      </form>
    </div>
  );
}
