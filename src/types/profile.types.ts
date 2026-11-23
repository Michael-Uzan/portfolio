import type { z } from 'zod';
import type { profileSchema } from '@/content/profile.schemas';

export type Profile = z.infer<typeof profileSchema>;
