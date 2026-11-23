import { MATRIX_RAIN } from '@/config/matrixRain.config';
import type { Random } from '@/types/random.types';
import { between, intBetween } from '@/utils/random.utils';
import type {
  CreateRainOptions,
  LayoutColumn,
  RainColumn,
  RainDepth,
  RainState,
  StepRainOptions,
} from './MatrixRain.types';

const { depths, cluster } = MATRIX_RAIN;
const DEPTH_ORDER: Record<RainDepth, number> = { far: 0, mid: 1, near: 2 };

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
export function layoutColumns(width: number, random: Random = Math.random): LayoutColumn[] {
  const columns: LayoutColumn[] = [];
  let x = 0;
  while (x < width) {
    for (const depth of buildCluster(random)) {
      if (x >= width) {
        break;
      }
      columns.push({ x, depth });
      x += depths[depth].fontSize;
    }
    x += intBetween(cluster.gap, random) * depths.mid.fontSize;
  }

  return columns;
}

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
