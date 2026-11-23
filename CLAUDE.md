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
