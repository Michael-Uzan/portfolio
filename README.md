# Portfolio

Michael Uzan's portfolio: React 19, TypeScript, Vite, GSAP, Tailwind. Deployed on Vercel.

## Requirements

Node >= 22.22 and pnpm 10.

## Scripts

| Command                        | What it does                       |
| ------------------------------ | ---------------------------------- |
| `pnpm install`                 | Install dependencies               |
| `pnpm dev`                     | Dev server                         |
| `pnpm lint` / `pnpm typecheck` | ESLint / TypeScript                |
| `pnpm test`                    | Vitest unit + component tests      |
| `pnpm test:e2e`                | Playwright e2e + axe accessibility |
| `pnpm build`                   | Production build to `dist/`        |

## Content

Milestones live in `src/content/journey.ts`. Add one object, push, and Vercel redeploys.
`pnpm test` validates the content against the Zod schema.
