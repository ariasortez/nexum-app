import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import {
  createServiceRequestSchema,
  updateServiceRequestSchema,
  paginationSchema,
} from '../schemas/index.js'
import * as requestService from '../services/request.service.js'
import type { Variables } from '../types/index.js'

const requests = new Hono<{ Variables: Variables }>()

const listQuerySchema = paginationSchema.extend({
  status: z.string().optional(),
  subcategory_id: z.string().uuid().optional(),
  department_id: z.string().uuid().optional(),
  municipality_id: z.string().uuid().optional(),
})

requests.get('/', zValidator('query', listQuerySchema), async (c) => {
  const query = c.req.valid('query')
  const result = await requestService.listRequests(query)

  return c.json({
    success: true,
    ...result,
  })
})

requests.get('/:id', async (c) => {
  const id = c.req.param('id')
  const data = await requestService.getRequestById(id)

  return c.json({
    success: true,
    data,
  })
})

requests.post('/', requireAuth, zValidator('json', createServiceRequestSchema), async (c) => {
  const user = c.get('user')
  const input = c.req.valid('json')
  const data = await requestService.createRequest(user.id, input)

  return c.json({
    success: true,
    data,
  }, 201)
})

requests.patch('/:id', requireAuth, zValidator('json', updateServiceRequestSchema), async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const input = c.req.valid('json')
  const data = await requestService.updateRequest(id, user.id, input)

  return c.json({
    success: true,
    data,
  })
})

requests.delete('/:id', requireAuth, async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  await requestService.deleteRequest(id, user.id)

  return c.json({
    success: true,
    message: 'Request deleted',
  })
})

export default requests
