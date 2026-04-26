import type { AuthSessionTokens, ProviderProfileSummary } from '../repositories/auth.repository.js'
import { getAuthProfileSummaryById, getProviderProfileSummaryByUserId } from '../repositories/auth.repository.js'

type AuthUserPayload = {
  id: string
  email: string | null | undefined
  full_name?: string
  role?: 'client' | 'provider' | 'admin'
  provider_profile: ProviderProfileSummary | null
}

export type AuthSessionPayload = AuthSessionTokens & {
  user: AuthUserPayload
}

export async function buildAuthSessionPayload(
  userId: string,
  email: string | null | undefined,
  session: AuthSessionTokens
): Promise<AuthSessionPayload> {
  const profile = await getAuthProfileSummaryById(userId)

  let providerProfile: ProviderProfileSummary | null = null
  if (profile?.role === 'provider') {
    providerProfile = await getProviderProfileSummaryByUserId(userId)
  }

  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    user: {
      id: userId,
      email,
      full_name: profile?.full_name,
      role: profile?.role,
      provider_profile: providerProfile,
    },
  }
}
