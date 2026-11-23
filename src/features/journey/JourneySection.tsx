import { useMemo, useRef, useState } from 'react';
import { MatrixRain } from '@/components/MatrixRain';
import { DESKTOP_QUERY } from '@/config/breakpoints.config';
import { journey } from '@/content/journey';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useWindowSize } from '@/hooks/useWindowSize';
import { cn } from '@/lib/utils';
import type { PathLayout } from '@/types/journey';
import { buildPath } from './buildPath';
import { JourneyPath } from './JourneyPath';
import { Station } from './Station';
import { StationCard } from './StationCard';
import { useJourneyTimeline } from './useJourneyTimeline';

export function JourneySection() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const reducedMotion = usePrefersReducedMotion();
  const { width, height } = useWindowSize();
  const [activeIndex, setActiveIndex] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const drawnPathRef = useRef<SVGPathElement>(null);

  const pinned = isDesktop && !reducedMotion;
  const layout: PathLayout = pinned ? 'horizontal' : 'vertical';
  // The vertical layout ignores viewport height; pinning it to 0 avoids rebuilds when
  // mobile browsers resize the viewport as the address bar hides.
  const pathHeight = pinned ? height : 0;
  const geometry = useMemo(
    () =>
      buildPath({
        count: journey.length,
        viewportWidth: width,
        viewportHeight: pathHeight,
        layout,
      }),
    [width, pathHeight, layout],
  );
  const activeStation = journey[activeIndex];

  const scrollToStation = useJourneyTimeline({
    sectionRef,
    sceneRef,
    drawnPathRef,
    geometry,
    pinned,
    animate: !reducedMotion,
    onActiveIndexChange: setActiveIndex,
  });

  return (
    <section
      ref={sectionRef}
      aria-labelledby="journey-title"
      className={cn('relative isolate overflow-clip text-white', pinned ? 'h-svh' : 'pb-32')}
    >
      <MatrixRain />

      <h1
        id="journey-title"
        className={cn(
          'z-10 px-4 text-center font-display leading-none text-amber-50 uppercase',
          pinned ? 'absolute inset-x-0 top-20' : 'pt-28',
        )}
      >
        <span className="text-3xl md:text-5xl">The</span>{' '}
        <span className="text-6xl md:text-9xl">Evolution</span>{' '}
        <span className="text-3xl md:text-5xl">Of</span>{' '}
        <span className="text-6xl md:text-9xl">Me</span>
      </h1>

      <div
        ref={sceneRef}
        className={pinned ? 'absolute inset-y-0 left-0' : 'relative mx-auto mt-8'}
        style={{ width: geometry.width, height: geometry.height }}
      >
        <JourneyPath geometry={geometry} drawnPathRef={drawnPathRef} />
        {/* Explicit role: Tailwind's list reset makes Safari/VoiceOver drop list semantics. */}
        {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
        <ol role="list" aria-label="Career milestones">
          {journey.map((station, index) => {
            const point = geometry.points[index];
            if (!point) return null;
            return (
              <Station
                key={station.id}
                station={station}
                point={point}
                isActive={index === activeIndex}
                isReached={reducedMotion || index <= activeIndex}
                onSelect={() => {
                  if (!scrollToStation(index)) setActiveIndex(index);
                }}
              />
            );
          })}
        </ol>
      </div>

      {activeStation ? (
        <StationCard
          station={activeStation}
          className={pinned ? 'absolute right-8 bottom-8' : 'sticky bottom-4 mx-4'}
        />
      ) : null}
    </section>
  );
}
