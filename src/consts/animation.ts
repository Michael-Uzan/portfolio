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

/** Digital-rain background behind the journey. Ranges are [min, max]. */
export const MATRIX_RAIN = {
  /** Frame cap — the effect reads as smooth at 30 fps and halves the work of 60. */
  fps: 30,
  /** Alpha of the black wash drawn each frame; lower = longer trails. */
  fadeAlpha: 0.05,
  /** Chance per frame that a column past the bottom restarts at the top. */
  resetChance: 0.06,
  /** Frames pre-drawn into the single static frame shown under reduced motion. */
  staticFrames: 90,
  headColor: '#ecfccb',
  trailColor: '#4ade80',
  /** Depth layers: far columns are small, slow and dim; near ones big, fast and bright. Speed is rows per frame. */
  depths: {
    far: { fontSize: 10, speed: [0.3, 0.5], alpha: [0.35, 0.6] },
    mid: { fontSize: 16, speed: [0.5, 0.8], alpha: [0.6, 0.9] },
    near: { fontSize: 28, speed: [0.8, 1.1], alpha: [0.8, 1] },
  },
  /** Columns per cluster for each depth, and the gap after each cluster (in mid-size columns). */
  cluster: { far: [2, 4], mid: [2, 4], near: [0, 1], gap: [0, 1] },
} as const;
