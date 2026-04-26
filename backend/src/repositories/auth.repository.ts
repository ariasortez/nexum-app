import { supabaseAdmin } from '../lib/supabase.js'
import type { UserRole } from '../types/index.js'

export type AuthSessionTokens = {
  access_token: string
  refresh_token: string
  expires_at?: number | null
}

export type AuthProfileSummary = {
  id: string
  full_name: string
  role?: UserRole
}

export type ProviderProfileSummary = {
  id: string
  slug: string
  business_name: string
  verification_status: 'pending' | 'in_review' | 'approved' | 'rejected'
  credits_balance: number
}

function normalizeRole(role: string | null | undefined): UserRole | undefined {
  if (role === 'client' || role === 'provider' || role === 'admin') {
    return role
  }
  return undefined
}

export async function getUserRoleById(userId: string): Promise<UserRole | undefined> {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  return normalizeRole(profile?.role)
}

export async function getAuthProfileSummaryById(userId: string): Promise<AuthProfileSummary | null> {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', userId)
    .single()

  if (!profile) {
    return null
  }

  return {
    id: profile.id,
    full_name: profile.full_name,
    role: normalizeRole(profile.role),
  }
}

export async function getProviderProfileSummaryByUserId(userId: string): Promise<ProviderProfileSummary | null> {
  const { data: provider } = await supabaseAdmin
    .from('provider_profiles')
    .select('id, slug, business_name, verification_status, credits_balance')
    .eq('user_id', userId)
    .single()

  if (!provider) {
    return null
  }

  return {
    id: provider.id,
    slug: provider.slug,
    business_name: provider.business_name,
    verification_status: provider.verification_status,
    credits_balance: provider.credits_balance ?? 0,
  }
}

export async function signInWithPassword(email: string, password: string) {
  return supabaseAdmin.auth.signInWithPassword({ email, password })
}

export async function signUpWithEmail(input: {
  email: string
  password: string
  emailRedirectTo: string
  full_name: string
  role: 'client' | 'provider'
}) {
  return supabaseAdmin.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: input.emailRedirectTo,
      data: {
        full_name: input.full_name,
        role: input.role,
      },
    },
  })
}

export async function refreshAuthSession(refreshToken: string) {
  return supabaseAdmin.auth.refreshSession({ refresh_token: refreshToken })
}

export async function revokeSessionByAccessToken(accessToken: string) {
  return supabaseAdmin.auth.admin.signOut(accessToken)
}

export async function deleteAuthUserById(userId: string) {
  return supabaseAdmin.auth.admin.deleteUser(userId)
}
