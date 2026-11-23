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
