import { z } from 'zod';

const patientInput = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  dob: z.coerce.date(),
  medicalNotes: z.string().max(5000).optional().nullable()
});

export const listPatientsSchema = z.object({
  body: z.object({}).optional().default({}),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10)
  }),
  params: z.object({}).optional().default({})
});

export const patientIdSchema = z.object({
  body: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
  params: z.object({
    id: z.string().uuid()
  })
});

export const createPatientSchema = z.object({
  body: patientInput,
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({})
});

export const updatePatientSchema = z.object({
  body: patientInput.partial().refine((val) => Object.keys(val).length > 0, {
    message: 'At least one field is required'
  }),
  query: z.object({}).optional().default({}),
  params: z.object({
    id: z.string().uuid()
  })
});
