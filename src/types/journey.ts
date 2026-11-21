import type { z } from 'zod';
import type { journeyStationSchema, stationKindSchema } from '@/content/schemas';

export type StationKind = z.infer<typeof stationKindSchema>;
export type JourneyStation = z.infer<typeof journeyStationSchema>;

export interface PathPoint {
  x: number;
  y: number;
}

export type PathLayout = 'horizontal' | 'vertical';

export interface JourneyGeometry {
  /** SVG path `d` attribute through every station. */
  d: string;
  /** Station positions, same order as the journey data. */
  points: PathPoint[];
  /** Size of the SVG canvas (px). */
  width: number;
  height: number;
}
