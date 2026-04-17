import { HTTPException } from 'hono/http-exception'
import { supabaseAdmin } from '../lib/supabase.js'
import type { RegisterClient, RegisterProvider } from '../schemas/index.js'
import { env } from '../config/env.js'

function generateSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function registerClient(input: RegisterClient) {
  const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${env.FRONTEND_URL}/auth/callback`,
      data: {
        full_name: input.full_name,
        role: 'client',
      },
    },
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      throw new HTTPException(409, { message: 'Email already registered' })
    }
    throw new HTTPException(400, { message: authError.message })
  }

  if (!authData.user) {
    throw new HTTPException(500, { message: 'Failed to create user' })
  }

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: authData.user.id,
      full_name: input.full_name,
      phone: input.phone,
      role: 'client',
    })

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    throw new HTTPException(500, { message: 'Failed to create profile' })
  }

  return {
    user_id: authData.user.id,
    email: authData.user.email,
    message: 'Registration successful. Please check your email to confirm your account.',
  }
}

export async function registerProvider(input: RegisterProvider) {
  const { data: existingSlug } = await supabaseAdmin
    .from('provider_profiles')
    .select('slug')
    .eq('slug', generateSlug(input.business_name))
    .single()

  let slug = generateSlug(input.business_name)
  if (existingSlug) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  const subcategoryIds = input.subcategory_ids
  const { data: subcategories, error: subError } = await supabaseAdmin
    .from('subcategories')
    .select('id, main_category_id')
    .in('id', subcategoryIds)

  if (subError || !subcategories || subcategories.length !== subcategoryIds.length) {
    throw new HTTPException(400, { message: 'Invalid subcategory IDs' })
  }

  const mainCategoryIds = [...new Set(subcategories.map(s => s.main_category_id))]
  if (mainCategoryIds.length > 5) {
    throw new HTTPException(400, { message: 'Subcategories must belong to at most 5 main categories' })
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${env.FRONTEND_URL}/auth/callback`,
      data: {
        full_name: input.full_name,
        role: 'provider',
      },
    },
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      throw new HTTPException(409, { message: 'Email already registered' })
    }
    throw new HTTPException(400, { message: authError.message })
  }

  if (!authData.user) {
    throw new HTTPException(500, { message: 'Failed to create user' })
  }

  const userId = authData.user.id

  try {
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        full_name: input.full_name,
        phone: input.phone,
        role: 'provider',
        department_id: input.department_id,
        municipality_id: input.municipality_id,
      })

    if (profileError) {
      throw new Error('Failed to create profile')
    }

    const { data: providerProfile, error: providerError } = await supabaseAdmin
      .from('provider_profiles')
      .insert({
        user_id: userId,
        slug,
        business_name: input.business_name,
        description: input.description,
        phone_public: input.phone,
        department_id: input.department_id,
        municipality_id: input.municipality_id,
        verification_status: 'pending',
      })
      .select('id')
      .single()

    if (providerError || !providerProfile) {
      throw new Error('Failed to create provider profile')
    }

    const categoryInserts = subcategoryIds.map(subcategoryId => ({
      provider_id: providerProfile.id,
      subcategory_id: subcategoryId,
    }))

    const { error: categoriesError } = await supabaseAdmin
      .from('provider_categories')
      .insert(categoryInserts)

    if (categoriesError) {
      throw new Error('Failed to assign categories')
    }

    return {
      user_id: userId,
      provider_id: providerProfile.id,
      email: authData.user.email,
      message: 'Registration successful. Please check your email to confirm your account, then upload your verification documents.',
    }
  } catch (error) {
    await supabaseAdmin.auth.admin.deleteUser(userId)
    throw new HTTPException(500, { message: error instanceof Error ? error.message : 'Registration failed' })
  }
}

export async function login(email: string, password: string) {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new HTTPException(401, { message: 'Invalid email or password' })
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', data.user.id)
    .single()

  let providerProfile = null
  if (profile?.role === 'provider') {
    const { data: provider } = await supabaseAdmin
      .from('provider_profiles')
      .select('id, slug, business_name, verification_status, credits_balance')
      .eq('user_id', data.user.id)
      .single()
    providerProfile = provider
  }

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    user: {
      id: data.user.id,
      email: data.user.email,
      ...profile,
      provider_profile: providerProfile,
    },
  }
}

export async function getMe(userId: string) {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    throw new HTTPException(404, { message: 'Profile not found' })
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
    throw new HTTPException(400, { message: error.message })
  }

  return { message: 'Confirmation email sent' }
}
