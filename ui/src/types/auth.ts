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

export type ProviderCategoryAssignment = {
  subcategory: {
    id: string
    name: string
    slug: string
    main_category: {
      id: string
      name: string
      slug: string
    } | null
  } | null
}

export type ProviderProfileDetail = {
  id: string
  user_id: string
  slug: string
  business_name: string
  description: string | null
  phone_public: string | null
  verified: boolean | null
  avg_rating: number | null
  total_reviews: number | null
  response_time_avg: number | null
  credits_balance: number | null
  department_id: string | null
  municipality_id: string | null
  address: string | null
  lat: number | null
  lng: number | null
  is_active: boolean | null
  categories?: ProviderCategoryAssignment[]
}

export type ProfileMe = {
  id: string
  full_name: string
  phone: string | null
  avatar_url: string | null
  role: UserRole | null
  department_id: string | null
  municipality_id: string | null
  address: string | null
  lat: number | null
  lng: number | null
  created_at: string | null
  updated_at: string | null
  provider_profile?: ProviderProfileDetail | null
}

export type UpdateProfileInput = {
  full_name?: string
  phone?: string
  department_id?: string
  municipality_id?: string
  address?: string
  avatar_url?: string
}

export type ChangePasswordInput = {
  current_password: string
  new_password: string
}

export type UpdateProviderProfileInput = {
  business_name?: string
  description?: string
  phone_public?: string
  department_id?: string
  municipality_id?: string
  address?: string
  lat?: number
  lng?: number
  subcategory_ids?: string[]
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
