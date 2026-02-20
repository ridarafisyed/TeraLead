import { z } from 'zod';

export const listMessagesSchema = z.object({
  body: z.object({}).optional().default({}),
  query: z.object({
    limit: z.coerce.number().int().min(1).max(200).default(50)
  }),
  params: z.object({
    id: z.string().uuid()
  })
});

export const createChatSchema = z.object({
  body: z.object({
    patientId: z.string().uuid(),
    message: z.string().min(1).max(5000)
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({})
});
