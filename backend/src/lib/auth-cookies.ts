import type { Context } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { env } from '../config/env.js'

export const ACCESS_TOKEN_COOKIE = 'fixo_access_token'
export const REFRESH_TOKEN_COOKIE = 'fixo_refresh_token'

const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

type AuthSessionTokens = {
  access_token: string
  refresh_token: string
  expires_at?: number | null
}

function getAccessCookieMaxAge(expiresAt?: number | null): number | undefined {
  if (!expiresAt || expiresAt <= 0) {
    return undefined
  }

  const now = Math.floor(Date.now() / 1000)
  return Math.max(expiresAt - now, 60)
}

function getCookieOptions() {
  return {
    path: '/',
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'Lax' as const,
  }
}

export function setAuthCookies(c: Context, session: AuthSessionTokens) {
  const cookieOptions = getCookieOptions()
  const accessCookieMaxAge = getAccessCookieMaxAge(session.expires_at)

  setCookie(c, ACCESS_TOKEN_COOKIE, session.access_token, {
    ...cookieOptions,
    ...(accessCookieMaxAge ? { maxAge: accessCookieMaxAge } : {}),
  })

  setCookie(c, REFRESH_TOKEN_COOKIE, session.refresh_token, {
    ...cookieOptions,
    maxAge: REFRESH_COOKIE_MAX_AGE,
  })
}

export function clearAuthCookies(c: Context) {
  const cookieOptions = getCookieOptions()
  deleteCookie(c, ACCESS_TOKEN_COOKIE, cookieOptions)
  deleteCookie(c, REFRESH_TOKEN_COOKIE, cookieOptions)
}

export function readAccessTokenFromRequest(c: Context): string | undefined {
  const authHeader = c.req.header('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return getCookie(c, ACCESS_TOKEN_COOKIE)
}

export function readRefreshTokenFromRequest(c: Context): string | undefined {
  return getCookie(c, REFRESH_TOKEN_COOKIE)
}
