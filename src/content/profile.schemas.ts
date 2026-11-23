import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(1),
  headline: z.string().min(1),
  summary: z.string().min(1),
});
