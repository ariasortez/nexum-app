import { z } from 'zod'

export const registerClientSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  full_name: z.string().min(2).max(100),
  phone: z.string().min(8).max(15).optional(),
})

export const registerProviderSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  full_name: z.string().min(2).max(100),
  phone: z.string().min(8).max(15),
  business_name: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  department_id: z.string().uuid(),
  municipality_id: z.string().uuid(),
  subcategory_ids: z.array(z.string().uuid()).min(1).max(10),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const resendConfirmationSchema = z.object({
  email: z.string().email(),
})

export type RegisterClient = z.infer<typeof registerClientSchema>
export type RegisterProvider = z.infer<typeof registerProviderSchema>
export type Login = z.infer<typeof loginSchema>
