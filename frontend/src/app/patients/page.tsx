'use client';

import Link from 'next/link';
import { useDeferredValue, useEffect, useMemo, useState, useTransition } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';
import { createPatient, deletePatient, listPatients, updatePatient } from '@/features/patients/patientApi';
import type { Patient } from '@/features/patients/types';
import { PatientModal } from '@/components/PatientModal';

export default function PatientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [creating, setCreating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const auth = useAuth();
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ['patients', page],
    queryFn: () => listPatients(page, 10),
    enabled: auth.isReady && auth.isAuthenticated
  });

  const createMutation = useMutation({
    mutationFn: createPatient,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] })
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updatePatient>[1] }) => updatePatient(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] })
  });

  const deleteMutation = useMutation({
    mutationFn: deletePatient,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] })
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!deferredSearch.trim()) return data.items;
    const q = deferredSearch.toLowerCase();
    return data.items.filter((p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
  }, [data, deferredSearch]);

  useEffect(() => {
    if (auth.isReady && !auth.isAuthenticated) {
      router.replace('/login');
    }
  }, [auth.isAuthenticated, auth.isReady, router]);

  if (!auth.isReady) {
    return null;
  }

  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Patients</h1>
        <div className="flex gap-2">
          <button className="rounded border px-4 py-2" onClick={() => auth.logout()}>Logout</button>
          <button className="rounded bg-brand-500 px-4 py-2 text-white" onClick={() => setCreating(true)}>New patient</button>
        </div>
      </div>
      <input
        className="mb-4 w-full rounded border px-3 py-2"
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {isLoading ? <p>Loading...</p> : null}
      {error ? <p className="text-red-600">{(error as Error).message}</p> : null}
      <div className="space-y-3">
        {filtered.map((patient) => (
          <div key={patient.id} className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
            <div>
              <Link href={`/patients/${patient.id}`} className="font-medium text-brand-600">{patient.name}</Link>
              <p className="text-sm text-slate-600">{patient.email} • {patient.phone}</p>
            </div>
            <div className="flex gap-2">
              <button className="rounded border px-3 py-1" onClick={() => setEditing(patient)}>Edit</button>
              <button className="rounded border border-red-300 px-3 py-1 text-red-700" onClick={() => deleteMutation.mutate(patient.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <button
          className="rounded border px-3 py-1 disabled:opacity-40"
          disabled={page === 1 || isPending}
          onClick={() => startTransition(() => setPage((p) => Math.max(1, p - 1)))}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          className="rounded border px-3 py-1 disabled:opacity-40"
          disabled={!data || page * data.limit >= data.total || isPending}
          onClick={() => startTransition(() => setPage((p) => p + 1))}
        >
          Next
        </button>
      </div>

      {creating ? (
        <PatientModal
          title="Create patient"
          onClose={() => setCreating(false)}
          onSubmit={async (values) => {
            await createMutation.mutateAsync(values);
          }}
        />
      ) : null}

      {editing ? (
        <PatientModal
          title="Edit patient"
          initialValues={{
            ...editing,
            dob: editing.dob,
            medicalNotes: editing.medicalNotes ?? ''
          }}
          onClose={() => setEditing(null)}
          onSubmit={async (values) => {
            await updateMutation.mutateAsync({ id: editing.id, payload: values });
          }}
        />
      ) : null}
    </main>
  );
}
