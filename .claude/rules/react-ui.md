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
