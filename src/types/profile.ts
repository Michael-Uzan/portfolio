import type { z } from 'zod';
import type { profileSchema } from '@/content/schemas';

export type Profile = z.infer<typeof profileSchema>;
