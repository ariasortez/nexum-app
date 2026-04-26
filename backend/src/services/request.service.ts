import { supabaseAdmin } from '../lib/supabase.js'
import type { CreateServiceRequest, UpdateServiceRequest } from '../schemas/index.js'
import { requestErrors } from '../errors/request.errors.js'

interface ListRequestsParams {
  page: number
  limit: number
  status?: string
  subcategory_id?: string
  department_id?: string
  municipality_id?: string
}

export async function listRequests(params: ListRequestsParams) {
  const { page, limit, status, subcategory_id, department_id, municipality_id } = params
  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('service_requests')
    .select(`
      id,
      title,
      description,
      urgency,
      status,
      max_responses,
      photos,
      created_at,
      expires_at,
      subcategory:subcategories (
        id,
        name,
        slug
      ),
      department:departments (
        id,
        name
      ),
      municipality:municipalities (
        id,
        name
      ),
      client:profiles (
        id,
        full_name,
        avatar_url
      )
    `, { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }
  if (subcategory_id) {
    query = query.eq('subcategory_id', subcategory_id)
  }
  if (department_id) {
    query = query.eq('department_id', department_id)
  }
  if (municipality_id) {
    query = query.eq('municipality_id', municipality_id)
  }

  const { data, error, count } = await query

  if (error) {
    throw requestErrors.fetchRequestsFailed()
  }

  return {
    data,
    pagination: {
      page,
      limit,
      total: count ?? 0,
      total_pages: Math.ceil((count ?? 0) / limit),
    },
  }
}

export async function getRequestById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('service_requests')
    .select(`
      id,
      title,
      description,
      urgency,
      status,
      address,
      lat,
      lng,
      max_responses,
      photos,
      created_at,
      expires_at,
      subcategory:subcategories (
        id,
        name,
        slug,
        main_category:main_categories (
          id,
          name,
          slug
        )
      ),
      department:departments (
        id,
        name
      ),
      municipality:municipalities (
        id,
        name
      ),
      client:profiles (
        id,
        full_name,
        avatar_url,
        phone
      ),
      responses:request_responses (
        id,
        message,
        estimated_price,
        is_selected,
        created_at,
        provider:provider_profiles (
          id,
          slug,
          business_name,
          avg_rating,
          total_reviews,
          verified
        )
      )
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error || !data) {
    throw requestErrors.requestNotFound()
  }

  return data
}

export async function createRequest(clientId: string, input: CreateServiceRequest) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const { data, error } = await supabaseAdmin
    .from('service_requests')
    .insert({
      client_id: clientId,
      subcategory_id: input.subcategory_id,
      title: input.title,
      description: input.description,
      urgency: input.urgency,
      department_id: input.department_id,
      municipality_id: input.municipality_id,
      address: input.address,
      lat: input.lat,
      lng: input.lng,
      photos: input.photos,
      status: 'open',
      expires_at: expiresAt.toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    throw requestErrors.createRequestFailed()
  }

  return data
}

export async function updateRequest(id: string, clientId: string, input: UpdateServiceRequest) {
  const existing = await supabaseAdmin
    .from('service_requests')
    .select('client_id, status')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (existing.error || !existing.data) {
    throw requestErrors.requestNotFound()
  }

  if (existing.data.client_id !== clientId) {
    throw requestErrors.updateNotAuthorized()
  }

  if (existing.data.status !== 'open') {
    throw requestErrors.updateOnlyOpen()
  }

  const updateFields: {
    title?: string
    description?: string
    urgency?: string
    status?: string
  } = {}

  if (input.title !== undefined) updateFields.title = input.title
  if (input.description !== undefined) updateFields.description = input.description
  if (input.urgency !== undefined) updateFields.urgency = input.urgency
  if (input.status !== undefined) updateFields.status = input.status

  const { data, error } = await supabaseAdmin
    .from('service_requests')
    .update(updateFields)
    .eq('id', id)
    .select('id')
    .single()

  if (error) {
    throw requestErrors.updateRequestFailed()
  }

  return data
}

export async function deleteRequest(id: string, clientId: string) {
  const existing = await supabaseAdmin
    .from('service_requests')
    .select('client_id')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (existing.error || !existing.data) {
    throw requestErrors.requestNotFound()
  }

  if (existing.data.client_id !== clientId) {
    throw requestErrors.deleteNotAuthorized()
  }

  const { error } = await supabaseAdmin
    .from('service_requests')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    throw requestErrors.deleteRequestFailed()
  }

  return { success: true }
}
