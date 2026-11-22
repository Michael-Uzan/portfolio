import { describe, expect, it } from 'vitest';
import { activeStationIndex } from './activeStationIndex';

describe('activeStationIndex', () => {
  it.each([
    [0, 5, 0],
    [0.24, 5, 0],
    [0.25, 5, 1],
    [0.5, 5, 2],
    [1, 5, 4],
    [-1, 5, 0],
    [2, 5, 4],
    [0.7, 1, 0],
  ])('progress %d with %d stations → station %d', (progress, count, expected) => {
    expect(activeStationIndex(progress, count)).toBe(expected);
  });
});
