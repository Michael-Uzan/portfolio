import { REDUCED_MOTION_QUERY } from '@/consts/breakpoints';
import { useMediaQuery } from './useMediaQuery';

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY);
}
