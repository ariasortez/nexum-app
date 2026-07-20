import { supabaseAdmin } from '../lib/supabase.js'
import { env } from '../config/env.js'
import type { CreateRequestResponse, CreateServiceRequest, UpdateServiceRequest } from '../schemas/index.js'
import type { AuthUser } from '../types/index.js'
import { requestErrors } from '../errors/request.errors.js'
import { providerErrors } from '../errors/provider.errors.js'
import { responseErrors } from '../errors/response.errors.js'
import * as notificationService from './notification.service.js'
import * as messageService from './message.service.js'

type AcceptQuotationResult = {
  accepted_response_id: string
  rejected_response_ids: string[]
}

type RejectQuotationResult = {
  rejected_response_id: string
}

const RESPONSE_CREDIT_COST = 1
const DEFAULT_MAX_PROPOSALS_PER_REQUEST = 5

type ProviderCannotRespondReason =
  | 'already_responded'
  | 'insufficient_credits'
  | 'max_responses_reached'
  | 'request_not_open'

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

export async function listClientRequests(clientId: string, params: ListRequestsParams) {
  const { page, limit, status } = params
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
      ),
      responses:request_responses (
        id,
        message,
        estimated_price,
        is_selected,
        status,
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
    `, { count: 'exact' })
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
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

export async function getRequestById(id: string, user: AuthUser) {
  const { data, error } = await supabaseAdmin
    .from('service_requests')
    .select(`
      id,
      client_id,
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
        avatar_url
      ),
      responses:request_responses (
        id,
        message,
        estimated_price,
        is_selected,
        status,
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

  if (user.role !== 'admin' && data.client_id !== user.id) {
    throw requestErrors.readNotAuthorized()
  }

  const { client_id: _clientId, ...request } = data
  return request
}

export async function generatePhotoUploadUrl(userId: string, fileName: string) {
  const fileExt = fileName.split('.').pop()?.toLowerCase() || 'jpg'
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'heic']

  if (!allowedExts.includes(fileExt)) {
    throw requestErrors.invalidPhotoFormat()
  }

  const filePath = `photos/${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  const { data, error } = await supabaseAdmin.storage
    .from('requests')
    .createSignedUploadUrl(filePath)

  if (error) {
    throw requestErrors.generateUploadUrlFailed()
  }

  return {
    upload_url: data.signedUrl,
    file_path: filePath,
    public_url: `${env.SUPABASE_URL}/storage/v1/object/public/requests/${filePath}`,
  }
}

export async function createRequest(clientId: string, input: CreateServiceRequest) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('department_id, municipality_id')
    .eq('id', clientId)
    .single()

  if (profileError || !profile) {
    throw requestErrors.clientProfileNotFound()
  }

  if (!profile.department_id || !profile.municipality_id) {
    throw requestErrors.clientLocationRequired()
  }

  const { data, error } = await supabaseAdmin
    .from('service_requests')
    .insert({
      client_id: clientId,
      subcategory_id: input.subcategory_id,
      title: input.title,
      description: input.description,
      urgency: input.urgency,
      department_id: profile.department_id,
      municipality_id: profile.municipality_id,
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
    console.error('[Request create] Supabase insert failed', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw requestErrors.createRequestFailed({
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
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

interface ListAvailableRequestsParams {
  page: number
  limit: number
}

async function getProviderOpportunityContext(userId: string) {
  const { data: provider, error: providerError } = await supabaseAdmin
    .from('provider_profiles')
    .select('id, user_id, business_name, department_id, municipality_id, credits_balance')
    .eq('user_id', userId)
    .single()

  if (providerError || !provider) {
    throw providerErrors.profileNotFound()
  }

  const { data: providerCategories, error: catError } = await supabaseAdmin
    .from('provider_categories')
    .select('subcategory_id')
    .eq('provider_id', provider.id)

  if (catError) {
    throw requestErrors.fetchRequestsFailed()
  }

  if (!providerCategories || providerCategories.length === 0) {
    throw requestErrors.providerNoCategoriesConfigured()
  }

  const subcategoryIds = providerCategories.map(category => category.subcategory_id)

  if (subcategoryIds.length === 0) {
    throw requestErrors.providerNoCategoriesConfigured()
  }

  return { provider, subcategoryIds }
}

async function getMaxProposalsPerRequest() {
  const { data, error } = await supabaseAdmin
    .from('marketplace_settings')
    .select('max_proposals_per_request')
    .eq('id', true)
    .maybeSingle()

  if (error) {
    throw responseErrors.fetchResponsesFailed()
  }

  return data?.max_proposals_per_request ?? DEFAULT_MAX_PROPOSALS_PER_REQUEST
}

function getResponseLimit(maxResponses: number | null, maxProposalsPerRequest: number) {
  return Math.min(maxResponses ?? maxProposalsPerRequest, maxProposalsPerRequest)
}

async function getResponseCounts(requestIds: string[]) {
  if (requestIds.length === 0) {
    return new Map<string, number>()
  }

  const { data, error } = await supabaseAdmin
    .from('request_responses')
    .select('request_id')
    .in('request_id', requestIds)

  if (error) {
    throw responseErrors.fetchResponsesFailed()
  }

  return (data ?? []).reduce((counts, response) => {
    counts.set(response.request_id, (counts.get(response.request_id) ?? 0) + 1)
    return counts
  }, new Map<string, number>())
}

async function getProviderResponseRequestIds(providerId: string, requestIds: string[]) {
  if (requestIds.length === 0) {
    return new Set<string>()
  }

  const { data, error } = await supabaseAdmin
    .from('request_responses')
    .select('request_id')
    .eq('provider_id', providerId)
    .in('request_id', requestIds)

  if (error) {
    throw responseErrors.fetchResponsesFailed()
  }

  return new Set((data ?? []).map(response => response.request_id))
}

function filterAvailableRequests<T extends { id: string; max_responses: number | null }>(
  requests: T[],
  responseCounts: Map<string, number>,
  providerResponseRequestIds: Set<string>,
  maxProposalsPerRequest: number
) {
  return requests.filter(request => {
    if (providerResponseRequestIds.has(request.id)) {
      return false
    }
    return (responseCounts.get(request.id) ?? 0) < getResponseLimit(request.max_responses, maxProposalsPerRequest)
  })
}

export async function listAvailableRequestsForProvider(userId: string, params: ListAvailableRequestsParams) {
  const { page, limit } = params
  const offset = (page - 1) * limit
  const { provider, subcategoryIds } = await getProviderOpportunityContext(userId)

  const { data: matchingRequests, error } = await supabaseAdmin
    .from('service_requests')
    .select(`
      id,
      title,
      description,
      urgency,
      status,
      max_responses,
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
        full_name
      )
    `)
    .eq('status', 'open')
    .eq('department_id', provider.department_id)
    .eq('municipality_id', provider.municipality_id)
    .in('subcategory_id', subcategoryIds)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(0, 999)

  if (error) {
    throw requestErrors.fetchRequestsFailed()
  }

  const requestIds = (matchingRequests ?? []).map(request => request.id)
  const [maxProposalsPerRequest, responseCounts, providerResponseRequestIds] = await Promise.all([
    getMaxProposalsPerRequest(),
    getResponseCounts(requestIds),
    getProviderResponseRequestIds(provider.id, requestIds),
  ])
  const availableRequests = filterAvailableRequests(
    matchingRequests ?? [],
    responseCounts,
    providerResponseRequestIds,
    maxProposalsPerRequest
  )
  const pagedRequests = availableRequests.slice(offset, offset + limit)

  return {
    data: pagedRequests,
    pagination: {
      page,
      limit,
      total: availableRequests.length,
      total_pages: Math.ceil(availableRequests.length / limit),
    },
  }
}

export async function getAvailableRequestForProvider(userId: string, requestId: string) {
  const { provider, subcategoryIds } = await getProviderOpportunityContext(userId)

  const { data: request, error } = await supabaseAdmin
    .from('service_requests')
    .select(`
      id,
      title,
      description,
      urgency,
      status,
      max_responses,
      photos,
      address,
      lat,
      lng,
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
        full_name
      )
    `)
    .eq('id', requestId)
    .eq('department_id', provider.department_id)
    .eq('municipality_id', provider.municipality_id)
    .in('subcategory_id', subcategoryIds)
    .is('deleted_at', null)
    .single()

  if (error || !request) {
    throw requestErrors.requestNotFound()
  }

  const [maxProposalsPerRequest, responseCounts, providerResponseRequestIds] = await Promise.all([
    getMaxProposalsPerRequest(),
    getResponseCounts([request.id]),
    getProviderResponseRequestIds(provider.id, [request.id]),
  ])
  const hasResponded = providerResponseRequestIds.has(request.id)
  const responseCount = responseCounts.get(request.id) ?? 0
  const responseLimit = getResponseLimit(request.max_responses, maxProposalsPerRequest)
  const hasEnoughCredits = (provider.credits_balance ?? 0) >= RESPONSE_CREDIT_COST

  let cannotRespondReason: ProviderCannotRespondReason | null = null
  if (hasResponded) {
    cannotRespondReason = 'already_responded'
  } else if (request.status !== 'open') {
    cannotRespondReason = 'request_not_open'
  } else if (responseCount >= responseLimit) {
    cannotRespondReason = 'max_responses_reached'
  } else if (!hasEnoughCredits) {
    cannotRespondReason = 'insufficient_credits'
  }

  if (hasResponded) {
    return {
      ...request,
      response_count: responseCount,
      response_limit: responseLimit,
      has_responded: true,
      can_respond: false,
      cannot_respond_reason: cannotRespondReason,
      credits_balance: provider.credits_balance ?? 0,
    }
  }

  return {
    ...request,
    response_count: responseCount,
    response_limit: responseLimit,
    has_responded: false,
    can_respond: cannotRespondReason === null,
    cannot_respond_reason: cannotRespondReason,
    credits_balance: provider.credits_balance ?? 0,
    client: request.client ? { full_name: request.client.full_name } : null,
  }
}

export async function createProviderResponse(userId: string, requestId: string, input: CreateRequestResponse) {
  const { provider, subcategoryIds } = await getProviderOpportunityContext(userId)
  const maxProposalsPerRequest = await getMaxProposalsPerRequest()

  if ((provider.credits_balance ?? 0) < RESPONSE_CREDIT_COST) {
    throw responseErrors.insufficientCredits()
  }

  const { data: request, error: requestError } = await supabaseAdmin
    .from('service_requests')
    .select('id, client_id, title, status, department_id, municipality_id, subcategory_id, max_responses')
    .eq('id', requestId)
    .is('deleted_at', null)
    .single()

  if (requestError || !request) {
    throw responseErrors.requestNotFound()
  }

  if (request.status !== 'open') {
    throw responseErrors.requestNotOpen()
  }

  if (request.department_id !== provider.department_id || request.municipality_id !== provider.municipality_id) {
    throw responseErrors.departmentMismatch()
  }

  if (!subcategoryIds.includes(request.subcategory_id)) {
    throw responseErrors.categoryMismatch()
  }

  const [{ count: totalResponses, error: countError }, existingResponse] = await Promise.all([
    supabaseAdmin
      .from('request_responses')
      .select('id', { count: 'exact', head: true })
      .eq('request_id', requestId),
    supabaseAdmin
      .from('request_responses')
      .select('id')
      .eq('request_id', requestId)
      .eq('provider_id', provider.id)
      .maybeSingle(),
  ])

  if (countError) {
    throw responseErrors.fetchResponsesFailed()
  }

  if (existingResponse.error) {
    throw responseErrors.fetchResponsesFailed()
  }

  if (existingResponse.data) {
    throw responseErrors.alreadyResponded()
  }

  if ((totalResponses ?? 0) >= getResponseLimit(request.max_responses, maxProposalsPerRequest)) {
    throw responseErrors.maxResponsesReached()
  }

  const currentBalance = provider.credits_balance ?? 0
  const newBalance = currentBalance - RESPONSE_CREDIT_COST

  const { error: creditError } = await supabaseAdmin
    .from('provider_profiles')
    .update({ credits_balance: newBalance })
    .eq('id', provider.id)

  if (creditError) {
    throw responseErrors.insufficientCredits()
  }

  const { data: response, error: responseError } = await supabaseAdmin
    .from('request_responses')
    .insert({
      request_id: requestId,
      provider_id: provider.id,
      message: input.message,
      estimated_price: input.estimated_price,
      credits_spent: RESPONSE_CREDIT_COST,
    })
    .select('id, request_id, provider_id, message, estimated_price, credits_spent, is_selected, created_at')
    .single()

  if (responseError) {
    await supabaseAdmin
      .from('provider_profiles')
      .update({ credits_balance: currentBalance })
      .eq('id', provider.id)

    throw responseErrors.createResponseFailed()
  }

  await messageService.ensureConversationForResponse(response.id)

  await notificationService.createProposalReceivedNotification({
    recipientId: request.client_id,
    actorId: provider.user_id,
    requestId,
    responseId: response.id,
    requestTitle: request.title,
    providerName: provider.business_name,
    estimatedPrice: input.estimated_price ?? response.estimated_price ?? 0,
  }).catch((error: unknown) => {
    console.error('[Notifications] Failed to create proposal notification', error)
  })

  return response
}

interface ListProviderResponsesParams {
  page: number
  limit: number
  status?: string
}

export async function listProviderResponses(userId: string, params: ListProviderResponsesParams) {
  const { page, limit, status } = params
  const offset = (page - 1) * limit

  const { data: provider, error: providerError } = await supabaseAdmin
    .from('provider_profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (providerError || !provider) {
    throw providerErrors.profileNotFound()
  }

  let query = supabaseAdmin
    .from('request_responses')
    .select(`
      id,
      message,
      estimated_price,
      is_selected,
      status,
      credits_spent,
      created_at,
      request:service_requests!request_responses_request_id_fkey (
        id,
        title,
        description,
        urgency,
        status,
        created_at,
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
      )
    `, { count: 'exact' })
    .eq('provider_id', provider.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error, count } = await query

  if (error) {
    throw responseErrors.fetchResponsesFailed()
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

export async function getProviderResponseById(userId: string, responseId: string) {
  const { data: provider, error: providerError } = await supabaseAdmin
    .from('provider_profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (providerError || !provider) {
    throw providerErrors.profileNotFound()
  }

  const { data: response, error } = await supabaseAdmin
    .from('request_responses')
    .select(`
      id,
      message,
      estimated_price,
      is_selected,
      status,
      credits_spent,
      created_at,
      request:service_requests!request_responses_request_id_fkey (
        id,
        title,
        description,
        urgency,
        status,
        photos,
        address,
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
          avatar_url
        )
      )
    `)
    .eq('id', responseId)
    .eq('provider_id', provider.id)
    .single()

  if (error || !response) {
    throw responseErrors.responseNotFound()
  }

  return response
}

export async function cancelProviderResponse(userId: string, responseId: string) {
  const { data: provider, error: providerError } = await supabaseAdmin
    .from('provider_profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (providerError || !provider) {
    throw providerErrors.profileNotFound()
  }

  const { data: response, error: responseError } = await supabaseAdmin
    .from('request_responses')
    .select('id, status, provider_id')
    .eq('id', responseId)
    .single()

  if (responseError || !response) {
    throw responseErrors.responseNotFound()
  }

  if (response.provider_id !== provider.id) {
    throw responseErrors.notYourResponse()
  }

  if (response.status === 'cancelled') {
    throw responseErrors.alreadyCancelled()
  }

  if (response.status === 'accepted') {
    throw responseErrors.cannotCancelAccepted()
  }

  if (response.status === 'completed') {
    throw responseErrors.cannotCancelCompleted()
  }

  const { error: updateError } = await supabaseAdmin
    .from('request_responses')
    .update({ status: 'cancelled' })
    .eq('id', responseId)

  if (updateError) {
    throw responseErrors.cancelResponseFailed()
  }

  await messageService.closeConversationForResponse(responseId, 'response_cancelled')

  return { success: true }
}

export async function acceptQuotation(clientId: string, requestId: string, responseId: string): Promise<AcceptQuotationResult> {
  const { data: request, error: requestError } = await supabaseAdmin
    .from('service_requests')
    .select('id, client_id, title, status')
    .eq('id', requestId)
    .is('deleted_at', null)
    .single()

  if (requestError || !request) {
    throw requestErrors.requestNotFound()
  }

  if (request.client_id !== clientId) {
    throw requestErrors.updateNotAuthorized()
  }

  if (request.status !== 'open') {
    throw requestErrors.updateOnlyOpen()
  }

  const { data: targetResponse, error: responseError } = await supabaseAdmin
    .from('request_responses')
    .select(`
      id,
      status,
      provider_id,
      provider:provider_profiles (
        id,
        user_id
      )
    `)
    .eq('id', responseId)
    .eq('request_id', requestId)
    .single()

  if (responseError || !targetResponse) {
    throw responseErrors.responseNotFound()
  }

  if (targetResponse.status !== 'pending') {
    throw responseErrors.responseNotPending()
  }

  const { data: allResponses, error: allResponsesError } = await supabaseAdmin
    .from('request_responses')
    .select(`
      id,
      provider_id,
      provider:provider_profiles (
        id,
        user_id
      )
    `)
    .eq('request_id', requestId)
    .neq('id', responseId)
    .eq('status', 'pending')

  if (allResponsesError) {
    throw responseErrors.fetchResponsesFailed()
  }

  const { error: acceptError } = await supabaseAdmin
    .from('request_responses')
    .update({ status: 'accepted', is_selected: true })
    .eq('id', responseId)

  if (acceptError) {
    throw responseErrors.acceptResponseFailed()
  }

  await messageService.ensureConversationForResponse(responseId)

  const rejectedIds: string[] = []
  if (allResponses && allResponses.length > 0) {
    const { error: rejectError } = await supabaseAdmin
      .from('request_responses')
      .update({ status: 'rejected', is_selected: false })
      .eq('request_id', requestId)
      .neq('id', responseId)
      .eq('status', 'pending')

    if (rejectError) {
      console.error('[Request] Failed to reject other responses', rejectError)
    }

    rejectedIds.push(...allResponses.map(r => r.id))
    await Promise.all(rejectedIds.map(id => messageService.closeConversationForResponse(id, 'response_rejected')))
  }

  const { error: updateRequestError } = await supabaseAdmin
    .from('service_requests')
    .update({ status: 'in_progress' })
    .eq('id', requestId)

  if (updateRequestError) {
    console.error('[Request] Failed to update request status', updateRequestError)
  }

  const { data: clientProfile } = await supabaseAdmin
    .from('profiles')
    .select('full_name')
    .eq('id', clientId)
    .single()

  const clientName = clientProfile?.full_name ?? 'Cliente'

  const provider = targetResponse.provider as { id: string; user_id: string } | null
  if (provider?.user_id) {
    notificationService.createQuotationAcceptedNotification({
      recipientId: provider.user_id,
      actorId: clientId,
      requestId,
      responseId,
      requestTitle: request.title,
      clientName,
    }).catch((error: unknown) => {
      console.error('[Notifications] Failed to create accepted notification', error)
    })
  }

  for (const rejectedResponse of (allResponses ?? [])) {
    const rejectedProvider = rejectedResponse.provider as { id: string; user_id: string } | null
    if (rejectedProvider?.user_id) {
      notificationService.createQuotationRejectedNotification({
        recipientId: rejectedProvider.user_id,
        actorId: clientId,
        requestId,
        responseId: rejectedResponse.id,
        requestTitle: request.title,
        clientName,
      }).catch((error: unknown) => {
        console.error('[Notifications] Failed to create rejected notification', error)
      })
    }
  }

  return {
    accepted_response_id: responseId,
    rejected_response_ids: rejectedIds,
  }
}

export async function rejectQuotation(clientId: string, requestId: string, responseId: string): Promise<RejectQuotationResult> {
  const { data: request, error: requestError } = await supabaseAdmin
    .from('service_requests')
    .select('id, client_id, title, status')
    .eq('id', requestId)
    .is('deleted_at', null)
    .single()

  if (requestError || !request) {
    throw requestErrors.requestNotFound()
  }

  if (request.client_id !== clientId) {
    throw requestErrors.updateNotAuthorized()
  }

  if (request.status !== 'open') {
    throw requestErrors.updateOnlyOpen()
  }

  const { data: targetResponse, error: responseError } = await supabaseAdmin
    .from('request_responses')
    .select(`
      id,
      status,
      provider_id,
      provider:provider_profiles (
        id,
        user_id
      )
    `)
    .eq('id', responseId)
    .eq('request_id', requestId)
    .single()

  if (responseError || !targetResponse) {
    throw responseErrors.responseNotFound()
  }

  if (targetResponse.status !== 'pending') {
    throw responseErrors.responseNotPending()
  }

  const { error: rejectError } = await supabaseAdmin
    .from('request_responses')
    .update({ status: 'rejected', is_selected: false })
    .eq('id', responseId)
    .eq('status', 'pending')

  if (rejectError) {
    throw responseErrors.rejectResponseFailed()
  }

  await messageService.closeConversationForResponse(responseId, 'response_rejected')

  const { data: clientProfile } = await supabaseAdmin
    .from('profiles')
    .select('full_name')
    .eq('id', clientId)
    .single()

  const clientName = clientProfile?.full_name ?? 'Cliente'
  const provider = targetResponse.provider as { id: string; user_id: string } | null

  if (provider?.user_id) {
    notificationService.createQuotationRejectedNotification({
      recipientId: provider.user_id,
      actorId: clientId,
      requestId,
      responseId,
      requestTitle: request.title,
      clientName,
    }).catch((error: unknown) => {
      console.error('[Notifications] Failed to create rejected notification', error)
    })
  }

  return {
    rejected_response_id: responseId,
  }
}
