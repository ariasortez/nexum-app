import type { ApiErrorResponse } from "@fixo/contracts/api"
import { clearAuthSession, getAccessToken, saveAuthSession } from "@/lib/session"
import type { ApiSuccessResponse, LoginResponse } from "@/types/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE"
  body?: unknown
  headers?: Record<string, string>
  _retry?: boolean
}

type ApiErrorPayload = ApiErrorResponse & {
  message?: string
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

let refreshPromise: Promise<boolean> | null = null

function isAuthScreenPath(pathname: string): boolean {
  return /^\/(login|register)(\/|$)/.test(pathname)
}

function isRefreshableEndpoint(endpoint: string): boolean {
  return !endpoint.startsWith("/auth/login") &&
    !endpoint.startsWith("/auth/refresh") &&
    !endpoint.startsWith("/auth/logout")
}

function redirectToLogin(reason: "expired" | "missing" = "expired") {
  if (typeof window === "undefined") {
    return
  }

  if (isAuthScreenPath(window.location.pathname)) {
    return
  }

  const params = new URLSearchParams()
  const next = `${window.location.pathname}${window.location.search}`
  params.set("next", next)
  params.set(reason, "true")
  window.location.replace(`/login?${params.toString()}`)
}

async function parseResponseJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

async function tryRefreshSession(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false
  }

  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      return false
    }

    const payload = await parseResponseJson(response) as ApiSuccessResponse<LoginResponse> | null
    if (!payload?.success || !payload.data) {
      return false
    }

    saveAuthSession(payload.data)
    return true
  })()
    .catch(() => false)
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, _retry = false } = options

  const config: RequestInit = {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  const token = getAccessToken()
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, config)
  const data = await parseResponseJson(response)

  if (!response.ok) {
    const payload = data as ApiErrorPayload | null
    const message =
      payload?.error?.message ??
      payload?.message ??
      "Something went wrong"

    if (response.status === 401 && isRefreshableEndpoint(endpoint) && !_retry) {
      const refreshed = await tryRefreshSession()
      if (refreshed) {
        return request<T>(endpoint, { ...options, _retry: true })
      }
    }

    if (response.status === 401 && typeof window !== "undefined") {
      clearAuthSession()
      redirectToLogin("expired")
    }

    throw new ApiError(
      response.status,
      message,
      payload?.error?.code,
      payload?.error?.details
    )
  }

  return data as T
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: "POST", body }),
  patch: <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: "PATCH", body }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
}

export { ApiError }
