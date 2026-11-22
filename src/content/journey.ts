import type { JourneyStation } from '@/types/journey';

/** Career milestones, oldest first. Add a new object to add a station. */
export const journey: JourneyStation[] = [
  {
    id: 'ben-gurion',
    year: 2012,
    endYear: 2016,
    kind: 'degree',
    title: 'B.Sc. Engineering',
    org: 'Ben-Gurion University',
    summary:
      'Engineering fundamentals, systems thinking, and solving hard problems with precision.',
  },
  {
    id: 'intel',
    year: 2016,
    endYear: 2019,
    kind: 'role',
    title: 'Mechanical Project Engineer',
    org: 'Intel',
    summary:
      'Managed engineering projects on multi-million-dollar semiconductor manufacturing systems used in advanced chip fabrication.',
  },
  {
    id: 'storyball',
    year: 2019,
    endYear: 2021,
    kind: 'role',
    title: 'Junior Developer',
    org: 'Storyball',
    summary: 'First steps as a developer: built React game generators and fixed mobile app bugs.',
  },
  {
    id: 'coding-academy',
    year: 2021,
    kind: 'degree',
    title: 'Full-Stack Bootcamp',
    org: 'Coding Academy',
    summary: 'Graduated a 640-hour full-stack bootcamp.',
  },
  {
    id: 'faintlines',
    year: 2021,
    endYear: 2023,
    kind: 'role',
    title: 'Full Stack Developer',
    org: 'Faintlines',
    summary: 'Built and optimized full-stack features with React, Python, and MongoDB.',
  },
  {
    id: 'byond-xr',
    year: 2024,
    endYear: 2025,
    kind: 'role',
    title: 'Full Stack Developer',
    org: 'Byond XR',
    summary:
      '3D e-commerce and virtual showrooms for enterprise clients like LEGO and Tilebar, from Figma to pixel-perfect responsive UI.',
  },
  {
    id: 'imagine-spaces',
    year: 2024,
    endYear: 2025,
    kind: 'role',
    title: 'Full Stack Developer',
    org: 'Imagine Spaces AI',
    summary:
      'AI image-generation platform with React, TypeScript, GraphQL, and microservices in an Nx monorepo.',
  },
  {
    id: 'leverate',
    year: 2025,
    endYear: 'present',
    kind: 'role',
    title: 'Full-Stack & Agentic AI Engineer',
    org: 'Leverate',
    summary:
      'Production multi-agent trading systems with Claude-based agents, plus AI workflows that turn bugs and PRDs into pull requests.',
  },
];
