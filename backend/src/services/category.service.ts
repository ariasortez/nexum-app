import { supabaseAdmin } from '../lib/supabase.js'
import { categoryErrors } from '../errors/category.errors.js'
import type { MainCategory } from '../schemas/index.js'

export async function getCategories() {
  const { data, error } = await supabaseAdmin
    .from('main_categories')
    .select(`
      id,
      name,
      slug,
      icon,
      subcategories (
        id,
        name,
        slug,
        icon
      )
    `)
    .eq('is_active', true)
    .order('name')

  if (error) {
    throw categoryErrors.fetchCategoriesFailed()
  }

  return data as MainCategory[]
}

export async function getCategoryBySlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('main_categories')
    .select(`
      id,
      name,
      slug,
      icon,
      subcategories (
        id,
        name,
        slug,
        icon
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    throw categoryErrors.categoryNotFound()
  }

  return data as MainCategory
}
