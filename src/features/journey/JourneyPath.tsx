import type { Ref } from 'react';
import type { JourneyGeometry } from './journeyLayout.types';

interface JourneyPathProps {
  geometry: JourneyGeometry;
  /** The solid line GSAP draws; the dashed line underneath shows the route ahead. */
  drawnPathRef: Ref<SVGPathElement>;
}

export function JourneyPath({ geometry, drawnPathRef }: JourneyPathProps) {
  const { d, width, height } = geometry;
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-visible"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
    >
      <path d={d} className="stroke-white/30" strokeWidth={1.5} strokeDasharray="6 10" />
      <path
        ref={drawnPathRef}
        d={d}
        className="stroke-lime-200"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}
