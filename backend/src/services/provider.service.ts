import { supabaseAdmin } from '../lib/supabase.js'
import type { UpdateProviderProfile, CreateWorkPost, UpdateWorkPost } from '../schemas/index.js'
import { env } from '../config/env.js'
import { providerErrors } from '../errors/provider.errors.js'

export async function getProviderByUserId(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('provider_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    throw providerErrors.profileNotFound()
  }

  return data
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

export async function getWorkPostById(postId: string) {
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

  return data
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
