# Portfolio Website — Foundation + Journey Section

## Context
Michael wants a personal portfolio (projects, CV, GitHub/LinkedIn links) that doubles as proof of modern frontend skill: React 19, TypeScript, testing, a11y, CI, Vercel deploy. Signature first section: a "journey" scene like the deltacafes.com "Journey of Coffee" screenshot — fullscreen looping background video, big title, an SVG route that loops across the screen with stations (icon + label). Here the stations are career milestones (B.Sc. 2016, Intel, Storyball 2019, Leverate, courses...). More sections (Projects, CV, Contact) come later, each with its own spec → plan cycle.

Decisions made in brainstorming:
- **Tech scope:** only tech the site really needs. Auth/Redux/GraphQL are shown through project cards, not forced into the site.
- **Framework:** Vite + React Router (Michael knows React well; Next adds concepts with little benefit here). Static SPA, no backend.
- **Data:** typed TS files in `src/content/` + Zod schemas, validated in a test.
- **Animation:** scroll-driven, pinned section (GSAP ScrollTrigger).
- **Video:** one muted loop (~10s, free stock clip, WebM+MP4+poster, 2-4MB).
- **Structure:** `/` long home page of stacked sections; later `/projects/:slug` and `/cv` as lazy routes.
- **Tests:** Vitest (Jest-compatible API) + RTL + Playwright. Not Jest itself.
- **Folders:** dedicated `src/consts/` and `src/types/` (Michael's request).
- Files kept ~200 lines max (standing preference).

## Location
New repo: `/Users/looply/Documents/code-projects/portfolio/` (git init, GitHub remote `Michael-Uzan/portfolio`).

## Stack
| Layer | Choice |
|---|---|
| Core | React 19, TypeScript strict, Vite |
| Routing | React Router data mode (`createBrowserRouter`), `lazy()` routes |
| Styling | Tailwind CSS v4, shadcn/ui |
| Animation | `gsap` + ScrollTrigger + `@gsap/react` (`useGSAP`) |
| Validation | Zod |
| Fonts | Fontsource, self-hosted (condensed display font + text font) |
| Icons | lucide-react (station-kind icons) |
| Tests | Vitest + jsdom + React Testing Library; Playwright + @axe-core/playwright |
| Quality | ESLint flat config (typescript-eslint strict, react-hooks, jsx-a11y), Prettier, Husky + lint-staged |
| CI | GitHub Actions: lint → typecheck → unit → build → Playwright → Lighthouse CI |
| Deploy | Vercel Git integration; `vercel.json` SPA rewrite to `/index.html` |
| SEO | React 19 native `<title>/<meta>` in pages; static OG/Twitter tags + `robots.txt` + `sitemap.xml` in `public/` |

No Docker. A static site has nothing to containerize.

## Folder layout
```
src/
  app/          router.tsx, RootLayout.tsx, RouteErrorBoundary.tsx
  consts/       routes.ts, links.ts, animation.ts, breakpoints.ts
  types/        journey.ts, profile.ts         (z.infer from schemas)
  content/      schemas.ts, journey.ts, profile.ts
  features/journey/
                JourneySection.tsx, JourneyPath.tsx, Station.tsx, StationCard.tsx,
                buildPath.ts, useJourneyTimeline.ts, stationIcons.ts
  components/   ui/ (shadcn), Navbar.tsx, Footer.tsx, BackgroundVideo.tsx
  hooks/        usePrefersReducedMotion.ts, useMediaQuery.ts
  pages/        HomePage.tsx, NotFoundPage.tsx
public/media/   journey.webm, journey.mp4, journey-poster.jpg
e2e/            journey.spec.ts, a11y.spec.ts
```
Rule: a type or const used in 2+ places goes in `types/` / `consts/`. Types come from Zod schemas so they never drift.

## Data model
```ts
// content/schemas.ts
export const stationKind = z.enum(['degree', 'role', 'course', 'project', 'award']);
export const journeyStationSchema = z.object({
  id: z.string(), year: z.number().int(), kind: stationKind,
  title: z.string(), org: z.string(), summary: z.string(),
  link: z.string().url().optional(),
});
// types/journey.ts
export type JourneyStation = z.infer<typeof journeyStationSchema>;
// content/journey.ts
export const journey = [ { id: 'bsc', year: 2016, kind: 'degree', ... }, ... ] satisfies JourneyStation[];
```
Adding a milestone = adding one object. The path rebuilds from the data.

## Journey section mechanics
**Layers:** BackgroundVideo (autoplay/muted/loop/playsInline/poster, dark gradient overlay for AA contrast, paused on reduced-motion or hidden tab) → title → SVG route + stations → active-station detail card.

**`buildPath.ts` (pure, unit-tested):** `(count, width, height, layout) → { d, points[] }`.
- Desktop: stations evenly spaced left→right; cubic Béziers between them loop alternately up and down (the serpentine in the screenshot). More than ~6 stations → SVG wider than the screen and the scene pans horizontally on the same timeline.
- Mobile (<768px): vertical wiggle path, stations stacked.

**`useJourneyTimeline.ts`:** ScrollTrigger pin (desktop only), scroll length = `count × 100vh`, `scrub`. Path draws via `strokeDashoffset`. Each station activates at its point's share of the path length: icon draws in, glow, detail card fades up. Dashed "future" path drawn faint ahead of the line. `useGSAP` handles cleanup; rebuild on resize.

**Mobile:** no pin; path draws as you scroll normally.

**A11y:** stations are also rendered as a semantic `<ol>` of text (SVG `aria-hidden`). Stations are keyboard-focusable and show their card on focus. Reduced motion → full path, no pin, all stations visible.

## Implementation order
1. Scaffold: `npm create vite@latest` (react-ts), TS strict, path alias `@/`, git init, `.gitignore`.
2. Tooling: ESLint flat config, Prettier, Husky + lint-staged, npm scripts (`lint`, `typecheck`, `test`, `test:e2e`, `build`).
3. Tailwind v4 + shadcn init, fonts, base theme tokens.
4. Router + RootLayout + Navbar/Footer + RouteErrorBoundary + NotFoundPage; `consts/routes.ts`, `consts/links.ts`.
5. Content layer: `schemas.ts`, `types/`, `journey.ts` with Michael's real milestones (from profile: B.Sc. ME Ben-Gurion 2016, Intel Mechanical Project Engineer, Storyball 2019, Leverate). Schema test.
6. `buildPath.ts` with tests first (TDD).
7. Static JourneySection: video, title, SVG path, stations, `<ol>` fallback. RTL test.
8. `useJourneyTimeline` GSAP animation + reduced-motion + mobile variant.
9. SEO: meta in HomePage, OG tags, robots/sitemap, favicon.
10. Playwright e2e + axe; GitHub Actions workflow; Lighthouse CI config with budgets.
11. Vercel: connect repo, `vercel.json` rewrite, verify preview deploy.

After approval: write spec to `docs/superpowers/specs/2026-11-21-portfolio-journey-design.md` in the new repo, commit, then the writing-plans skill expands this into detailed tasks. Also save a memory: Michael wants `consts/` + `types/` folders in frontend repos.

## Verification
- `npm run lint && npm run typecheck && npm test` all green.
- `npm run dev`: scroll through Journey on desktop (pins, path draws, stations activate in order) and in DevTools mobile view (no pin, vertical path).
- OS "reduce motion" on → static full journey.
- `npm run test:e2e`: Playwright passes, axe reports 0 violations.
- Lighthouse (CI + manual): perf ≥ 90; a11y, SEO, best-practices = 100.
- Vercel preview URL loads; deep link `/does-not-exist` shows NotFoundPage (rewrite works).
