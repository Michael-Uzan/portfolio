import {
  HORIZONTAL_PATH_Y_RATIO,
  MIN_STATION_SPACING_X,
  PATH_BULGE_RATIO,
  STATION_SPACING_Y,
  VERTICAL_PATH_MAX_WIDTH,
} from '@/consts/animation';
import type { JourneyGeometry, PathLayout, PathPoint } from '@/types/journey';

interface BuildPathOptions {
  count: number;
  viewportWidth: number;
  viewportHeight: number;
  layout: PathLayout;
}

interface Canvas {
  points: PathPoint[];
  width: number;
  height: number;
}

/** One decimal place keeps the `d` string short and stable across renders. */
const round = (value: number): number => Math.round(value * 10) / 10;

function horizontalCanvas(count: number, viewportWidth: number, viewportHeight: number): Canvas {
  const spacing = Math.max(MIN_STATION_SPACING_X, viewportWidth / count);
  const y = round(viewportHeight * HORIZONTAL_PATH_Y_RATIO);
  const points = Array.from({ length: count }, (_, i) => ({ x: round(spacing * (i + 0.5)), y }));
  return { points, width: round(spacing * count), height: viewportHeight };
}

function verticalCanvas(count: number, viewportWidth: number): Canvas {
  const width = Math.min(viewportWidth, VERTICAL_PATH_MAX_WIDTH);
  const x = round(width / 2);
  const points = Array.from({ length: count }, (_, i) => ({
    x,
    y: round(STATION_SPACING_Y * (i + 0.5)),
  }));
  return { points, width, height: STATION_SPACING_Y * count };
}

function curve(from: PathPoint, to: PathPoint, layout: PathLayout, offset: number): string {
  if (layout === 'horizontal') {
    return `C ${from.x} ${round(from.y + offset)}, ${to.x} ${round(to.y + offset)}, ${to.x} ${to.y}`;
  }
  return `C ${round(from.x + offset)} ${from.y}, ${round(to.x + offset)} ${to.y}, ${to.x} ${to.y}`;
}

/** Turns a station count and viewport size into a looping SVG route through every station. */
export function buildPath({
  count,
  viewportWidth,
  viewportHeight,
  layout,
}: BuildPathOptions): JourneyGeometry {
  if (count < 1) return { d: '', points: [], width: viewportWidth, height: viewportHeight };

  const { points, width, height } =
    layout === 'horizontal'
      ? horizontalCanvas(count, viewportWidth, viewportHeight)
      : verticalCanvas(count, viewportWidth);
  const bulge = round((layout === 'horizontal' ? height : width) * PATH_BULGE_RATIO);

  const commands = points.map((to, i) => {
    if (i === 0) return `M ${to.x} ${to.y}`;
    const from = points[i - 1] ?? to;
    const direction = i % 2 === 1 ? -1 : 1;
    return curve(from, to, layout, direction * bulge);
  });

  return { d: commands.join(' '), points, width, height };
}
