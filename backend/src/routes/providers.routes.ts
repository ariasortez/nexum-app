import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import type { Variables } from '../types/index.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { updateProviderProfileSchema, createWorkPostSchema, updateWorkPostSchema } from '../schemas/index.js'
import * as providerService from '../services/provider.service.js'
import { ok, okMessage } from '../lib/api-response.js'
import { validateJson } from '../lib/validators.js'

const providers = new Hono<{ Variables: Variables }>()

providers.get('/me', requireAuth, requireRole('provider'), async (c) => {
  const user = c.get('user')
  const data = await providerService.getMyProviderProfile(user.id)
  return c.json(ok(data))
})

providers.patch(
  '/me',
  requireAuth,
  requireRole('provider'),
  validateJson(updateProviderProfileSchema),
  async (c) => {
    const user = c.get('user')
    const input = c.req.valid('json')
    const data = await providerService.updateProviderProfile(user.id, input)
    return c.json(ok(data))
  }
)

providers.get('/me/categories', requireAuth, requireRole('provider'), async (c) => {
  const user = c.get('user')
  const provider = await providerService.getProviderByUserId(user.id)
  const data = await providerService.getCategories(provider.id)
  return c.json(ok(data))
})

providers.put(
  '/me/categories',
  requireAuth,
  requireRole('provider'),
  validateJson(z.object({
    subcategory_ids: z.array(z.string().uuid()).min(1).max(10),
  })),
  async (c) => {
    const user = c.get('user')
    const { subcategory_ids } = c.req.valid('json')
    const provider = await providerService.getProviderByUserId(user.id)
    await providerService.updateCategories(provider.id, subcategory_ids)
    const data = await providerService.getCategories(provider.id)
    return c.json(ok(data))
  }
)

providers.get('/me/work-posts', requireAuth, requireRole('provider'), async (c) => {
  const user = c.get('user')
  const provider = await providerService.getProviderByUserId(user.id)
  const data = await providerService.getWorkPosts(provider.id)
  return c.json(ok(data))
})

providers.post(
  '/me/work-posts',
  requireAuth,
  requireRole('provider'),
  validateJson(createWorkPostSchema),
  async (c) => {
    const user = c.get('user')
    const input = c.req.valid('json')
    const provider = await providerService.getProviderByUserId(user.id)
    const data = await providerService.createWorkPost(provider.id, input)
    return c.json(ok(data), 201)
  }
)

providers.get('/me/work-posts/:id', requireAuth, requireRole('provider'), async (c) => {
  const user = c.get('user')
  const postId = c.req.param('id')
  const provider = await providerService.getProviderByUserId(user.id)
  const data = await providerService.getWorkPostById(postId)
  if (data.provider_id !== provider.id) {
    throw new HTTPException(403, { message: 'Not authorized' })
  }
  return c.json(ok(data))
})

providers.patch(
  '/me/work-posts/:id',
  requireAuth,
  requireRole('provider'),
  validateJson(updateWorkPostSchema),
  async (c) => {
    const user = c.get('user')
    const postId = c.req.param('id')
    const input = c.req.valid('json')
    const provider = await providerService.getProviderByUserId(user.id)
    const data = await providerService.updateWorkPost(provider.id, postId, input)
    return c.json(ok(data))
  }
)

providers.delete('/me/work-posts/:id', requireAuth, requireRole('provider'), async (c) => {
  const user = c.get('user')
  const postId = c.req.param('id')
  const provider = await providerService.getProviderByUserId(user.id)
  await providerService.deleteWorkPost(provider.id, postId)
  return c.json(okMessage('Work post deleted'))
})

providers.post(
  '/me/work-posts/upload-url',
  requireAuth,
  requireRole('provider'),
  validateJson(z.object({ file_name: z.string().min(1) })),
  async (c) => {
    const user = c.get('user')
    const { file_name } = c.req.valid('json')
    const provider = await providerService.getProviderByUserId(user.id)
    const data = await providerService.generateWorkPostUploadUrl(provider.id, file_name)
    return c.json(ok(data))
  }
)

export default providers
