/** Source of floats in [0, 1) — `Math.random` or a seeded stand-in for tests. */
export type Random = () => number;
/** Inclusive `[min, max]` pair. */
export type Range = readonly [number, number];
