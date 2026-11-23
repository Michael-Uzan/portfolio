import { describe, expect, it } from 'vitest';
import { between, intBetween, randomDigit } from './random.utils';

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

describe('randomDigit', () => {
  it.each([
    [0, '0'],
    [0.55, '5'],
    [0.999, '9'],
  ])('random %d → digit %s', (value, digit) => {
    expect(randomDigit(always(value))).toBe(digit);
  });
});
