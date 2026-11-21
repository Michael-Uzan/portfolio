import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCallback, useRef, type RefObject } from 'react';
import { JOURNEY_SCRUB_SECONDS, JOURNEY_VIEWPORTS_PER_STATION } from '@/consts/animation';
import type { JourneyGeometry } from '@/types/journey';
import { activeStationIndex } from './activeStationIndex';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface JourneyTimelineOptions {
  sectionRef: RefObject<HTMLElement | null>;
  sceneRef: RefObject<HTMLDivElement | null>;
  drawnPathRef: RefObject<SVGPathElement | null>;
  geometry: JourneyGeometry;
  pinned: boolean;
  animate: boolean;
  onActiveIndexChange: (index: number) => void;
}

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
  const triggerRef = useRef<{ start: number; end: number } | null>(null);

  useGSAP(
    () => {
      triggerRef.current = null;
      const section = sectionRef.current;
      const scene = sceneRef.current;
      const path = drawnPathRef.current;
      if (!animate || !section || !scene || !path) return;

      const count = geometry.points.length;
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: pinned
            ? () => `+=${count * JOURNEY_VIEWPORTS_PER_STATION * window.innerHeight}`
            : 'bottom bottom',
          pin: pinned,
          scrub: JOURNEY_SCRUB_SECONDS,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const index = activeStationIndex(self.progress, count);
            if (index === lastIndexRef.current) return;
            lastIndexRef.current = index;
            onActiveIndexChange(index);
          },
        },
      });
      triggerRef.current = timeline.scrollTrigger ?? null;

      timeline.to(path, { strokeDashoffset: 0, duration: 1 }, 0);
      if (pinned) {
        timeline.to(
          scene,
          { x: () => -Math.max(0, geometry.width - window.innerWidth), duration: 1 },
          0,
        );
      }
    },
    {
      scope: sectionRef,
      dependencies: [geometry, pinned, animate, onActiveIndexChange],
      revertOnUpdate: true,
    },
  );

  const stationCount = geometry.points.length;
  return useCallback(
    (index: number) => {
      const trigger = triggerRef.current;
      if (!pinned || !trigger || stationCount < 2) return false;
      const top = trigger.start + (trigger.end - trigger.start) * (index / (stationCount - 1));
      window.scrollTo({ top, behavior: 'smooth' });
      return true;
    },
    [pinned, stationCount],
  );
}
