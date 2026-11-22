import { describe, expect, it } from 'vitest';
import { MATRIX_RAIN } from '@/consts/animation';
import type { RainDepth } from '@/types/matrixRain';
import { buildCluster, createRain, layoutColumns, randomDigit, stepRain } from './rain';

const { depths, cluster } = MATRIX_RAIN;

/** Deterministic random source that cycles through the given values. */
function sequence(...values: number[]): () => number {
  let i = 0;
  return () => {
    const value = values[i % values.length] ?? 0;
    i += 1;
    return value;
  };
}

/** Small seeded PRNG (mulberry32) for property checks over many layouts. */
function seeded(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEEDS = Array.from({ length: 25 }, (_, i) => i + 1);
const count = (list: RainDepth[], depth: RainDepth) => list.filter((d) => d === depth).length;

describe('buildCluster', () => {
  it.each(SEEDS)('keeps each depth count within its range (seed %d)', (seed) => {
    const group = buildCluster(seeded(seed));
    expect(count(group, 'far')).toBeGreaterThanOrEqual(cluster.far[0]);
    expect(count(group, 'far')).toBeLessThanOrEqual(cluster.far[1]);
    expect(count(group, 'mid')).toBeGreaterThanOrEqual(cluster.mid[0]);
    expect(count(group, 'mid')).toBeLessThanOrEqual(cluster.mid[1]);
    expect(count(group, 'near')).toBeLessThanOrEqual(cluster.near[1]);
  });

  it('uses the low end of every range when random is 0', () => {
    expect(buildCluster(sequence(0)).sort()).toEqual(['far', 'mid']);
  });

  it('uses the high end of every range when random is just below 1', () => {
    const group = buildCluster(sequence(0.999));
    expect([count(group, 'far'), count(group, 'mid'), count(group, 'near')]).toEqual([3, 3, 1]);
  });
});

describe('layoutColumns', () => {
  it.each(SEEDS)(
    'places columns left to right without overlap, inside the width (seed %d)',
    (seed) => {
      const columns = layoutColumns(1280, seeded(seed));
      columns.forEach((column, i) => {
        expect(column.x).toBeLessThan(1280);
        const previous = columns[i - 1];
        if (previous)
          expect(column.x).toBeGreaterThanOrEqual(previous.x + depths[previous.depth].fontSize);
      });
    },
  );

  it.each(SEEDS)('leaves gaps between clusters and mixes all three sizes (seed %d)', (seed) => {
    const columns = layoutColumns(1280, seeded(seed));
    const gaps = columns.filter((column, i) => {
      const previous = columns[i - 1];
      return (
        previous !== undefined && column.x - (previous.x + depths[previous.depth].fontSize) > 0
      );
    });
    expect(gaps.length).toBeGreaterThan(5);
    expect(new Set(columns.map((column) => column.depth))).toEqual(new Set(['far', 'mid', 'near']));
  });
});

describe('createRain', () => {
  it.each(SEEDS)(
    'gives every column the size of its depth and speed/alpha inside its ranges (seed %d)',
    (seed) => {
      const { columns } = createRain({ width: 800, height: 600, random: seeded(seed) });
      for (const column of columns) {
        const preset = depths[column.depth];
        expect(column.fontSize).toBe(preset.fontSize);
        expect(column.speed).toBeGreaterThanOrEqual(preset.speed[0]);
        expect(column.speed).toBeLessThanOrEqual(preset.speed[1]);
        expect(column.alpha).toBeGreaterThanOrEqual(preset.alpha[0]);
        expect(column.alpha).toBeLessThanOrEqual(preset.alpha[1]);
      }
    },
  );

  it('varies opacity between columns of the same depth', () => {
    const { columns } = createRain({ width: 1280, height: 600, random: seeded(7) });
    const midAlphas = new Set(columns.filter((c) => c.depth === 'mid').map((c) => c.alpha));
    expect(midAlphas.size).toBeGreaterThan(3);
  });

  it('orders columns far → mid → near so nearer digits paint on top', () => {
    const { columns } = createRain({ width: 1280, height: 600, random: seeded(3) });
    const order: Record<RainDepth, number> = { far: 0, mid: 1, near: 2 };
    const ranks = columns.map((column) => order[column.depth]);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });
});

describe('stepRain', () => {
  const column = { x: 0, depth: 'mid' as const, fontSize: 10, alpha: 1 };

  it('moves every column down by its speed', () => {
    const next = stepRain(
      { height: 100, columns: [{ ...column, y: 1, speed: 0.5 }] },
      { resetChance: 0.1, random: sequence(0.5) },
    );
    expect(next.columns[0]?.y).toBe(1.5);
  });

  it('restarts a column past the bottom (in its own rows) when the reset roll hits', () => {
    const next = stepRain(
      { height: 100, columns: [{ ...column, y: 11, speed: 1 }] },
      { resetChance: 0.1, random: sequence(0.05) },
    );
    expect(next.columns[0]?.y).toBe(0);
  });

  it('keeps falling past the bottom when the reset roll misses', () => {
    const next = stepRain(
      { height: 100, columns: [{ ...column, y: 11, speed: 1 }] },
      { resetChance: 0.1, random: sequence(0.5) },
    );
    expect(next.columns[0]?.y).toBe(12);
  });
});

describe('randomDigit', () => {
  it.each([
    [0, '0'],
    [0.55, '5'],
    [0.999, '9'],
  ])('random %d → digit %s', (value, digit) => {
    expect(randomDigit(sequence(value))).toBe(digit);
  });
});
