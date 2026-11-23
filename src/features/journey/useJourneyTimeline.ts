import { useGSAP } from '@gsap/react';
import { useCallback, useRef } from 'react';
import { activeStationIndex } from './activeStationIndex';
import type { JourneyTimelineOptions, ScrollBounds } from './useJourneyTimeline.types';
import { createJourneyTimeline, stationScrollTop } from './useJourneyTimeline.utils';

/**
 * Links path drawing, horizontal pan and the active station to scroll position.
 * Returns scrollToStation(index): true if it scrolled (timeline live), false if the caller should select directly.
 */
export function useJourneyTimeline({
  sectionRef,
  sceneRef,
  drawnPathRef,
  geometry,
  pinned,
  animate,
  onActiveIndexChange,
}: JourneyTimelineOptions): (index: number) => boolean {
  const lastIndexRef = useRef(0);
  const boundsRef = useRef<ScrollBounds | null>(null);
  const stationCount = geometry.points.length;

  useGSAP(
    () => {
      boundsRef.current = null;
      lastIndexRef.current = -1;
      const section = sectionRef.current;
      const scene = sceneRef.current;
      const path = drawnPathRef.current;
      if (!animate || !section || !scene || !path) {
        return;
      }

      const reportProgress = (progress: number) => {
        const index = activeStationIndex(progress, stationCount);
        if (index === lastIndexRef.current) {
          return;
        }
        lastIndexRef.current = index;
        onActiveIndexChange(index);
      };

      const timeline = createJourneyTimeline({
        section,
        scene,
        path,
        geometry,
        pinned,
        onProgress: reportProgress,
      });
      boundsRef.current = timeline.scrollTrigger ?? null;
    },
    {
      scope: sectionRef,
      dependencies: [geometry, pinned, animate, onActiveIndexChange],
      revertOnUpdate: true,
    },
  );

  return useCallback(
    (index: number) => {
      const bounds = boundsRef.current;
      if (!pinned || !bounds || stationCount < 2) {
        lastIndexRef.current = index;

        return false;
      }
      window.scrollTo({ top: stationScrollTop(bounds, index, stationCount), behavior: 'smooth' });

      return true;
    },
    [pinned, stationCount],
  );
}
