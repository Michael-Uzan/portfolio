# Portfolio

Michael Uzan's portfolio: React 19, TypeScript, Vite, GSAP, Tailwind. Deployed on Vercel.

## Scripts

| Command                              | What it does                       |
| ------------------------------------ | ---------------------------------- |
| `npm run dev`                        | Dev server                         |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript                |
| `npm test`                           | Vitest unit + component tests      |
| `npm run test:e2e`                   | Playwright e2e + axe accessibility |
| `npm run build`                      | Production build to `dist/`        |

## Content

Milestones live in `src/content/journey.ts`. Add one object, push, and Vercel redeploys.
`npm test` validates the content against the Zod schema.
