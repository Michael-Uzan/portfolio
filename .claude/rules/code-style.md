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
`curly` is re-enabled after `eslint-config-prettier`, which turns it off.
