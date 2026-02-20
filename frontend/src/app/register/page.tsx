'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/features/auth/AuthProvider';
import { register } from '@/features/auth/authApi';

export default function RegisterPage() {
  const router = useRouter();
  const auth = useAuth();

  return (
    <main className="min-h-screen p-6">
      <AuthForm
        title="Register"
        submitLabel="Create account"
        onSubmit={async (values) => {
          const result = await register(values);
          auth.login(result.token);
          router.push('/patients');
        }}
      />
      <p className="mt-4 text-center text-sm">
        Already have an account? <Link className="text-brand-600" href="/login">Login</Link>
      </p>
    </main>
  );
}
