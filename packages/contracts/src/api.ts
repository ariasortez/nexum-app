export type ApiErrorDetail = {
  message: string
  code?: string
  details?: unknown
}

export type ApiErrorResponse = {
  success: false
  error: ApiErrorDetail
}

export type ApiSuccessResponse<T> = {
  success: true
  data: T
}

export type ApiSuccessMessageResponse = {
  success: true
  message: string
}

export type ApiPagination = {
  page: number
  limit: number
  total: number
  total_pages: number
}

export type ApiPaginatedResponse<T> = {
  success: true
  data: T
  pagination: ApiPagination
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse
