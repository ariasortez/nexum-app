import { env } from '../config/env.js'
import { notificationErrors } from '../errors/notification.errors.js'
import { supabaseAdmin } from '../lib/supabase.js'

type NotificationType = 'proposal_received' | 'quotation_accepted' | 'quotation_rejected' | 'request_completed' | 'review_received'

type NotificationData = {
  request_id?: string
  response_id?: string
  estimated_price?: number
  provider_name?: string
  client_name?: string
  request_title?: string
}

type CreateNotificationParams = {
  recipientId: string
  actorId: string
  type: NotificationType
  title: string
  body: string
  data: NotificationData
  dedupeKey: string
}

type ListNotificationsParams = {
  limit?: number
}

const DEFAULT_NOTIFICATION_LIMIT = 20

// ============================================================================
// Query Functions
// ============================================================================

export async function listNotifications(userId: string, params: ListNotificationsParams = {}) {
  const limit = params.limit ?? DEFAULT_NOTIFICATION_LIMIT

  const [notificationsResult, unreadResult] = await Promise.all([
    supabaseAdmin
      .from('notifications')
      .select('id, recipient_id, actor_id, type, title, body, data, read_at, created_at')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabaseAdmin
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .is('read_at', null),
  ])

  if (notificationsResult.error || unreadResult.error) {
    throw notificationErrors.fetchFailed()
  }

  return {
    items: notificationsResult.data ?? [],
    unread_count: unreadResult.count ?? 0,
  }
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('recipient_id', userId)
    .select('id, read_at')
    .maybeSingle()

  if (error) {
    console.error('[Notifications] Mark read failed', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      notificationId,
      userId,
    })
    throw notificationErrors.updateFailed({
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
  }

  if (!data) {
    throw notificationErrors.notFound()
  }

  return data
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabaseAdmin
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', userId)
    .is('read_at', null)

  if (error) {
    console.error('[Notifications] Mark all read failed', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      userId,
    })
    throw notificationErrors.updateFailed({
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
  }

  return { updated: true }
}

// ============================================================================
// Core Create Function (Single Responsibility)
// ============================================================================

async function createNotification(params: CreateNotificationParams) {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .upsert({
      recipient_id: params.recipientId,
      actor_id: params.actorId,
      type: params.type,
      title: params.title,
      body: params.body,
      data: params.data,
      dedupe_key: params.dedupeKey,
    }, { onConflict: 'dedupe_key' })
    .select('id')
    .single()

  if (error) {
    const details = {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      type: params.type,
      recipientId: params.recipientId,
      actorId: params.actorId,
      dedupeKey: params.dedupeKey,
    }
    console.error('[Notifications] Create failed', details)
    throw notificationErrors.createFailed(details)
  }

  return data
}

// ============================================================================
// Notification Factory Functions (Open/Closed - extend without modifying core)
// ============================================================================

type ProposalReceivedParams = {
  recipientId: string
  actorId: string
  requestId: string
  responseId: string
  requestTitle: string
  providerName: string
  estimatedPrice: number
}

export async function createProposalReceivedNotification(params: ProposalReceivedParams) {
  return createNotification({
    recipientId: params.recipientId,
    actorId: params.actorId,
    type: 'proposal_received',
    title: 'Nueva cotización recibida',
    body: `${params.providerName} envió una cotización para "${params.requestTitle}".`,
    data: {
      request_id: params.requestId,
      response_id: params.responseId,
      estimated_price: params.estimatedPrice,
      provider_name: params.providerName,
    },
    dedupeKey: `proposal_received:${params.responseId}`,
  })
}

type QuotationStatusParams = {
  recipientId: string
  actorId: string
  requestId: string
  responseId: string
  requestTitle: string
  clientName: string
}

export async function createQuotationAcceptedNotification(params: QuotationStatusParams) {
  return createNotification({
    recipientId: params.recipientId,
    actorId: params.actorId,
    type: 'quotation_accepted',
    title: '¡Tu cotización fue aceptada!',
    body: `${params.clientName} aceptó tu cotización para "${params.requestTitle}".`,
    data: {
      request_id: params.requestId,
      response_id: params.responseId,
      client_name: params.clientName,
      request_title: params.requestTitle,
    },
    dedupeKey: `quotation_accepted:${params.responseId}`,
  })
}

export async function createQuotationRejectedNotification(params: QuotationStatusParams) {
  return createNotification({
    recipientId: params.recipientId,
    actorId: params.actorId,
    type: 'quotation_rejected',
    title: 'Cotización no seleccionada',
    body: `${params.clientName} eligió otro proveedor para "${params.requestTitle}".`,
    data: {
      request_id: params.requestId,
      response_id: params.responseId,
      client_name: params.clientName,
      request_title: params.requestTitle,
    },
    dedupeKey: `quotation_rejected:${params.responseId}`,
  })
}

// ============================================================================
// Request Completed Notification
// ============================================================================

type RequestCompletedParams = {
  recipientId: string
  actorId: string
  requestId: string
  requestTitle: string
}

export async function createRequestCompletedNotification(params: RequestCompletedParams) {
  return createNotification({
    recipientId: params.recipientId,
    actorId: params.actorId,
    type: 'request_completed',
    title: '¡Trabajo completado!',
    body: `El cliente marcó como completado el trabajo "${params.requestTitle}".`,
    data: {
      request_id: params.requestId,
      request_title: params.requestTitle,
    },
    dedupeKey: `request_completed:${params.requestId}`,
  })
}

// ============================================================================
// Review Received Notification
// ============================================================================

type ReviewReceivedParams = {
  recipientId: string
  actorId: string
  requestId: string
  rating: number
}

export async function createReviewReceivedNotification(params: ReviewReceivedParams) {
  const stars = '★'.repeat(params.rating) + '☆'.repeat(5 - params.rating)
  return createNotification({
    recipientId: params.recipientId,
    actorId: params.actorId,
    type: 'review_received',
    title: '¡Nueva reseña recibida!',
    body: `Un cliente te dejó una reseña: ${stars}`,
    data: {
      request_id: params.requestId,
    },
    dedupeKey: `review_received:${params.requestId}`,
  })
}

// ============================================================================
// Realtime Config
// ============================================================================

export function getRealtimeConfig(accessToken: string) {
  return {
    supabase_url: env.SUPABASE_URL,
    supabase_anon_key: env.SUPABASE_ANON_KEY,
    access_token: accessToken,
  }
}
