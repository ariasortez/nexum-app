import { Hono } from 'hono'
import { z } from 'zod'
import { requireAuth, requireRole } from '../middleware/auth.js'
import {
  createServiceRequestSchema,
  updateServiceRequestSchema,
  paginationSchema,
} from '../schemas/index.js'
import * as requestService from '../services/request.service.js'
import type { Variables } from '../types/index.js'
import { ok, okMessage, okPaginated } from '../lib/api-response.js'
import { validateJson, validateQuery } from '../lib/validators.js'

const requests = new Hono<{ Variables: Variables }>()

const listQuerySchema = paginationSchema.extend({
  status: z.string().optional(),
  subcategory_id: z.string().uuid().optional(),
  department_id: z.string().uuid().optional(),
  municipality_id: z.string().uuid().optional(),
})

requests.get('/', validateQuery(listQuerySchema), async (c) => {
  const query = c.req.valid('query')
  const result = await requestService.listRequests(query)

  return c.json(okPaginated(result.data, result.pagination))
})

requests.get('/me', requireAuth, requireRole('client'), validateQuery(listQuerySchema), async (c) => {
  const user = c.get('user')
  const query = c.req.valid('query')
  const result = await requestService.listClientRequests(user.id, query)

  return c.json(okPaginated(result.data, result.pagination))
})

requests.get('/:id', requireAuth, async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const data = await requestService.getRequestById(id, user)

  return c.json(ok(data))
})

const uploadUrlSchema = z.object({
  file_name: z.string().min(1),
})

requests.post('/upload-url', requireAuth, requireRole('client'), validateJson(uploadUrlSchema), async (c) => {
  const user = c.get('user')
  const { file_name } = c.req.valid('json')
  const data = await requestService.generatePhotoUploadUrl(user.id, file_name)

  return c.json(ok(data))
})

requests.post('/', requireAuth, requireRole('client'), validateJson(createServiceRequestSchema), async (c) => {
  const user = c.get('user')
  const input = c.req.valid('json')
  const data = await requestService.createRequest(user.id, input)

  return c.json(ok(data), 201)
})

requests.patch('/:id', requireAuth, requireRole('client'), validateJson(updateServiceRequestSchema), async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const input = c.req.valid('json')
  const data = await requestService.updateRequest(id, user.id, input)

  return c.json(ok(data))
})

requests.delete('/:id', requireAuth, requireRole('client'), async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  await requestService.deleteRequest(id, user.id)

  return c.json(okMessage('Request deleted'))
})

requests.post('/:id/responses/:responseId/accept', requireAuth, requireRole('client'), async (c) => {
  const user = c.get('user')
  const requestId = c.req.param('id')
  const responseId = c.req.param('responseId')
  const data = await requestService.acceptQuotation(user.id, requestId, responseId)

  return c.json(ok(data))
})

requests.post('/:id/responses/:responseId/reject', requireAuth, requireRole('client'), async (c) => {
  const user = c.get('user')
  const requestId = c.req.param('id')
  const responseId = c.req.param('responseId')
  const data = await requestService.rejectQuotation(user.id, requestId, responseId)

  return c.json(ok(data))
})

export default requests
