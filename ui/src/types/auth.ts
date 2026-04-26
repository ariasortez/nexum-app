import type { ApiErrorResponse, ApiSuccessResponse } from "@fixo/contracts/api"

export type UserRole = "client" | "provider" | "admin"

export type RegisterClientInput = {
  email: string
  password: string
  full_name: string
  phone: string
  department_id: string
  municipality_id: string
}

export type RegisterProviderInput = RegisterClientInput & {
  business_name: string
  description?: string
  subcategory_ids: string[]
}

export type RegisterResponse = {
  user_id: string
  email: string
  message: string
  provider_id?: string
}

export type LoginInput = {
  email: string
  password: string
}

export type ProviderProfileSummary = {
  id: string
  slug: string
  business_name: string
  verification_status: "pending" | "in_review" | "approved" | "rejected"
  credits_balance: number
}

export type AuthUser = {
  id: string
  email?: string | null
  full_name?: string | null
  role?: UserRole
  provider_profile?: ProviderProfileSummary | null
}

export type LoginResponse = {
  access_token: string
  refresh_token: string
  expires_at?: number | null
  user: AuthUser
}

export type { ApiErrorResponse, ApiSuccessResponse }
