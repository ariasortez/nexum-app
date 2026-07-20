import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import type { Variables } from '../types/index.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import {
  updateProviderProfileSchema,
  createWorkPostSchema,
  updateWorkPostSchema,
  createCertificationSchema,
  updateCertificationSchema,
  paginationSchema,
} from '../schemas/index.js'
import * as providerService from '../services/provider.service.js'
import * as requestService from '../services/request.service.js'
import { ok, okMessage, okPaginated } from '../lib/api-response.js'
import { validateJson, validateQuery } from '../lib/validators.js'

const providers = new Hono<{ Variables: Variables }>()

const createProviderResponseBodySchema = z.object({
  message: z.string().min(10).max(1000),
  estimated_price: z.coerce.number().positive(),
})

const providerResponsesQuerySchema = paginationSchema.extend({
  status: z.enum(['pending', 'accepted', 'rejected', 'completed', 'cancelled']).optional(),
})

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

providers.get(
  '/me/requests/available',
  requireAuth,
  requireRole('provider'),
  validateQuery(paginationSchema),
  async (c) => {
    const user = c.get('user')
    const query = c.req.valid('query')
    const result = await requestService.listAvailableRequestsForProvider(user.id, query)
    return c.json(okPaginated(result.data, result.pagination))
  }
)

providers.get('/me/requests/available/:id', requireAuth, requireRole('provider'), async (c) => {
  const user = c.get('user')
  const requestId = c.req.param('id')
  const data = await requestService.getAvailableRequestForProvider(user.id, requestId)
  return c.json(ok(data))
})

providers.post(
  '/me/requests/available/:id/responses',
  requireAuth,
  requireRole('provider'),
  validateJson(createProviderResponseBodySchema),
  async (c) => {
    const user = c.get('user')
    const requestId = c.req.param('id')
    const input = {
      ...c.req.valid('json'),
      request_id: requestId,
    }
    const data = await requestService.createProviderResponse(user.id, requestId, input)
    return c.json(ok(data), 201)
  }
)

providers.get(
  '/me/responses',
  requireAuth,
  requireRole('provider'),
  validateQuery(providerResponsesQuerySchema),
  async (c) => {
    const user = c.get('user')
    const query = c.req.valid('query')
    const result = await requestService.listProviderResponses(user.id, query)
    return c.json(okPaginated(result.data, result.pagination))
  }
)

providers.get('/me/responses/:id', requireAuth, requireRole('provider'), async (c) => {
  const user = c.get('user')
  const responseId = c.req.param('id')
  const data = await requestService.getProviderResponseById(user.id, responseId)
  return c.json(ok(data))
})

providers.post('/me/responses/:id/cancel', requireAuth, requireRole('provider'), async (c) => {
  const user = c.get('user')
  const responseId = c.req.param('id')
  await requestService.cancelProviderResponse(user.id, responseId)
  return c.json(okMessage('Response cancelled successfully'))
})

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

// ==================== CERTIFICATIONS ====================

providers.get('/me/certifications', requireAuth, requireRole('provider'), async (c) => {
  const user = c.get('user')
  const provider = await providerService.getProviderByUserId(user.id)
  const data = await providerService.getCertifications(provider.id)
  return c.json(ok(data))
})

providers.post(
  '/me/certifications',
  requireAuth,
  requireRole('provider'),
  validateJson(createCertificationSchema),
  async (c) => {
    const user = c.get('user')
    const input = c.req.valid('json')
    const provider = await providerService.getProviderByUserId(user.id)
    const data = await providerService.createCertification(provider.id, input)
    return c.json(ok(data), 201)
  }
)

providers.patch(
  '/me/certifications/:id',
  requireAuth,
  requireRole('provider'),
  validateJson(updateCertificationSchema),
  async (c) => {
    const user = c.get('user')
    const certificationId = c.req.param('id')
    const input = c.req.valid('json')
    const provider = await providerService.getProviderByUserId(user.id)
    const data = await providerService.updateCertification(provider.id, certificationId, input)
    return c.json(ok(data))
  }
)

providers.delete('/me/certifications/:id', requireAuth, requireRole('provider'), async (c) => {
  const user = c.get('user')
  const certificationId = c.req.param('id')
  const provider = await providerService.getProviderByUserId(user.id)
  await providerService.deleteCertification(provider.id, certificationId)
  return c.json(okMessage('Certification deleted'))
})

providers.post(
  '/me/certifications/upload-url',
  requireAuth,
  requireRole('provider'),
  validateJson(z.object({ file_name: z.string().min(1) })),
  async (c) => {
    const user = c.get('user')
    const { file_name } = c.req.valid('json')
    const provider = await providerService.getProviderByUserId(user.id)
    const data = await providerService.generateCertificationUploadUrl(provider.id, file_name)
    return c.json(ok(data))
  }
)

// ==================== PUBLIC PROFILE ====================

providers.get('/:slug', async (c) => {
  const slug = c.req.param('slug')
  const profile = await providerService.getPublicProfileBySlug(slug)

  const [workPosts, certifications, reviewsResult] = await Promise.all([
    providerService.getPublicWorkPosts(profile.id),
    providerService.getPublicCertifications(profile.id),
    providerService.getPublicReviews(profile.id, 10, 0),
  ])

  return c.json(ok({
    profile,
    work_posts: workPosts,
    certifications,
    reviews: reviewsResult.data,
    reviews_pagination: reviewsResult.pagination,
  }))
})

providers.get('/:slug/work-posts', validateQuery(paginationSchema), async (c) => {
  const slug = c.req.param('slug')
  const profile = await providerService.getPublicProfileBySlug(slug)
  const data = await providerService.getPublicWorkPosts(profile.id)
  return c.json(ok(data))
})

providers.get('/:slug/certifications', async (c) => {
  const slug = c.req.param('slug')
  const profile = await providerService.getPublicProfileBySlug(slug)
  const data = await providerService.getPublicCertifications(profile.id)
  return c.json(ok(data))
})

providers.get('/:slug/reviews', validateQuery(paginationSchema), async (c) => {
  const slug = c.req.param('slug')
  const query = c.req.valid('query')
  const profile = await providerService.getPublicProfileBySlug(slug)
  const result = await providerService.getPublicReviews(profile.id, query.page, query.limit)
  return c.json(okPaginated(result.data, result.pagination))
})

export default providers
