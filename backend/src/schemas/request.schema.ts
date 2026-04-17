import { z } from 'zod'

export const urgencyLevelSchema = z.enum(['low', 'medium', 'high', 'urgent'])

export const requestStatusSchema = z.enum(['open', 'in_progress', 'completed', 'cancelled', 'expired'])

export const serviceRequestSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  subcategory_id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  urgency: urgencyLevelSchema.nullable(),
  department_id: z.string().uuid().nullable(),
  municipality_id: z.string().uuid().nullable(),
  address: z.string().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  status: requestStatusSchema.nullable(),
  max_responses: z.number().nullable(),
  photos: z.array(z.string()).nullable(),
  created_at: z.string().nullable(),
  expires_at: z.string().nullable(),
})

export const createServiceRequestSchema = z.object({
  subcategory_id: z.string().uuid(),
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  urgency: urgencyLevelSchema.default('medium'),
  department_id: z.string().uuid().optional(),
  municipality_id: z.string().uuid().optional(),
  address: z.string().max(255).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  photos: z.array(z.string().url()).max(5).optional(),
})

export const updateServiceRequestSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  description: z.string().min(20).max(2000).optional(),
  urgency: urgencyLevelSchema.optional(),
  status: requestStatusSchema.optional(),
})

export const requestResponseSchema = z.object({
  id: z.string().uuid(),
  request_id: z.string().uuid(),
  provider_id: z.string().uuid(),
  message: z.string().nullable(),
  estimated_price: z.number().nullable(),
  credits_spent: z.number().nullable(),
  is_selected: z.boolean().nullable(),
  created_at: z.string().nullable(),
})

export const createRequestResponseSchema = z.object({
  request_id: z.string().uuid(),
  message: z.string().min(10).max(1000).optional(),
  estimated_price: z.number().positive().optional(),
})

export type UrgencyLevel = z.infer<typeof urgencyLevelSchema>
export type RequestStatus = z.infer<typeof requestStatusSchema>
export type ServiceRequest = z.infer<typeof serviceRequestSchema>
export type CreateServiceRequest = z.infer<typeof createServiceRequestSchema>
export type UpdateServiceRequest = z.infer<typeof updateServiceRequestSchema>
export type RequestResponse = z.infer<typeof requestResponseSchema>
export type CreateRequestResponse = z.infer<typeof createRequestResponseSchema>
