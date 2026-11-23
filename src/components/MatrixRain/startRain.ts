import { MATRIX_RAIN } from '@/config/matrixRain.config';
import type { RainState } from './MatrixRain.types';
import { createRain, stepRain } from './rain';
import { drawFrame, resizeCanvas } from './rain.utils';

const { fps, resetChance, staticFrames } = MATRIX_RAIN;
const FRAME_MS = 1000 / fps;

/**
 * Runs the rain on a canvas: redraws on resize, pauses when hidden or off-screen,
 * and under reduced motion paints one pre-filled static frame. Returns a cleanup function.
 */
export function startRain(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  reducedMotion: boolean,
): () => void {
  let rain: RainState = { columns: [], height: 0 };
  let width = 0;
  let onScreen = true;
  let lastFrame = 0;
  let frameId = 0;

  function step() {
    drawFrame(ctx, rain, width);
    rain = stepRain(rain, { resetChance });
  }

  function resize() {
    const size = resizeCanvas(canvas, ctx);
    width = size.width;
    rain = createRain(size);
    // Reduced motion: fast-forward to a filled screen once instead of animating.
    if (reducedMotion) {
      for (let i = 0; i < staticFrames; i++) {
        step();
      }
    }
  }

  function tick(time: number) {
    frameId = requestAnimationFrame(tick);
    if (!onScreen || document.hidden || time - lastFrame < FRAME_MS) {
      return;
    }
    lastFrame = time;
    step();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    onScreen = entry?.isIntersecting ?? true;
  });
  visibilityObserver.observe(canvas);
  resize();
  if (!reducedMotion) {
    frameId = requestAnimationFrame(tick);
  }

  return () => {
    cancelAnimationFrame(frameId);
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
  };
}
