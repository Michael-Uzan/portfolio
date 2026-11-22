# Portfolio Foundation + Journey Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Vite + React 19 portfolio to Vercel whose first section is a scroll-pinned "journey": a background video plus an SVG route whose stations are Michael's career milestones.

**Architecture:** Static SPA. Content lives in typed TS files validated by Zod. A pure function (`buildPath`) turns the station count and viewport size into SVG geometry. A GSAP ScrollTrigger hook pins the section on desktop and links path drawing and the active station to scroll progress. Mobile and reduced-motion users get a vertical, unpinned layout. React Router serves lazy-loaded pages.

**Tech Stack:** React 19.3, TypeScript 6.0, Vite 8, React Router 8 (data mode), Tailwind CSS 4 + shadcn/ui, GSAP 3.15 + @gsap/react, Zod 4, lucide-react, Fontsource, Vitest 5 + React Testing Library + jsdom, Playwright + @axe-core/playwright, ESLint 9 + typescript-eslint, Prettier, Husky + lint-staged, GitHub Actions, Lighthouse CI, Vercel.

**Spec:** `docs/superpowers/specs/2026-11-21-portfolio-journey-design.md`

## Global Constraints

- Repo root: `/Users/looply/Documents/code-projects/portfolio` (git already initialised on `main`, the spec is already committed).
- **TypeScript must stay `~6.0.3`**: typescript-eslint 8.73 requires `typescript >=4.8.4 <6.1.0`. The Vite template ships TS 7; we downgrade it.
- **ESLint must stay `^9`**: eslint-plugin-jsx-a11y 6.10 supports ESLint ≤ 9. The Vite template ships oxlint; we replace it.
- No `!` non-null assertions (`@typescript-eslint/no-non-null-assertion` is on). Handle `undefined` explicitly; `noUncheckedIndexedAccess` is on.
- Source files ~200 lines max. Split by responsibility before that.
- A type used in 2+ places lives in `src/types/`; a constant used in 2+ places (or general site config) lives in `src/consts/`. Types come from Zod schemas via `z.infer`.
- Imports use the `@/` alias for anything outside the current feature folder.
- Unit tests sit next to their source as `*.test.ts(x)`. Vitest is used with explicit imports (`import { describe, expect, it } from 'vitest'`), not globals.
- The phone number from the CV must never appear on the site.
- Every commit message ends with the trailer line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Package manager is **pnpm** (switched after Task 6 by owner decision). Tasks 1-6 text shows the original npm commands.
- Prettier style: single quotes, trailing commas, width 100, semicolons.

## File Map

```
portfolio/
  index.html                     static meta/OG tags, <html class="dark">
  vite.config.ts                 react + tailwind plugins, @ alias, vitest config
  eslint.config.js  .prettierrc.json  .prettierignore  .lintstagedrc.json  .husky/pre-commit
  playwright.config.ts  lighthouserc.json  vercel.json  .github/workflows/ci.yml
  public/  favicon.svg robots.txt sitemap.xml og-image.jpg media/journey.{webm,mp4} media/journey-poster.jpg
  e2e/  journey.spec.ts  a11y.spec.ts
  src/
    main.tsx                     creates browser router, mounts app
    index.css                    tailwind + shadcn tokens + font theme
    app/       router.tsx (routes array), RootLayout.tsx, RouteErrorBoundary.tsx, router.test.tsx
    consts/    routes.ts, links.ts, breakpoints.ts, animation.ts
    types/     journey.ts, profile.ts
    content/   schemas.ts, journey.ts, profile.ts, content.test.ts
    hooks/     useMediaQuery.ts, usePrefersReducedMotion.ts, useWindowSize.ts, useMediaQuery.test.ts
    features/journey/
               buildPath.ts (+test), activeStationIndex.ts (+test), formatPeriod.ts (+test),
               stationIcons.ts, JourneyPath.tsx, Station.tsx, StationCard.tsx,
               JourneySection.tsx (+test), useJourneyTimeline.ts
    components/ BackgroundVideo.tsx, Navbar.tsx, Footer.tsx, ui/button.tsx (shadcn)
    lib/       utils.ts (shadcn cn helper)
    pages/     HomePage.tsx, NotFoundPage.tsx
    test/      setup.ts, matchMedia.ts
```

---

### Task 1: Scaffold Vite app + quality tooling

**Files:**
- Create (via template): `package.json`, `index.html`, `vite.config.ts`, `tsconfig*.json`, `src/main.tsx`, `src/index.css`
- Create: `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `.lintstagedrc.json`, `.husky/pre-commit`, `src/test/setup.ts`, `README.md`
- Delete: `.oxlintrc.json`, `src/App.tsx`, `src/App.css`, `src/assets/`, `public/icons.svg`

**Interfaces:**
- Produces: npm scripts `dev`, `build`, `preview`, `lint`, `typecheck`, `test`, `test:watch`, `format`, `format:check`; `@/` alias → `src/`; Vitest setup file `src/test/setup.ts`.

- [ ] **Step 1: Scaffold the template beside the repo and copy it in** (the repo is not empty, so `create vite` cannot target it directly)

```bash
cd /Users/looply/Documents/code-projects
npm create vite@latest portfolio-scaffold -- --template react-ts --no-interactive
rsync -a portfolio-scaffold/ portfolio/
rm -rf portfolio-scaffold
cd portfolio
rm -rf .oxlintrc.json src/App.tsx src/App.css src/assets public/icons.svg
npm pkg set name=portfolio
```

- [ ] **Step 2: Swap oxlint/TS 7 for ESLint 9/TS 6 and install the test + format tooling**

```bash
npm uninstall oxlint
npm install -D typescript@~6.0.3 eslint@^9.39.5 @eslint/js@^9.39.5 typescript-eslint globals \
  eslint-plugin-react-hooks eslint-plugin-react-refresh eslint-plugin-jsx-a11y eslint-config-prettier \
  prettier husky lint-staged vitest jsdom @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event
```
Expected: installs with `found 0 vulnerabilities` and no `ERESOLVE` peer errors.

- [ ] **Step 3: Set npm scripts**

```bash
npm pkg set scripts.lint="eslint . --max-warnings 0" \
  scripts.typecheck="tsc -b" \
  scripts.test="vitest run" \
  scripts.test:watch="vitest" \
  scripts.format="prettier --write ." \
  scripts.format:check="prettier --check ." \
  scripts.prepare="husky"
```
(`dev`, `build` = `tsc -b && vite build`, and `preview` come from the template.)

- [ ] **Step 4: Replace `tsconfig.json`** (shadcn and editors read the alias from here)

```json
{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }],
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
```

- [ ] **Step 5: Replace `tsconfig.app.json`**

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "esnext",
    "types": ["vite/client"],
    "allowArbitraryExtensions": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
```

- [ ] **Step 6: Replace `tsconfig.node.json`** (includes the Playwright files that later tasks add, so ESLint's type-aware rules can see them)

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023"],
    "types": ["node"],
    "skipLibCheck": true,
    "module": "nodenext",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts", "playwright.config.ts", "e2e"]
}
```

- [ ] **Step 7: Replace `vite.config.ts`**

```ts
/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
});
```

- [ ] **Step 8: Create `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 9: Create `eslint.config.js`**

```js
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'playwright-report', 'test-results', '.lighthouseci']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // Numbers in template strings are safe and common in SVG path building.
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },
  {
    // shadcn components export variants next to the component.
    files: ['src/components/ui/**/*.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  prettier,
]);
```

- [ ] **Step 10: Create Prettier + lint-staged config**

`.prettierrc.json`:
```json
{ "singleQuote": true, "trailingComma": "all", "printWidth": 100 }
```

`.prettierignore`:
```
dist
coverage
playwright-report
test-results
.lighthouseci
package-lock.json
docs
```

`.lintstagedrc.json`:
```json
{
  "*.{ts,tsx}": ["eslint --fix --max-warnings 0", "prettier --write"],
  "*.{js,json,css,html,yml,yaml}": "prettier --write"
}
```

- [ ] **Step 11: Replace `src/main.tsx`** (bootstrap only; Task 7 replaces it with the router)

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found');

createRoot(rootElement).render(
  <StrictMode>
    <p>Portfolio</p>
  </StrictMode>,
);
```

- [ ] **Step 12: Replace `README.md`**

```markdown
# Portfolio

Michael Uzan's portfolio: React 19, TypeScript, Vite, GSAP, Tailwind. Deployed on Vercel.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm test` | Vitest unit + component tests |
| `npm run test:e2e` | Playwright e2e + axe accessibility |
| `npm run build` | Production build to `dist/` |

## Content

Milestones live in `src/content/journey.ts`. Add one object, push, and Vercel redeploys.
`npm test` validates the content against the Zod schema.
```

- [ ] **Step 13: Set up Husky**

```bash
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

- [ ] **Step 14: Format and verify everything is green**

```bash
npm run format
npm run lint && npm run typecheck && npx vitest run --passWithNoTests && npm run build
```
Expected: lint prints nothing, `tsc -b` exits 0, Vitest says `No test files found, exiting with code 0`, and the build ends with `✓ built in`.

- [ ] **Step 15: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite React app with ESLint, Prettier, Vitest, Husky

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Tailwind CSS 4, shadcn/ui, fonts, dark theme

**Files:**
- Modify: `vite.config.ts`, `src/index.css`, `index.html`, `src/main.tsx`
- Create (via shadcn CLI): `components.json`, `src/components/ui/button.tsx`, `src/lib/utils.ts`

**Interfaces:**
- Produces: Tailwind utilities; `font-display` (Bebas Neue) and `font-sans` (Inter) classes; `cn()` from `@/lib/utils`; `Button` from `@/components/ui/button` (supports `asChild`); dark shadcn tokens active via `<html class="dark">`.

- [ ] **Step 1: Install Tailwind and fonts**

```bash
npm install -D tailwindcss@^4.3.5 @tailwindcss/vite@^4.3.5
npm install @fontsource/bebas-neue @fontsource-variable/inter
```

- [ ] **Step 2: Add the Tailwind plugin to `vite.config.ts`**

Add `import tailwindcss from '@tailwindcss/vite';` at the top and change the plugins line to:
```ts
  plugins: [react(), tailwindcss()],
```

- [ ] **Step 3: Replace `src/index.css`** (shadcn needs the Tailwind import before it runs)

```css
@import 'tailwindcss';
```

- [ ] **Step 4: Initialise shadcn with the Button component** (non-interactive; verified on this stack)

```bash
npx shadcn@latest init -t vite -b radix -y --no-monorepo button
```
Expected: `✔ Created 2 files: src/components/ui/button.tsx, src/lib/utils.ts` and `Project initialization completed.`

- [ ] **Step 5: Append the font theme to the end of `src/index.css`**

```css
@theme {
  --font-display: 'Bebas Neue', 'Arial Narrow', sans-serif;
  --font-sans: 'Inter Variable', ui-sans-serif, system-ui, sans-serif;
}
```

- [ ] **Step 6: Import fonts in `src/main.tsx`** (add above `import './index.css';`)

```tsx
import '@fontsource/bebas-neue';
import '@fontsource-variable/inter';
```

- [ ] **Step 7: Turn on dark tokens in `index.html`**: change `<html lang="en">` to `<html lang="en" class="dark">`.

- [ ] **Step 8: Format and verify**

```bash
npm run format
npm run lint && npm run typecheck && npm run build
```
Expected: all pass. `npm run dev` shows "Portfolio" in Inter on a near-black background.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add Tailwind 4, shadcn/ui button, fonts and dark theme

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Content layer (consts, schemas, types, data)

**Files:**
- Create: `src/consts/routes.ts`, `src/consts/links.ts`, `src/consts/breakpoints.ts`, `src/consts/animation.ts`
- Create: `src/content/schemas.ts`, `src/types/journey.ts`, `src/types/profile.ts`, `src/content/journey.ts`, `src/content/profile.ts`
- Test: `src/content/content.test.ts`

**Interfaces:**
- Produces:
  - `ROUTES: { home: '/' }`, `SOCIAL_LINKS: readonly { label: string; href: string }[]`, `CONTACT_EMAIL: string`
  - `DESKTOP_QUERY`, `REDUCED_MOTION_QUERY` (media-query strings)
  - `MIN_STATION_SPACING_X = 260`, `STATION_SPACING_Y = 240`, `VERTICAL_PATH_MAX_WIDTH = 560`, `PATH_BULGE_RATIO = 0.28`, `HORIZONTAL_PATH_Y_RATIO = 0.6`, `JOURNEY_VIEWPORTS_PER_STATION = 1`, `JOURNEY_SCRUB_SECONDS = 1`
  - `journeyStationSchema`, `journeySchema`, `stationKindSchema`, `profileSchema`
  - Types `StationKind`, `JourneyStation`, `PathPoint {x;y}`, `PathLayout = 'horizontal' | 'vertical'`, `JourneyGeometry { d: string; points: PathPoint[]; width: number; height: number }`, `Profile`
  - `journey: JourneyStation[]` (8 stations, oldest first), `profile: Profile`

- [ ] **Step 1: Install Zod, then create the consts**

```bash
npm install zod@^4.6.7
```

`src/consts/routes.ts`:
```ts
export const ROUTES = {
  home: '/',
} as const;
```

`src/consts/links.ts`:
```ts
export const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/Michael-Uzan' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/michael-uzan-dev' },
] as const;

export const CONTACT_EMAIL = 'michael.uzan3@gmail.com';
```

`src/consts/breakpoints.ts`:
```ts
export const DESKTOP_QUERY = '(min-width: 768px)';
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
```

`src/consts/animation.ts`:
```ts
/** Minimum horizontal gap between stations on the pinned desktop route (px). */
export const MIN_STATION_SPACING_X = 260;
/** Vertical gap between stations on the stacked mobile / reduced-motion route (px). */
export const STATION_SPACING_Y = 240;
/** Vertical route never gets wider than this, even on wide screens (px). */
export const VERTICAL_PATH_MAX_WIDTH = 560;
/** How far each loop bulges, as a share of the cross-axis size. */
export const PATH_BULGE_RATIO = 0.28;
/** Where the horizontal route sits, as a share of viewport height. */
export const HORIZONTAL_PATH_Y_RATIO = 0.6;
/** Pinned scroll length per station, in viewport heights. */
export const JOURNEY_VIEWPORTS_PER_STATION = 1;
/** ScrollTrigger scrub smoothing (seconds). */
export const JOURNEY_SCRUB_SECONDS = 1;
```

- [ ] **Step 2: Write the failing content test** `src/content/content.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { journey } from './journey';
import { profile } from './profile';
import { journeySchema, profileSchema } from './schemas';

const station = {
  id: 'sample',
  year: 2020,
  kind: 'role',
  title: 'Developer',
  org: 'Acme',
  summary: 'Built things.',
} as const;

describe('journey content', () => {
  it('passes the journey schema', () => {
    const result = journeySchema.safeParse(journey);
    expect(result.error?.issues).toBeUndefined();
  });

  it('rejects duplicate ids', () => {
    expect(journeySchema.safeParse([station, station]).success).toBe(false);
  });

  it('rejects stations out of chronological order', () => {
    const later = { ...station, id: 'later', year: 2021 };
    expect(journeySchema.safeParse([later, station]).success).toBe(false);
  });

  it('rejects an unknown station kind', () => {
    expect(journeySchema.safeParse([{ ...station, kind: 'hobby' }]).success).toBe(false);
  });
});

describe('profile content', () => {
  it('passes the profile schema', () => {
    expect(profileSchema.safeParse(profile).success).toBe(true);
  });
});
```

- [ ] **Step 3: Run it and confirm it fails**

Run: `npx vitest run src/content`
Expected: FAIL, `Failed to resolve import "./journey"`.

- [ ] **Step 4: Create `src/content/schemas.ts`**

```ts
import { z } from 'zod';

export const stationKindSchema = z.enum(['degree', 'role', 'course', 'project', 'award']);

export const journeyStationSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'id must be kebab-case'),
  year: z.number().int().min(1990).max(2100),
  endYear: z.union([z.number().int(), z.literal('present')]).optional(),
  kind: stationKindSchema,
  title: z.string().min(1),
  org: z.string().min(1),
  summary: z.string().min(1),
  link: z.url().optional(),
});

export const journeySchema = z
  .array(journeyStationSchema)
  .min(1)
  .refine((stations) => new Set(stations.map((s) => s.id)).size === stations.length, {
    message: 'Station ids must be unique',
  })
  .refine(
    (stations) =>
      stations.every(
        (s, index) => index === 0 || s.year >= (stations[index - 1]?.year ?? s.year),
      ),
    { message: 'Stations must be ordered oldest first' },
  );

export const profileSchema = z.object({
  name: z.string().min(1),
  headline: z.string().min(1),
  summary: z.string().min(1),
});
```

- [ ] **Step 5: Create the types**

`src/types/journey.ts`:
```ts
import type { z } from 'zod';
import type { journeyStationSchema, stationKindSchema } from '@/content/schemas';

export type StationKind = z.infer<typeof stationKindSchema>;
export type JourneyStation = z.infer<typeof journeyStationSchema>;

export interface PathPoint {
  x: number;
  y: number;
}

export type PathLayout = 'horizontal' | 'vertical';

export interface JourneyGeometry {
  /** SVG path `d` attribute through every station. */
  d: string;
  /** Station positions, same order as the journey data. */
  points: PathPoint[];
  /** Size of the SVG canvas (px). */
  width: number;
  height: number;
}
```

`src/types/profile.ts`:
```ts
import type { z } from 'zod';
import type { profileSchema } from '@/content/schemas';

export type Profile = z.infer<typeof profileSchema>;
```

- [ ] **Step 6: Create the data** (from Michael's CV; no phone number)

`src/content/profile.ts`:
```ts
import type { Profile } from '@/types/profile';

export const profile: Profile = {
  name: 'Michael Uzan',
  headline: 'Full-Stack & Agentic AI Engineer',
  summary:
    'Full-Stack & AI Engineer building production software and enterprise AI systems: agentic architectures, multi-agent orchestration, and LLM-powered automation across fintech, e-commerce, and XR.',
};
```

`src/content/journey.ts`:
```ts
import type { JourneyStation } from '@/types/journey';

/** Career milestones, oldest first. Add a new object to add a station. */
export const journey: JourneyStation[] = [
  {
    id: 'ben-gurion',
    year: 2012,
    endYear: 2016,
    kind: 'degree',
    title: 'B.Sc. Mechanical Engineering',
    org: 'Ben-Gurion University',
    summary: 'Engineering fundamentals, systems thinking, and solving hard problems with precision.',
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
    kind: 'course',
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
```

- [ ] **Step 7: Run the test and confirm it passes**

Run: `npx vitest run src/content`
Expected: PASS, 5 tests.

- [ ] **Step 8: Lint, typecheck, commit**

```bash
npm run lint && npm run typecheck
git add -A
git commit -m "feat: add typed, Zod-validated journey and profile content

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Pure journey logic (`buildPath`, `activeStationIndex`, `formatPeriod`)

**Files:**
- Create: `src/features/journey/buildPath.ts`, `src/features/journey/activeStationIndex.ts`, `src/features/journey/formatPeriod.ts`
- Test: `src/features/journey/buildPath.test.ts`, `src/features/journey/activeStationIndex.test.ts`, `src/features/journey/formatPeriod.test.ts`

**Interfaces:**
- Consumes: consts from `@/consts/animation`; types `JourneyGeometry`, `PathLayout`, `PathPoint`, `JourneyStation` from `@/types/journey`.
- Produces:
  - `buildPath(options: { count: number; viewportWidth: number; viewportHeight: number; layout: PathLayout }): JourneyGeometry`
  - `activeStationIndex(progress: number, count: number): number`
  - `formatPeriod(station: Pick<JourneyStation, 'year' | 'endYear'>): string`

**How the geometry works** (for the reviewer): stations are evenly spaced along the main axis. Each pair of neighbours is joined by one cubic Bézier whose two control points are pushed off the axis by `bulge`, alternating sides. That gives the looping serpentine from the reference screenshot. Every segment has the same shape, so the path length is split equally between segments, and station *i* sits at progress `i / (count - 1)`.

- [ ] **Step 1: Write the failing `buildPath` test** `src/features/journey/buildPath.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { buildPath } from './buildPath';

describe('buildPath', () => {
  it('returns empty geometry when there are no stations', () => {
    expect(buildPath({ count: 0, viewportWidth: 800, viewportHeight: 600, layout: 'horizontal' })).toEqual({
      d: '',
      points: [],
      width: 800,
      height: 600,
    });
  });

  it('draws a single station as a lone move command', () => {
    const geometry = buildPath({ count: 1, viewportWidth: 400, viewportHeight: 500, layout: 'horizontal' });
    expect(geometry.d).toBe('M 200 300');
    expect(geometry.points).toEqual([{ x: 200, y: 300 }]);
  });

  it('builds a horizontal serpentine that alternates up and down', () => {
    const geometry = buildPath({ count: 3, viewportWidth: 900, viewportHeight: 1000, layout: 'horizontal' });
    expect(geometry.points).toEqual([
      { x: 150, y: 600 },
      { x: 450, y: 600 },
      { x: 750, y: 600 },
    ]);
    expect(geometry.d).toBe('M 150 600 C 150 320, 450 320, 450 600 C 450 880, 750 880, 750 600');
    expect(geometry.width).toBe(900);
    expect(geometry.height).toBe(1000);
  });

  it('widens the horizontal canvas past the viewport when stations would be cramped', () => {
    const geometry = buildPath({ count: 8, viewportWidth: 1280, viewportHeight: 800, layout: 'horizontal' });
    expect(geometry.width).toBe(8 * 260);
    expect(geometry.points[1]?.x).toBe(390);
  });

  it('builds a vertical serpentine that alternates left and right', () => {
    const geometry = buildPath({ count: 3, viewportWidth: 400, viewportHeight: 0, layout: 'vertical' });
    expect(geometry.points).toEqual([
      { x: 200, y: 120 },
      { x: 200, y: 360 },
      { x: 200, y: 600 },
    ]);
    expect(geometry.d).toBe('M 200 120 C 88 120, 88 360, 200 360 C 312 360, 312 600, 200 600');
    expect(geometry.width).toBe(400);
    expect(geometry.height).toBe(720);
  });

  it('caps the vertical canvas width on wide screens', () => {
    const geometry = buildPath({ count: 2, viewportWidth: 1400, viewportHeight: 900, layout: 'vertical' });
    expect(geometry.width).toBe(560);
    expect(geometry.points[0]?.x).toBe(280);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run src/features/journey/buildPath.test.ts`
Expected: FAIL, `Failed to resolve import "./buildPath"`.

- [ ] **Step 3: Implement `src/features/journey/buildPath.ts`**

```ts
import {
  HORIZONTAL_PATH_Y_RATIO,
  MIN_STATION_SPACING_X,
  PATH_BULGE_RATIO,
  STATION_SPACING_Y,
  VERTICAL_PATH_MAX_WIDTH,
} from '@/consts/animation';
import type { JourneyGeometry, PathLayout, PathPoint } from '@/types/journey';

interface BuildPathOptions {
  count: number;
  viewportWidth: number;
  viewportHeight: number;
  layout: PathLayout;
}

interface Canvas {
  points: PathPoint[];
  width: number;
  height: number;
}

/** One decimal place keeps the `d` string short and stable across renders. */
const round = (value: number): number => Math.round(value * 10) / 10;

function horizontalCanvas(count: number, viewportWidth: number, viewportHeight: number): Canvas {
  const spacing = Math.max(MIN_STATION_SPACING_X, viewportWidth / count);
  const y = round(viewportHeight * HORIZONTAL_PATH_Y_RATIO);
  const points = Array.from({ length: count }, (_, i) => ({ x: round(spacing * (i + 0.5)), y }));
  return { points, width: round(spacing * count), height: viewportHeight };
}

function verticalCanvas(count: number, viewportWidth: number): Canvas {
  const width = Math.min(viewportWidth, VERTICAL_PATH_MAX_WIDTH);
  const x = round(width / 2);
  const points = Array.from({ length: count }, (_, i) => ({ x, y: round(STATION_SPACING_Y * (i + 0.5)) }));
  return { points, width, height: STATION_SPACING_Y * count };
}

function curve(from: PathPoint, to: PathPoint, layout: PathLayout, offset: number): string {
  if (layout === 'horizontal') {
    return `C ${from.x} ${round(from.y + offset)}, ${to.x} ${round(to.y + offset)}, ${to.x} ${to.y}`;
  }
  return `C ${round(from.x + offset)} ${from.y}, ${round(to.x + offset)} ${to.y}, ${to.x} ${to.y}`;
}

/** Turns a station count and viewport size into a looping SVG route through every station. */
export function buildPath({ count, viewportWidth, viewportHeight, layout }: BuildPathOptions): JourneyGeometry {
  if (count < 1) return { d: '', points: [], width: viewportWidth, height: viewportHeight };

  const { points, width, height } =
    layout === 'horizontal'
      ? horizontalCanvas(count, viewportWidth, viewportHeight)
      : verticalCanvas(count, viewportWidth);
  const bulge = round((layout === 'horizontal' ? height : width) * PATH_BULGE_RATIO);

  const commands = points.map((to, i) => {
    if (i === 0) return `M ${to.x} ${to.y}`;
    const from = points[i - 1] ?? to;
    const direction = i % 2 === 1 ? -1 : 1;
    return curve(from, to, layout, direction * bulge);
  });

  return { d: commands.join(' '), points, width, height };
}
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npx vitest run src/features/journey/buildPath.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Write the failing tests for the two helpers**

`src/features/journey/activeStationIndex.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { activeStationIndex } from './activeStationIndex';

describe('activeStationIndex', () => {
  it.each([
    [0, 5, 0],
    [0.24, 5, 0],
    [0.25, 5, 1],
    [0.5, 5, 2],
    [1, 5, 4],
    [-1, 5, 0],
    [2, 5, 4],
    [0.7, 1, 0],
  ])('progress %d with %d stations → station %d', (progress, count, expected) => {
    expect(activeStationIndex(progress, count)).toBe(expected);
  });
});
```

`src/features/journey/formatPeriod.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { formatPeriod } from './formatPeriod';

describe('formatPeriod', () => {
  it('shows a single year when there is no end year', () => {
    expect(formatPeriod({ year: 2021 })).toBe('2021');
  });

  it('shows a single year when start and end match', () => {
    expect(formatPeriod({ year: 2021, endYear: 2021 })).toBe('2021');
  });

  it('shows a range', () => {
    expect(formatPeriod({ year: 2016, endYear: 2019 })).toBe('2016 – 2019');
  });

  it('shows an open range for current roles', () => {
    expect(formatPeriod({ year: 2025, endYear: 'present' })).toBe('2025 – Present');
  });
});
```

- [ ] **Step 6: Run them and confirm they fail**

Run: `npx vitest run src/features/journey`
Expected: FAIL for both new files (`Failed to resolve import`); `buildPath` still passes.

- [ ] **Step 7: Implement the helpers**

`src/features/journey/activeStationIndex.ts`:
```ts
/**
 * Which station the drawn line has reached. Every path segment has the same length,
 * so station i sits at progress i / (count - 1).
 */
export function activeStationIndex(progress: number, count: number): number {
  if (count <= 1) return 0;
  const clamped = Math.min(1, Math.max(0, progress));
  // Small epsilon so float error at exact station boundaries never rounds down.
  return Math.min(count - 1, Math.floor(clamped * (count - 1) + 1e-6));
}
```

`src/features/journey/formatPeriod.ts`:
```ts
import type { JourneyStation } from '@/types/journey';

export function formatPeriod({ year, endYear }: Pick<JourneyStation, 'year' | 'endYear'>): string {
  if (endYear === undefined || endYear === year) return String(year);
  return `${year} – ${endYear === 'present' ? 'Present' : endYear}`;
}
```

- [ ] **Step 8: Run all journey tests and confirm they pass**

Run: `npx vitest run src/features/journey`
Expected: PASS, 3 files, 18 tests.

- [ ] **Step 9: Lint, typecheck, commit**

```bash
npm run lint && npm run typecheck
git add -A
git commit -m "feat: add journey path geometry and station progress helpers

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Browser hooks + matchMedia test mock

**Files:**
- Create: `src/hooks/useMediaQuery.ts`, `src/hooks/usePrefersReducedMotion.ts`, `src/hooks/useWindowSize.ts`, `src/test/matchMedia.ts`
- Modify: `src/test/setup.ts`
- Test: `src/hooks/useMediaQuery.test.ts`

**Interfaces:**
- Consumes: `DESKTOP_QUERY`, `REDUCED_MOTION_QUERY` from `@/consts/breakpoints`.
- Produces:
  - `useMediaQuery(query: string): boolean`
  - `usePrefersReducedMotion(): boolean`
  - `useWindowSize(): { width: number; height: number }`
  - `mockMatchMedia(matching?: readonly string[]): void`: test helper; only the listed queries match.
  - **Test default:** `setup.ts` mocks matchMedia so that *only* `REDUCED_MOTION_QUERY` matches. Every component test therefore runs in the static mobile layout with no GSAP (jsdom has no SVG geometry). Tests that need something else call `mockMatchMedia([...])` themselves.

- [ ] **Step 1: Create `src/test/matchMedia.ts`**

```ts
import { vi } from 'vitest';

/** Replaces window.matchMedia; only the given queries report `matches: true`. */
export function mockMatchMedia(matching: readonly string[] = []): void {
  vi.stubGlobal(
    'matchMedia',
    (query: string): MediaQueryList => ({
      matches: matching.includes(query),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    }),
  );
}
```

- [ ] **Step 2: Replace `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { REDUCED_MOTION_QUERY } from '@/consts/breakpoints';
import { mockMatchMedia } from './matchMedia';

// Default: reduced motion on, desktop off → static layout, no GSAP in jsdom.
// jsdom has no scrollTo; React Router's ScrollRestoration calls it.
beforeEach(() => {
  mockMatchMedia([REDUCED_MOTION_QUERY]);
  vi.stubGlobal('scrollTo', vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
```

- [ ] **Step 3: Write the failing test** `src/hooks/useMediaQuery.test.ts`

```ts
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DESKTOP_QUERY, REDUCED_MOTION_QUERY } from '@/consts/breakpoints';
import { mockMatchMedia } from '@/test/matchMedia';
import { useMediaQuery } from './useMediaQuery';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

describe('useMediaQuery', () => {
  it('is true when the query matches', () => {
    mockMatchMedia([DESKTOP_QUERY]);
    const { result } = renderHook(() => useMediaQuery(DESKTOP_QUERY));
    expect(result.current).toBe(true);
  });

  it('is false when the query does not match', () => {
    mockMatchMedia([]);
    const { result } = renderHook(() => useMediaQuery(DESKTOP_QUERY));
    expect(result.current).toBe(false);
  });
});

describe('usePrefersReducedMotion', () => {
  it('reads the reduced-motion media query', () => {
    mockMatchMedia([REDUCED_MOTION_QUERY]);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });
});
```

- [ ] **Step 4: Run it and confirm it fails**

Run: `npx vitest run src/hooks`
Expected: FAIL, `Failed to resolve import "./useMediaQuery"`.

- [ ] **Step 5: Implement the hooks**

`src/hooks/useMediaQuery.ts`:
```ts
import { useCallback, useSyncExternalStore } from 'react';

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener('change', onChange);
      return () => {
        mediaQueryList.removeEventListener('change', onChange);
      };
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
```

`src/hooks/usePrefersReducedMotion.ts`:
```ts
import { REDUCED_MOTION_QUERY } from '@/consts/breakpoints';
import { useMediaQuery } from './useMediaQuery';

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY);
}
```

`src/hooks/useWindowSize.ts`:
```ts
import { useEffect, useState } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

const readSize = (): WindowSize => ({ width: window.innerWidth, height: window.innerHeight });

export function useWindowSize(): WindowSize {
  const [size, setSize] = useState(readSize);

  useEffect(() => {
    const onResize = () => {
      setSize(readSize());
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return size;
}
```

- [ ] **Step 6: Run all tests and confirm they pass**

Run: `npm test`
Expected: PASS: content, journey helpers and hooks (5 files).

- [ ] **Step 7: Lint, typecheck, commit**

```bash
npm run lint && npm run typecheck
git add -A
git commit -m "feat: add media-query, reduced-motion and window-size hooks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Static Journey section (video, route, stations, card)

**Files:**
- Create: `src/components/BackgroundVideo.tsx`, `src/features/journey/stationIcons.ts`, `src/features/journey/JourneyPath.tsx`, `src/features/journey/Station.tsx`, `src/features/journey/StationCard.tsx`, `src/features/journey/JourneySection.tsx`
- Test: `src/features/journey/JourneySection.test.tsx`

**Interfaces:**
- Consumes: `buildPath`, `formatPeriod` (Task 4); `useMediaQuery`, `usePrefersReducedMotion`, `useWindowSize` (Task 5); `journey` (Task 3); `cn` (Task 2).
- Produces:
  - `BackgroundVideo({ webm, mp4, poster }: { webm: string; mp4: string; poster: string })`
  - `STATION_ICONS: Record<StationKind, LucideIcon>`
  - `JourneyPath({ geometry, drawnPathRef }: { geometry: JourneyGeometry; drawnPathRef: Ref<SVGPathElement> })`
  - `Station({ station, point, isActive, isReached, onSelect })`
  - `StationCard({ station, className? })`
  - `JourneySection()`: owns `sectionRef: RefObject<HTMLElement | null>`, `sceneRef: RefObject<HTMLDivElement | null>`, `drawnPathRef: RefObject<SVGPathElement | null>`, `activeIndex` state, and `pinned` / `layout`. Task 8 wires these into the GSAP hook.

Layout rule: `pinned = isDesktop && !reducedMotion`. Pinned → horizontal route filling the viewport height. Otherwise → vertical stacked route in normal flow. Reduced motion on desktop therefore gets the vertical layout, so no station is ever off-screen without a way to scroll to it.

- [ ] **Step 1: Install icons**

```bash
npm install lucide-react
```

- [ ] **Step 2: Write the failing test** `src/features/journey/JourneySection.test.tsx`

```tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { journey } from '@/content/journey';
import { JourneySection } from './JourneySection';

function getStationList() {
  return screen.getByRole('list', { name: 'Career milestones' });
}

describe('JourneySection', () => {
  it('renders the title as the page heading', () => {
    render(<JourneySection />);
    expect(screen.getByRole('heading', { level: 1, name: /evolution of me/i })).toBeInTheDocument();
  });

  it('renders every milestone in order as a list item', () => {
    render(<JourneySection />);
    const items = within(getStationList()).getAllByRole('listitem');
    expect(items).toHaveLength(journey.length);
    journey.forEach((station, index) => {
      expect(items[index]).toHaveTextContent(station.org);
    });
  });

  it('shows the first milestone details by default', () => {
    render(<JourneySection />);
    const [first] = journey;
    if (!first) throw new Error('journey content is empty');
    expect(screen.getByText(first.summary)).toBeInTheDocument();
  });

  it('shows a milestone when it is selected', async () => {
    const user = userEvent.setup();
    render(<JourneySection />);
    const buttons = within(getStationList()).getAllByRole('button');
    const lastButton = buttons[buttons.length - 1];
    const lastStation = journey[journey.length - 1];
    if (!lastButton || !lastStation) throw new Error('journey content is empty');

    await user.click(lastButton);

    expect(lastButton).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText(lastStation.summary)).toBeInTheDocument();
  });

  it('shows a still poster instead of video when reduced motion is on', () => {
    const { container } = render(<JourneySection />);
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('img')).toHaveAttribute('src', '/media/journey-poster.jpg');
  });
});
```

- [ ] **Step 3: Run it and confirm it fails**

Run: `npx vitest run src/features/journey/JourneySection.test.tsx`
Expected: FAIL, `Failed to resolve import "./JourneySection"`.

- [ ] **Step 4: Create `src/components/BackgroundVideo.tsx`**

```tsx
import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface BackgroundVideoProps {
  webm: string;
  mp4: string;
  poster: string;
}

/** Full-bleed muted loop behind a section. Sticks to the viewport while its section scrolls. */
export function BackgroundVideo({ webm, mp4, poster }: BackgroundVideoProps) {
  const reducedMotion = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const onVisibilityChange = () => {
      const video = videoRef.current;
      if (!video) return;
      if (document.hidden) video.pause();
      else void video.play().catch(() => undefined);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  const mediaClass = 'sticky top-0 h-svh w-full object-cover';

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10">
      {reducedMotion ? (
        <img src={poster} alt="" className={mediaClass} />
      ) : (
        <video
          ref={videoRef}
          className={mediaClass}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
        >
          <source src={webm} type="video/webm" />
          <source src={mp4} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-linear-to-b from-black/75 via-black/55 to-black/85" />
    </div>
  );
}
```

- [ ] **Step 5: Create `src/features/journey/stationIcons.ts`**

```ts
import { Award, BookOpen, Briefcase, FolderGit2, GraduationCap, type LucideIcon } from 'lucide-react';
import type { StationKind } from '@/types/journey';

export const STATION_ICONS: Record<StationKind, LucideIcon> = {
  degree: GraduationCap,
  role: Briefcase,
  course: BookOpen,
  project: FolderGit2,
  award: Award,
};
```

- [ ] **Step 6: Create `src/features/journey/JourneyPath.tsx`**

```tsx
import type { Ref } from 'react';
import type { JourneyGeometry } from '@/types/journey';

interface JourneyPathProps {
  geometry: JourneyGeometry;
  /** The solid line GSAP draws; the dashed line underneath shows the route ahead. */
  drawnPathRef: Ref<SVGPathElement>;
}

export function JourneyPath({ geometry, drawnPathRef }: JourneyPathProps) {
  const { d, width, height } = geometry;
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-visible"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
    >
      <path d={d} className="stroke-white/30" strokeWidth={1.5} strokeDasharray="6 10" />
      <path
        ref={drawnPathRef}
        d={d}
        className="stroke-lime-200"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}
```

- [ ] **Step 7: Create `src/features/journey/Station.tsx`**

```tsx
import { cn } from '@/lib/utils';
import type { JourneyStation, PathPoint } from '@/types/journey';
import { STATION_ICONS } from './stationIcons';

interface StationProps {
  station: JourneyStation;
  point: PathPoint;
  isActive: boolean;
  isReached: boolean;
  onSelect: () => void;
}

export function Station({ station, point, isActive, isReached, onSelect }: StationProps) {
  const Icon = STATION_ICONS[station.kind];
  return (
    <li className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: point.x, top: point.y }}>
      <button
        type="button"
        onClick={onSelect}
        onFocus={onSelect}
        aria-current={isActive ? 'step' : undefined}
        className={cn(
          'flex w-44 flex-col items-center gap-1 rounded-xl p-2 text-center transition duration-500',
          'focus-visible:outline-2 focus-visible:outline-lime-200',
          isReached ? 'opacity-100' : 'opacity-60',
          isActive && 'scale-110',
        )}
      >
        <span
          className={cn(
            'grid size-14 place-items-center rounded-full border border-lime-200/60 bg-black/50 backdrop-blur-sm transition-shadow duration-500',
            isActive && 'shadow-[0_0_28px_rgba(217,249,157,0.55)]',
          )}
        >
          <Icon aria-hidden="true" className="size-7 text-lime-100" strokeWidth={1.25} />
        </span>
        <span className="font-display text-3xl leading-none tracking-wide text-white">
          {station.year}
        </span>
        <span className="text-sm leading-tight text-white">{station.title}</span>
        <span className="text-xs text-white/80">{station.org}</span>
      </button>
    </li>
  );
}
```

- [ ] **Step 8: Create `src/features/journey/StationCard.tsx`**

```tsx
import { cn } from '@/lib/utils';
import type { JourneyStation } from '@/types/journey';
import { formatPeriod } from './formatPeriod';

interface StationCardProps {
  station: JourneyStation;
  className?: string;
}

/** Details of the active station. Polite live region so keyboard users hear the change. */
export function StationCard({ station, className }: StationCardProps) {
  return (
    <div
      aria-live="polite"
      className={cn(
        'z-20 max-w-sm rounded-2xl border border-white/15 bg-black/60 p-5 backdrop-blur-md',
        className,
      )}
    >
      <p className="text-xs tracking-widest text-lime-200 uppercase">
        {formatPeriod(station)} · {station.org}
      </p>
      <h2 className="mt-1 font-display text-3xl tracking-wide text-white">{station.title}</h2>
      <p className="mt-2 text-sm text-white/85">{station.summary}</p>
    </div>
  );
}
```

- [ ] **Step 9: Create `src/features/journey/JourneySection.tsx`**

```tsx
import { useMemo, useRef, useState } from 'react';
import { BackgroundVideo } from '@/components/BackgroundVideo';
import { DESKTOP_QUERY } from '@/consts/breakpoints';
import { journey } from '@/content/journey';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useWindowSize } from '@/hooks/useWindowSize';
import { cn } from '@/lib/utils';
import type { PathLayout } from '@/types/journey';
import { buildPath } from './buildPath';
import { JourneyPath } from './JourneyPath';
import { Station } from './Station';
import { StationCard } from './StationCard';

const JOURNEY_MEDIA = {
  webm: '/media/journey.webm',
  mp4: '/media/journey.mp4',
  poster: '/media/journey-poster.jpg',
} as const;

export function JourneySection() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const reducedMotion = usePrefersReducedMotion();
  const { width, height } = useWindowSize();
  const [activeIndex, setActiveIndex] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const drawnPathRef = useRef<SVGPathElement>(null);

  const pinned = isDesktop && !reducedMotion;
  const layout: PathLayout = pinned ? 'horizontal' : 'vertical';
  // The vertical layout ignores viewport height; pinning it to 0 avoids rebuilds when
  // mobile browsers resize the viewport as the address bar hides.
  const pathHeight = pinned ? height : 0;
  const geometry = useMemo(
    () =>
      buildPath({ count: journey.length, viewportWidth: width, viewportHeight: pathHeight, layout }),
    [width, pathHeight, layout],
  );
  const activeStation = journey[activeIndex];

  return (
    <section
      ref={sectionRef}
      aria-labelledby="journey-title"
      className={cn('relative isolate overflow-clip text-white', pinned ? 'h-svh' : 'pb-32')}
    >
      <BackgroundVideo {...JOURNEY_MEDIA} />

      <h1
        id="journey-title"
        className={cn(
          'z-10 px-4 text-center font-display leading-none text-amber-50 uppercase',
          pinned ? 'absolute inset-x-0 top-20' : 'pt-28',
        )}
      >
        <span className="text-3xl md:text-5xl">The </span>
        <span className="text-6xl md:text-9xl">Journey</span>
        <span className="text-3xl md:text-5xl"> of </span>
        <span className="text-6xl md:text-9xl">Michael</span>
      </h1>

      <div
        ref={sceneRef}
        className={pinned ? 'absolute inset-y-0 left-0' : 'relative mx-auto mt-8'}
        style={{ width: geometry.width, height: geometry.height }}
      >
        <JourneyPath geometry={geometry} drawnPathRef={drawnPathRef} />
        <ol aria-label="Career milestones">
          {journey.map((station, index) => {
            const point = geometry.points[index];
            if (!point) return null;
            return (
              <Station
                key={station.id}
                station={station}
                point={point}
                isActive={index === activeIndex}
                isReached={reducedMotion || index <= activeIndex}
                onSelect={() => {
                  setActiveIndex(index);
                }}
              />
            );
          })}
        </ol>
      </div>

      {activeStation ? (
        <StationCard
          station={activeStation}
          className={pinned ? 'absolute right-8 bottom-8' : 'sticky bottom-4 mx-4'}
        />
      ) : null}
    </section>
  );
}
```

- [ ] **Step 10: Run the test and confirm it passes**

Run: `npx vitest run src/features/journey/JourneySection.test.tsx`
Expected: PASS, 5 tests.

- [ ] **Step 11: Full check, commit**

```bash
npm run format && npm run lint && npm run typecheck && npm test
git add -A
git commit -m "feat: add static journey section with video, route and stations

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: App shell (router, layout, navbar, footer, pages)

**Files:**
- Create: `src/app/router.tsx`, `src/app/RootLayout.tsx`, `src/app/RouteErrorBoundary.tsx`, `src/components/Navbar.tsx`, `src/components/Footer.tsx`, `src/pages/HomePage.tsx`, `src/pages/NotFoundPage.tsx`
- Modify: `src/main.tsx` (full replace)
- Test: `src/app/router.test.tsx`

**Interfaces:**
- Consumes: `JourneySection` (Task 6), `ROUTES`, `SOCIAL_LINKS`, `CONTACT_EMAIL` (Task 3), `profile`, `Button`.
- Produces: `routes: RouteObject[]` (pages are lazy-loaded; `*` → NotFoundPage). Page `<title>` is set per page through React 19's native `<title>`, and `index.html` holds no `<title>`, so there is never a duplicate.

- [ ] **Step 1: Install React Router**

```bash
pnpm add react-router@^8.5.2
```

- [ ] **Step 2: Write the failing test** `src/app/router.test.tsx`

```tsx
import { render, screen } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { describe, expect, it } from 'vitest';
import { routes } from './router';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
}

describe('routes', () => {
  it('renders the journey on the home page', async () => {
    renderAt('/');
    expect(
      await screen.findByRole('heading', { level: 1, name: /evolution of me/i }),
    ).toBeInTheDocument();
  });

  it('renders the not-found page for unknown paths', async () => {
    renderAt('/no-such-page');
    expect(await screen.findByRole('heading', { level: 1, name: '404' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to the journey/i })).toHaveAttribute('href', '/');
  });

  it('shows navigation with external profile links', async () => {
    renderAt('/');
    const github = await screen.findByRole('link', { name: 'GitHub' });
    expect(github).toHaveAttribute('href', 'https://github.com/Michael-Uzan');
    expect(github).toHaveAttribute('rel', 'noreferrer');
  });
});
```

- [ ] **Step 3: Run it and confirm it fails**

Run: `pnpm exec vitest run src/app`
Expected: FAIL, `Failed to resolve import "./router"`.

- [ ] **Step 4: Create the layout components**

`src/components/Navbar.tsx`:
```tsx
import { Link } from 'react-router';
import { SOCIAL_LINKS } from '@/consts/links';
import { ROUTES } from '@/consts/routes';
import { profile } from '@/content/profile';

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-sm text-white"
      >
        <Link to={ROUTES.home} className="font-display text-2xl tracking-wide">
          {profile.name}
        </Link>
        <ul className="flex gap-6">
          {SOCIAL_LINKS.map((link) => (
            <li key={link.label}>
              <a href={link.href} target="_blank" rel="noreferrer" className="hover:text-lime-200">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
```

`src/components/Footer.tsx`:
```tsx
import { CONTACT_EMAIL } from '@/consts/links';
import { profile } from '@/content/profile';

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-8 text-sm text-white/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 md:flex-row md:justify-between">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white">
          {CONTACT_EMAIL}
        </a>
      </div>
    </footer>
  );
}
```

`src/app/RootLayout.tsx`:
```tsx
import { Outlet, ScrollRestoration } from 'react-router';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

export function RootLayout() {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded bg-white px-4 py-2 text-black focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  );
}
```

`src/app/RouteErrorBoundary.tsx`:
```tsx
import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { ROUTES } from '@/consts/routes';

export function RouteErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Something went wrong.';

  return (
    <main className="grid min-h-svh place-items-center p-6 text-center text-white">
      <title>Error · Michael Uzan</title>
      <div>
        <h1 className="font-display text-6xl">Oops</h1>
        <p className="mt-4 text-white/80">{message}</p>
        <Link to={ROUTES.home} className="mt-6 inline-block underline">
          Back home
        </Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Create the pages**

`src/pages/HomePage.tsx`:
```tsx
import { profile } from '@/content/profile';
import { JourneySection } from '@/features/journey/JourneySection';

export function HomePage() {
  return (
    <>
      <title>{`${profile.name} · ${profile.headline}`}</title>
      <JourneySection />
    </>
  );
}
```

`src/pages/NotFoundPage.tsx`:
```tsx
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/consts/routes';

export function NotFoundPage() {
  return (
    <section className="grid min-h-svh place-items-center px-6 text-center text-white">
      <title>Page not found · Michael Uzan</title>
      <meta name="robots" content="noindex" />
      <div>
        <h1 className="font-display text-7xl md:text-9xl">404</h1>
        <p className="mt-4 text-lg text-white/80">This stop is not on the route.</p>
        <Button asChild className="mt-8">
          <Link to={ROUTES.home}>Back to the journey</Link>
        </Button>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Create `src/app/router.tsx`**

```tsx
import type { RouteObject } from 'react-router';
import { ROUTES } from '@/consts/routes';
import { RootLayout } from './RootLayout';
import { RouteErrorBoundary } from './RouteErrorBoundary';

/** Pages are lazy so each one becomes its own chunk. */
export const routes: RouteObject[] = [
  {
    path: ROUTES.home,
    Component: RootLayout,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('@/pages/HomePage')).HomePage }),
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('@/pages/NotFoundPage')).NotFoundPage }),
      },
    ],
  },
];
```

- [ ] **Step 7: Replace `src/main.tsx`**

```tsx
import '@fontsource/bebas-neue';
import '@fontsource-variable/inter';
import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { routes } from '@/app/router';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found');

const router = createBrowserRouter(routes);

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
```

- [ ] **Step 8: Remove the template `<title>` from `index.html`**: delete the `<title>…</title>` line (pages set it; Task 9 adds the static meta tags).

- [ ] **Step 9: Run the tests and confirm they pass**

Run: `pnpm test`
Expected: PASS: all files, including `src/app/router.test.tsx` (3 tests).

- [ ] **Step 10: Check it in the browser**

Run: `pnpm dev`, open http://localhost:5173.
Expected: navbar with name + GitHub/LinkedIn, big "THE evolution of me" title, the route with 8 stations (static for now; the video area is black until Task 9 adds media), the card for Ben-Gurion bottom-right, footer. Clicking a station updates the card. `/anything` shows the 404 page with a working button. Build output (`pnpm build`) lists separate `HomePage-*.js` and `NotFoundPage-*.js` chunks.

- [ ] **Step 11: Lint, typecheck, commit**

```bash
pnpm format && pnpm lint && pnpm typecheck
git add -A
git commit -m "feat: add router, layout, navbar, footer, home and 404 pages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Scroll-driven GSAP timeline

**Files:**
- Create: `src/features/journey/useJourneyTimeline.ts`
- Modify: `src/features/journey/JourneySection.tsx`

**Interfaces:**
- Consumes: `activeStationIndex` (Task 4); refs, `geometry`, `pinned`, `reducedMotion`, `setActiveIndex` from `JourneySection` (Task 6); `JOURNEY_VIEWPORTS_PER_STATION`, `JOURNEY_SCRUB_SECONDS` (Task 3).
- Produces: `useJourneyTimeline(options: JourneyTimelineOptions): void` where
  ```ts
  interface JourneyTimelineOptions {
    sectionRef: RefObject<HTMLElement | null>;
    sceneRef: RefObject<HTMLDivElement | null>;
    drawnPathRef: RefObject<SVGPathElement | null>;
    geometry: JourneyGeometry;
    pinned: boolean;
    animate: boolean;
    onActiveIndexChange: (index: number) => void;
  }
  ```

Behaviour:
- `animate === false` (reduced motion) → does nothing; the full line shows and all stations count as reached.
- Pinned (desktop) → pins the section for `count × 1` viewport heights. The line draws 0 → 100% with scroll; if the canvas is wider than the viewport, the scene pans left by `geometry.width − innerWidth` on the same timeline.
- Not pinned (mobile) → no pin. The line draws while the section scrolls past (`top top` → `bottom bottom`).
- Active station = `activeStationIndex(progress, count)`. The callback fires only when the index changes.

This is animation glue that jsdom cannot run (no SVG geometry, no layout). It is verified by Playwright in Task 10 and by hand here. The unit-tested logic lives in `buildPath` and `activeStationIndex`.

- [ ] **Step 1: Install GSAP**

```bash
pnpm add gsap@^3.15.1 @gsap/react@^2.1.2
```

- [ ] **Step 2: Create `src/features/journey/useJourneyTimeline.ts`**

```ts
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, type RefObject } from 'react';
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

/** Links path drawing, horizontal pan and the active station to scroll position. */
export function useJourneyTimeline({
  sectionRef,
  sceneRef,
  drawnPathRef,
  geometry,
  pinned,
  animate,
  onActiveIndexChange,
}: JourneyTimelineOptions): void {
  const lastIndexRef = useRef(0);

  useGSAP(
    () => {
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

      timeline.to(path, { strokeDashoffset: 0, duration: 1 }, 0);
      if (pinned) {
        timeline.to(scene, { x: () => -Math.max(0, geometry.width - window.innerWidth), duration: 1 }, 0);
      }
    },
    {
      scope: sectionRef,
      dependencies: [geometry, pinned, animate, onActiveIndexChange],
      revertOnUpdate: true,
    },
  );
}
```

- [ ] **Step 3: Wire it into `JourneySection.tsx`**

Add the import below the other `./` imports:
```tsx
import { useJourneyTimeline } from './useJourneyTimeline';
```

Add this right after the `const activeStation = journey[activeIndex];` line (`setActiveIndex` is a stable React setter, so it doesn't rebuild the timeline):
```tsx
  useJourneyTimeline({
    sectionRef,
    sceneRef,
    drawnPathRef,
    geometry,
    pinned,
    animate: !reducedMotion,
    onActiveIndexChange: setActiveIndex,
  });
```

- [ ] **Step 4: Unit tests still pass** (they run with reduced motion, so the hook returns early)

Run: `pnpm test`
Expected: PASS, all files.

- [ ] **Step 5: Manual check, desktop** (`pnpm dev`, window ≥ 768px wide)

Expected:
1. The section pins on load. Scrolling draws the solid line left → right over the dashed one.
2. Each station brightens, scales up, and glows as the line reaches it; the card switches to that station.
3. With 8 stations, the scene pans left so later stations slide into view.
4. After the last station (Leverate) the pin releases and the footer scrolls in.
5. Resizing the window re-lays out the route without errors in the console.

- [ ] **Step 6: Manual check, mobile + reduced motion**

- DevTools device toolbar → iPhone 14: no pinning; the vertical line draws as you scroll; the card sticks to the bottom.
- DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce" (desktop width): vertical layout, full line drawn, all stations bright, still poster image, no pin.

- [ ] **Step 7: Lint, typecheck, commit**

```bash
pnpm format && pnpm lint && pnpm typecheck
git add -A
git commit -m "feat: animate journey route with pinned GSAP ScrollTrigger timeline

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Media assets + SEO

**Files:**
- Create: `public/media/journey.webm`, `public/media/journey.mp4`, `public/media/journey-poster.jpg`, `public/og-image.jpg`, `public/robots.txt`, `public/sitemap.xml`
- Modify: `public/favicon.svg` (replace), `index.html`

**Interfaces:**
- Produces: the media paths `JourneySection` already references (`/media/journey.{webm,mp4}`, `/media/journey-poster.jpg`). The site URL placeholder `https://michael-uzan.vercel.app` is used in `index.html`, `robots.txt`, `sitemap.xml`, and replaced with the real domain in Task 12.

- [ ] **Step 1: Pick the clip (Michael chooses)**

Download a free clip from https://www.pexels.com/videos/ (search e.g. "code screen dark", "city night timelapse", "circuit board macro"). Pick something dark and calm, ≥ 1920px wide. Save it as `~/Downloads/journey-source.mp4`. The Pexels license allows this use without attribution.

- [ ] **Step 2: Install ffmpeg and encode** (ffmpeg is not installed on this machine yet)

```bash
brew install ffmpeg
mkdir -p public/media
SRC=~/Downloads/journey-source.mp4
ffmpeg -y -i "$SRC" -t 10 -an -vf "scale=1920:-2,fps=30" -c:v libvpx-vp9 -b:v 0 -crf 40 -row-mt 1 public/media/journey.webm
ffmpeg -y -i "$SRC" -t 10 -an -vf "scale=1920:-2,fps=30" -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart public/media/journey.mp4
ffmpeg -y -ss 1 -i "$SRC" -frames:v 1 -vf "scale=1920:-2" -q:v 5 public/media/journey-poster.jpg
ffmpeg -y -i public/media/journey-poster.jpg -vf "scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630" -q:v 4 public/og-image.jpg
ls -lh public/media public/og-image.jpg
```
Expected: webm and mp4 each ≤ ~4 MB, poster ≤ ~300 KB. If a video is larger, re-run its command with a higher `-crf` (+4).

- [ ] **Step 3: Replace `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0a0a0a"/>
  <text x="32" y="43" text-anchor="middle" font-family="Arial Narrow, Arial, sans-serif" font-weight="700" font-size="28" fill="#d9f99d">MU</text>
</svg>
```

- [ ] **Step 4: Replace `index.html`** (no `<title>`; React sets it per page)

```html
<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="theme-color" content="#0a0a0a" />
    <meta
      name="description"
      content="Michael Uzan — Full-Stack & Agentic AI Engineer. From mechanical engineering at Intel to multi-agent AI systems: projects, CV and contact."
    />
    <link rel="canonical" href="https://michael-uzan.vercel.app/" />
    <link rel="preload" as="image" href="/media/journey-poster.jpg" fetchpriority="high" />

    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://michael-uzan.vercel.app/" />
    <meta property="og:title" content="Michael Uzan · Full-Stack & Agentic AI Engineer" />
    <meta
      property="og:description"
      content="From mechanical engineering at Intel to multi-agent AI systems."
    />
    <meta property="og:image" content="https://michael-uzan.vercel.app/og-image.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://michael-uzan.vercel.app/sitemap.xml
```

- [ ] **Step 6: Create `public/sitemap.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://michael-uzan.vercel.app/</loc>
  </url>
</urlset>
```

- [ ] **Step 7: Verify in the browser**

`pnpm build && pnpm preview` → http://localhost:4173: the video plays behind the journey with readable text over the dark overlay; the tab shows "Michael Uzan · Full-Stack & Agentic AI Engineer" and the MU favicon. In Chrome DevTools → Lighthouse (desktop), SEO = 100.

- [ ] **Step 8: Commit**

```bash
pnpm format
git add -A
git commit -m "feat: add journey video, poster, favicon and SEO metadata

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Playwright e2e + axe accessibility

**Files:**
- Create: `playwright.config.ts`, `e2e/journey.spec.ts`, `e2e/a11y.spec.ts`
- Modify: `.gitignore` (append Playwright output), `package.json` (script)

**Interfaces:**
- Consumes: the built site via `pnpm preview` on port 4173; the accessible names `heading "…evolution of me"`, `list "Career milestones"`, and station buttons with `aria-current="step"` (Task 6).
- Produces: `pnpm test:e2e`; two projects, `desktop` (Desktop Chrome) and `mobile` (Pixel 7).

- [ ] **Step 1: Install and add the script**

```bash
pnpm add -D @playwright/test @axe-core/playwright
pnpm exec playwright install chromium
pnpm pkg set scripts.test:e2e="playwright test"
printf "\n# Playwright\nplaywright-report\ntest-results\n.lighthouseci\n" >> .gitignore
```

- [ ] **Step 2: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: 'http://localhost:4173', trace: 'on-first-retry' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'pnpm build && pnpm preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !isCI,
  },
});
```

- [ ] **Step 3: Create `e2e/journey.spec.ts`**

```ts
import { expect, test } from '@playwright/test';

test.describe('journey', () => {
  test('shows the title and the milestone list', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: /evolution of me/i })).toBeVisible();
    await expect(
      page.getByRole('list', { name: 'Career milestones' }).getByRole('listitem').first(),
    ).toBeAttached();
  });

  test('scrolling to the end activates the last milestone', async ({ page }) => {
    await page.goto('/');
    const stations = page.getByRole('list', { name: 'Career milestones' }).getByRole('button');
    await expect(stations.first()).toHaveAttribute('aria-current', 'step');

    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
    });

    await expect(stations.last()).toHaveAttribute('aria-current', 'step');
  });

  test('unknown routes show the 404 page', async ({ page }) => {
    await page.goto('/no-such-page');
    await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeVisible();
    await page.getByRole('link', { name: /back to the journey/i }).click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('journey with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('does not pin the section and shows the poster', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: /evolution of me/i })).toBeVisible();
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    await expect(page.locator('video')).toHaveCount(0);
  });
});
```

- [ ] **Step 4: Create `e2e/a11y.spec.ts`**

```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const path of ['/', '/no-such-page']) {
  test(`has no WCAG 2.1 AA violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
```

- [ ] **Step 5: Run e2e**

Run: `pnpm test:e2e`
Expected: PASS, 12 tests (6 specs × 2 projects). If axe reports a violation, fix the component it names (usually contrast: raise the text opacity) rather than disabling the rule.

- [ ] **Step 6: Lint, typecheck, commit**

```bash
pnpm format && pnpm lint && pnpm typecheck
git add -A
git commit -m "test: add Playwright e2e and axe accessibility checks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: GitHub Actions CI + Lighthouse budgets

**Files:**
- Create: `.github/workflows/ci.yml`, `lighthouserc.json`

**Interfaces:**
- Consumes: npm scripts `format:check`, `lint`, `typecheck`, `test`, `build`, `test:e2e`.
- Produces: CI on every push to `main` and every PR. Lighthouse budget: performance ≥ 0.9; accessibility, best-practices and SEO = 1.

- [ ] **Step 1: Install Lighthouse CI**

```bash
pnpm add -D @lhci/cli
```

- [ ] **Step 2: Create `lighthouserc.json`**

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 1 }],
        "categories:best-practices": ["error", { "minScore": 1 }],
        "categories:seo": ["error", { "minScore": 1 }]
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```

- [ ] **Step 3: Run Lighthouse locally**

Run: `pnpm build && pnpm exec lhci autorun`
Expected: `All results processed!` with no assertion failures. If performance is < 0.9 (Lighthouse emulates a slow phone), check the report's LCP element. Usual fixes: lower the video bitrate (higher `-crf`), or confirm the poster preload from Task 9 is present.

- [ ] **Step 4: Create `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm format:check
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build

  e2e:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report
          retention-days: 7

  lighthouse:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm exec lhci autorun
```

- [ ] **Step 5: Verify the whole local pipeline once**

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
```
Expected: every step passes.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "ci: add GitHub Actions pipeline with e2e and Lighthouse budgets

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: GitHub repo + Vercel deploy

**Files:**
- Create: `vercel.json`
- Modify: `index.html`, `public/robots.txt`, `public/sitemap.xml` (real domain)

**Interfaces:**
- Consumes: everything above.
- Produces: public repo `Michael-Uzan/portfolio`, production URL, preview deploy per PR.

> **Outward-facing steps:** creating the public GitHub repo and connecting Vercel publish the code. The executor must get Michael's explicit go-ahead before Step 2 and Step 4.

- [ ] **Step 1: Create `vercel.json`** (SPA fallback; Vercel serves real files first, so assets are unaffected)

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```
Commit it:
```bash
git add vercel.json
git commit -m "chore: add Vercel SPA rewrite and asset caching

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 2: Create the GitHub repo and push** (after Michael confirms)

```bash
gh repo create Michael-Uzan/portfolio --public --source . --remote origin --push
```
Expected: repo URL printed; the Actions tab shows the CI run, and all three jobs go green.

- [ ] **Step 3: Connect Vercel (Michael, in the browser)**

1. https://vercel.com/new → Import `Michael-Uzan/portfolio`.
2. Framework preset: **Vite** (auto-detected). Build `pnpm build`, output `dist`. Leave the defaults.
3. Project name: `michael-uzan` (gives `michael-uzan.vercel.app`; if taken, note the domain Vercel assigns).
4. Deploy.

- [ ] **Step 4: Point the metadata at the real domain** (skip if it is exactly `michael-uzan.vercel.app`)

```bash
DOMAIN=the-real-domain.vercel.app
grep -rl "michael-uzan.vercel.app" index.html public | xargs sed -i '' "s/michael-uzan.vercel.app/$DOMAIN/g"
git add -A
git commit -m "chore: point canonical and OG URLs at production domain

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

- [ ] **Step 5: Verify production**

- The production URL loads; the journey pins and animates on desktop and is vertical on a phone.
- `https://<domain>/no-such-page` (typed directly, a hard load) shows the 404 page, which proves the rewrite works.
- Paste the URL into https://www.opengraph.xyz → the title, description and OG image show.
- Open a test PR → Vercel posts a preview URL on it; CI runs.

---

## Self-Review Notes

- Spec coverage: stack ✓ (T1-2, T7-8, T10-11), consts/types folders ✓ (T3), Zod content + validation test ✓ (T3), buildPath with desktop serpentine + pan + mobile vertical ✓ (T4, T8), video loop + overlay + reduced-motion poster + hidden-tab pause ✓ (T6), `<ol>` semantics + keyboard focus ✓ (T6), pinned scrub timeline ✓ (T8), SEO (React title, static OG, robots, sitemap, favicon) ✓ (T7, T9), Playwright + axe ✓ (T10), CI + Lighthouse budgets ✓ (T11), Vercel + SPA rewrite + 404 deep link ✓ (T12). No Docker, by design.
- Deliberate deviations from the spec, all recorded here: `useWindowSize` hook added (needed for geometry); reduced-motion desktop uses the vertical layout (no off-screen stations); TypeScript pinned to 6.0 and ESLint to 9 (typescript-eslint / jsx-a11y peer ranges); `index.html` has no `<title>` so React 19's per-page title is the only one.
```
