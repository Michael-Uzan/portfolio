import { describe, expect, it } from 'vitest';
import { between, intBetween, randomGlyph } from './random.utils';

function always(value: number): () => number {
  return () => value;
}

describe('between', () => {
  it.each([
    [0, 2],
    [0.5, 3],
    [1, 4],
  ])('random %d → %d in [2, 4]', (value, expected) => {
    expect(between([2, 4], always(value))).toBe(expected);
  });
});

describe('intBetween', () => {
  it.each([
    [0, 2],
    [0.5, 3],
    [0.999, 4],
    [1, 4],
  ])('random %d → %d in [2, 4] inclusive', (value, expected) => {
    expect(intBetween([2, 4], always(value))).toBe(expected);
  });
});

describe('randomGlyph', () => {
  const glyphs = ['0', 'ｱ', '#'];

  it.each([
    [0, '0'],
    [0.5, 'ｱ'],
    [0.999, '#'],
  ])('random %d → %s', (value, glyph) => {
    expect(randomGlyph(glyphs, always(value))).toBe(glyph);
  });

  it('only returns glyphs from the set', () => {
    for (let i = 0; i < 200; i++) {
      expect(glyphs).toContain(randomGlyph(glyphs));
    }
  });
});
