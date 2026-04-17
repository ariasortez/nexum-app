import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { supabaseAdmin } from '../lib/supabase.js'
import type { Variables } from '../types/index.js'

export const requireAuth = createMiddleware<{ Variables: Variables }>(
  async (c, next) => {
    const authHeader = c.req.header('Authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      throw new HTTPException(401, { message: 'Missing or invalid authorization header' })
    }

    const token = authHeader.substring(7)
    const { data, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !data.user) {
      throw new HTTPException(401, { message: 'Invalid or expired token' })
    }

    c.set('user', {
      id: data.user.id,
      email: data.user.email!,
      role: data.user.user_metadata?.role,
    })

    await next()
  }
)

export const optionalAuth = createMiddleware<{ Variables: Variables }>(
  async (c, next) => {
    const authHeader = c.req.header('Authorization')

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { data } = await supabaseAdmin.auth.getUser(token)

      if (data.user) {
        c.set('user', {
          id: data.user.id,
          email: data.user.email!,
          role: data.user.user_metadata?.role,
        })
      }
    }

    await next()
  }
)
