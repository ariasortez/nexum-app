import type { Context } from 'hono'

export interface AuthUser {
  id: string
  email: string
  role?: string
}

export interface AuthContext extends Context {
  get(key: 'user'): AuthUser
  set(key: 'user', value: AuthUser): void
}

export type Variables = {
  user: AuthUser
}

export type { Database } from './database.js'
