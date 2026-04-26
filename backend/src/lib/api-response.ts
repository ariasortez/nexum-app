import type {
  ApiPagination,
  ApiPaginatedResponse,
  ApiSuccessMessageResponse,
  ApiSuccessResponse,
} from '@fixo/contracts/api'

export function ok<T>(data: T): ApiSuccessResponse<T> {
  return { success: true, data }
}

export function okPaginated<T>(data: T, pagination: ApiPagination): ApiPaginatedResponse<T> {
  return { success: true, data, pagination }
}

export function okMessage(message: string): ApiSuccessMessageResponse {
  return { success: true, message }
}
