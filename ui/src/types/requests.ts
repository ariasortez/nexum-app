// Types aligned with backend schema

export type UrgencyLevel = "low" | "medium" | "high" | "emergency"
export type RequestStatus = "open" | "in_progress" | "completed" | "cancelled" | "expired"

export type ServiceRequestSummary = {
  id: string
  title: string
  description: string
  urgency: UrgencyLevel
  status: RequestStatus
  max_responses: number | null
  photos?: string[] | null
  created_at: string
  expires_at: string
  subcategory: {
    id: string
    name: string
    slug: string
  } | null
  department: {
    id: string
    name: string
  } | null
  municipality: {
    id: string
    name: string
  } | null
  client: {
    id?: string
    full_name: string
    avatar_url?: string | null
  } | null
}

export type ServiceRequestDetail = ServiceRequestSummary & {
  address: string | null
  lat: number | null
  lng: number | null
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
  client: {
    id?: string
    full_name: string
    avatar_url?: string | null
  } | null
  responses: RequestResponseItem[]
}

export type ProviderOpportunityDetail = Omit<ServiceRequestDetail, "client" | "responses"> & {
  response_count: number
  response_limit: number
  has_responded: boolean
  can_respond: boolean
  cannot_respond_reason: "already_responded" | "insufficient_credits" | "max_responses_reached" | "request_not_open" | null
  credits_balance: number
  client: {
    full_name: string
  } | null
}

export type RequestResponseItem = {
  id: string
  message: string | null
  estimated_price: number | null
  is_selected: boolean | null
  status: ResponseStatus
  created_at: string
  provider: {
    id: string
    slug: string
    business_name: string
    avg_rating: number | null
    total_reviews: number
    verified: boolean
  } | null
}

export type ClientRequestSummary = ServiceRequestSummary & {
  responses: RequestResponseItem[]
}

export type CreateServiceRequestInput = {
  subcategory_id: string
  title: string
  description: string
  urgency: UrgencyLevel
  address?: string
  lat?: number
  lng?: number
  photos?: string[]
}

export type UpdateServiceRequestInput = {
  title?: string
  description?: string
  urgency?: UrgencyLevel
  status?: RequestStatus
}

export type CreateProviderResponseInput = {
  message?: string
  estimated_price?: number
}

export type ProviderResponse = {
  id: string
  request_id: string
  provider_id: string
  message: string | null
  estimated_price: number | null
  credits_spent: number | null
  is_selected: boolean | null
  created_at: string | null
}

export type ListRequestsParams = {
  page?: number
  limit?: number
  status?: RequestStatus
  subcategory_id?: string
  department_id?: string
  municipality_id?: string
}

// Provider quotation types
export type ResponseStatus = "pending" | "accepted" | "rejected" | "completed" | "cancelled"

export type ProviderQuotationSummary = {
  id: string
  message: string | null
  estimated_price: number | null
  is_selected: boolean | null
  status: ResponseStatus
  credits_spent: number | null
  created_at: string
  request: {
    id: string
    title: string
    description: string
    urgency: UrgencyLevel
    status: RequestStatus
    created_at: string
    subcategory: {
      id: string
      name: string
      slug: string
    } | null
    department: {
      id: string
      name: string
    } | null
    municipality: {
      id: string
      name: string
    } | null
    client: {
      id: string
      full_name: string
      avatar_url: string | null
    } | null
  } | null
}

export type ProviderQuotationDetail = ProviderQuotationSummary & {
  request: {
    id: string
    title: string
    description: string
    urgency: UrgencyLevel
    status: RequestStatus
    photos: string[] | null
    address: string | null
    created_at: string
    expires_at: string
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
    department: {
      id: string
      name: string
    } | null
    municipality: {
      id: string
      name: string
    } | null
    client: {
      id: string
      full_name: string
      avatar_url: string | null
    } | null
  } | null
}

export type ListProviderResponsesParams = {
  page?: number
  limit?: number
  status?: ResponseStatus
}

export type AcceptQuotationResult = {
  accepted_response_id: string
  rejected_response_ids: string[]
}

export type RejectQuotationResult = {
  rejected_response_id: string
}

// Display config for UI
export const URGENCY_DISPLAY: Record<UrgencyLevel, { label: string; icon: string; color: string }> = {
  emergency: { label: "Urgente", icon: "bolt", color: "error" },
  high: { label: "Esta semana", icon: "calendar_today", color: "warning" },
  medium: { label: "Este mes", icon: "calendar_month", color: "secondary" },
  low: { label: "Flexible", icon: "schedule", color: "neutral" },
}

export const STATUS_DISPLAY: Record<RequestStatus, { label: string; icon: string; color: string }> = {
  open: { label: "Abierta", icon: "schedule", color: "secondary" },
  in_progress: { label: "En Progreso", icon: "engineering", color: "primary" },
  completed: { label: "Completada", icon: "check_circle", color: "success" },
  cancelled: { label: "Cancelada", icon: "cancel", color: "error" },
  expired: { label: "Expirada", icon: "timer_off", color: "neutral" },
}

export const RESPONSE_STATUS_DISPLAY: Record<ResponseStatus, { label: string; icon: string; color: string }> = {
  pending: { label: "Pendiente", icon: "hourglass_empty", color: "warning" },
  accepted: { label: "Aceptada", icon: "check_circle", color: "success" },
  rejected: { label: "Rechazada", icon: "cancel", color: "error" },
  completed: { label: "Completada", icon: "task_alt", color: "primary" },
  cancelled: { label: "Cancelada", icon: "close", color: "neutral" },
}
