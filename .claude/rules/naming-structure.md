# Naming & structure

## File suffixes

| Suffix                        | Holds                                                     | Example               |
| ----------------------------- | --------------------------------------------------------- | --------------------- |
| `.types.ts`                   | types / interfaces                                        | `MatrixRain.types.ts` |
| `.consts.ts`                  | values shown on the site: names, titles, links            | `links.consts.ts`     |
| `.config.ts`                  | behavior / tuning: spacing, fps, breakpoints, route table | `journey.config.ts`   |
| `.utils.ts`                   | pure functions, no React                                  | `math.utils.ts`       |
| `.schemas.ts`                 | zod schemas                                               | `journey.schemas.ts`  |
| `.styles.ts` / `.variants.ts` | styles pulled out of a component                          | `Button.variants.ts`  |
| `.test.ts(x)`                 | tests, next to the file under test                        | `rain.test.ts`        |

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
  MatrixRain.tsx MatrixRain.types.ts rain.ts rain.utils.ts startRain.ts rain.test.ts index.ts

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
