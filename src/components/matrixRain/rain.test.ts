import { describe, expect, it } from 'vitest';
import { createRain, randomDigit, stepRain } from './rain';

/** Deterministic random source that cycles through the given values. */
function sequence(...values: number[]): () => number {
  let i = 0;
  return () => {
    const value = values[i % values.length] ?? 0;
    i += 1;
    return value;
  };
}

describe('createRain', () => {
  it('creates one column per font-size slot across the width', () => {
    const rain = createRain({ width: 200, height: 100, fontSize: 20, random: sequence(0) });
    expect(rain.columns).toHaveLength(10);
    expect(rain.rows).toBe(5);
  });

  it('rounds partial columns and rows up so the edges are covered', () => {
    const rain = createRain({ width: 205, height: 101, fontSize: 20, random: sequence(0) });
    expect(rain.columns).toHaveLength(11);
    expect(rain.rows).toBe(6);
  });

  it('staggers starting rows and gives each column a speed between 0.5 and 1', () => {
    const rain = createRain({
      width: 40,
      height: 100,
      fontSize: 20,
      random: sequence(0.5, 0, 1, 1),
    });
    expect(rain.columns).toEqual([
      { y: 2.5, speed: 0.5 },
      { y: 5, speed: 1 },
    ]);
  });
});

describe('stepRain', () => {
  it('moves every column down by its speed', () => {
    const next = stepRain(
      {
        rows: 10,
        columns: [
          { y: 1, speed: 0.5 },
          { y: 3, speed: 1 },
        ],
      },
      { resetChance: 0.1, random: sequence(0.5) },
    );
    expect(next.columns.map((column) => column.y)).toEqual([1.5, 4]);
  });

  it('restarts a column at the top once it is past the bottom and the reset roll hits', () => {
    const next = stepRain(
      { rows: 10, columns: [{ y: 11, speed: 1 }] },
      { resetChance: 0.1, random: sequence(0.05) },
    );
    expect(next.columns[0]?.y).toBe(0);
  });

  it('keeps falling past the bottom when the reset roll misses, so columns stay staggered', () => {
    const next = stepRain(
      { rows: 10, columns: [{ y: 11, speed: 1 }] },
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
