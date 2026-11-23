# Code Rules, ESLint & Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enforce the review's conventions (ESLint + `.claude/` rules) and refactor the codebase to match, with no behavior change except dropping the unused `course` / `award` station kinds.

**Architecture:** Structural moves first (utils, config/consts/routes, MatrixRain folder, journey split), each keeping today's lint + typecheck + tests green. Then the new ESLint rules land together with the style conversion so every commit passes the pre-commit hook. Docs (`.claude/`, `CLAUDE.md`) and cleanup last.

**Tech Stack:** Vite, React 19, TypeScript (strict), Tailwind 4, shadcn (`cva`, `cn`), GSAP + `@gsap/react`, zod 4, react-router 8, Vitest + Testing Library, Playwright, ESLint 9 flat config, pnpm.

**Spec:** `docs/superpowers/specs/2026-11-23-code-rules-refactor-design.md`

## Global Constraints

- Components (contain JSX) → `export const X = () => …`. Module-level non-JSX functions (logic, utils, hooks) → `function name() {}`. Inline callbacks stay arrows.
- Always `{}` after `if` / `else` / `for` / `while` (`curly: all`).
- Blank line before `return` unless it is the first statement in its block.
- Source files ≤ 200 lines (tests ≤ 300); `.claude/` files ≤ 100 lines.
- Suffixes: `.types.ts`, `.consts.ts`, `.config.ts`, `.utils.ts`, `.schemas.ts`, `.styles.ts` / `.variants.ts`, `.test.ts(x)`.
- Only component Props may stay inline in a component file. Every other type → `.types.ts`.
- Global (used across project) → `src/types|consts|config|utils`; local → next to its user with suffix. `src/lib/` = third-party wrappers only.
- Pre-commit hook runs `eslint --fix --max-warnings 0` + prettier on staged files: every commit must pass it. Never `--no-verify`.
- macOS filesystem is case-insensitive: rename `matrixRain/` → `MatrixRain/` through a temp name.
- Commit messages: Conventional Commits, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Remove each `// Claude:` review comment in the task that addresses its file.

Verify commands (run from repo root): `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e`.

---

### Task 1: Global utils and random types

**Files:**
- Create: `src/types/random.types.ts`
- Create: `src/utils/math.utils.ts`, `src/utils/math.utils.test.ts`
- Create: `src/utils/random.utils.ts`, `src/utils/random.utils.test.ts`

**Interfaces:**
- Produces:
  - `type Random = () => number`, `type Range = readonly [number, number]` (`@/types/random.types`)
  - `round(value: number, decimals: number): number`, `clamp(value: number, min: number, max: number): number` (`@/utils/math.utils`)
  - `between(range: Range, random: Random): number`, `intBetween(range: Range, random: Random): number`, `randomDigit(random?: Random): string` (`@/utils/random.utils`)

- [ ] **Step 1: Write failing tests**

`src/utils/math.utils.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { clamp, round } from './math.utils';

describe('round', () => {
  it.each([
    [1.26, 1, 1.3],
    [1.24, 1, 1.2],
    [1.5, 0, 2],
    [-1.26, 1, -1.3],
  ])('round(%d, %d) → %d', (value, decimals, expected) => {
    expect(round(value, decimals)).toBe(expected);
  });
});

describe('clamp', () => {
  it.each([
    [5, 0, 10, 5],
    [-1, 0, 10, 0],
    [11, 0, 10, 10],
  ])('clamp(%d, %d, %d) → %d', (value, min, max, expected) => {
    expect(clamp(value, min, max)).toBe(expected);
  });
});
```

Note: `Math.round(-12.6) / 10` is `-1.3`, matching the old `round` in `buildPath.ts`.

`src/utils/random.utils.test.ts` (the `randomDigit` cases move here from `rain.test.ts` in Task 3):

```ts
import { describe, expect, it } from 'vitest';
import { between, intBetween, randomDigit } from './random.utils';

function always(value: number): () => number {
  return () => value;
}

describe('between', () => {
  it.each([
    [0, 2],
    [0.5, 3],
    [1, 4],
  ])('random %d → %d in [2, 4]', (value, expected) => {
    expect(between([2, 4], always(value))).toBe(expected);
  });
});

describe('intBetween', () => {
  it.each([
    [0, 2],
    [0.5, 3],
    [0.999, 4],
    [1, 4],
  ])('random %d → %d in [2, 4] inclusive', (value, expected) => {
    expect(intBetween([2, 4], always(value))).toBe(expected);
  });
});

describe('randomDigit', () => {
  it.each([
    [0, '0'],
    [0.55, '5'],
    [0.999, '9'],
  ])('random %d → digit %s', (value, digit) => {
    expect(randomDigit(always(value))).toBe(digit);
  });
});
```

- [ ] **Step 2: Run tests, confirm they fail**

Run: `pnpm vitest run src/utils`
Expected: FAIL — cannot resolve `./math.utils` / `./random.utils`.

- [ ] **Step 3: Implement**

`src/types/random.types.ts`:

```ts
/** Source of floats in [0, 1) — `Math.random` or a seeded stand-in for tests. */
export type Random = () => number;
/** Inclusive `[min, max]` pair. */
export type Range = readonly [number, number];
```

`src/utils/math.utils.ts`:

```ts
/** Rounds to a fixed number of decimal places. */
export function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;

  return Math.round(value * factor) / factor;
}

/** Limits value to [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
```

`src/utils/random.utils.ts`:

```ts
import type { Random, Range } from '@/types/random.types';

/** Float in [min, max]. */
export function between([min, max]: Range, random: Random): number {
  return min + random() * (max - min);
}

/** Integer in [min, max] (inclusive). */
export function intBetween([min, max]: Range, random: Random): number {
  return Math.min(max, min + Math.floor(random() * (max - min + 1)));
}

/** Single digit character 0-9. */
export function randomDigit(random: Random = Math.random): string {
  return String(Math.floor(random() * 10));
}
```

- [ ] **Step 4: Run tests, confirm pass**

Run: `pnpm vitest run src/utils && pnpm typecheck`
Expected: PASS, no type errors.

- [ ] **Step 5: Commit**

```bash
git add src/types/random.types.ts src/utils
git commit -m "feat: add shared math and random utils"
```

---

### Task 2: Split consts into config / consts / routes

**Files:**
- Create: `src/config/journey.config.ts`, `src/config/matrixRain.config.ts`, `src/config/breakpoints.config.ts`
- Create: `src/routes/routes.consts.ts`, `src/routes/routes.config.ts`
- Move: `src/consts/links.ts` → `src/consts/links.consts.ts`
- Move: `src/app/router.test.tsx` → `src/routes/routes.test.tsx`
- Delete: `src/consts/animation.ts`, `src/consts/breakpoints.ts`, `src/consts/routes.ts`, `src/app/router.tsx`
- Modify (imports only): `src/components/Footer.tsx`, `src/components/Navbar.tsx`, `src/components/MatrixRain.tsx`, `src/components/matrixRain/rain.ts`, `src/components/matrixRain/rain.test.ts`, `src/types/matrixRain.ts`, `src/features/journey/buildPath.ts`, `src/features/journey/useJourneyTimeline.ts`, `src/features/journey/JourneySection.tsx`, `src/hooks/usePrefersReducedMotion.ts`, `src/hooks/useMediaQuery.test.ts`, `src/test/setup.ts`, `src/app/RouteErrorBoundary.tsx`, `src/pages/NotFoundPage.tsx`, `src/main.tsx`

**Interfaces:**
- Produces (export names unchanged, paths new):
  - `@/config/journey.config`: `MIN_STATION_SPACING_X`, `STATION_SPACING_Y`, `VERTICAL_PATH_MAX_WIDTH`, `PATH_BULGE_RATIO`, `HORIZONTAL_PATH_Y_RATIO`, `JOURNEY_VIEWPORTS_PER_STATION`, `JOURNEY_SCRUB_SECONDS`
  - `@/config/matrixRain.config`: `MATRIX_RAIN`
  - `@/config/breakpoints.config`: `DESKTOP_QUERY`, `REDUCED_MOTION_QUERY`
  - `@/consts/links.consts`: `SOCIAL_LINKS`, `CONTACT_EMAIL`
  - `@/routes/routes.consts`: `ROUTES`
  - `@/routes/routes.config`: `routes: RouteObject[]`

- [ ] **Step 1: Create config files**

`src/config/journey.config.ts` — copy lines for the seven journey constants (with their doc comments) verbatim from `src/consts/animation.ts` (everything above `MATRIX_RAIN`, minus the `// Claude:` comment).

`src/config/matrixRain.config.ts` — copy the `MATRIX_RAIN` block (with its doc comments) verbatim from `src/consts/animation.ts`.

`src/config/breakpoints.config.ts` — copy `src/consts/breakpoints.ts` verbatim.

```bash
git rm -q src/consts/animation.ts src/consts/breakpoints.ts
```

- [ ] **Step 2: Move links and routes**

```bash
git mv src/consts/links.ts src/consts/links.consts.ts
mkdir -p src/routes
git mv src/app/router.test.tsx src/routes/routes.test.tsx
git mv src/app/router.tsx src/routes/routes.config.ts
git rm -q src/consts/routes.ts
```

`src/routes/routes.consts.ts`:

```ts
export const ROUTES = {
  home: '/',
} as const;
```

In `src/routes/routes.config.ts` replace the imports with:

```ts
import type { RouteObject } from 'react-router';
import { RootLayout } from '@/app/RootLayout';
import { RouteErrorBoundary } from '@/app/RouteErrorBoundary';
import { ROUTES } from './routes.consts';
```

In `src/routes/routes.test.tsx`: `import { routes } from './router';` → `import { routes } from './routes.config';`.

- [ ] **Step 3: Rewrite imports**

```bash
grep -rl "@/consts/animation" src | xargs sed -i '' \
  -e "s#import { MATRIX_RAIN } from '@/consts/animation'#import { MATRIX_RAIN } from '@/config/matrixRain.config'#" \
  -e "s#import type { MATRIX_RAIN } from '@/consts/animation'#import type { MATRIX_RAIN } from '@/config/matrixRain.config'#" \
  -e "s#'@/consts/animation'#'@/config/journey.config'#"
grep -rl "@/consts/breakpoints" src | xargs sed -i '' "s#'@/consts/breakpoints'#'@/config/breakpoints.config'#"
grep -rl "@/consts/links'" src | xargs sed -i '' "s#'@/consts/links'#'@/consts/links.consts'#"
grep -rl "@/consts/routes" src | xargs sed -i '' "s#'@/consts/routes'#'@/routes/routes.consts'#"
sed -i '' "s#'@/app/router'#'@/routes/routes.config'#" src/main.tsx
grep -rn "@/consts/animation\|@/consts/breakpoints\|@/consts/routes\|@/app/router\|consts/links'" src
```

Expected: last grep prints nothing.

- [ ] **Step 4: Verify**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: all pass (same test count as before).

- [ ] **Step 5: Commit**

```bash
git add -A src
git commit -m "refactor: split consts into config, consts and routes"
```

---

### Task 3: MatrixRain component folder

**Files:**
- Move: `src/components/MatrixRain.tsx` → `src/components/MatrixRain/MatrixRain.tsx`
- Move: `src/components/matrixRain/rain.ts` → `src/components/MatrixRain/rain.ts`
- Move: `src/components/matrixRain/rain.test.ts` → `src/components/MatrixRain/rain.test.ts`
- Move: `src/types/matrixRain.ts` → `src/components/MatrixRain/MatrixRain.types.ts`
- Create: `src/components/MatrixRain/rain.utils.ts`, `src/components/MatrixRain/startRain.ts`, `src/components/MatrixRain/index.ts`
- Modify: `src/features/journey/JourneySection.tsx` (import unchanged path `@/components/MatrixRain` — now resolves to `index.ts`)

**Interfaces:**
- Consumes: `between`, `intBetween`, `randomDigit` (`@/utils/random.utils`); `Random` (`@/types/random.types`); `MATRIX_RAIN` (`@/config/matrixRain.config`)
- Produces:
  - `MatrixRain.types.ts`: `RainDepth`, `RainColumn`, `RainState` (unchanged shapes), `LayoutColumn { x: number; depth: RainDepth }`, `CreateRainOptions { width; height; random?: Random }`, `StepRainOptions { resetChance: number; random?: Random }`, `CanvasSize { width: number; height: number }`
  - `rain.ts`: `buildCluster(random?)`, `layoutColumns(width, random?): LayoutColumn[]`, `createRain(options): RainState`, `stepRain(state, options): RainState` (randomDigit removed)
  - `rain.utils.ts`: `drawFrame(ctx, rain, width): void`, `resizeCanvas(canvas, ctx): CanvasSize`
  - `startRain.ts`: `startRain(canvas, ctx, reducedMotion: boolean): () => void` (returns cleanup)
  - `index.ts`: `export { MatrixRain } from './MatrixRain';`

- [ ] **Step 1: Move files (two-step rename for case-insensitive FS)**

```bash
git mv src/components/matrixRain src/components/__rain_tmp
git mv src/components/__rain_tmp src/components/MatrixRain
git mv src/components/MatrixRain.tsx src/components/MatrixRain/MatrixRain.tsx
git mv src/types/matrixRain.ts src/components/MatrixRain/MatrixRain.types.ts
```

- [ ] **Step 2: Write `MatrixRain.types.ts`**

```ts
import type { MATRIX_RAIN } from '@/config/matrixRain.config';
import type { Random } from '@/types/random.types';

export type RainDepth = keyof typeof MATRIX_RAIN.depths;

/** One falling stream of digits. `y` is measured in rows of this column's own font size. */
export interface RainColumn {
  x: number;
  depth: RainDepth;
  fontSize: number;
  y: number;
  /** Rows advanced per frame. */
  speed: number;
  /** Opacity of the whole column (0-1). */
  alpha: number;
}

export interface RainState {
  /** Drawn in order: far columns first so nearer ones paint on top. */
  columns: RainColumn[];
  /** Canvas height in px — each column converts it to its own row count. */
  height: number;
}

export interface LayoutColumn {
  x: number;
  depth: RainDepth;
}

export interface CreateRainOptions {
  width: number;
  height: number;
  random?: Random;
}

export interface StepRainOptions {
  /** Chance per frame that a column past the bottom restarts at the top. */
  resetChance: number;
  random?: Random;
}

export interface CanvasSize {
  width: number;
  height: number;
}
```

- [ ] **Step 3: Rewrite `rain.ts`**

Remove local `Random`/`Range`/`between`/`intBetween`/`randomDigit`/option interfaces and all `// Claude:` comments. Final file:

```ts
import { MATRIX_RAIN } from '@/config/matrixRain.config';
import type { Random } from '@/types/random.types';
import { between, intBetween } from '@/utils/random.utils';
import type {
  CreateRainOptions,
  LayoutColumn,
  RainColumn,
  RainDepth,
  RainState,
  StepRainOptions,
} from './MatrixRain.types';

const { depths, cluster } = MATRIX_RAIN;
const DEPTH_ORDER: Record<RainDepth, number> = { far: 0, mid: 1, near: 2 };

/** One group of columns, e.g. 2 far + 3 mid + 1 near, shuffled so every cluster looks different. */
export function buildCluster(random: Random = Math.random): RainDepth[] {
  const group: RainDepth[] = [
    ...Array<RainDepth>(intBetween(cluster.far, random)).fill('far'),
    ...Array<RainDepth>(intBetween(cluster.mid, random)).fill('mid'),
    ...Array<RainDepth>(intBetween(cluster.near, random)).fill('near'),
  ];
  for (let i = group.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [group[i], group[j]] = [group[j] ?? 'mid', group[i] ?? 'mid'];
  }

  return group;
}

/** Fills the width left to right with clusters, each followed by an empty gap. */
export function layoutColumns(width: number, random: Random = Math.random): LayoutColumn[] {
  const columns: LayoutColumn[] = [];
  let x = 0;
  while (x < width) {
    for (const depth of buildCluster(random)) {
      if (x >= width) {
        break;
      }
      columns.push({ x, depth });
      x += depths[depth].fontSize;
    }
    x += intBetween(cluster.gap, random) * depths.mid.fontSize;
  }

  return columns;
}

/** Lays out clustered columns, each with its depth's size and a random start row, speed and opacity. */
export function createRain({ width, height, random = Math.random }: CreateRainOptions): RainState {
  const columns: RainColumn[] = layoutColumns(width, random).map(({ x, depth }) => {
    const preset = depths[depth];

    return {
      x,
      depth,
      fontSize: preset.fontSize,
      y: random() * (height / preset.fontSize),
      speed: between(preset.speed, random),
      alpha: between(preset.alpha, random),
    };
  });
  columns.sort((a, b) => DEPTH_ORDER[a.depth] - DEPTH_ORDER[b.depth]);

  return { columns, height };
}

/** Advances every column one frame; columns past the bottom restart at random so they stay staggered. */
export function stepRain(
  { columns, height }: RainState,
  { resetChance, random = Math.random }: StepRainOptions,
): RainState {
  return {
    height,
    columns: columns.map((column) =>
      column.y * column.fontSize > height && random() < resetChance
        ? { ...column, y: 0 }
        : { ...column, y: column.y + column.speed },
    ),
  };
}
```

- [ ] **Step 4: Update `rain.test.ts`**

- Imports → `import { MATRIX_RAIN } from '@/config/matrixRain.config';`, `import type { RainDepth } from './MatrixRain.types';`, `import { buildCluster, createRain, layoutColumns, stepRain } from './rain';`
- Delete the `describe('randomDigit', …)` block (now in `random.utils.test.ts`).
- Change `const count = (list: RainDepth[], depth: RainDepth) => list.filter((d) => d === depth).length;` to:

```ts
function count(list: RainDepth[], depth: RainDepth): number {
  return list.filter((d) => d === depth).length;
}
```

- In `layoutColumns` test, brace the braceless `if`:

```ts
        if (previous) {
          expect(column.x).toBeGreaterThanOrEqual(previous.x + depths[previous.depth].fontSize);
        }
```

- [ ] **Step 5: Create `rain.utils.ts`**

```ts
import { MATRIX_RAIN } from '@/config/matrixRain.config';
import { randomDigit } from '@/utils/random.utils';
import type { CanvasSize, RainState } from './MatrixRain.types';

const { fadeAlpha, headColor, trailColor } = MATRIX_RAIN;
const FONT_FAMILY = 'ui-monospace, SFMono-Regular, Menlo, monospace';

/** Fades the previous frame, then paints each column's head digit and recolours the one behind it. */
export function drawFrame(ctx: CanvasRenderingContext2D, rain: RainState, width: number): void {
  ctx.globalAlpha = 1;
  ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
  ctx.fillRect(0, 0, width, rain.height);
  let font = 0;
  for (const column of rain.columns) {
    // Columns are sorted by depth, so the font only changes a few times per frame.
    if (column.fontSize !== font) {
      font = column.fontSize;
      ctx.font = `${font}px ${FONT_FAMILY}`;
    }
    const y = Math.floor(column.y) * column.fontSize;
    ctx.globalAlpha = column.alpha;
    // Recolour the previous head green so only the leading digit stays bright.
    ctx.fillStyle = trailColor;
    ctx.fillText(randomDigit(), column.x, y - column.fontSize);
    ctx.fillStyle = headColor;
    ctx.fillText(randomDigit(), column.x, y);
  }
}

/** Matches the backing store to the element size at device pixel ratio and paints it black. */
export function resizeCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
): CanvasSize {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.textBaseline = 'top';
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);

  return { width, height };
}
```

- [ ] **Step 6: Create `startRain.ts`**

```ts
import { MATRIX_RAIN } from '@/config/matrixRain.config';
import type { RainState } from './MatrixRain.types';
import { createRain, stepRain } from './rain';
import { drawFrame, resizeCanvas } from './rain.utils';

const { fps, resetChance, staticFrames } = MATRIX_RAIN;
const FRAME_MS = 1000 / fps;

/**
 * Runs the rain on a canvas: redraws on resize, pauses when hidden or off-screen,
 * and under reduced motion paints one pre-filled static frame. Returns a cleanup function.
 */
export function startRain(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  reducedMotion: boolean,
): () => void {
  let rain: RainState = { columns: [], height: 0 };
  let width = 0;
  let onScreen = true;
  let lastFrame = 0;
  let frameId = 0;

  function step() {
    drawFrame(ctx, rain, width);
    rain = stepRain(rain, { resetChance });
  }

  function resize() {
    const size = resizeCanvas(canvas, ctx);
    width = size.width;
    rain = createRain(size);
    // Reduced motion: fast-forward to a filled screen once instead of animating.
    if (reducedMotion) {
      for (let i = 0; i < staticFrames; i++) {
        step();
      }
    }
  }

  function tick(time: number) {
    frameId = requestAnimationFrame(tick);
    if (!onScreen || document.hidden || time - lastFrame < FRAME_MS) {
      return;
    }
    lastFrame = time;
    step();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    onScreen = entry?.isIntersecting ?? true;
  });
  visibilityObserver.observe(canvas);
  resize();
  if (!reducedMotion) {
    frameId = requestAnimationFrame(tick);
  }

  return () => {
    cancelAnimationFrame(frameId);
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
  };
}
```

- [ ] **Step 7: Rewrite `MatrixRain.tsx` and add `index.ts`**

`MatrixRain.tsx` (still `function` here — Task 5 converts all components at once):

```tsx
import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { startRain } from './startRain';

/** Falling-digits canvas behind a section. Pauses when hidden or off-screen; static under reduced motion. */
export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      return;
    }

    return startRain(canvas, ctx, reducedMotion);
  }, [reducedMotion]);

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black">
      <canvas ref={canvasRef} className="sticky top-0 block h-svh w-full" />
      <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/35 to-black/70" />
    </div>
  );
}
```

`index.ts`:

```ts
export { MatrixRain } from './MatrixRain';
```

- [ ] **Step 8: Verify**

Run: `grep -rn "types/matrixRain\|components/matrixRain" src; pnpm typecheck && pnpm lint && pnpm test`
Expected: grep empty; all pass. `JourneySection.test` "renders the digital-rain background" still passes.

- [ ] **Step 9: Commit**

```bash
git add -A src
git commit -m "refactor: move MatrixRain into its own folder and split loop, drawing and types"
```

---

### Task 4: Journey types, schemas and timeline split

**Files:**
- Create: `src/content/journey.schemas.ts`, `src/content/profile.schemas.ts`
- Delete: `src/content/schemas.ts`
- Move: `src/types/journey.ts` → `src/types/journey.types.ts` (shared part only)
- Move: `src/types/profile.ts` → `src/types/profile.types.ts`
- Create: `src/features/journey/journeyLayout.types.ts`
- Create: `src/features/journey/useJourneyTimeline.types.ts`
- Create: `src/features/journey/useJourneyTimeline.utils.ts`, `src/features/journey/useJourneyTimeline.utils.test.ts`
- Modify: `src/features/journey/buildPath.ts`, `activeStationIndex.ts`, `useJourneyTimeline.ts`, `stationIcons.ts`, `formatPeriod.ts`, `Station.tsx`, `StationCard.tsx`, `JourneyPath.tsx`, `JourneySection.tsx` (imports), `src/content/journey.ts`, `src/content/profile.ts`, `src/content/content.test.ts`

**Interfaces:**
- Consumes: `round`, `clamp` (`@/utils/math.utils`); journey config constants (`@/config/journey.config`)
- Produces:
  - `@/content/journey.schemas`: `stationKindSchema` (`'degree' | 'role' | 'project'`), `journeyStationSchema`, `journeySchema`
  - `@/content/profile.schemas`: `profileSchema`
  - `@/types/journey.types`: `StationKind`, `JourneyStation`
  - `@/types/profile.types`: `Profile`
  - `./journeyLayout.types`: `PathPoint`, `PathLayout`, `JourneyGeometry`, `BuildPathOptions`, `Canvas`
  - `./useJourneyTimeline.types`: `JourneyTimelineOptions`, `ScrollBounds { start: number; end: number }`, `TimelineSetup { section: HTMLElement; scene: HTMLDivElement; path: SVGPathElement; geometry: JourneyGeometry; pinned: boolean; onProgress: (progress: number) => void }`
  - `./useJourneyTimeline.utils`: `stationScrollTop(bounds: ScrollBounds, index: number, count: number): number`, `createJourneyTimeline(setup: TimelineSetup): gsap.core.Timeline`

- [ ] **Step 1: Write failing test for `stationScrollTop`**

`src/features/journey/useJourneyTimeline.utils.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { stationScrollTop } from './useJourneyTimeline.utils';

describe('stationScrollTop', () => {
  const bounds = { start: 100, end: 1100 };

  it.each([
    [0, 101],
    [2, 601],
    [4, 1100],
    [-3, 101],
    [9, 1100],
  ])('station %d of 5 → scroll top %d', (index, expected) => {
    expect(stationScrollTop(bounds, index, 5)).toBe(expected);
  });

  it('rounds fractional positions up and stays one pixel inside the band', () => {
    expect(stationScrollTop({ start: 0, end: 100 }, 1, 4)).toBe(35);
  });
});
```

(`100 * 1/3 = 33.33… → ceil 34 → +1 = 35`.)

- [ ] **Step 2: Run, confirm failure**

Run: `pnpm vitest run src/features/journey/useJourneyTimeline.utils.test.ts`
Expected: FAIL — cannot resolve `./useJourneyTimeline.utils`.

- [ ] **Step 3: Split schemas and shared types**

`src/content/journey.schemas.ts` — the `stationKindSchema`, `journeyStationSchema`, `journeySchema` blocks from `schemas.ts`, with the kind enum changed to:

```ts
export const stationKindSchema = z.enum(['degree', 'role', 'project']);
```

`src/content/profile.schemas.ts`:

```ts
import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(1),
  headline: z.string().min(1),
  summary: z.string().min(1),
});
```

```bash
git rm -q src/content/schemas.ts
git mv src/types/journey.ts src/types/journey.types.ts
git mv src/types/profile.ts src/types/profile.types.ts
```

`src/types/journey.types.ts`:

```ts
import type { z } from 'zod';
import type { journeyStationSchema, stationKindSchema } from '@/content/journey.schemas';

export type StationKind = z.infer<typeof stationKindSchema>;
export type JourneyStation = z.infer<typeof journeyStationSchema>;
```

`src/types/profile.types.ts`: import from `'@/content/profile.schemas'`.

`src/content/content.test.ts`: replace `import { journeySchema, profileSchema } from './schemas';` with:

```ts
import { journeySchema } from './journey.schemas';
import { profileSchema } from './profile.schemas';
```

Add a test inside `describe('journey content')`:

```ts
  it.each(['course', 'award'])('rejects the removed station kind %s', (kind) => {
    expect(journeySchema.safeParse([{ ...station, kind }]).success).toBe(false);
  });
```

`src/content/journey.ts` / `profile.ts`: imports → `@/types/journey.types` / `@/types/profile.types`.

- [ ] **Step 4: Feature-local types**

`src/features/journey/journeyLayout.types.ts`:

```ts
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

export interface BuildPathOptions {
  count: number;
  viewportWidth: number;
  viewportHeight: number;
  layout: PathLayout;
}

/** Station positions plus the canvas they fit in, before the curve is drawn. */
export interface Canvas {
  points: PathPoint[];
  width: number;
  height: number;
}
```

`src/features/journey/useJourneyTimeline.types.ts`:

```ts
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
```

Update imports: `Station.tsx` (`JourneyStation` from `@/types/journey.types`, `PathPoint` from `./journeyLayout.types`), `StationCard.tsx`, `formatPeriod.ts`, `stationIcons.ts` (`@/types/journey.types`), `JourneyPath.tsx` (`./journeyLayout.types`), `JourneySection.tsx` (`PathLayout` from `./journeyLayout.types`).

Remove the `// Claude:` comment in `StationCard.tsx` (its Props stay inline — allowed).

- [ ] **Step 5: `stationIcons.ts`**

```ts
import { Briefcase, FolderGit2, GraduationCap, type LucideIcon } from 'lucide-react';
import type { StationKind } from '@/types/journey.types';

export const STATION_ICONS: Record<StationKind, LucideIcon> = {
  degree: GraduationCap,
  role: Briefcase,
  project: FolderGit2,
};
```

- [ ] **Step 6: `buildPath.ts` and `activeStationIndex.ts` use shared utils**

`buildPath.ts`: delete the local `BuildPathOptions`, `Canvas`, `round` and `// Claude:` comments; import:

```ts
import {
  HORIZONTAL_PATH_Y_RATIO,
  MIN_STATION_SPACING_X,
  PATH_BULGE_RATIO,
  STATION_SPACING_Y,
  VERTICAL_PATH_MAX_WIDTH,
} from '@/config/journey.config';
import { round } from '@/utils/math.utils';
import type {
  BuildPathOptions,
  Canvas,
  JourneyGeometry,
  PathLayout,
  PathPoint,
} from './journeyLayout.types';

/** One decimal place keeps the `d` string short and stable across renders. */
const DECIMALS = 1;
```

Replace every `round(x)` with `round(x, DECIMALS)`. Brace both braceless `if`s and add blank lines before returns:

```ts
  if (count < 1) {
    return { d: '', points: [], width: viewportWidth, height: viewportHeight };
  }
```

```ts
  const commands = points.map((to, i) => {
    if (i === 0) {
      return `M ${to.x} ${to.y}`;
    }
    const from = points[i - 1] ?? to;
    const direction = i % 2 === 1 ? -1 : 1;

    return curve(from, to, layout, direction * bulge);
  });
```

`activeStationIndex.ts`:

```ts
import { clamp } from '@/utils/math.utils';

/**
 * Which station the drawn line has reached. Every path segment has the same length,
 * so station i sits at progress i / (count - 1).
 */
export function activeStationIndex(progress: number, count: number): number {
  if (count <= 1) {
    return 0;
  }
  const clamped = clamp(progress, 0, 1);

  // Small epsilon so float error at exact station boundaries never rounds down.
  return Math.min(count - 1, Math.floor(clamped * (count - 1) + 1e-6));
}
```

`formatPeriod.ts`:

```ts
import type { JourneyStation } from '@/types/journey.types';

export function formatPeriod({ year, endYear }: Pick<JourneyStation, 'year' | 'endYear'>): string {
  if (endYear === undefined || endYear === year) {
    return String(year);
  }

  return `${year} – ${endYear === 'present' ? 'Present' : endYear}`;
}
```

- [ ] **Step 7: Create `useJourneyTimeline.utils.ts`**

```ts
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { JOURNEY_SCRUB_SECONDS, JOURNEY_VIEWPORTS_PER_STATION } from '@/config/journey.config';
import { clamp } from '@/utils/math.utils';
import type { ScrollBounds, TimelineSetup } from './useJourneyTimeline.types';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Scroll position that lands on station `index`, just inside its band (browsers round to whole px). */
export function stationScrollTop({ start, end }: ScrollBounds, index: number, count: number): number {
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
```

- [ ] **Step 8: Rewrite `useJourneyTimeline.ts`**

```ts
import { useGSAP } from '@gsap/react';
import { useCallback, useRef } from 'react';
import { activeStationIndex } from './activeStationIndex';
import type { JourneyTimelineOptions, ScrollBounds } from './useJourneyTimeline.types';
import { createJourneyTimeline, stationScrollTop } from './useJourneyTimeline.utils';

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
  const boundsRef = useRef<ScrollBounds | null>(null);
  const stationCount = geometry.points.length;

  useGSAP(
    () => {
      boundsRef.current = null;
      lastIndexRef.current = -1;
      const section = sectionRef.current;
      const scene = sceneRef.current;
      const path = drawnPathRef.current;
      if (!animate || !section || !scene || !path) {
        return;
      }

      const reportProgress = (progress: number) => {
        const index = activeStationIndex(progress, stationCount);
        if (index === lastIndexRef.current) {
          return;
        }
        lastIndexRef.current = index;
        onActiveIndexChange(index);
      };

      const timeline = createJourneyTimeline({
        section,
        scene,
        path,
        geometry,
        pinned,
        onProgress: reportProgress,
      });
      boundsRef.current = timeline.scrollTrigger ?? null;
    },
    {
      scope: sectionRef,
      dependencies: [geometry, pinned, animate, onActiveIndexChange],
      revertOnUpdate: true,
    },
  );

  return useCallback(
    (index: number) => {
      const bounds = boundsRef.current;
      if (!pinned || !bounds || stationCount < 2) {
        lastIndexRef.current = index;

        return false;
      }
      window.scrollTo({ top: stationScrollTop(bounds, index, stationCount), behavior: 'smooth' });

      return true;
    },
    [pinned, stationCount],
  );
}
```

(`stationCount` moved above `useGSAP`; the `useGSAP` callback reads the same value as before since `geometry` is in its dependencies. `react-hooks/exhaustive-deps` does not check `useGSAP`.)

- [ ] **Step 9: Verify**

Run: `grep -rn "content/schemas\|types/journey'\|types/profile'" src; pnpm typecheck && pnpm lint && pnpm test`
Expected: grep empty; all pass including the new `stationScrollTop` and removed-kind tests.

Run: `pnpm build && pnpm test:e2e`
Expected: PASS — journey e2e (scroll, pin, station selection) unchanged.

- [ ] **Step 10: Commit**

```bash
git add -A src
git commit -m "refactor: split journey types, schemas and timeline logic; drop unused station kinds"
```

---

### Task 5: ESLint rules and style conversion

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml` (dev dep), `eslint.config.js`
- Modify: every component file (`src/app/RootLayout.tsx`, `src/app/RouteErrorBoundary.tsx`, `src/components/Footer.tsx`, `src/components/Navbar.tsx`, `src/components/MatrixRain/MatrixRain.tsx`, `src/components/ui/button.tsx`, `src/features/journey/JourneyPath.tsx`, `JourneySection.tsx`, `Station.tsx`, `StationCard.tsx`, `src/pages/HomePage.tsx`, `src/pages/NotFoundPage.tsx`), `src/routes/routes.test.tsx`, `src/hooks/useWindowSize.ts`, `src/main.tsx`, `src/features/journey/JourneySection.test.tsx`
- Create: `src/hooks/useWindowSize.types.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: lint rules every later task must satisfy. `Button` export name unchanged (`Button`, `buttonVariants`).

- [ ] **Step 1: Install plugin**

Run: `pnpm add -D @stylistic/eslint-plugin`
Expected: added to `devDependencies`.

- [ ] **Step 2: Update `eslint.config.js`**

Add import `import stylistic from '@stylistic/eslint-plugin';`. In the `**/*.{ts,tsx}` block add `plugins: { '@stylistic': stylistic },` and extend `rules`:

```js
    rules: {
      // Numbers in template strings are safe and common in SVG path building.
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      curly: ['error', 'all'],
      'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'FunctionDeclaration:has(JSXElement), FunctionDeclaration:has(JSXFragment)',
          message: 'Components use arrow functions: export const X = () => …',
        },
        {
          selector:
            ':matches(Program, ExportNamedDeclaration) > VariableDeclaration > VariableDeclarator > ArrowFunctionExpression:not(:has(JSXElement)):not(:has(JSXFragment))',
          message: 'Plain logic, utils and hooks use `function name() {}`.',
        },
      ],
    },
```

After the `src/components/ui/**` block add:

```js
  {
    files: ['**/*.test.{ts,tsx}'],
    rules: { 'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }] },
  },
```

Keep `prettier` last.

- [ ] **Step 3: See what fails**

Run: `pnpm lint 2>&1 | grep -E "error" | sort | uniq -c | sort -rn | head -40`
Expected: `no-restricted-syntax` on the ~12 function components + `renderAt` in `routes.test.tsx` + `readSize` in `useWindowSize.ts`; `curly` / padding errors in `main.tsx`, `JourneySection.tsx`, `JourneySection.test.tsx`, hooks. Nothing from files rewritten in Tasks 1-4 except components.

- [ ] **Step 4: Auto-fix**

Run: `pnpm eslint . --fix`
Fixes `curly` and blank-line-before-return everywhere.

- [ ] **Step 5: Convert components to arrow consts**

For each component file, change `export function Name(props) {` → `export const Name = (props) => {` and the closing `}` → `};`. Example, `Footer.tsx` (also drop the `// Claude:` comment):

```tsx
export const Footer = () => {
  return (
    <footer className="border-t border-white/10 px-6 py-8 text-sm text-white/70">
      …unchanged…
    </footer>
  );
};
```

With props: `export const Station = ({ station, point, isActive, isReached, onSelect }: StationProps) => {`.

`routes.test.tsx`:

```tsx
const renderAt = (path: string) => {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
};
```

(Keep it a `const` arrow — it contains JSX, so the component rule applies.)

`button.tsx` (also drop the two `// Claude:` comments):

```tsx
type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = ({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
};
```

(`ButtonProps` is component Props → inline is allowed.)

- [ ] **Step 6: `useWindowSize`**

`src/hooks/useWindowSize.types.ts`:

```ts
export interface WindowSize {
  width: number;
  height: number;
}
```

`src/hooks/useWindowSize.ts`:

```ts
import { useEffect, useState } from 'react';
import type { WindowSize } from './useWindowSize.types';

function readSize(): WindowSize {
  return { width: window.innerWidth, height: window.innerHeight };
}

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

- [ ] **Step 7: Verify clean**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm format:check`
Expected: 0 errors, 0 warnings; tests pass. If `format:check` fails, run `pnpm format` and re-check.

- [ ] **Step 8: Commit**

```bash
git add -A package.json pnpm-lock.yaml eslint.config.js src
git commit -m "chore: enforce function style, curly braces, return padding and file size in ESLint"
```

---

### Task 6: Station uses the shared Button

**Files:**
- Modify: `src/components/ui/button.tsx` (add `size: 'none'`)
- Modify: `src/features/journey/Station.tsx`
- Test: `src/features/journey/JourneySection.test.tsx` (existing button tests must still pass)

**Interfaces:**
- Consumes: `Button` (`@/components/ui/button`)
- Produces: `buttonVariants` size `'none'` (no height/padding).

- [ ] **Step 1: Add `none` size**

In `buttonVariants.variants.size` add after `'icon-lg'`:

```ts
        none: '',
```

- [ ] **Step 2: Use `Button` in `Station.tsx`**

Add `import { Button } from '@/components/ui/button';`, delete the `// Claude:` comment, replace `<button type="button" …>` / `</button>` with:

```tsx
      <Button
        type="button"
        variant="ghost"
        size="none"
        onClick={onSelect}
        onFocus={onSelect}
        aria-current={isActive ? 'step' : undefined}
        className={cn(
          'flex h-auto w-44 flex-col gap-1 rounded-xl p-2 text-center font-normal whitespace-normal duration-500 hover:bg-transparent hover:text-inherit motion-reduce:transition-none dark:hover:bg-transparent',
          'focus-visible:ring-lime-200/60',
          isReached ? 'opacity-100' : 'opacity-60',
          isActive && 'scale-110 motion-reduce:scale-100',
        )}
      >
        …children unchanged…
      </Button>
```

Overrides explained: `flex` replaces `inline-flex`, `whitespace-normal` lets titles wrap inside `w-44`, `font-normal` replaces `font-medium`, `hover:bg-transparent` cancels the ghost hover fill, and the focus ring comes from `Button` (tinted lime). The old `focus-visible:outline-*` classes are dropped in favor of `Button`'s ring.

- [ ] **Step 3: Verify**

Run: `pnpm lint && pnpm typecheck && pnpm test`
Expected: PASS — `JourneySection.test` "shows a milestone when it is selected" still finds the station buttons by role.

Run: `pnpm build && pnpm test:e2e`
Expected: PASS (includes axe a11y scan).

Manual: `pnpm dev`, open the journey, check that station tiles look unchanged (wrapping titles, no hover background), and Tab shows a lime ring.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/button.tsx src/features/journey/Station.tsx
git commit -m "refactor: render journey stations with the shared Button"
```

---

### Task 7: `.claude/` rules, settings and `CLAUDE.md`

**Files:**
- Create: `CLAUDE.md`
- Create: `.claude/rules/code-style.md`, `.claude/rules/naming-structure.md`, `.claude/rules/react-ui.md`, `.claude/rules/workflow.md`
- Create: `.claude/settings.json`

**Interfaces:**
- Consumes: final structure from Tasks 1-6.
- Produces: docs only.

- [ ] **Step 1: `CLAUDE.md`**

````markdown
# Portfolio

Personal portfolio of Michael Uzan: a scroll-driven "Evolution of Me" journey over a
digital-rain background. Single page, static, deployed on Vercel.

## Stack

Vite · React 19 · TypeScript (strict) · Tailwind CSS 4 · shadcn/ui (`cva`, `cn`, radix-ui) ·
GSAP + `@gsap/react` (ScrollTrigger) · zod 4 · react-router 8 · Vitest + Testing Library ·
Playwright + axe · ESLint 9 (flat) + Prettier · pnpm · Husky + lint-staged.

## Structure

```
src/
  app/          root layout, route error boundary
  routes/       route paths (consts), route table (config), router tests
  pages/        lazy-loaded pages
  features/     feature folders (journey/) — components, hooks, local types/utils
  components/   shared components; ui/ = shadcn primitives
  hooks/        shared hooks
  content/      site content + zod schemas
  config/       behavior/tuning values (spacing, fps, breakpoints)
  consts/       values shown on the site (links, email)
  types/        types shared across the project
  utils/        pure shared functions
  lib/          third-party wrappers only
  test/         test setup and mocks
e2e/            Playwright specs
docs/superpowers/  specs and plans
```

## Commands

```
pnpm dev            dev server
pnpm lint           ESLint, zero warnings
pnpm typecheck      tsc -b
pnpm test           Vitest (unit + component)
pnpm test:e2e       Playwright (builds + previews)
pnpm build          production build
pnpm format         Prettier write
```

Run lint, typecheck and test before every commit (the pre-commit hook lints staged files).

## Rules

- [Code style](.claude/rules/code-style.md)
- [Naming & structure](.claude/rules/naming-structure.md)
- [React & UI](.claude/rules/react-ui.md)
- [Workflow](.claude/rules/workflow.md)
````

- [ ] **Step 2: `.claude/rules/code-style.md`**

````markdown
# Code style

## Functions

- Components (return JSX) are arrow consts:

  ```tsx
  export const Footer = () => {
    return <footer>…</footer>;
  };
  ```

- Module-level logic, utils and hooks are function declarations:

  ```ts
  export function round(value: number, decimals: number): number { … }
  export function useWindowSize(): WindowSize { … }
  ```

- Inline callbacks (`.map(x => …)`, `useEffect(() => …)`, event handlers) stay arrows.
- Long inline logic → extract named functions (`createJourneyTimeline`, `stationScrollTop`).
  A hook or component body should read as a short list of named steps.

## Formatting

- Always braces, even for one line:

  ```ts
  if (count <= 1) {
    return 0;
  }
  ```

  Never `if (count <= 1) return 0;`.

- One blank line before `return` (unless it is the first line of the block).
- Prettier owns everything else. Don't hand-format.

## Types

- Component Props may stay inline in the component file (one small interface).
- Every other type → a `.types.ts` file (see naming-structure.md).
- Prefer `interface` for object shapes, `type` for unions and aliases.

## Size

- Source files ≤ 200 lines, tests ≤ 300 (ESLint `max-lines`). Split before they sprawl.

## Enforced by ESLint

`curly`, `max-lines`, `@stylistic/padding-line-between-statements` (return),
`no-restricted-syntax` (function style). `pnpm lint` must pass with zero warnings.
````

- [ ] **Step 3: `.claude/rules/naming-structure.md`**

```markdown
# Naming & structure

## File suffixes

| Suffix | Holds | Example |
|---|---|---|
| `.types.ts` | types / interfaces | `MatrixRain.types.ts` |
| `.consts.ts` | values shown on the site: names, titles, links | `links.consts.ts` |
| `.config.ts` | behavior / tuning: spacing, fps, breakpoints, route table | `journey.config.ts` |
| `.utils.ts` | pure functions, no React | `math.utils.ts` |
| `.schemas.ts` | zod schemas | `journey.schemas.ts` |
| `.styles.ts` / `.variants.ts` | styles pulled out of a component | `Button.variants.ts` |
| `.test.ts(x)` | tests, next to the file under test | `rain.test.ts` |

Files in shared folders keep the suffix too: `src/config/journey.config.ts`.

## config vs consts

- config = how the site behaves: `MIN_STATION_SPACING_X = 260`, `MATRIX_RAIN.fps`, `DESKTOP_QUERY`.
- consts = what the site shows: `CONTACT_EMAIL`, `SOCIAL_LINKS`.

## Global vs local

- Used across the project → `src/types`, `src/consts`, `src/config`, `src/utils`.
- Used by one component/feature → next to it with the suffix.
- When a local file gains a second consumer elsewhere, move it to the global folder.
- `src/lib/` holds third-party wrappers only (`cn`).
- Say "utils", not "helpers".

## Folders

- A component gets its own folder once it has sibling files, with an `index.ts` re-export:

  components/MatrixRain/
    MatrixRain.tsx  MatrixRain.types.ts  rain.ts  rain.utils.ts  startRain.ts  rain.test.ts  index.ts

- Single-file components stay flat (`components/Footer.tsx`).
- Feature folders (`features/journey/`) stay flat inside; files carry suffixes.
- Routes live in `src/routes/` (`routes.consts.ts`, `routes.config.ts`).

## Styles

- Tailwind classes inline in the component by default.
- `cva` variants may stay in the component file while small.
- Once large or reused → `Component.variants.ts` / `Component.styles.ts`.

## Names

- Components and their folders: PascalCase (`StationCard.tsx`).
- Everything else: camelCase (`buildPath.ts`, `useJourneyTimeline.ts`).
- Constants: SCREAMING_SNAKE_CASE.
```

- [ ] **Step 4: `.claude/rules/react-ui.md`**

```markdown
# React & UI

## Primitives

- Clickable things use `Button` from `@/components/ui/button`. Card-like tiles use
  `variant="ghost" size="none"` and override layout with `className`.
- Add new primitives with the shadcn CLI into `src/components/ui/`.
- Merge classes with `cn` (`@/lib/utils`) — it resolves Tailwind conflicts.

## Accessibility

- Semantic elements first (`button`, `nav`, `ol`); `aria-*` only where semantics fall short.
- Decorative visuals get `aria-hidden="true"`.
- Changing content the user should hear → `aria-live="polite"`.
- Every interactive element is reachable by keyboard and has a visible focus ring.
- `pnpm test:e2e` runs an axe scan; it must stay clean.

## Motion

- GSAP only through `useGSAP` with `scope` and `revertOnUpdate` when inputs change.
- Respect `usePrefersReducedMotion()`: no scroll pinning or animation; show a static result.
- Canvas / rAF loops pause when the tab is hidden or the element is off-screen.

## Content

- Site content lives in `src/content/` and is validated by zod schemas in tests.
- Types for content come from `z.infer` of the schema — don't hand-write them.

## Hooks

- Shared hooks in `src/hooks/`; feature hooks inside the feature folder.
- Hook files hold orchestration; the steps go in `<hook>.utils.ts`.
```

- [ ] **Step 5: `.claude/rules/workflow.md`**

```markdown
# Workflow

1. Branch from `main`: `feat/…`, `fix/…`, `chore/…`, `refactor/…`.
2. Non-trivial work: spec in `docs/superpowers/specs/`, plan in `docs/superpowers/plans/`.
3. Write the failing test first for logic (utils, hooks, schemas).
4. Before committing: `pnpm lint && pnpm typecheck && pnpm test`.
   UI or animation changes: also `pnpm build && pnpm test:e2e`.
5. Commit with Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`).
   Never skip the pre-commit hook.
6. Open a PR to `main`; CI must be green before merge.

## Do

- Keep files ≤ 200 lines; split by responsibility.
- Reuse `src/utils`, `src/config`, `src/consts` before adding new values.
- Remove unused code, kinds and exports instead of keeping them "for later".

## Don't

- Don't add a dependency without a reason in the PR description.
- Don't hard-code tuning numbers in components — put them in `config/`.
- Don't put types, consts or utils in a component file (Props excepted).
- Don't use `eslint-disable` without a comment saying why.
```

- [ ] **Step 6: `.claude/settings.json`**

```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm lint)",
      "Bash(pnpm typecheck)",
      "Bash(pnpm test)",
      "Bash(pnpm test:*)",
      "Bash(pnpm build)",
      "Bash(pnpm format)",
      "Bash(pnpm format:check)",
      "Bash(pnpm vitest:*)",
      "Bash(pnpm eslint:*)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "f=$(jq -r '.tool_input.file_path // empty'); case \"$f\" in *.ts|*.tsx) cd \"$CLAUDE_PROJECT_DIR\" && pnpm exec eslint --fix \"$f\" >&2 || exit 2;; esac"
          }
        ]
      }
    ]
  }
}
```

(Exit code 2 sends ESLint's remaining errors back to Claude; files outside `*.ts(x)` are skipped.)

- [ ] **Step 7: Verify**

Run: `wc -l CLAUDE.md .claude/rules/*.md`
Expected: every file ≤ 100 lines.

Run: `jq . .claude/settings.json >/dev/null && echo ok`
Expected: `ok`.

Hook check: `echo '{"tool_input":{"file_path":"src/utils/math.utils.ts"}}' | CLAUDE_PROJECT_DIR=$PWD sh -c "$(jq -r '.hooks.PostToolUse[0].hooks[0].command' .claude/settings.json)"; echo "exit $?"`
Expected: `exit 0`.

- [ ] **Step 8: Commit**

```bash
git add CLAUDE.md .claude
git commit -m "docs: add CLAUDE.md, .claude rules, settings and eslint hook"
```

---

### Task 8: Cleanup and full verification

**Files:**
- Delete: `for-claude.txt`
- Modify: any file still containing a `// Claude:` / `// CLaude:` comment
- Modify: `docs/superpowers/specs/2026-11-23-code-rules-refactor-design.md` (mark implemented deviations, if any)

- [ ] **Step 1: Remove leftovers**

```bash
git rm -q for-claude.txt
grep -rniE "(//|\{/\*)\s*claude:" src e2e
```

Expected: grep prints nothing. If it prints lines, delete those comment lines and re-run.

- [ ] **Step 2: Size and structure checks**

```bash
find src -name '*.ts' -o -name '*.tsx' | xargs wc -l | sort -n | tail -5
ls src/consts src/config src/routes src/utils src/types src/components/MatrixRain
```

Expected: largest file < 200 lines; folders match the spec's target structure.

- [ ] **Step 3: Full verification**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e && pnpm format:check`
Expected: all pass.

- [ ] **Step 4: Commit and push**

```bash
git add -A
git commit -m "chore: remove review notes after applying them"
git push
```
