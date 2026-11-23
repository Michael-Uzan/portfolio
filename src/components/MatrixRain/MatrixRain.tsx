import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { startRain } from './startRain';

/** Falling-digits canvas behind a section. Pauses when hidden or off-screen; static under reduced motion. */
export const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      return;
    }

    return startRain(canvas, ctx, reducedMotion);
  }, [reducedMotion]);

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black">
      <canvas ref={canvasRef} className="sticky top-0 block h-svh w-full" />
      <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/35 to-black/70" />
    </div>
  );
};
