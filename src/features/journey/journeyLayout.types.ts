export interface PathPoint {
  x: number;
  y: number;
}

export type PathLayout = 'horizontal' | 'vertical';

export interface JourneyGeometry {
  /** SVG path `d` attribute through every station. */
  d: string;
  /** Station positions, same order as the journey data. */
  points: PathPoint[];
  /** Size of the SVG canvas (px). */
  width: number;
  height: number;
}

export interface BuildPathOptions {
  count: number;
  viewportWidth: number;
  viewportHeight: number;
  layout: PathLayout;
}

/** Station positions plus the canvas they fit in, before the curve is drawn. */
export interface Canvas {
  points: PathPoint[];
  width: number;
  height: number;
}
