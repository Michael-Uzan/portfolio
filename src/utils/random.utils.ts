import type { Random, Range } from '@/types/random.types';

/** Float in [min, max]. */
export function between([min, max]: Range, random: Random): number {
  return min + random() * (max - min);
}

/** Integer in [min, max] (inclusive). */
export function intBetween([min, max]: Range, random: Random): number {
  return Math.min(max, min + Math.floor(random() * (max - min + 1)));
}

/** Random item from a non-empty list of glyphs (pre-split so multi-byte characters stay whole). */
export function randomGlyph(glyphs: readonly string[], random: Random = Math.random): string {
  return glyphs[Math.floor(random() * glyphs.length)] ?? '';
}
