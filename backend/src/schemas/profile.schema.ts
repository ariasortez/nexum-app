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

export type UserRole = z.infer<typeof userRoleSchema>
export type Profile = z.infer<typeof profileSchema>
