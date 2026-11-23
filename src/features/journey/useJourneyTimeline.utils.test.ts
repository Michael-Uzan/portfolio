import { describe, expect, it } from 'vitest';
import { stationScrollTop } from './useJourneyTimeline.utils';

describe('stationScrollTop', () => {
  const bounds = { start: 100, end: 1100 };

  it.each([
    [0, 101],
    [2, 601],
    [4, 1100],
    [-3, 101],
    [9, 1100],
  ])('station %d of 5 → scroll top %d', (index, expected) => {
    expect(stationScrollTop(bounds, index, 5)).toBe(expected);
  });

  it('rounds fractional positions up and stays one pixel inside the band', () => {
    expect(stationScrollTop({ start: 0, end: 100 }, 1, 4)).toBe(35);
  });
});
