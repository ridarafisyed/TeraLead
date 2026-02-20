import { z } from 'zod';

const email = z.string().email().toLowerCase();
const password = z.string().min(8).max(72);

export const authSchema = z.object({
  body: z.object({
    email,
    password
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({})
});
