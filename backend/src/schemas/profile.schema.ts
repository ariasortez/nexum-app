import { z } from 'zod'

export const userRoleSchema = z.enum(['client', 'provider', 'admin'])

export const profileSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string(),
  phone: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  role: userRoleSchema.nullable(),
  department_id: z.string().uuid().nullable(),
  municipality_id: z.string().uuid().nullable(),
  address: z.string().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
})

export const createProfileSchema = z.object({
  full_name: z.string().min(2).max(100),
  phone: z.string().min(8).max(15).optional(),
  department_id: z.string().uuid().optional(),
  municipality_id: z.string().uuid().optional(),
  address: z.string().max(255).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
})

export const updateProfileSchema = createProfileSchema.partial()

export type UserRole = z.infer<typeof userRoleSchema>
export type Profile = z.infer<typeof profileSchema>
export type CreateProfile = z.infer<typeof createProfileSchema>
export type UpdateProfile = z.infer<typeof updateProfileSchema>
