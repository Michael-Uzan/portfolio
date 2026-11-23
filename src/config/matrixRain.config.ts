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
  /** Characters the rain picks from: digits, half-width Katakana and symbols. */
  glyphs: '0123456789ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ+-=*:<>[]{}|/\\#',
  /** The leading character of each column is white with a soft glow; the trail behind it is green. */
  headColor: '#ffffff',
  /** Blur radius (px) of the leading character's glow; 0 turns it off. */
  headGlow: 8,
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
