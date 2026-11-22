import { useEffect, useRef } from 'react';
import { MATRIX_RAIN } from '@/consts/animation';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { RainState } from '@/types/matrixRain';
import { createRain, randomDigit, stepRain } from './matrixRain/rain';

const { fps, fadeAlpha, resetChance, staticFrames, headColor, trailColor } = MATRIX_RAIN;
const FRAME_MS = 1000 / fps;
const FONT_FAMILY = 'ui-monospace, SFMono-Regular, Menlo, monospace';

function drawFrame(ctx: CanvasRenderingContext2D, rain: RainState, width: number) {
  ctx.globalAlpha = 1;
  ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
  ctx.fillRect(0, 0, width, rain.height);
  let font = 0;
  for (const column of rain.columns) {
    // Columns are sorted by depth, so the font only changes a few times per frame.
    if (column.fontSize !== font) {
      font = column.fontSize;
      ctx.font = `${font}px ${FONT_FAMILY}`;
    }
    const y = Math.floor(column.y) * column.fontSize;
    ctx.globalAlpha = column.alpha;
    // Recolour the previous head green so only the leading digit stays bright.
    ctx.fillStyle = trailColor;
    ctx.fillText(randomDigit(), column.x, y - column.fontSize);
    ctx.fillStyle = headColor;
    ctx.fillText(randomDigit(), column.x, y);
  }
}

/** Falling-digits canvas behind a section. Pauses when hidden or off-screen; static under reduced motion. */
export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let rain: RainState = { columns: [], height: 0 };
    let width = 0;
    let height = 0;
    let onScreen = true;
    let lastFrame = 0;
    let frameId = 0;

    const step = () => {
      drawFrame(ctx, rain, width);
      rain = stepRain(rain, { resetChance });
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.textBaseline = 'top';
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);
      rain = createRain({ width, height });
      // Reduced motion: fast-forward to a filled screen once instead of animating.
      if (reducedMotion) for (let i = 0; i < staticFrames; i++) step();
    };

    const tick = (time: number) => {
      frameId = requestAnimationFrame(tick);
      if (!onScreen || document.hidden || time - lastFrame < FRAME_MS) return;
      lastFrame = time;
      step();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? true;
    });
    visibilityObserver.observe(canvas);
    resize();
    if (!reducedMotion) frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, [reducedMotion]);

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black">
      <canvas ref={canvasRef} className="sticky top-0 block h-svh w-full" />
      <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/45 to-black/80" />
    </div>
  );
}
