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
  // CLaude: I dont think we need the course, it is unused.
  course: BookOpen,
  // CLaude: we gonna use the project.
  project: FolderGit2,
  //   // CLaude: I dont think we need the award, it is unused.
  award: Award,
};
