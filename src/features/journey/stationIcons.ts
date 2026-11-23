import { Briefcase, FolderGit2, GraduationCap, type LucideIcon } from 'lucide-react';
import type { StationKind } from '@/types/journey.types';

export const STATION_ICONS: Record<StationKind, LucideIcon> = {
  degree: GraduationCap,
  role: Briefcase,
  project: FolderGit2,
};
