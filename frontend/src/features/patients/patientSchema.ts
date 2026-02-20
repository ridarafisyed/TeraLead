import { z } from 'zod';

export const patientFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email(),
  phone: z.string().min(7),
  dob: z.string().min(1),
  medicalNotes: z.string().optional()
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;
