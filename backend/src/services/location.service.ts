import { supabaseAdmin } from '../lib/supabase.js'
import { locationErrors } from '../errors/location.errors.js'

export async function getDepartments() {
  const { data, error } = await supabaseAdmin
    .from('departments')
    .select('id, name, slug')
    .order('name')

  if (error) {
    throw locationErrors.fetchDepartmentsFailed()
  }

  return data
}

export async function getMunicipalities(departmentId?: string) {
  let query = supabaseAdmin
    .from('municipalities')
    .select('id, name, slug, department_id, lat, lng')
    .order('name')

  if (departmentId) {
    query = query.eq('department_id', departmentId)
  }

  const { data, error } = await query

  if (error) {
    throw locationErrors.fetchMunicipalitiesFailed()
  }

  return data
}

export async function getDepartmentBySlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('departments')
    .select(`
      id,
      name,
      slug,
      municipalities (
        id,
        name,
        slug,
        lat,
        lng
      )
    `)
    .eq('slug', slug)
    .single()

  if (error || !data) {
    throw locationErrors.departmentNotFound()
  }

  return data
}
