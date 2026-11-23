import type { Random, Range } from '@/types/random.types';

/** Float in [min, max]. */
export function between([min, max]: Range, random: Random): number {
  return min + random() * (max - min);
}

/** Integer in [min, max] (inclusive). */
export function intBetween([min, max]: Range, random: Random): number {
  return Math.min(max, min + Math.floor(random() * (max - min + 1)));
}

/** Single digit character 0-9. */
export function randomDigit(random: Random = Math.random): string {
  return String(Math.floor(random() * 10));
}
