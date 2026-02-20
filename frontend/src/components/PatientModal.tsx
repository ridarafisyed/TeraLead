'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { patientFormSchema, type PatientFormValues } from '@/features/patients/patientSchema';

type Props = {
  initialValues?: Partial<PatientFormValues>;
  onClose: () => void;
  onSubmit: (values: PatientFormValues) => Promise<void>;
  title: string;
};

export function PatientModal({ initialValues, onClose, onSubmit, title }: Props) {
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      email: initialValues?.email ?? '',
      phone: initialValues?.phone ?? '',
      dob: initialValues?.dob ? initialValues.dob.slice(0, 10) : '',
      medicalNotes: initialValues?.medicalNotes ?? ''
    }
  });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6">
        <h2 className="text-xl font-semibold">{title}</h2>
        <form
          className="mt-4 space-y-3"
          onSubmit={form.handleSubmit(async (values) => {
            await onSubmit(values);
            onClose();
          })}
        >
          <input className="w-full rounded border px-3 py-2" placeholder="Name" {...form.register('name')} />
          <p className="text-xs text-red-600">{form.formState.errors.name?.message}</p>
          <input className="w-full rounded border px-3 py-2" placeholder="Email" {...form.register('email')} />
          <p className="text-xs text-red-600">{form.formState.errors.email?.message}</p>
          <input className="w-full rounded border px-3 py-2" placeholder="Phone" {...form.register('phone')} />
          <p className="text-xs text-red-600">{form.formState.errors.phone?.message}</p>
          <input className="w-full rounded border px-3 py-2" type="date" {...form.register('dob')} />
          <p className="text-xs text-red-600">{form.formState.errors.dob?.message}</p>
          <textarea className="w-full rounded border px-3 py-2" rows={3} placeholder="Medical notes" {...form.register('medicalNotes')} />
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded border px-4 py-2" onClick={onClose}>Cancel</button>
            <button type="submit" className="rounded bg-brand-500 px-4 py-2 text-white">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
