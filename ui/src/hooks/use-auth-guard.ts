"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import type { UserRole } from "@/types/auth"
import { clearAuthSession, getAuthSession, isSessionExpired } from "@/lib/session"

export type AuthGuardState = {
  isChecking: boolean
  isAuthorized: boolean
}

type GuardResult =
  | { authorized: true }
  | {
      authorized: false
      redirectTo: string
      clearSession: boolean
    }

function getRoleHomePath(role: UserRole): string {
  if (role === "admin") return "/admin"
  if (role === "provider") return "/provider"
  return "/client"
}

function buildLoginPath(pathname: string, reason?: "missing" | "expired") {
  const params = new URLSearchParams()
  params.set("next", pathname)

  if (reason === "expired") {
    params.set("expired", "true")
  }

  const query = params.toString()
  return query ? `/login?${query}` : "/login"
}

export function useAuthGuard(requiredRole: UserRole): AuthGuardState {
  const router = useRouter()
  const pathname = usePathname()
  const [state, setState] = useState<AuthGuardState>({
    isChecking: true,
    isAuthorized: false,
  })

  useEffect(() => {
    const session = getAuthSession()

    let guard: GuardResult

    if (!session || !session.user?.role) {
      guard = {
        authorized: false,
        redirectTo: buildLoginPath(pathname, "missing"),
        clearSession: true,
      }
    } else if (isSessionExpired(session)) {
      guard = {
        authorized: false,
        redirectTo: buildLoginPath(pathname, "expired"),
        clearSession: true,
      }
    } else if (session.user.role !== requiredRole) {
      guard = {
        authorized: false,
        redirectTo: getRoleHomePath(session.user.role),
        clearSession: false,
      }
    } else {
      guard = { authorized: true }
    }

    if (guard.authorized) {
      setState({ isChecking: false, isAuthorized: true })
    } else {
      if (guard.clearSession) {
        clearAuthSession()
      }
      router.replace(guard.redirectTo)
    }
  }, [pathname, requiredRole, router])

  return state
}
