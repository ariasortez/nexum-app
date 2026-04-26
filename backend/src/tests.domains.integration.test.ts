import test from 'node:test'
import assert from 'node:assert/strict'

process.env.PORT ??= '3000'
process.env.NODE_ENV ??= 'test'
process.env.SUPABASE_URL ??= 'https://example.supabase.co'
process.env.SUPABASE_ANON_KEY ??= 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY ??= 'test-service-role-key'
process.env.FRONTEND_URL ??= 'http://localhost:3001'

const appPromise = import('./app.js').then((m) => m.default)

type ErrorBody = {
  success: false
  error: {
    message: string
    code?: string
    details?: unknown
  }
}

async function expectErrorCode(
  method: 'GET' | 'POST',
  path: string,
  expectedStatus: number,
  expectedCode: string,
  body?: unknown
) {
  const app = await appPromise
  const res = await app.request(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  const payload = (await res.json()) as ErrorBody

  assert.equal(res.status, expectedStatus)
  assert.equal(payload.success, false)
  assert.equal(payload.error.code, expectedCode)
  assert.equal(typeof payload.error.message, 'string')
  assert.ok(payload.error.message.length > 0)
}

test('auth domain returns stable VALIDATION_ERROR code for invalid login payload', async () => {
  await expectErrorCode('POST', '/api/auth/login', 400, 'VALIDATION_ERROR', {})
})

test('requests domain returns stable VALIDATION_ERROR code for invalid query', async () => {
  await expectErrorCode('GET', '/api/requests?page=0', 400, 'VALIDATION_ERROR')
})

test('providers domain returns stable UNAUTHORIZED code without token', async () => {
  await expectErrorCode('GET', '/api/providers/me', 401, 'UNAUTHORIZED')
})

test('verification domain returns stable UNAUTHORIZED code without token', async () => {
  await expectErrorCode('GET', '/api/verification/documents', 401, 'UNAUTHORIZED')
})
