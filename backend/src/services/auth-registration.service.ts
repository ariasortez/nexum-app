import type { RegisterClient, RegisterProvider } from '../schemas/index.js'
import { env } from '../config/env.js'
import { authErrors } from '../errors/auth.errors.js'
import { AppError } from '../lib/app-error.js'
import { deleteAuthUserById, signUpWithEmail } from '../repositories/auth.repository.js'
import {
  assignProviderCategories,
  createProfile,
  createProviderProfile,
  getSubcategoriesByIds,
  getUniqueMainCategoryIds,
  providerSlugExists,
} from '../repositories/registration.repository.js'

type SupabaseDbError = {
  message: string
  code?: string | null
  details?: string | null
  hint?: string | null
}

function buildSupabaseErrorDetails(error: SupabaseDbError) {
  return {
    message: error.message,
    code: error.code ?? undefined,
    details: error.details ?? undefined,
    hint: error.hint ?? undefined,
  }
}

function generateSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function isRoleConstraintError(error: SupabaseDbError): boolean {
  const normalizedMessage = error.message.toLowerCase()
  const normalizedDetails = (error.details ?? '').toLowerCase()
  return (
    error.code === '23503' &&
    (normalizedMessage.includes('profiles_role_fkey') ||
      normalizedDetails.includes('(role)='))
  )
}

function mapProfileInsertError(error: SupabaseDbError, role: 'client' | 'provider') {
  const details = buildSupabaseErrorDetails(error)
  if (isRoleConstraintError(error)) {
    return authErrors.roleNotConfigured(role, details)
  }
  return authErrors.createProfileFailed(details)
}

async function rollbackAuthUser(userId: string) {
  const { error } = await deleteAuthUserById(userId)
  if (error) {
    console.error(`[Auth rollback] Failed to delete user ${userId}: ${error.message}`)
  }
}

export async function registerClient(input: RegisterClient) {
  const { data: authData, error: authError } = await signUpWithEmail({
    email: input.email,
    password: input.password,
    emailRedirectTo: `${env.FRONTEND_URL}/auth/callback`,
    full_name: input.full_name,
    role: 'client',
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      throw authErrors.emailAlreadyRegistered()
    }
    throw authErrors.invalidAuthProviderResponse(authError.message)
  }

  if (!authData.user) {
    throw authErrors.createUserFailed()
  }

  const { error: profileError } = await createProfile({
    user_id: authData.user.id,
    full_name: input.full_name,
    phone: input.phone,
    role: 'client',
    department_id: input.department_id,
    municipality_id: input.municipality_id,
  })

  if (profileError) {
    await rollbackAuthUser(authData.user.id)
    throw mapProfileInsertError(profileError, 'client')
  }

  return {
    user_id: authData.user.id,
    email: authData.user.email,
    message: 'Registration successful. Please check your email to confirm your account.',
  }
}

export async function registerProvider(input: RegisterProvider) {
  let slug = generateSlug(input.business_name)
  if (await providerSlugExists(slug)) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  const subcategoryIds = input.subcategory_ids
  const { data: subcategories, error: subError } = await getSubcategoriesByIds(subcategoryIds)
  if (subError || !subcategories || subcategories.length !== subcategoryIds.length) {
    throw authErrors.invalidSubcategoryIds()
  }

  const mainCategoryIds = getUniqueMainCategoryIds(subcategories)
  if (mainCategoryIds.length > 5) {
    throw authErrors.tooManyMainCategories()
  }

  const { data: authData, error: authError } = await signUpWithEmail({
    email: input.email,
    password: input.password,
    emailRedirectTo: `${env.FRONTEND_URL}/auth/callback`,
    full_name: input.full_name,
    role: 'provider',
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      throw authErrors.emailAlreadyRegistered()
    }
    throw authErrors.invalidAuthProviderResponse(authError.message)
  }

  if (!authData.user) {
    throw authErrors.createUserFailed()
  }

  const userId = authData.user.id

  try {
    const { error: profileError } = await createProfile({
      user_id: userId,
      full_name: input.full_name,
      phone: input.phone,
      role: 'provider',
      department_id: input.department_id,
      municipality_id: input.municipality_id,
    })
    if (profileError) {
      throw mapProfileInsertError(profileError, 'provider')
    }

    const { data: providerProfile, error: providerError } = await createProviderProfile({
      user_id: userId,
      slug,
      business_name: input.business_name,
      description: input.description,
      phone: input.phone,
      department_id: input.department_id,
      municipality_id: input.municipality_id,
    })
    if (providerError || !providerProfile) {
      if (providerError) {
        throw authErrors.createProviderProfileFailed(buildSupabaseErrorDetails(providerError))
      }
      throw authErrors.createProviderProfileFailed()
    }

    const { error: categoriesError } = await assignProviderCategories(providerProfile.id, subcategoryIds)
    if (categoriesError) {
      throw authErrors.assignCategoriesFailed(buildSupabaseErrorDetails(categoriesError))
    }

    return {
      user_id: userId,
      provider_id: providerProfile.id,
      email: authData.user.email,
      message: 'Registration successful. Please check your email to confirm your account, then upload your verification documents.',
    }
  } catch (error) {
    await rollbackAuthUser(userId)
    if (error instanceof AppError) {
      throw error
    }
    if (error instanceof Error) {
      throw authErrors.registrationFailed(error.message, { message: error.message })
    }
    throw authErrors.registrationFailed('Registration failed')
  }
}
