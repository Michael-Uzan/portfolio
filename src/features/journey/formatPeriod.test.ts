import { describe, expect, it } from 'vitest';
import { formatPeriod } from './formatPeriod';

describe('formatPeriod', () => {
  it('shows a single year when there is no end year', () => {
    expect(formatPeriod({ year: 2021 })).toBe('2021');
  });

  it('shows a single year when start and end match', () => {
    expect(formatPeriod({ year: 2021, endYear: 2021 })).toBe('2021');
  });

  it('shows a range', () => {
    expect(formatPeriod({ year: 2016, endYear: 2019 })).toBe('2016 – 2019');
  });

  it('shows an open range for current roles', () => {
    expect(formatPeriod({ year: 2025, endYear: 'present' })).toBe('2025 – Present');
  });
});
