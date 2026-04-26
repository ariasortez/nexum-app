# Backend

## Quick Start
```bash
pnpm install
pnpm dev
```

API base: `http://localhost:3000/api`

## Scripts
- `pnpm dev`: run API in watch mode (`tsx watch src/index.ts`).
- `pnpm build`: compile TypeScript to `dist/`.
- `pnpm start`: run compiled server.
- `pnpm test`: run backend tests (`node --import tsx --test src/**/*.test.ts`).
- `pnpm db:types`: regenerate Supabase DB types.

## Shared API Contracts
Shared response contracts live in `packages/contracts/src/api.ts` and are consumed by both backend and UI.

Main contracts:
- `ApiSuccessResponse<T>`
- `ApiPaginatedResponse<T>`
- `ApiSuccessMessageResponse`
- `ApiErrorResponse`

## Error Handling Convention
All API errors must follow this contract:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable message",
    "code": "STABLE_MACHINE_CODE",
    "details": {}
  }
}
```

Rules:
- In `services`, throw domain factories from `src/errors/*.errors.ts`.
- Do not throw `HTTPException` from services.
- `error-handler.ts` is the only place that maps errors to HTTP responses.
- Use stable `code` values for client logic and analytics.

Example (service):
```ts
import { providerErrors } from '../errors/provider.errors.js'

if (!provider) {
  throw providerErrors.profileNotFound()
}
```

## Adding New Domain Errors
1. Create/update `src/errors/<domain>.errors.ts`.
2. Export factory functions returning `new AppError(status, message, code, details?)`.
3. Use those factories in services instead of hardcoded status/messages.

## Integration Tests
Route-level contract tests live in:
- `src/tests.error-contract.test.ts`
- `src/tests.domains.integration.test.ts`

These verify stable `error.code` behavior for auth/requests/providers/verification entry points.
