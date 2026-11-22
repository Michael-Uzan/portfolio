import type { JourneyStation } from '@/types/journey';

export function formatPeriod({ year, endYear }: Pick<JourneyStation, 'year' | 'endYear'>): string {
  if (endYear === undefined || endYear === year) return String(year);
  return `${year} – ${endYear === 'present' ? 'Present' : endYear}`;
}
