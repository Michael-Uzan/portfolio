/** Minimum horizontal gap between stations on the pinned desktop route (px). */
export const MIN_STATION_SPACING_X = 260;
/** Vertical gap between stations on the stacked mobile / reduced-motion route (px). */
export const STATION_SPACING_Y = 240;
/** Vertical route never gets wider than this, even on wide screens (px). */
export const VERTICAL_PATH_MAX_WIDTH = 560;
/** How far each loop bulges, as a share of the cross-axis size. */
export const PATH_BULGE_RATIO = 0.28;
/** Where the horizontal route sits, as a share of viewport height. */
export const HORIZONTAL_PATH_Y_RATIO = 0.6;
/** Pinned scroll length per station, in viewport heights. */
export const JOURNEY_VIEWPORTS_PER_STATION = 1;
/** ScrollTrigger scrub smoothing (seconds). */
export const JOURNEY_SCRUB_SECONDS = 1;

/** Digital-rain background behind the journey. */
export const MATRIX_RAIN = {
  /** Glyph size and column width (px). */
  fontSize: 18,
  /** Frame cap — the effect reads as smooth at 30 fps and halves the work of 60. */
  fps: 30,
  /** Alpha of the black wash drawn each frame; lower = longer trails. */
  fadeAlpha: 0.08,
  /** Chance per frame that a column past the bottom restarts at the top. */
  resetChance: 0.025,
  headColor: '#ecfccb',
  trailColor: '#4ade80',
} as const;
