import { api } from "@/lib/api"
import type {
  LoginInput,
  LoginResponse,
  RegisterClientInput,
  RegisterProviderInput,
  RegisterResponse,
  ApiSuccessResponse,
} from "@/types/auth"
import { clearAuthSession, saveAuthSession } from "@/lib/session"

export async function registerClient(input: RegisterClientInput): Promise<RegisterResponse> {
  const response = await api.post<ApiSuccessResponse<RegisterResponse>>(
    "/auth/register/client",
    input
  )
  return response.data
}

export async function registerProvider(input: RegisterProviderInput): Promise<RegisterResponse> {
  const response = await api.post<ApiSuccessResponse<RegisterResponse>>(
    "/auth/register/provider",
    input
  )
  return response.data
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  const response = await api.post<ApiSuccessResponse<LoginResponse>>("/auth/login", input)
  saveAuthSession(response.data)
  return response.data
}

export async function logout() {
  try {
    await api.post<ApiSuccessResponse<{ message: string }>>("/auth/logout", {})
  } finally {
    clearAuthSession()
  }
}
