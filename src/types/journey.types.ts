import type { z } from 'zod';
import type { journeyStationSchema, stationKindSchema } from '@/content/journey.schemas';

export type StationKind = z.infer<typeof stationKindSchema>;
export type JourneyStation = z.infer<typeof journeyStationSchema>;
