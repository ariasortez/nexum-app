import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth.js'
import {
  registerClientSchema,
  registerProviderSchema,
  loginSchema,
  resendConfirmationSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/index.js'
import * as authService from '../services/auth.service.js'
import type { Variables } from '../types/index.js'
import { ok } from '../lib/api-response.js'
import { validateJson } from '../lib/validators.js'
import { authErrors } from '../errors/auth.errors.js'
import { clearAuthCookies, readAccessTokenFromRequest, readRefreshTokenFromRequest, setAuthCookies } from '../lib/auth-cookies.js'

const auth = new Hono<{ Variables: Variables }>()

auth.post('/register/client', validateJson(registerClientSchema), async (c) => {
  const input = c.req.valid('json')
  const result = await authService.registerClient(input)
  return c.json(ok(result), 201)
})

auth.post('/register/provider', validateJson(registerProviderSchema), async (c) => {
  const input = c.req.valid('json')
  const result = await authService.registerProvider(input)
  return c.json(ok(result), 201)
})

auth.post('/login', validateJson(loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')
  const result = await authService.login(email, password)
  setAuthCookies(c, result)
  return c.json(ok(result))
})

auth.post('/refresh', async (c) => {
  let refreshToken = readRefreshTokenFromRequest(c)

  if (!refreshToken) {
    const body = await c.req.json().catch(() => null) as { refresh_token?: string } | null
    refreshToken = body?.refresh_token
  }

  if (!refreshToken) {
    throw authErrors.missingRefreshToken()
  }

  const result = await authService.refreshSession(refreshToken)
  setAuthCookies(c, result)
  return c.json(ok(result))
})

auth.post('/logout', async (c) => {
  const accessToken = readAccessTokenFromRequest(c)
  const result = await authService.logout(accessToken)
  clearAuthCookies(c)
  return c.json(ok(result))
})

auth.get('/me', requireAuth, async (c) => {
  const user = c.get('user')
  const result = await authService.getMe(user.id)
  return c.json(ok(result))
})

auth.patch('/me', requireAuth, validateJson(updateProfileSchema), async (c) => {
  const user = c.get('user')
  const input = c.req.valid('json')
  const result = await authService.updateProfile(user.id, input)
  return c.json(ok(result))
})

auth.post('/resend-confirmation', validateJson(resendConfirmationSchema), async (c) => {
  const { email } = c.req.valid('json')
  const result = await authService.resendConfirmation(email)
  return c.json(ok(result))
})

auth.post('/change-password', requireAuth, validateJson(changePasswordSchema), async (c) => {
  const user = c.get('user')
  const input = c.req.valid('json')
  const result = await authService.changePassword(user.id, input)
  return c.json(ok(result))
})

auth.post('/forgot-password', validateJson(forgotPasswordSchema), async (c) => {
  const { email } = c.req.valid('json')
  const result = await authService.forgotPassword(email)
  return c.json(ok(result))
})

auth.post('/reset-password', requireAuth, validateJson(resetPasswordSchema), async (c) => {
  const user = c.get('user')
  const { new_password } = c.req.valid('json')
  const result = await authService.resetPassword(user.id, new_password)
  return c.json(ok(result))
})

export default auth
