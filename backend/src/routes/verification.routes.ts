import { Hono } from 'hono'
import { z } from 'zod'
import type { Variables } from '../types/index.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { uploadDocumentSchema, reviewVerificationSchema } from '../schemas/index.js'
import * as verificationService from '../services/verification.service.js'
import { ok, okMessage, okPaginated } from '../lib/api-response.js'
import { validateJson, validateQuery } from '../lib/validators.js'

const verification = new Hono<{ Variables: Variables }>()

verification.get('/documents', requireAuth, requireRole('provider'), async (c) => {
  const user = c.get('user')
  const provider = await verificationService.getProviderByUserId(user.id)
  const documents = await verificationService.getVerificationDocuments(provider.id)

  return c.json(ok(documents))
})

verification.post(
  '/documents',
  requireAuth,
  requireRole('provider'),
  validateJson(uploadDocumentSchema),
  async (c) => {
    const user = c.get('user')
    const input = c.req.valid('json')
    const provider = await verificationService.getProviderByUserId(user.id)
    const document = await verificationService.uploadDocument(provider.id, input)

    return c.json(ok(document), 201)
  }
)

verification.delete('/documents/:id', requireAuth, requireRole('provider'), async (c) => {
  const user = c.get('user')
  const documentId = c.req.param('id')
  const provider = await verificationService.getProviderByUserId(user.id)
  await verificationService.deleteDocument(provider.id, documentId)

  return c.json(okMessage('Document deleted'))
})

verification.post(
  '/documents/upload-url',
  requireAuth,
  requireRole('provider'),
  validateJson(z.object({ file_name: z.string().min(1) })),
  async (c) => {
  const user = c.get('user')
  const { file_name } = c.req.valid('json')
  const provider = await verificationService.getProviderByUserId(user.id)
  const uploadData = await verificationService.generateUploadUrl(provider.id, file_name)

  return c.json(ok(uploadData))
  }
)

verification.post('/submit', requireAuth, requireRole('provider'), async (c) => {
  const user = c.get('user')
  const provider = await verificationService.getProviderByUserId(user.id)
  const result = await verificationService.submitForReview(provider.id)

  return c.json(okMessage(result.message))
})

verification.get('/status', requireAuth, requireRole('provider'), async (c) => {
  const user = c.get('user')
  const provider = await verificationService.getProviderByUserId(user.id)
  const status = await verificationService.getVerificationStatus(provider.id)

  return c.json(ok(status))
})

verification.get(
  '/admin/pending',
  requireAuth,
  requireRole('admin'),
  validateQuery(z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
  })),
  async (c) => {
    const { page, limit } = c.req.valid('query')
    const result = await verificationService.getPendingVerifications(page, limit)

    return c.json(okPaginated(result.data, result.pagination))
  }
)

verification.post(
  '/admin/review/:providerId',
  requireAuth,
  requireRole('admin'),
  validateJson(reviewVerificationSchema),
  async (c) => {
    const user = c.get('user')
    const providerId = c.req.param('providerId')
    const input = c.req.valid('json')
    const result = await verificationService.reviewProvider(providerId, user.id, input)

    return c.json(ok(result))
  }
)

export default verification
