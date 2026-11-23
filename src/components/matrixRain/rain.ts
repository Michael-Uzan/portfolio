import { MATRIX_RAIN } from '@/config/matrixRain.config';
import type { RainColumn, RainDepth, RainState } from '@/types/matrixRain';

// Claude: move it to rain.types.ts
type Random = () => number;
type Range = readonly [number, number];

const { depths, cluster } = MATRIX_RAIN;
const DEPTH_ORDER: Record<RainDepth, number> = { far: 0, mid: 1, near: 2 };

//  Claude: is that a helper function? util function?
// lets move it to a general place or to a local Rainbow.utils.ts

/** Float in [min, max]. */
const between = ([min, max]: Range, random: Random) => min + random() * (max - min);
/** Integer in [min, max] (inclusive). */
const intBetween = ([min, max]: Range, random: Random) =>
  Math.min(max, min + Math.floor(random() * (max - min + 1)));

/** One group of columns, e.g. 2 far + 3 mid + 1 near, shuffled so every cluster looks different. */
export function buildCluster(random: Random = Math.random): RainDepth[] {
  const group: RainDepth[] = [
    ...Array<RainDepth>(intBetween(cluster.far, random)).fill('far'),
    ...Array<RainDepth>(intBetween(cluster.mid, random)).fill('mid'),
    ...Array<RainDepth>(intBetween(cluster.near, random)).fill('near'),
  ];
  for (let i = group.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [group[i], group[j]] = [group[j] ?? 'mid', group[i] ?? 'mid'];
  }
  return group;
}

/** Fills the width left to right with clusters, each followed by an empty gap. */
export function layoutColumns(
  width: number,
  random: Random = Math.random,
): { x: number; depth: RainDepth }[] {
  const columns: { x: number; depth: RainDepth }[] = [];
  let x = 0;
  while (x < width) {
    for (const depth of buildCluster(random)) {
      if (x >= width) break;
      columns.push({ x, depth });
      x += depths[depth].fontSize;
    }
    x += intBetween(cluster.gap, random) * depths.mid.fontSize;
  }
  return columns;
}

// Claude: no. this is on types file.
interface CreateRainOptions {
  width: number;
  height: number;
  random?: Random;
}

// CLaude: why not use arrow function?
/** Lays out clustered columns, each with its depth's size and a random start row, speed and opacity. */
export function createRain({ width, height, random = Math.random }: CreateRainOptions): RainState {
  const columns: RainColumn[] = layoutColumns(width, random).map(({ x, depth }) => {
    const preset = depths[depth];
    return {
      x,
      depth,
      fontSize: preset.fontSize,
      y: random() * (height / preset.fontSize),
      speed: between(preset.speed, random),
      alpha: between(preset.alpha, random),
    };
  });
  columns.sort((a, b) => DEPTH_ORDER[a.depth] - DEPTH_ORDER[b.depth]);
  return { columns, height };
}

interface StepRainOptions {
  /** Chance per frame that a column past the bottom restarts at the top. */
  resetChance: number;
  random?: Random;
}

/** Advances every column one frame; columns past the bottom restart at random so they stay staggered. */
export function stepRain(
  { columns, height }: RainState,
  { resetChance, random = Math.random }: StepRainOptions,
): RainState {
  return {
    height,
    columns: columns.map((column) =>
      column.y * column.fontSize > height && random() < resetChance
        ? { ...column, y: 0 }
        : { ...column, y: column.y + column.speed },
    ),
  };
}

// CLaude: it fills like utils, isnt it?
export function randomDigit(random: Random = Math.random): string {
  return String(Math.floor(random() * 10));
}
