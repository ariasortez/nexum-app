import { z } from 'zod'

export const reviewSchema = z.object({
  id: z.string().uuid(),
  provider_id: z.string().uuid(),
  client_id: z.string().uuid(),
  request_id: z.string().uuid().nullable(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable(),
  photos: z.array(z.string()).nullable(),
  created_at: z.string().nullable(),
})

export const createReviewSchema = z.object({
  provider_id: z.string().uuid(),
  request_id: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000).optional(),
  photos: z.array(z.string().url()).max(3).optional(),
})

export type Review = z.infer<typeof reviewSchema>
export type CreateReview = z.infer<typeof createReviewSchema>
