import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DESKTOP_QUERY, REDUCED_MOTION_QUERY } from '@/consts/breakpoints';
import { mockMatchMedia } from '@/test/matchMedia';
import { useMediaQuery } from './useMediaQuery';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

describe('useMediaQuery', () => {
  it('is true when the query matches', () => {
    mockMatchMedia([DESKTOP_QUERY]);
    const { result } = renderHook(() => useMediaQuery(DESKTOP_QUERY));
    expect(result.current).toBe(true);
  });

  it('is false when the query does not match', () => {
    mockMatchMedia([]);
    const { result } = renderHook(() => useMediaQuery(DESKTOP_QUERY));
    expect(result.current).toBe(false);
  });
});

describe('usePrefersReducedMotion', () => {
  it('reads the reduced-motion media query', () => {
    mockMatchMedia([REDUCED_MOTION_QUERY]);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });
});
