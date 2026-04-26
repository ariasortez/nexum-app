# Repository Guidelines

## Project Structure & Module Organization
This repository is a `pnpm` workspace with two packages:
- `backend/`: Hono + TypeScript API (`src/routes`, `src/services`, `src/schemas`, `src/middleware`, `src/config`). Build output goes to `backend/dist`.
- `ui/`: Next.js App Router frontend (`src/app`, `src/components`, `src/hooks`, `src/lib`, `src/services`, `public`).

Shared workspace config lives at the repo root (`package.json`, `pnpm-workspace.yaml`). Environment setup for the API is documented in `backend/.env.example`.

## Build, Test, and Development Commands
Run from repository root unless noted:
- `pnpm install`: install all workspace dependencies.
- `pnpm dev:backend`: start backend in watch mode (`tsx watch src/index.ts`).
- `pnpm dev:ui`: start Next.js UI on port `3001`.
- `pnpm build`: build all packages (`pnpm -r build`).
- `pnpm lint`: run lint checks across workspace (`pnpm -r lint`).

Package-specific examples:
- `pnpm --filter backend start`: run built backend.
- `pnpm --filter backend db:types`: regenerate Supabase TS types.

## Coding Style & Naming Conventions
- Language: TypeScript across backend and UI with `strict` mode enabled.
- Indentation: 2 spaces; keep semicolon usage consistent with surrounding files.
- Naming: `kebab-case` for backend files (for example `auth.service.ts`), Next route files follow App Router conventions (`page.tsx`, `layout.tsx`), and React component exports use `PascalCase`.
- Linting: UI uses ESLint (`ui/eslint.config.mjs`, Next core-web-vitals + TypeScript rules). Run `pnpm lint` before opening a PR.

## Testing Guidelines
There is currently no committed automated test suite (`*test*` / `*spec*` files are absent). For new features:
- add tests alongside code (`*.test.ts` / `*.test.tsx`) or in a nearby `__tests__/` folder,
- include manual verification steps in the PR until a shared test runner is standardized,
- prioritize service-layer and route validation coverage in `backend`.

## Commit & Pull Request Guidelines
Git history is minimal (currently one seed commit: `Initial commit: Nexum backend setup`). Follow that style: short, imperative, descriptive subjects (optionally `area: summary`, e.g. `ui: add provider profile form validation`).

PRs should include:
- a clear summary of what changed and why,
- linked issue/task (if available),
- screenshots or short recordings for UI changes,
- notes for env/config updates (new variables, ports, or API contracts).
