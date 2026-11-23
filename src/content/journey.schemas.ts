import { z } from 'zod';

export const stationKindSchema = z.enum(['degree', 'role', 'project']);

export const journeyStationSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'id must be kebab-case'),
  year: z.number().int().min(1990).max(2100),
  endYear: z.union([z.number().int(), z.literal('present')]).optional(),
  kind: stationKindSchema,
  title: z.string().min(1),
  org: z.string().min(1),
  summary: z.string().min(1),
  link: z.url().optional(),
});

export const journeySchema = z
  .array(journeyStationSchema)
  .min(1)
  .refine((stations) => new Set(stations.map((s) => s.id)).size === stations.length, {
    message: 'Station ids must be unique',
  })
  .refine(
    (stations) =>
      stations.every((s, index) => index === 0 || s.year >= (stations[index - 1]?.year ?? s.year)),
    { message: 'Stations must be ordered oldest first' },
  );
