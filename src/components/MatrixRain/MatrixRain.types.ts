import type { MATRIX_RAIN } from '@/config/matrixRain.config';
import type { Random } from '@/types/random.types';

export type RainDepth = keyof typeof MATRIX_RAIN.depths;

/** One falling stream of digits. `y` is measured in rows of this column's own font size. */
export interface RainColumn {
  x: number;
  depth: RainDepth;
  fontSize: number;
  y: number;
  /** Rows advanced per frame. */
  speed: number;
  /** Opacity of the whole column (0-1). */
  alpha: number;
}

export interface RainState {
  /** Drawn in order: far columns first so nearer ones paint on top. */
  columns: RainColumn[];
  /** Canvas height in px — each column converts it to its own row count. */
  height: number;
}

export interface LayoutColumn {
  x: number;
  depth: RainDepth;
}

export interface CreateRainOptions {
  width: number;
  height: number;
  random?: Random;
}

export interface StepRainOptions {
  /** Chance per frame that a column past the bottom restarts at the top. */
  resetChance: number;
  random?: Random;
}

export interface CanvasSize {
  width: number;
  height: number;
}
