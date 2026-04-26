import type { LoginResponse } from "@/types/auth"

export const AUTH_SESSION_KEY = "fixo.auth.session.v1"

type StoredSession = {
  version: 2
  expires_at?: number | null
  user: LoginResponse["user"]
  saved_at: string
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export function saveAuthSession(session: LoginResponse) {
  if (typeof window === "undefined") {
    return
  }

  const payload: StoredSession = {
    version: 2,
    expires_at: session.expires_at,
    user: session.user,
    saved_at: new Date().toISOString(),
  }

  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(payload))
  // Legacy cleanup after migrating tokens to httpOnly cookies.
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
}

export function getAuthSession(): StoredSession | null {
  if (typeof window === "undefined") {
    return null
  }

  const raw = localStorage.getItem(AUTH_SESSION_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isObject(parsed)) {
      clearAuthSession()
      return null
    }

    if (!("version" in parsed) || (parsed.version !== 1 && parsed.version !== 2)) {
      clearAuthSession()
      return null
    }

    if (parsed.version === 2) {
      return parsed as StoredSession
    }

    const legacy = parsed as {
      expires_at?: number | null
      user?: LoginResponse["user"]
      saved_at?: string
    }

    if (!legacy.user) {
      clearAuthSession()
      return null
    }

    const migrated: StoredSession = {
      version: 2,
      user: legacy.user,
      expires_at: legacy.expires_at,
      saved_at: typeof legacy.saved_at === "string" ? legacy.saved_at : new Date().toISOString(),
    }
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(migrated))
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    return migrated
  } catch {
    clearAuthSession()
    return null
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null
  }

  // Legacy fallback while old sessions are still around.
  return localStorage.getItem("access_token")
}

export function isSessionExpired(session: StoredSession): boolean {
  if (!session.expires_at || session.expires_at <= 0) {
    return false
  }

  const nowInSeconds = Math.floor(Date.now() / 1000)
  return nowInSeconds >= session.expires_at
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return
  }

  localStorage.removeItem(AUTH_SESSION_KEY)
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
}
