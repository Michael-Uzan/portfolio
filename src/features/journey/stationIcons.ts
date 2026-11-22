import {
  Award,
  BookOpen,
  Briefcase,
  FolderGit2,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react';
import type { StationKind } from '@/types/journey';

export const STATION_ICONS: Record<StationKind, LucideIcon> = {
  degree: GraduationCap,
  role: Briefcase,
  course: BookOpen,
  project: FolderGit2,
  award: Award,
};
