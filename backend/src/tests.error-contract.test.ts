import test from 'node:test'
import assert from 'node:assert/strict'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { errorHandler } from './middleware/error-handler.js'
import { AppError } from './lib/app-error.js'

function createAppWithError(errorFactory: () => Error) {
  const app = new Hono()
  app.onError(errorHandler)
  app.get('/boom', () => {
    throw errorFactory()
  })
  return app
}

test('maps HTTPException to standard error contract', async () => {
  const app = createAppWithError(() => new HTTPException(403, { message: 'Forbidden' }))

  const res = await app.request('/boom')
  const body = await res.json()

  assert.equal(res.status, 403)
  assert.equal(body.success, false)
  assert.equal(body.error.message, 'Forbidden')
  assert.equal(body.error.code, 'FORBIDDEN')
})

test('maps AppError with explicit code/details', async () => {
  const app = createAppWithError(
    () => new AppError(404, 'Provider profile not found', 'PROVIDER_PROFILE_NOT_FOUND', { provider_id: 'p1' })
  )

  const res = await app.request('/boom')
  const body = await res.json()

  assert.equal(res.status, 404)
  assert.equal(body.success, false)
  assert.equal(body.error.message, 'Provider profile not found')
  assert.equal(body.error.code, 'PROVIDER_PROFILE_NOT_FOUND')
  assert.deepEqual(body.error.details, { provider_id: 'p1' })
})

test('maps unexpected errors to INTERNAL_SERVER_ERROR', async () => {
  const app = createAppWithError(() => new Error('Unexpected failure'))

  const res = await app.request('/boom')
  const body = await res.json()

  assert.equal(res.status, 500)
  assert.equal(body.success, false)
  assert.equal(body.error.code, 'INTERNAL_SERVER_ERROR')
  assert.ok(typeof body.error.message === 'string' && body.error.message.length > 0)
})
