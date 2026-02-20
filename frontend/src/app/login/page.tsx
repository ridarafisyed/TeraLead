'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/features/auth/AuthProvider';
import { login } from '@/features/auth/authApi';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();

  return (
    <main className="min-h-screen p-6">
      <AuthForm
        title="Login"
        submitLabel="Login"
        onSubmit={async (values) => {
          const result = await login(values);
          auth.login(result.token);
          router.push('/patients');
        }}
      />
      <p className="mt-4 text-center text-sm">
        No account? <Link className="text-brand-600" href="/register">Register</Link>
      </p>
    </main>
  );
}
