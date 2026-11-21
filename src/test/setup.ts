import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { REDUCED_MOTION_QUERY } from '@/consts/breakpoints';
import { mockMatchMedia } from './matchMedia';

// GSAP's ScrollTrigger calls matchMedia when it registers at import time, before any beforeEach runs.
mockMatchMedia([REDUCED_MOTION_QUERY]);

// Default: reduced motion on, desktop off → static layout, no GSAP in jsdom.
// jsdom has no scrollTo; React Router's ScrollRestoration calls it.
beforeEach(() => {
  mockMatchMedia([REDUCED_MOTION_QUERY]);
  vi.stubGlobal('scrollTo', vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
