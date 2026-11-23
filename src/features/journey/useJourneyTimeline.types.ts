import type { RefObject } from 'react';
import type { JourneyGeometry } from './journeyLayout.types';

export interface JourneyTimelineOptions {
  sectionRef: RefObject<HTMLElement | null>;
  sceneRef: RefObject<HTMLDivElement | null>;
  drawnPathRef: RefObject<SVGPathElement | null>;
  geometry: JourneyGeometry;
  pinned: boolean;
  animate: boolean;
  onActiveIndexChange: (index: number) => void;
}

/** Scroll positions (px) where the timeline starts and ends. */
export interface ScrollBounds {
  start: number;
  end: number;
}

export interface TimelineSetup {
  section: HTMLElement;
  scene: HTMLDivElement;
  path: SVGPathElement;
  geometry: JourneyGeometry;
  pinned: boolean;
  /** Called with scroll progress in [0, 1] on every update. */
  onProgress: (progress: number) => void;
}
