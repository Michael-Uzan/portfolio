# Code Rules, ESLint & Refactor — Design

Date: 2026-11-23
Branch: `fix/code-review-and-rules-defintion`
Source: `for-claude.txt` + inline `// Claude:` review comments on this branch.

## Goal

Turn the review into enforced conventions (ESLint + `.claude/` rules), then refactor the
codebase to match. Behavior unchanged except removing the unused `course` / `award` station kinds.

## 1. Conventions

### Function style

- Components (anything containing JSX) → arrow const: `export const Footer = () => { … }`.
- Module-level plain logic, utils and hooks (no JSX) → `function name() {}`.
- Inline callbacks (`.map(x => …)`, `useEffect(() => …)`, `lazy: async () => …`) stay arrows.

### Formatting

- `curly: all` — always `{}` after `if` / `else` / `for` / `while`.
- One blank line before `return`, unless it is the first statement in its block.

### File size

- Source files ≤ 200 lines (blank lines and comments excluded); tests ≤ 300.
- `.claude/` files ≤ 100 lines.

### File suffixes

| Suffix | Holds |
|---|---|
| `.types.ts` | types / interfaces |
| `.consts.ts` | values shown on the site (names, titles, links) |
| `.config.ts(x)` | behavior / tuning (spacing, fps, breakpoints, route table) |
| `.utils.ts` | pure functions, no React |
| `.schemas.ts` | zod schemas |
| `.styles.ts` / `.variants.ts` | styles extracted once they grow large or are reused |
| `.test.ts(x)` | tests |

- Small component Props may stay inline in the component file. Anything more → `.types.ts`.
- Styles (e.g. `cva` variants) may stay inline while small.
- Shared-folder files also take the suffix: `config/journey.config.ts`, `consts/links.consts.ts`.

### Placement

- Used across the project → `src/types`, `src/consts`, `src/config`, `src/utils`.
- Used by one feature/component → next to it, with the suffix.
- `src/lib/` → third-party wrappers only (`cn`).
- "utils" is the only term (no "helpers").
- A component gets its own folder (with `index.ts` re-export) once it has sibling files;
  single-file components stay flat. Feature folders (`features/journey/`) stay flat inside.

### UI

- Interactive buttons use `components/ui/button` (`Button`), including card-like tiles via
  `variant="ghost" size="none"`.

## 2. ESLint (`eslint.config.js`)

Add dev dependency `@stylistic/eslint-plugin`. Rules for `**/*.{ts,tsx}` (no `ui/` exemption):

```js
curly: ['error', 'all'],
'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
'@stylistic/padding-line-between-statements': ['error',
  { blankLine: 'always', prev: '*', next: 'return' },
],
'no-restricted-syntax': ['error',
  {
    selector: 'FunctionDeclaration:has(JSXElement), FunctionDeclaration:has(JSXFragment)',
    message: 'Components use arrow functions: export const X = () => …',
  },
  {
    selector: ':matches(Program, ExportNamedDeclaration) > VariableDeclaration > VariableDeclarator > ArrowFunctionExpression:not(:has(JSXElement)):not(:has(JSXFragment))',
    message: 'Plain logic/utils/hooks use `function name() {}`.',
  },
],
```

Override for `**/*.test.{ts,tsx}`: `max-lines` 300.

File-suffix and type-placement rules are not linted (documented in `.claude/rules`).

## 3. Target structure

```
src/
  config/
    journey.config.ts        spacing, bulge, path ratios, scrub, viewports-per-station
    matrixRain.config.ts     MATRIX_RAIN (fps, fade, depths, colors)
    breakpoints.config.ts    DESKTOP_QUERY, REDUCED_MOTION_QUERY
  consts/
    links.consts.ts          SOCIAL_LINKS, CONTACT_EMAIL
  routes/
    routes.consts.ts         ROUTES paths
    routes.config.tsx        RouteObject[] (from app/router.tsx)
    routes.test.tsx          (from app/router.test.tsx)
  types/
    journey.types.ts         JourneyStation, StationKind (shared with content/)
    profile.types.ts
    random.types.ts          Random, Range
  utils/
    random.utils.ts (+test)  between, intBetween, randomDigit
    math.utils.ts (+test)    round, clamp
  content/
    journey.schemas.ts       (from schemas.ts; kinds: degree, role, project)
  components/
    MatrixRain/
      MatrixRain.tsx         component + effect only
      MatrixRain.types.ts    RainState, RainColumn, RainDepth, CreateRainOptions, StepRainOptions
      rain.ts                buildCluster, layoutColumns, createRain, stepRain
      rain.utils.ts          drawFrame
      rain.test.ts
      index.ts
  features/journey/
    journeyLayout.types.ts   feature-only types: PathPoint, JourneyGeometry, buildPath Canvas, …
    useJourneyTimeline.ts    short orchestration
    useJourneyTimeline.utils.ts  named steps (createScrollTrigger, updateActiveStation, …)
    …existing files
```

`app/` keeps `RootLayout` and `RouteErrorBoundary`. `src/consts/animation.ts`,
`breakpoints.ts`, `routes.ts`, `src/types/journey.ts`, `src/types/matrixRain.ts` are removed.
`src/types/journey.ts` splits: types used by `content/` stay global; the rest move into the feature.

## 4. Code changes

| Where | Change |
|---|---|
| all files | arrow components, `function` logic, `curly`, blank line before `return` |
| `ui/button.tsx` | arrow + named `ButtonProps`; add `size: 'none'` |
| `Station.tsx` | native `<button>` → `<Button variant="ghost" size="none">` |
| `stationIcons.ts` + schema | remove `course`, `award` |
| `useJourneyTimeline.ts` | split into named functions in `.utils.ts` |
| `MatrixRain.tsx` | extract `drawFrame`, types; keep component lean |
| `for-claude.txt`, `// Claude:` comments | removed |

## 5. `.claude/` (each ≤ 100 lines)

```
CLAUDE.md                    repo root: purpose, stack, folder map, commands, links to rules
.claude/
  rules/code-style.md        function style, curly, return padding, inline props, named extraction, file size
  rules/naming-structure.md  suffix table, config vs consts, placement, folder-per-component
  rules/react-ui.md          ui/button + shadcn, a11y, useGSAP + reduced motion, zod content
  rules/workflow.md          branch, conventional commits, lint/typecheck/test before commit, PR to main
  settings.json              allow pnpm lint/typecheck/test/build/format + eslint;
                             PostToolUse (Edit|Write) hook → pnpm eslint --fix <file>
```

No commands, agents or skills for now.

## 6. Rollout (separate commits)

1. This spec.
2. ESLint config + `@stylistic/eslint-plugin` (lint fails until step 4).
3. File moves/renames, imports fixed (typecheck + tests green).
4. Code changes + `eslint --fix` until lint is clean.
5. `.claude/` + `CLAUDE.md`.
6. Remove `for-claude.txt` and `// Claude:` comments.

## 7. Verification

`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm build` all pass.
Journey + matrix rain render and animate as before (desktop, mobile, reduced motion).
