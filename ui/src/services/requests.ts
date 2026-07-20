import { api } from "@/lib/api"
import type { ApiSuccessResponse, ApiPaginatedResponse } from "@fixo/contracts/api"
import type {
  ServiceRequestSummary,
  ServiceRequestDetail,
  ClientRequestSummary,
  ProviderOpportunityDetail,
  CreateServiceRequestInput,
  CreateProviderResponseInput,
  ProviderResponse,
  UpdateServiceRequestInput,
  ListRequestsParams,
  ProviderQuotationSummary,
  ProviderQuotationDetail,
  ListProviderResponsesParams,
  AcceptQuotationResult,
  RejectQuotationResult,
} from "@/types/requests"

export async function listRequests(params: ListRequestsParams = {}): Promise<{
  data: ServiceRequestSummary[]
  pagination: { page: number; limit: number; total: number; total_pages: number }
}> {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set("page", String(params.page))
  if (params.limit) searchParams.set("limit", String(params.limit))
  if (params.status) searchParams.set("status", params.status)
  if (params.subcategory_id) searchParams.set("subcategory_id", params.subcategory_id)
  if (params.department_id) searchParams.set("department_id", params.department_id)
  if (params.municipality_id) searchParams.set("municipality_id", params.municipality_id)

  const query = searchParams.toString()
  const endpoint = query ? `/requests?${query}` : "/requests"

  const response = await api.get<ApiPaginatedResponse<ServiceRequestSummary[]>>(endpoint)
  return { data: response.data, pagination: response.pagination }
}

export async function listMyRequests(params: ListRequestsParams = {}): Promise<{
  data: ClientRequestSummary[]
  pagination: { page: number; limit: number; total: number; total_pages: number }
}> {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set("page", String(params.page))
  if (params.limit) searchParams.set("limit", String(params.limit))
  if (params.status) searchParams.set("status", params.status)

  const query = searchParams.toString()
  const endpoint = query ? `/requests/me?${query}` : "/requests/me"

  const response = await api.get<ApiPaginatedResponse<ClientRequestSummary[]>>(endpoint)
  return { data: response.data, pagination: response.pagination }
}

export async function getRequest(id: string): Promise<ServiceRequestDetail> {
  const response = await api.get<ApiSuccessResponse<ServiceRequestDetail>>(`/requests/${id}`)
  return response.data
}

interface UploadUrlResponse {
  upload_url: string
  file_path: string
  public_url: string
}

export async function getPhotoUploadUrl(fileName: string): Promise<UploadUrlResponse> {
  const response = await api.post<ApiSuccessResponse<UploadUrlResponse>>("/requests/upload-url", { file_name: fileName })
  return response.data
}

export async function uploadPhoto(file: File): Promise<string> {
  const { upload_url, public_url } = await getPhotoUploadUrl(file.name)

  const uploadResponse = await fetch(upload_url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  })

  if (!uploadResponse.ok) {
    throw new Error("Failed to upload photo")
  }

  return public_url
}

export async function uploadPhotos(files: File[]): Promise<string[]> {
  const urls = await Promise.all(files.map(uploadPhoto))
  return urls
}

export async function createRequest(input: CreateServiceRequestInput): Promise<{ id: string }> {
  const response = await api.post<ApiSuccessResponse<{ id: string }>>("/requests", input)
  return response.data
}

export async function updateRequest(id: string, input: UpdateServiceRequestInput): Promise<{ id: string }> {
  const response = await api.patch<ApiSuccessResponse<{ id: string }>>(`/requests/${id}`, input)
  return response.data
}

export async function deleteRequest(id: string): Promise<void> {
  await api.delete(`/requests/${id}`)
}

export async function acceptQuotation(requestId: string, responseId: string): Promise<AcceptQuotationResult> {
  const response = await api.post<ApiSuccessResponse<AcceptQuotationResult>>(
    `/requests/${requestId}/responses/${responseId}/accept`,
    {}
  )
  return response.data
}

export async function rejectQuotation(requestId: string, responseId: string): Promise<RejectQuotationResult> {
  const response = await api.post<ApiSuccessResponse<RejectQuotationResult>>(
    `/requests/${requestId}/responses/${responseId}/reject`,
    {}
  )
  return response.data
}

export async function completeRequest(requestId: string): Promise<{ completed: boolean; response_id: string }> {
  const response = await api.post<ApiSuccessResponse<{ completed: boolean; response_id: string }>>(
    `/requests/${requestId}/complete`,
    {}
  )
  return response.data
}

export interface CreateReviewInput {
  rating: number
  comment?: string
}

export async function createReview(requestId: string, input: CreateReviewInput): Promise<{ id: string; rating: number }> {
  const response = await api.post<ApiSuccessResponse<{ id: string; rating: number }>>(
    `/requests/${requestId}/review`,
    input
  )
  return response.data
}

// Provider-specific: list available requests matching provider's categories and location
export async function listAvailableRequests(params: { page?: number; limit?: number } = {}): Promise<{
  data: ServiceRequestSummary[]
  pagination: { page: number; limit: number; total: number; total_pages: number }
}> {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set("page", String(params.page))
  if (params.limit) searchParams.set("limit", String(params.limit))

  const query = searchParams.toString()
  const endpoint = query ? `/providers/me/requests/available?${query}` : "/providers/me/requests/available"

  const response = await api.get<ApiPaginatedResponse<ServiceRequestSummary[]>>(endpoint)
  return { data: response.data, pagination: response.pagination }
}

export async function getAvailableRequest(id: string): Promise<ProviderOpportunityDetail> {
  const response = await api.get<ApiSuccessResponse<ProviderOpportunityDetail>>(`/providers/me/requests/available/${id}`)
  return response.data
}

export async function createProviderResponse(
  requestId: string,
  input: CreateProviderResponseInput
): Promise<ProviderResponse> {
  const response = await api.post<ApiSuccessResponse<ProviderResponse>>(
    `/providers/me/requests/available/${requestId}/responses`,
    input
  )
  return response.data
}

// Provider quotations (responses they've submitted)
export async function listProviderResponses(params: ListProviderResponsesParams = {}): Promise<{
  data: ProviderQuotationSummary[]
  pagination: { page: number; limit: number; total: number; total_pages: number }
}> {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set("page", String(params.page))
  if (params.limit) searchParams.set("limit", String(params.limit))
  if (params.status) searchParams.set("status", params.status)

  const query = searchParams.toString()
  const endpoint = query ? `/providers/me/responses?${query}` : "/providers/me/responses"

  const response = await api.get<ApiPaginatedResponse<ProviderQuotationSummary[]>>(endpoint)
  return { data: response.data, pagination: response.pagination }
}

export async function getProviderResponse(id: string): Promise<ProviderQuotationDetail> {
  const response = await api.get<ApiSuccessResponse<ProviderQuotationDetail>>(`/providers/me/responses/${id}`)
  return response.data
}

export async function cancelProviderResponse(id: string): Promise<void> {
  await api.post(`/providers/me/responses/${id}/cancel`, {})
}
