export interface Department {
  id: string
  name: string
}

export interface Municipality {
  id: string
  name: string
  department_id: string
}

export interface MainCategory {
  id: string
  name: string
  slug: string
}

export interface Subcategory {
  id: string
  name: string
  slug: string
  main_category_id: string
  main_category?: MainCategory
}

export interface Profile {
  id: string
  full_name: string
  phone: string
  role: "client" | "provider" | "admin"
  avatar_url?: string | null
  department_id: string
  municipality_id: string
  department?: Department
  municipality?: Municipality
}

export interface ProviderProfile {
  id: string
  user_id: string
  slug: string
  business_name: string
  description?: string | null
  phone_public?: string | null
  verification_status: "pending" | "in_review" | "approved" | "rejected"
  verified: boolean
  avg_rating?: number | null
  total_reviews: number
  credits_balance: number
  department_id: string
  municipality_id: string
  categories?: ProviderCategory[]
}

export interface ProviderCategory {
  provider_id: string
  subcategory_id: string
  subcategory?: Subcategory
}

export type UrgencyLevel = "urgente" | "esta_semana" | "este_mes" | "flexible"

export interface ServiceRequest {
  id: string
  client_id: string
  subcategory_id: string
  title: string
  description: string
  urgency: UrgencyLevel
  status: "open" | "in_progress" | "completed" | "cancelled"
  department_id: string
  municipality_id: string
  address?: string | null
  lat?: number | null
  lng?: number | null
  photos?: string[] | null
  max_responses: number
  created_at: string
  expires_at: string
  subcategory?: Subcategory
  department?: Department
  municipality?: Municipality
  client?: Profile
  responses?: RequestResponse[]
}

export interface RequestResponse {
  id: string
  request_id: string
  provider_id: string
  message: string
  estimated_price?: number | null
  is_selected: boolean
  created_at: string
  provider?: ProviderProfile
}

export interface Review {
  id: string
  client_id: string
  provider_id: string
  request_id: string
  rating: number
  comment?: string | null
  created_at: string
  client?: Profile
}

export interface WorkPost {
  id: string
  provider_id: string
  title: string
  description: string
  subcategory_id: string
  images: string[]
  created_at: string
  subcategory?: Subcategory
}

export interface CreditTransaction {
  id: string
  provider_id: string
  amount: number
  transaction_type_id: string
  reference_id?: string | null
  created_at: string
}

export interface CreditPackage {
  credits: number
  price: number
  pricePerCredit: number
  popular?: boolean
  bonus?: string
}

export const URGENCY_CONFIG: Record<UrgencyLevel, { label: string; tone: string; desc: string }> = {
  urgente: { label: "Urgente", tone: "red", desc: "Hoy mismo" },
  esta_semana: { label: "Esta semana", tone: "amber", desc: "En los próximos días" },
  este_mes: { label: "Este mes", tone: "brand", desc: "En las próximas semanas" },
  flexible: { label: "Flexible", tone: "neutral", desc: "Sin apuro" },
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  { credits: 5, price: 150, pricePerCredit: 30 },
  { credits: 15, price: 420, pricePerCredit: 28, popular: true, bonus: "-7%" },
  { credits: 30, price: 780, pricePerCredit: 26, bonus: "-13%" },
  { credits: 60, price: 1440, pricePerCredit: 24, bonus: "-20%" },
]
