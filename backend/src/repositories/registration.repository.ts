import { supabaseAdmin } from '../lib/supabase.js'
import type { RegisterClient, RegisterProvider } from '../schemas/index.js'

type SubcategoryRow = {
  id: string
  main_category_id: string
}

type CreateProfileInput = Pick<RegisterClient, 'full_name' | 'phone' | 'department_id' | 'municipality_id'> & {
  user_id: string
  role: 'client' | 'provider'
}

type CreateProviderProfileInput = Pick<RegisterProvider, 'business_name' | 'description' | 'phone' | 'department_id' | 'municipality_id'> & {
  user_id: string
  slug: string
}

export async function providerSlugExists(slug: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('provider_profiles')
    .select('slug')
    .eq('slug', slug)
    .single()

  return Boolean(data)
}

export async function getSubcategoriesByIds(ids: string[]) {
  return supabaseAdmin
    .from('subcategories')
    .select('id, main_category_id')
    .in('id', ids)
}

export async function createProfile(input: CreateProfileInput) {
  return supabaseAdmin
    .from('profiles')
    .insert({
      id: input.user_id,
      full_name: input.full_name,
      phone: input.phone,
      role: input.role,
      department_id: input.department_id,
      municipality_id: input.municipality_id,
    })
}

export async function createProviderProfile(input: CreateProviderProfileInput) {
  return supabaseAdmin
    .from('provider_profiles')
    .insert({
      user_id: input.user_id,
      slug: input.slug,
      business_name: input.business_name,
      description: input.description,
      phone_public: input.phone,
      department_id: input.department_id,
      municipality_id: input.municipality_id,
      verification_status: 'pending',
    })
    .select('id')
    .single()
}

export async function assignProviderCategories(providerId: string, subcategoryIds: string[]) {
  const inserts = subcategoryIds.map((subcategoryId) => ({
    provider_id: providerId,
    subcategory_id: subcategoryId,
  }))

  return supabaseAdmin
    .from('provider_categories')
    .insert(inserts)
}

export function getUniqueMainCategoryIds(subcategories: SubcategoryRow[]): string[] {
  return [...new Set(subcategories.map((item) => item.main_category_id))]
}
