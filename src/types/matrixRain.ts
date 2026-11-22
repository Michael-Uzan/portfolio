import type { MATRIX_RAIN } from '@/consts/animation';

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
