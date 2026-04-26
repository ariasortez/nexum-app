import { z } from 'zod'

export const providerProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  slug: z.string(),
  business_name: z.string(),
  description: z.string().nullable(),
  phone_public: z.string().nullable(),
  verified: z.boolean().nullable(),
  avg_rating: z.number().nullable(),
  total_reviews: z.number().nullable(),
  response_time_avg: z.number().nullable(),
  credits_balance: z.number().nullable(),
  department_id: z.string().uuid().nullable(),
  municipality_id: z.string().uuid().nullable(),
  address: z.string().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  is_active: z.boolean().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
})

export const createProviderProfileSchema = z.object({
  business_name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().max(1000).optional(),
  phone_public: z.string().min(8).max(15).optional(),
  department_id: z.string().uuid().optional(),
  municipality_id: z.string().uuid().optional(),
  address: z.string().max(255).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  subcategory_ids: z.array(z.string().uuid()).min(1).max(10),
})

export const updateProviderProfileSchema = createProviderProfileSchema.partial().omit({ slug: true })

export const workPostSchema = z.object({
  id: z.string().uuid(),
  provider_id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  subcategory_id: z.string().uuid(),
  images: z.array(z.string().url()),
  created_at: z.string(),
  updated_at: z.string(),
})

export const createWorkPostSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  subcategory_id: z.string().uuid(),
  images: z.array(z.string().url()).min(1).max(5),
})

export const updateWorkPostSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(2000).optional(),
  subcategory_id: z.string().uuid().optional(),
  images: z.array(z.string().url()).min(1).max(5).optional(),
})

export type ProviderProfile = z.infer<typeof providerProfileSchema>
export type CreateProviderProfile = z.infer<typeof createProviderProfileSchema>
export type UpdateProviderProfile = z.infer<typeof updateProviderProfileSchema>
export type WorkPost = z.infer<typeof workPostSchema>
export type CreateWorkPost = z.infer<typeof createWorkPostSchema>
export type UpdateWorkPost = z.infer<typeof updateWorkPostSchema>
