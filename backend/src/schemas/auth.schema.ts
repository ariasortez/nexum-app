import { z } from 'zod'

export const registerClientSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  full_name: z.string().min(2).max(100),
  phone: z.string().min(8).max(15),
  department_id: z.string().uuid(),
  municipality_id: z.string().uuid(),
})

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z.string().min(8).max(15).optional(),
  department_id: z.string().uuid().optional(),
  municipality_id: z.string().uuid().optional(),
  address: z.string().max(255).optional(),
  avatar_url: z.string().url().optional(),
})

export const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8).max(72),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z.object({
  new_password: z.string().min(8).max(72),
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
export type UpdateProfile = z.infer<typeof updateProfileSchema>
export type ChangePassword = z.infer<typeof changePasswordSchema>
export type ForgotPassword = z.infer<typeof forgotPasswordSchema>
export type ResetPassword = z.infer<typeof resetPasswordSchema>
