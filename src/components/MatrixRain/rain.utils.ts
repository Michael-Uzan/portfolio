import { MATRIX_RAIN } from '@/config/matrixRain.config';
import { randomGlyph } from '@/utils/random.utils';
import type { CanvasSize, RainState } from './MatrixRain.types';

const { fadeAlpha, glyphs, headColor, headGlow, trailColor } = MATRIX_RAIN;
const FONT_FAMILY = 'ui-monospace, SFMono-Regular, Menlo, monospace';
/** Split once: drawing picks two glyphs per column every frame. */
const GLYPHS = Array.from(glyphs);

/** Fades the previous frame, then paints each column's glowing head glyph and recolours the one behind it. */
export function drawFrame(ctx: CanvasRenderingContext2D, rain: RainState, width: number): void {
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
  ctx.fillRect(0, 0, width, rain.height);
  ctx.shadowColor = headColor;
  let font = 0;
  for (const column of rain.columns) {
    // Columns are sorted by depth, so the font only changes a few times per frame.
    if (column.fontSize !== font) {
      font = column.fontSize;
      ctx.font = `${font}px ${FONT_FAMILY}`;
    }
    const y = Math.floor(column.y) * column.fontSize;
    ctx.globalAlpha = column.alpha;
    // Recolour the previous head green so only the leading glyph stays bright.
    ctx.shadowBlur = 0;
    ctx.fillStyle = trailColor;
    ctx.fillText(randomGlyph(GLYPHS), column.x, y - column.fontSize);
    ctx.shadowBlur = headGlow;
    ctx.fillStyle = headColor;
    ctx.fillText(randomGlyph(GLYPHS), column.x, y);
  }
  ctx.shadowBlur = 0;
}

/** Matches the backing store to the element size at device pixel ratio and paints it black. */
export function resizeCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): CanvasSize {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.textBaseline = 'top';
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);

  return { width, height };
}
