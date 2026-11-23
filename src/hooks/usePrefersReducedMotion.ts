import { REDUCED_MOTION_QUERY } from '@/config/breakpoints.config';
import { useMediaQuery } from './useMediaQuery';

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY);
}
