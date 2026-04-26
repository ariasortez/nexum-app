import { supabaseAdmin } from '../lib/supabase.js'
import type { UpdateProfile, ChangePassword } from '../schemas/index.js'
import { env } from '../config/env.js'
import { authErrors } from '../errors/auth.errors.js'
import { buildAuthSessionPayload } from './auth-session.service.js'
import { refreshAuthSession, revokeSessionByAccessToken, signInWithPassword } from '../repositories/auth.repository.js'
export { registerClient, registerProvider } from './auth-registration.service.js'

export async function login(email: string, password: string) {
  const { data, error } = await signInWithPassword(email, password)

  if (error) {
    throw authErrors.invalidCredentials()
  }

  if (!data.session) {
    throw authErrors.invalidAuthProviderResponse('Missing session in auth response')
  }

  return buildAuthSessionPayload(data.user.id, data.user.email, data.session)
}

export async function refreshSession(refreshToken: string) {
  const { data, error } = await refreshAuthSession(refreshToken)

  if (error) {
    throw authErrors.invalidRefreshToken()
  }

  if (!data.user || !data.session) {
    throw authErrors.refreshSessionFailed({ message: 'Missing user or session in refresh response' })
  }

  return buildAuthSessionPayload(data.user.id, data.user.email, data.session)
}

export async function logout(accessToken?: string) {
  if (!accessToken) {
    return { message: 'Logged out' }
  }

  const { error } = await revokeSessionByAccessToken(accessToken)
  if (error) {
    // We still clear cookies on the route level to ensure local logout.
    console.error(`[Auth logout] Failed to revoke session: ${error.message}`)
  }

  return { message: 'Logged out' }
}

export async function getMe(userId: string) {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    throw authErrors.profileNotFound()
  }

  let providerProfile = null
  if (profile.role === 'provider') {
    const { data: provider } = await supabaseAdmin
      .from('provider_profiles')
      .select(`
        *,
        categories:provider_categories (
          subcategory:subcategories (
            id,
            name,
            slug,
            main_category:main_categories (
              id,
              name,
              slug
            )
          )
        )
      `)
      .eq('user_id', userId)
      .single()
    providerProfile = provider
  }

  return {
    ...profile,
    provider_profile: providerProfile,
  }
}

export async function resendConfirmation(email: string) {
  const { error } = await supabaseAdmin.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${env.FRONTEND_URL}/auth/callback`,
    },
  })

  if (error) {
    throw authErrors.invalidAuthProviderResponse(error.message)
  }

  return { message: 'Confirmation email sent' }
}

export async function updateProfile(userId: string, input: UpdateProfile) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw authErrors.updateProfileFailed()
  }

  return data
}

export async function changePassword(userId: string, input: ChangePassword) {
  const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId)

  if (!user.user?.email) {
    throw authErrors.userNotFound()
  }

  const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
    email: user.user.email,
    password: input.current_password,
  })

  if (signInError) {
    throw authErrors.currentPasswordIncorrect()
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: input.new_password,
  })

  if (error) {
    throw authErrors.changePasswordFailed()
  }

  return { message: 'Password changed successfully' }
}

export async function forgotPassword(email: string) {
  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo: `${env.FRONTEND_URL}/auth/reset-password`,
  })

  if (error) {
    throw authErrors.forgotPasswordFailed(error.message)
  }

  return { message: 'Password reset email sent' }
}

export async function resetPassword(userId: string, newPassword: string) {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  })

  if (error) {
    throw authErrors.resetPasswordFailed()
  }

  return { message: 'Password reset successfully' }
}
