import gsap from 'gsap';
import { JOURNEY_SCRUB_SECONDS, JOURNEY_VIEWPORTS_PER_STATION } from '@/config/journey.config';
import { clamp } from '@/utils/math.utils';
import type { ScrollBounds, TimelineSetup } from './useJourneyTimeline.types';

/** Scroll position that lands on station `index`, just inside its band (browsers round to whole px). */
export function stationScrollTop(
  { start, end }: ScrollBounds,
  index: number,
  count: number,
): number {
  const station = clamp(index, 0, count - 1);
  const raw = start + (end - start) * (station / (count - 1));

  return Math.min(end, Math.ceil(raw) + 1);
}

/** Pinned: scroll one viewport height per station. Otherwise: until the section leaves. */
function scrollEnd(pinned: boolean, count: number): string | (() => string) {
  if (!pinned) {
    return 'bottom bottom';
  }

  return () => `+=${count * JOURNEY_VIEWPORTS_PER_STATION * window.innerHeight}`;
}

/** Hides the solid path so the timeline can draw it in from 0 to full length. */
function hideDrawnPath(path: SVGPathElement): void {
  const length = path.getTotalLength();
  gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
}

/** How far left the scene pans so its right edge meets the viewport. */
function panDistance(sceneWidth: number): number {
  return -Math.max(0, sceneWidth - window.innerWidth);
}

/** Scroll-scrubbed timeline: draws the path and, when pinned, pans the scene horizontally. */
export function createJourneyTimeline({
  section,
  scene,
  path,
  geometry,
  pinned,
  onProgress,
}: TimelineSetup): gsap.core.Timeline {
  hideDrawnPath(path);

  const timeline = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: scrollEnd(pinned, geometry.points.length),
      pin: pinned,
      scrub: JOURNEY_SCRUB_SECONDS,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        onProgress(self.progress);
      },
    },
  });

  timeline.to(path, { strokeDashoffset: 0, duration: 1 }, 0);
  if (pinned) {
    timeline.to(scene, { x: () => panDistance(geometry.width), duration: 1 }, 0);
  }

  return timeline;
}
