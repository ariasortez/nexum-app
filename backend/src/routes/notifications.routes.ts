import { Hono } from 'hono'
import { z } from 'zod'
import type { Variables } from '../types/index.js'
import { requireAuth } from '../middleware/auth.js'
import { ok } from '../lib/api-response.js'
import { readAccessTokenFromRequest } from '../lib/auth-cookies.js'
import { validateQuery } from '../lib/validators.js'
import * as notificationService from '../services/notification.service.js'
import { HTTPException } from 'hono/http-exception'

const notifications = new Hono<{ Variables: Variables }>()

const listNotificationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
})

notifications.get(
  '/',
  requireAuth,
  validateQuery(listNotificationsQuerySchema),
  async (c) => {
    const user = c.get('user')
    const query = c.req.valid('query')
    const data = await notificationService.listNotifications(user.id, query)
    return c.json(ok(data))
  }
)

notifications.get('/realtime-config', requireAuth, async (c) => {
  const accessToken = readAccessTokenFromRequest(c)
  if (!accessToken) {
    throw new HTTPException(401, { message: 'Missing authentication token' })
  }

  const data = notificationService.getRealtimeConfig(accessToken)
  return c.json(ok(data))
})

notifications.patch('/read-all', requireAuth, async (c) => {
  const user = c.get('user')
  const data = await notificationService.markAllNotificationsRead(user.id)
  return c.json(ok(data))
})

notifications.patch('/:id/read', requireAuth, async (c) => {
  const user = c.get('user')
  const notificationId = c.req.param('id')
  const data = await notificationService.markNotificationRead(user.id, notificationId)
  return c.json(ok(data))
})

export default notifications
