import { vi } from 'vitest';

/** Replaces window.matchMedia; only the given queries report `matches: true`. */
export function mockMatchMedia(matching: readonly string[] = []): void {
  vi.stubGlobal('matchMedia', (query: string): MediaQueryList => ({
    matches: matching.includes(query),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    // MediaQueryList still requires these deprecated members for type-checking.
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    addListener: vi.fn(),
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  }));
}
