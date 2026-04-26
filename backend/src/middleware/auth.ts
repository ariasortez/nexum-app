import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import type { UserRole, Variables } from '../types/index.js'
import { readAccessTokenFromRequest } from '../lib/auth-cookies.js'
import { supabaseAdmin } from '../lib/supabase.js'
import { getUserRoleById } from '../repositories/auth.repository.js'

export const requireAuth = createMiddleware<{ Variables: Variables }>(
  async (c, next) => {
    const token = readAccessTokenFromRequest(c)
    if (!token) {
      throw new HTTPException(401, { message: 'Missing authentication token' })
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !data.user) {
      throw new HTTPException(401, { message: 'Invalid or expired token' })
    }

    const role = await getUserRoleById(data.user.id)

    c.set('user', {
      id: data.user.id,
      email: data.user.email!,
      role,
    })

    await next()
  }
)

export const optionalAuth = createMiddleware<{ Variables: Variables }>(
  async (c, next) => {
    const token = readAccessTokenFromRequest(c)
    if (token) {
      const { data } = await supabaseAdmin.auth.getUser(token)

      if (data.user) {
        const role = await getUserRoleById(data.user.id)
        c.set('user', {
          id: data.user.id,
          email: data.user.email!,
          role,
        })
      }
    }

    await next()
  }
)

export const requireRole = (...allowedRoles: UserRole[]) =>
  createMiddleware<{ Variables: Variables }>(async (c, next) => {
    const user = c.get('user')
    if (!user.role || !allowedRoles.includes(user.role)) {
      throw new HTTPException(403, { message: 'Forbidden' })
    }
    await next()
  })
