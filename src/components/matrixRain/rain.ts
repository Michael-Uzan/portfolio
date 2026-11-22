/** One falling stream of digits. `y` is measured in rows (multiples of the font size). */
export interface RainColumn {
  y: number;
  /** Rows advanced per frame. */
  speed: number;
}

export interface RainState {
  columns: RainColumn[];
  /** Rows that fit the canvas height. */
  rows: number;
}

type Random = () => number;

interface CreateRainOptions {
  width: number;
  height: number;
  fontSize: number;
  random?: Random;
}

/** Lays out one column per font-size slot, each starting at a random row with a random speed. */
export function createRain({
  width,
  height,
  fontSize,
  random = Math.random,
}: CreateRainOptions): RainState {
  const rows = Math.ceil(height / fontSize);
  const columns = Array.from({ length: Math.ceil(width / fontSize) }, () => ({
    y: random() * rows,
    speed: 0.5 + random() * 0.5,
  }));
  return { columns, rows };
}

interface StepRainOptions {
  /** Chance per frame that a column past the bottom restarts at the top. */
  resetChance: number;
  random?: Random;
}

/** Advances every column one frame; columns past the bottom restart at random so they stay staggered. */
export function stepRain(
  { columns, rows }: RainState,
  { resetChance, random = Math.random }: StepRainOptions,
): RainState {
  return {
    rows,
    columns: columns.map((column) =>
      column.y > rows && random() < resetChance
        ? { ...column, y: 0 }
        : { ...column, y: column.y + column.speed },
    ),
  };
}

export function randomDigit(random: Random = Math.random): string {
  return String(Math.floor(random() * 10));
}
