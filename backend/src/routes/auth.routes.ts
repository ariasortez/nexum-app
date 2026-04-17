import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../middleware/auth.js'
import {
  registerClientSchema,
  registerProviderSchema,
  loginSchema,
  resendConfirmationSchema,
} from '../schemas/index.js'
import * as authService from '../services/auth.service.js'
import type { Variables } from '../types/index.js'

const auth = new Hono<{ Variables: Variables }>()

auth.post('/register/client', zValidator('json', registerClientSchema), async (c) => {
  const input = c.req.valid('json')
  const result = await authService.registerClient(input)

  return c.json({
    success: true,
    data: result,
  }, 201)
})

auth.post('/register/provider', zValidator('json', registerProviderSchema), async (c) => {
  const input = c.req.valid('json')
  const result = await authService.registerProvider(input)

  return c.json({
    success: true,
    data: result,
  }, 201)
})

auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')
  const result = await authService.login(email, password)

  return c.json({
    success: true,
    data: result,
  })
})

auth.get('/me', requireAuth, async (c) => {
  const user = c.get('user')
  const result = await authService.getMe(user.id)

  return c.json({
    success: true,
    data: result,
  })
})

auth.post('/resend-confirmation', zValidator('json', resendConfirmationSchema), async (c) => {
  const { email } = c.req.valid('json')
  const result = await authService.resendConfirmation(email)

  return c.json({
    success: true,
    data: result,
  })
})

export default auth
