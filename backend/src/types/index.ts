import type { Context } from 'hono'

export type UserRole = 'client' | 'provider' | 'admin'

export interface AuthUser {
  id: string
  email: string
  role?: UserRole
}

export interface AuthContext extends Context {
  get(key: 'user'): AuthUser
  set(key: 'user', value: AuthUser): void
}

export type Variables = {
  user: AuthUser
}

export type { Database } from './database.js'
