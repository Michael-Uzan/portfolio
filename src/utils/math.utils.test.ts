import { describe, expect, it } from 'vitest';
import { clamp, round } from './math.utils';

describe('round', () => {
  it.each([
    [1.26, 1, 1.3],
    [1.24, 1, 1.2],
    [1.5, 0, 2],
    [-1.26, 1, -1.3],
  ])('round(%d, %d) → %d', (value, decimals, expected) => {
    expect(round(value, decimals)).toBe(expected);
  });
});

describe('clamp', () => {
  it.each([
    [5, 0, 10, 5],
    [-1, 0, 10, 0],
    [11, 0, 10, 10],
  ])('clamp(%d, %d, %d) → %d', (value, min, max, expected) => {
    expect(clamp(value, min, max)).toBe(expected);
  });
});
