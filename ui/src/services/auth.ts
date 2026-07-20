import { api } from "@/lib/api"
import type {
  LoginInput,
  LoginResponse,
  RegisterClientInput,
  RegisterProviderInput,
  RegisterResponse,
  ProfileMe,
  UpdateProfileInput,
  ChangePasswordInput,
  UpdateProviderProfileInput,
  ApiSuccessResponse,
} from "@/types/auth"
import { clearAuthSession, saveAuthSession } from "@/lib/session"

let meCache: ProfileMe | null = null
let mePromise: Promise<ProfileMe> | null = null

function setMeCache(profile: ProfileMe | null) {
  meCache = profile
}

export function invalidateMeCache() {
  meCache = null
  mePromise = null
}

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
  invalidateMeCache()
  saveAuthSession(response.data)
  return response.data
}

export async function logout() {
  try {
    await api.post<ApiSuccessResponse<{ message: string }>>("/auth/logout", {})
  } finally {
    invalidateMeCache()
    clearAuthSession()
  }
}

export async function getMe(): Promise<ProfileMe> {
  if (meCache) {
    return meCache
  }

  if (mePromise) {
    return mePromise
  }

  mePromise = api
    .get<ApiSuccessResponse<ProfileMe>>("/auth/me")
    .then((response) => {
      setMeCache(response.data)
      return response.data
    })
    .finally(() => {
      mePromise = null
    })

  return mePromise
}

export async function updateMyProfile(input: UpdateProfileInput): Promise<ProfileMe> {
  const response = await api.patch<ApiSuccessResponse<ProfileMe>>("/auth/me", input)
  setMeCache(response.data)
  return response.data
}

export async function updateMyProviderProfile(input: UpdateProviderProfileInput) {
  const response = await api.patch<ApiSuccessResponse<ProfileMe["provider_profile"]>>("/providers/me", input)
  invalidateMeCache()
  return response.data
}

export async function changePassword(input: ChangePasswordInput): Promise<{ message: string }> {
  const response = await api.post<ApiSuccessResponse<{ message: string }>>("/auth/change-password", input)
  return response.data
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const response = await api.post<ApiSuccessResponse<{ message: string }>>("/auth/forgot-password", { email })
  return response.data
}

export async function resetPassword(newPassword: string): Promise<{ message: string }> {
  const response = await api.post<ApiSuccessResponse<{ message: string }>>("/auth/reset-password", { new_password: newPassword })
  return response.data
}
