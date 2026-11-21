/**
 * Which station the drawn line has reached. Every path segment has the same length,
 * so station i sits at progress i / (count - 1).
 */
export function activeStationIndex(progress: number, count: number): number {
  if (count <= 1) return 0;
  const clamped = Math.min(1, Math.max(0, progress));
  // Small epsilon so float error at exact station boundaries never rounds down.
  return Math.min(count - 1, Math.floor(clamped * (count - 1) + 1e-6));
}
