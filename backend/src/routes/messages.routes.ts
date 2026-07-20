import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { Variables } from '../types/index.js'
import { requireAuth } from '../middleware/auth.js'
import { ok } from '../lib/api-response.js'
import { readAccessTokenFromRequest } from '../lib/auth-cookies.js'
import { validateJson, validateQuery } from '../lib/validators.js'
import {
  createConversationMessageSchema,
  listConversationMessagesQuerySchema,
  listConversationsQuerySchema,
  signConversationAttachmentSchema,
} from '../schemas/message.schema.js'
import * as messageService from '../services/message.service.js'

const messages = new Hono<{ Variables: Variables }>()

messages.get(
  '/conversations',
  requireAuth,
  validateQuery(listConversationsQuerySchema),
  async (c) => {
    const user = c.get('user')
    const query = c.req.valid('query')
    const data = await messageService.listConversations(user.id, query)
    return c.json(ok(data))
  }
)

messages.get('/realtime-config', requireAuth, async (c) => {
  const accessToken = readAccessTokenFromRequest(c)
  if (!accessToken) {
    throw new HTTPException(401, { message: 'Missing authentication token' })
  }

  const data = messageService.getRealtimeConfig(accessToken)
  return c.json(ok(data))
})

messages.get(
  '/conversations/:id/messages',
  requireAuth,
  validateQuery(listConversationMessagesQuerySchema),
  async (c) => {
    const user = c.get('user')
    const conversationId = c.req.param('id')
    const query = c.req.valid('query')
    const data = await messageService.listConversationMessages(user.id, conversationId, query)
    return c.json(ok(data))
  }
)

messages.post(
  '/conversations/:id/messages',
  requireAuth,
  validateJson(createConversationMessageSchema),
  async (c) => {
    const user = c.get('user')
    const conversationId = c.req.param('id')
    const input = c.req.valid('json')
    const accessToken = readAccessTokenFromRequest(c)
    if (!accessToken) {
      throw new HTTPException(401, { message: 'Missing authentication token' })
    }
    const data = await messageService.createConversationMessage(user.id, conversationId, input, accessToken)
    return c.json(ok(data), 201)
  }
)

messages.post(
  '/conversations/:id/attachments/sign',
  requireAuth,
  validateJson(signConversationAttachmentSchema),
  async (c) => {
    const user = c.get('user')
    const conversationId = c.req.param('id')
    const input = c.req.valid('json')
    const accessToken = readAccessTokenFromRequest(c)
    if (!accessToken) {
      throw new HTTPException(401, { message: 'Missing authentication token' })
    }
    const data = await messageService.createAttachmentUpload(user.id, conversationId, input, accessToken)
    return c.json(ok(data), 201)
  }
)

messages.post('/conversations/:id/attachments/:attachmentId/complete', requireAuth, async (c) => {
  const user = c.get('user')
  const conversationId = c.req.param('id')
  const attachmentId = c.req.param('attachmentId')
  const accessToken = readAccessTokenFromRequest(c)
  if (!accessToken) {
    throw new HTTPException(401, { message: 'Missing authentication token' })
  }
  const data = await messageService.completeAttachmentUpload(user.id, conversationId, attachmentId, accessToken)
  return c.json(ok(data))
})

messages.patch('/conversations/:id/read', requireAuth, async (c) => {
  const user = c.get('user')
  const conversationId = c.req.param('id')
  const accessToken = readAccessTokenFromRequest(c)
  if (!accessToken) {
    throw new HTTPException(401, { message: 'Missing authentication token' })
  }
  const data = await messageService.markConversationRead(user.id, conversationId, accessToken)
  return c.json(ok(data))
})

export default messages
