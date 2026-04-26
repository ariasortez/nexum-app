# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fixo is a full-stack marketplace platform for service requests. It's a pnpm monorepo with three packages:
- `backend/` - Hono + TypeScript API server (port 3000)
- `ui/` - Next.js 16 App Router frontend (port 3001)
- `packages/contracts/` - Shared TypeScript API response types

## Development Commands

From repository root:
```bash
pnpm install          # Install all workspace dependencies
pnpm dev:backend      # Start backend with hot reload
pnpm dev:ui           # Start Next.js frontend
pnpm build            # Build all packages
pnpm lint             # Run linters across workspace
```

From `backend/`:
```bash
pnpm test             # Run tests: node --import tsx --test src/**/*.test.ts
pnpm db:types         # Regenerate Supabase types to src/types/database.ts
```

## Architecture

### Backend Layer Structure

```
backend/src/
├── routes/           # HTTP route handlers (thin layer)
├── services/         # Business logic (throws AppError, never HTTPException)
├── repositories/     # Data access helpers for complex queries
├── schemas/          # Zod validation schemas
├── errors/           # Domain-specific error factories
├── middleware/       # Auth, error handling, validation
├── lib/              # Utilities (supabase client, response helpers)
├── types/            # TypeScript types (database.ts is auto-generated)
└── config/           # Environment validation
```

**Request flow**: Route → Validation middleware → Service → Repository/Supabase → Response helper

### Error Handling Pattern

Services throw domain errors from factory functions, never raw HTTPException:

```typescript
// In service
import { providerErrors } from '../errors/provider.errors.js'
if (!provider) throw providerErrors.profileNotFound()
```

All errors are caught by `middleware/error-handler.ts` and converted to:
```json
{
  "success": false,
  "error": { "message": "...", "code": "STABLE_CODE", "details": {} }
}
```

To add new domain errors: create/update `src/errors/<domain>.errors.ts` with factory functions returning `new AppError(status, message, code, details?)`.

### Authentication

- Middleware: `requireAuth`, `optionalAuth`, `requireRole(...roles)`
- Cookies: `fixo_access_token`, `fixo_refresh_token` (httpOnly, secure in prod)
- User context accessed via `c.get('user')` in routes

### Validation

Routes use Zod schemas with custom middleware:
```typescript
route.post('/', validateJson(createRequestSchema), async (c) => {
  const input = c.req.valid('json')  // Type-safe validated input
})
```

### API Response Helpers

```typescript
import { ok, okPaginated, okMessage } from '../lib/api-response.js'

return c.json(ok(data))
return c.json(okPaginated(items, pagination))
return c.json(okMessage('Success'))
```

### Shared Contracts

`packages/contracts/src/api.ts` exports response types used by both backend and UI:
- `ApiSuccessResponse<T>`, `ApiErrorResponse`, `ApiPaginatedResponse<T>`

### Database

- Supabase (managed PostgreSQL) via `@supabase/supabase-js`
- Types auto-generated: run `pnpm db:types` after schema changes
- Never edit `src/types/database.ts` directly

## Code Style

- TypeScript strict mode, 2-space indentation
- Backend files: `kebab-case` (e.g., `auth.service.ts`)
- React components: `PascalCase` exports
- Commit style: `area: summary` (e.g., `ui: add provider profile form`)

## Testing

Tests use Node's built-in test runner:
```bash
pnpm test  # from backend/
```

Test files: `*.test.ts` alongside source or in `__tests__/` folders.

Key test files:
- `src/tests.error-contract.test.ts` - Error response contract verification
- `src/tests.domains.integration.test.ts` - Route integration tests
