import { supabaseAdmin } from '../lib/supabase.js'
import type { UpdateProviderProfile, CreateWorkPost, UpdateWorkPost, CreateCertification, UpdateCertification } from '../schemas/index.js'
import { env } from '../config/env.js'
import { providerErrors } from '../errors/provider.errors.js'

type ProviderProfileRow = {
  id: string
  user_id: string
  slug: string
  business_name: string
  verification_status: 'pending' | 'in_review' | 'approved' | 'rejected'
  credits_balance: number | null
  [key: string]: unknown
}

type ProviderWorkPostRow = {
  id: string
  provider_id: string
  [key: string]: unknown
}

export async function getProviderByUserId(userId: string): Promise<ProviderProfileRow> {
  const { data, error } = await supabaseAdmin
    .from('provider_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    throw providerErrors.profileNotFound()
  }

  return data as ProviderProfileRow
}

export async function getMyProviderProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('provider_profiles')
    .select(`
      *,
      department:departments (id, name, slug),
      municipality:municipalities (id, name, slug),
      categories:provider_categories (
        subcategory:subcategories (
          id,
          name,
          slug,
          main_category:main_categories (id, name, slug)
        )
      )
    `)
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    throw providerErrors.profileNotFound()
  }

  return data
}

export async function updateProviderProfile(userId: string, input: UpdateProviderProfile) {
  const provider = await getProviderByUserId(userId)

  const { subcategory_ids, ...profileData } = input

  if (Object.keys(profileData).length > 0) {
    const { error } = await supabaseAdmin
      .from('provider_profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', provider.id)

    if (error) {
      throw providerErrors.updateProfileFailed()
    }
  }

  if (subcategory_ids && subcategory_ids.length > 0) {
    await updateCategories(provider.id, subcategory_ids)
  }

  return getMyProviderProfile(userId)
}

export async function updateCategories(providerId: string, subcategoryIds: string[]) {
  const { data: subcategories, error: subError } = await supabaseAdmin
    .from('subcategories')
    .select('id, main_category_id')
    .in('id', subcategoryIds)

  if (subError || !subcategories || subcategories.length !== subcategoryIds.length) {
    throw providerErrors.invalidSubcategoryIds()
  }

  const mainCategoryIds = [...new Set(subcategories.map(s => s.main_category_id))]
  if (mainCategoryIds.length > 5) {
    throw providerErrors.tooManyMainCategories()
  }

  if (subcategoryIds.length > 10) {
    throw providerErrors.tooManySubcategories()
  }

  const { error: deleteError } = await supabaseAdmin
    .from('provider_categories')
    .delete()
    .eq('provider_id', providerId)

  if (deleteError) {
    throw providerErrors.updateCategoriesFailed()
  }

  const categoryInserts = subcategoryIds.map(subcategoryId => ({
    provider_id: providerId,
    subcategory_id: subcategoryId,
  }))

  const { error: insertError } = await supabaseAdmin
    .from('provider_categories')
    .insert(categoryInserts)

  if (insertError) {
    throw providerErrors.updateCategoriesFailed()
  }

  return { success: true }
}

export async function getCategories(providerId: string) {
  const { data, error } = await supabaseAdmin
    .from('provider_categories')
    .select(`
      subcategory:subcategories (
        id,
        name,
        slug,
        main_category:main_categories (id, name, slug)
      )
    `)
    .eq('provider_id', providerId)

  if (error) {
    throw providerErrors.fetchCategoriesFailed()
  }

  return data
}

export async function getWorkPosts(providerId: string) {
  const { data, error } = await supabaseAdmin
    .from('provider_work_posts')
    .select(`
      id,
      title,
      description,
      images,
      created_at,
      updated_at,
      subcategory:subcategories (
        id,
        name,
        slug,
        main_category:main_categories (id, name, slug)
      )
    `)
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })

  if (error) {
    throw providerErrors.fetchWorkPostsFailed()
  }

  return data
}

export async function getWorkPostById(postId: string): Promise<ProviderWorkPostRow> {
  const { data, error } = await supabaseAdmin
    .from('provider_work_posts')
    .select(`
      id,
      provider_id,
      title,
      description,
      images,
      created_at,
      updated_at,
      subcategory:subcategories (
        id,
        name,
        slug,
        main_category:main_categories (id, name, slug)
      )
    `)
    .eq('id', postId)
    .single()

  if (error || !data) {
    throw providerErrors.workPostNotFound()
  }

  return data as ProviderWorkPostRow
}

export async function createWorkPost(providerId: string, input: CreateWorkPost) {
  const { data: subcategory } = await supabaseAdmin
    .from('provider_categories')
    .select('subcategory_id')
    .eq('provider_id', providerId)
    .eq('subcategory_id', input.subcategory_id)
    .single()

  if (!subcategory) {
    throw providerErrors.subcategoryNotRegistered()
  }

  const { data, error } = await supabaseAdmin
    .from('provider_work_posts')
    .insert({
      provider_id: providerId,
      title: input.title,
      description: input.description,
      subcategory_id: input.subcategory_id,
      images: input.images,
    })
    .select()
    .single()

  if (error) {
    throw providerErrors.createWorkPostFailed()
  }

  return data
}

export async function updateWorkPost(providerId: string, postId: string, input: UpdateWorkPost) {
  const existing = await getWorkPostById(postId)

  if (existing.provider_id !== providerId) {
    throw providerErrors.notAuthorized()
  }

  if (input.subcategory_id) {
    const { data: subcategory } = await supabaseAdmin
      .from('provider_categories')
      .select('subcategory_id')
      .eq('provider_id', providerId)
      .eq('subcategory_id', input.subcategory_id)
      .single()

    if (!subcategory) {
      throw providerErrors.subcategoryNotRegistered()
    }
  }

  const { data, error } = await supabaseAdmin
    .from('provider_work_posts')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)
    .select()
    .single()

  if (error) {
    throw providerErrors.updateWorkPostFailed()
  }

  return data
}

export async function deleteWorkPost(providerId: string, postId: string) {
  const existing = await getWorkPostById(postId)

  if (existing.provider_id !== providerId) {
    throw providerErrors.notAuthorized()
  }

  const { error } = await supabaseAdmin
    .from('provider_work_posts')
    .delete()
    .eq('id', postId)

  if (error) {
    throw providerErrors.deleteWorkPostFailed()
  }

  return { success: true }
}

export async function generateWorkPostUploadUrl(providerId: string, fileName: string) {
  const fileExt = fileName.split('.').pop()
  const filePath = `work-posts/${providerId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  const { data, error } = await supabaseAdmin.storage
    .from('portfolio')
    .createSignedUploadUrl(filePath)

  if (error) {
    throw providerErrors.generateUploadUrlFailed()
  }

  return {
    upload_url: data.signedUrl,
    file_path: filePath,
    public_url: `${env.SUPABASE_URL}/storage/v1/object/public/portfolio/${filePath}`,
  }
}

// ==================== CERTIFICATIONS ====================

export async function getCertifications(providerId: string) {
  const { data, error } = await supabaseAdmin
    .from('provider_certifications')
    .select('*')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })

  if (error) {
    throw providerErrors.fetchCertificationsFailed()
  }

  return data
}

type CertificationRow = {
  id: string
  provider_id: string
  name: string
  issuer: string
  [key: string]: unknown
}

export async function getCertificationById(certificationId: string): Promise<CertificationRow> {
  const { data, error } = await supabaseAdmin
    .from('provider_certifications')
    .select('*')
    .eq('id', certificationId)
    .single()

  if (error || !data) {
    throw providerErrors.certificationNotFound()
  }

  return data as CertificationRow
}

export async function createCertification(providerId: string, input: CreateCertification) {
  const { data, error } = await supabaseAdmin
    .from('provider_certifications')
    .insert({
      provider_id: providerId,
      name: input.name,
      issuer: input.issuer,
      description: input.description,
      issue_date: input.issue_date,
      expiry_date: input.expiry_date,
      certificate_url: input.certificate_url,
    })
    .select()
    .single()

  if (error) {
    throw providerErrors.createCertificationFailed()
  }

  return data
}

export async function updateCertification(providerId: string, certificationId: string, input: UpdateCertification) {
  const existing = await getCertificationById(certificationId)

  if (existing.provider_id !== providerId) {
    throw providerErrors.notAuthorized()
  }

  const { data, error } = await supabaseAdmin
    .from('provider_certifications')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', certificationId)
    .select()
    .single()

  if (error) {
    throw providerErrors.updateCertificationFailed()
  }

  return data
}

export async function deleteCertification(providerId: string, certificationId: string) {
  const existing = await getCertificationById(certificationId)

  if (existing.provider_id !== providerId) {
    throw providerErrors.notAuthorized()
  }

  const { error } = await supabaseAdmin
    .from('provider_certifications')
    .delete()
    .eq('id', certificationId)

  if (error) {
    throw providerErrors.deleteCertificationFailed()
  }

  return { success: true }
}

export async function generateCertificationUploadUrl(providerId: string, fileName: string) {
  const fileExt = fileName.split('.').pop()
  const filePath = `certifications/${providerId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  const { data, error } = await supabaseAdmin.storage
    .from('portfolio')
    .createSignedUploadUrl(filePath)

  if (error) {
    throw providerErrors.generateUploadUrlFailed()
  }

  return {
    upload_url: data.signedUrl,
    file_path: filePath,
    public_url: `${env.SUPABASE_URL}/storage/v1/object/public/portfolio/${filePath}`,
  }
}

// ==================== PUBLIC PROFILE ====================

export async function getPublicProfileBySlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('provider_profiles')
    .select(`
      id,
      slug,
      business_name,
      description,
      phone_public,
      verified,
      avg_rating,
      total_reviews,
      response_time_avg,
      is_active,
      created_at,
      department:departments (id, name, slug),
      municipality:municipalities (id, name, slug),
      categories:provider_categories (
        subcategory:subcategories (
          id,
          name,
          slug,
          main_category:main_categories (id, name, slug)
        )
      ),
      user:profiles!provider_profiles_user_id_fkey (
        full_name,
        avatar_url
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    throw providerErrors.profileNotFound()
  }

  return data
}

export async function getPublicWorkPosts(providerId: string) {
  const { data, error } = await supabaseAdmin
    .from('provider_work_posts')
    .select(`
      id,
      title,
      description,
      images,
      created_at,
      subcategory:subcategories (
        id,
        name,
        slug,
        main_category:main_categories (id, name, slug)
      )
    `)
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    throw providerErrors.fetchWorkPostsFailed()
  }

  return data
}

export async function getPublicCertifications(providerId: string) {
  const { data, error } = await supabaseAdmin
    .from('provider_certifications')
    .select(`
      id,
      name,
      issuer,
      description,
      issue_date,
      expiry_date,
      certificate_url,
      verified
    `)
    .eq('provider_id', providerId)
    .order('verified', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw providerErrors.fetchCertificationsFailed()
  }

  return data
}

export async function getPublicReviews(providerId: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit

  const { data, error, count } = await supabaseAdmin
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      photos,
      created_at,
      client:profiles!reviews_client_id_fkey (
        full_name,
        avatar_url
      ),
      request:service_requests (
        id,
        title,
        subcategory:subcategories (
          id,
          name
        )
      )
    `, { count: 'exact' })
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw providerErrors.fetchReviewsFailed()
  }

  const total = count || 0
  const totalPages = Math.ceil(total / limit)

  return {
    data: data || [],
    pagination: {
      page,
      limit,
      total,
      total_pages: totalPages,
    },
  }
}
