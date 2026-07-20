import { randomUUID } from 'node:crypto'
import { env } from '../config/env.js'
import { messageErrors } from '../errors/message.errors.js'
import { createSupabaseClient, supabaseAdmin } from '../lib/supabase.js'
import type {
  CreateConversationMessageInput,
  ListConversationMessagesQuery,
  ListConversationsQuery,
  SignConversationAttachmentInput,
} from '../schemas/message.schema.js'

const ATTACHMENT_BUCKET = 'chat-attachments'
const SIGNED_DOWNLOAD_TTL_SECONDS = 60 * 60
const DEFAULT_CONVERSATION_LIMIT = 30
const DEFAULT_MESSAGES_LIMIT = 50

type ConversationStatus = 'active' | 'closed'
type ParticipantType = 'client' | 'provider'

type ConversationRecord = {
  id: string
  request_id: string
  response_id: string
  client_id: string
  provider_id: string
  provider_user_id: string
  status: ConversationStatus
  created_at: string
  updated_at: string
  closed_at: string | null
  request: { id: string; title: string; status: string | null } | null
  response: { id: string; status: string; estimated_price: number | null } | null
  client: { id: string; full_name: string; avatar_url: string | null } | null
  provider: {
    id: string
    user_id: string
    slug: string
    business_name: string
    avg_rating: number | null
    total_reviews: number | null
    verified: boolean | null
  } | null
}

type MessageRecord = {
  id: string
  conversation_id: string
  sender_id: string
  body: string | null
  created_at: string
  deleted_at: string | null
  attachments?: AttachmentRecord[]
}

type AttachmentRecord = {
  id: string
  message_id: string
  bucket: string
  path: string
  file_name: string
  mime_type: string
  size_bytes: number
  upload_status: 'pending' | 'uploaded' | 'failed'
  created_at: string
  uploaded_at: string | null
}

export type MessageAttachmentItem = AttachmentRecord & {
  signed_url: string | null
}

export type ConversationMessageItem = Omit<MessageRecord, 'attachments'> & {
  is_own: boolean
  attachments: MessageAttachmentItem[]
}

export type ConversationSummary = {
  id: string
  request_id: string
  response_id: string
  status: ConversationStatus
  participant_type: ParticipantType
  participant: {
    id: string
    name: string
    avatar_url: string | null
    slug?: string
    verified?: boolean | null
  }
  request: {
    id: string
    title: string
    status: string | null
  } | null
  response: {
    id: string
    status: string
    estimated_price: number | null
  } | null
  last_message: ConversationMessageItem | null
  unread_count: number
  updated_at: string
  created_at: string
}

export type AttachmentUploadResult = {
  message: ConversationMessageItem
  attachment: MessageAttachmentItem
  upload: {
    bucket: string
    path: string
    token: string
    signed_url: string
  }
}

function logSupabaseError(scope: string, error: { message?: string; details?: string; hint?: string; code?: string } | null, extra?: Record<string, unknown>) {
  if (!error) return
  console.error(`[Messages] ${scope}`, {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
    ...extra,
  })
}

function assertConversationParticipant(conversation: Pick<ConversationRecord, 'client_id' | 'provider_user_id'>, userId: string) {
  if (conversation.client_id !== userId && conversation.provider_user_id !== userId) {
    throw messageErrors.conversationNotFound()
  }
}

function assertConversationActive(conversation: Pick<ConversationRecord, 'status'>) {
  if (conversation.status !== 'active') {
    throw messageErrors.conversationClosed()
  }
}

function toParticipant(conversation: ConversationRecord, userId: string): ConversationSummary['participant'] {
  const isClient = conversation.client_id === userId

  if (isClient) {
    return {
      id: conversation.provider_user_id,
      name: conversation.provider?.business_name ?? 'Proveedor',
      avatar_url: null,
      slug: conversation.provider?.slug,
      verified: conversation.provider?.verified,
    }
  }

  return {
    id: conversation.client_id,
    name: conversation.client?.full_name ?? 'Cliente',
    avatar_url: conversation.client?.avatar_url ?? null,
  }
}

function sanitizeFileName(fileName: string) {
  return fileName
    .normalize('NFKD')
    .replace(/[^\w.\-]+/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 120)
}

function buildAttachmentPath(conversationId: string, messageId: string, fileName: string) {
  return `conversations/${conversationId}/${messageId}/${randomUUID()}-${sanitizeFileName(fileName)}`
}

async function signUploadedAttachments(attachments: AttachmentRecord[]): Promise<MessageAttachmentItem[]> {
  return Promise.all(
    attachments.map(async (attachment) => {
      if (attachment.upload_status !== 'uploaded') {
        return { ...attachment, signed_url: null }
      }

      const { data, error } = await supabaseAdmin.storage
        .from(attachment.bucket)
        .createSignedUrl(attachment.path, SIGNED_DOWNLOAD_TTL_SECONDS)

      if (error) {
        logSupabaseError('Signed download URL failed', error, { attachmentId: attachment.id })
        return { ...attachment, signed_url: null }
      }

      return { ...attachment, signed_url: data.signedUrl }
    })
  )
}

async function toMessageItem(message: MessageRecord, userId: string): Promise<ConversationMessageItem> {
  const attachments = await signUploadedAttachments(message.attachments ?? [])

  return {
    id: message.id,
    conversation_id: message.conversation_id,
    sender_id: message.sender_id,
    body: message.body,
    created_at: message.created_at,
    deleted_at: message.deleted_at,
    is_own: message.sender_id === userId,
    attachments,
  }
}

async function fetchConversation(conversationId: string): Promise<ConversationRecord> {
  const { data, error } = await supabaseAdmin
    .from('conversations')
    .select(`
      id,
      request_id,
      response_id,
      client_id,
      provider_id,
      provider_user_id,
      status,
      created_at,
      updated_at,
      closed_at,
      request:service_requests!conversations_request_id_fkey (
        id,
        title,
        status
      ),
      response:request_responses!conversations_response_id_fkey (
        id,
        status,
        estimated_price
      ),
      client:profiles!conversations_client_id_fkey (
        id,
        full_name,
        avatar_url
      ),
      provider:provider_profiles!conversations_provider_id_fkey (
        id,
        user_id,
        slug,
        business_name,
        avg_rating,
        total_reviews,
        verified
      )
    `)
    .eq('id', conversationId)
    .maybeSingle()

  if (error) {
    logSupabaseError('Fetch conversation failed', error, { conversationId })
    throw messageErrors.fetchConversationsFailed(error)
  }

  if (!data) {
    throw messageErrors.conversationNotFound()
  }

  return data as ConversationRecord
}

async function fetchMessage(messageId: string, userId: string): Promise<ConversationMessageItem> {
  const { data, error } = await supabaseAdmin
    .from('conversation_messages')
    .select(`
      id,
      conversation_id,
      sender_id,
      body,
      created_at,
      deleted_at,
      attachments:message_attachments (
        id,
        message_id,
        bucket,
        path,
        file_name,
        mime_type,
        size_bytes,
        upload_status,
        created_at,
        uploaded_at
      )
    `)
    .eq('id', messageId)
    .maybeSingle()

  if (error) {
    logSupabaseError('Fetch message failed', error, { messageId })
    throw messageErrors.fetchMessagesFailed(error)
  }

  if (!data) {
    throw messageErrors.messageNotFound()
  }

  return toMessageItem(data as MessageRecord, userId)
}

async function touchConversation(conversationId: string) {
  const { error } = await supabaseAdmin
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)

  if (error) {
    logSupabaseError('Touch conversation failed', error, { conversationId })
  }
}

export async function ensureConversationForResponse(responseId: string) {
  const { data: response, error } = await supabaseAdmin
    .from('request_responses')
    .select(`
      id,
      request_id,
      provider_id,
      status,
      request:service_requests!request_responses_request_id_fkey (
        id,
        client_id
      ),
      provider:provider_profiles!request_responses_provider_id_fkey (
        id,
        user_id
      )
    `)
    .eq('id', responseId)
    .maybeSingle()

  if (error || !response) {
    logSupabaseError('Fetch response for conversation failed', error, { responseId })
    throw messageErrors.createConversationFailed(error)
  }

  const request = (response as { request: { client_id: string } | null }).request
  const provider = (response as { provider: { user_id: string } | null }).provider

  if (!request || !provider) {
    throw messageErrors.createConversationFailed({ responseId, reason: 'missing_request_or_provider' })
  }

  const isClosed = (response as { status: string }).status === 'rejected'
  const { data, error: upsertError } = await supabaseAdmin
    .from('conversations')
    .upsert({
      request_id: (response as { request_id: string }).request_id,
      response_id: responseId,
      client_id: request.client_id,
      provider_id: (response as { provider_id: string }).provider_id,
      provider_user_id: provider.user_id,
      status: isClosed ? 'closed' : 'active',
      closed_reason: isClosed ? 'response_rejected' : null,
      closed_at: isClosed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'response_id' })
    .select('id')
    .single()

  if (upsertError) {
    logSupabaseError('Create conversation failed', upsertError, { responseId })
    throw messageErrors.createConversationFailed(upsertError)
  }

  return data
}

export async function closeConversationForResponse(responseId: string, reason = 'response_rejected') {
  const { error } = await supabaseAdmin
    .from('conversations')
    .update({
      status: 'closed',
      closed_reason: reason,
      closed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('response_id', responseId)

  if (error) {
    logSupabaseError('Close conversation failed', error, { responseId, reason })
    throw messageErrors.closeConversationFailed(error)
  }

  return { closed: true }
}

export async function reopenConversationForResponse(responseId: string) {
  const { error } = await supabaseAdmin
    .from('conversations')
    .update({
      status: 'active',
      closed_reason: null,
      closed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('response_id', responseId)

  if (error) {
    logSupabaseError('Reopen conversation failed', error, { responseId })
    throw messageErrors.closeConversationFailed(error)
  }

  return { active: true }
}

export async function listConversations(userId: string, params: ListConversationsQuery = {}) {
  const limit = params.limit ?? DEFAULT_CONVERSATION_LIMIT

  const { data, error } = await supabaseAdmin
    .from('conversations')
    .select(`
      id,
      request_id,
      response_id,
      client_id,
      provider_id,
      provider_user_id,
      status,
      created_at,
      updated_at,
      closed_at,
      request:service_requests!conversations_request_id_fkey (
        id,
        title,
        status
      ),
      response:request_responses!conversations_response_id_fkey (
        id,
        status,
        estimated_price
      ),
      client:profiles!conversations_client_id_fkey (
        id,
        full_name,
        avatar_url
      ),
      provider:provider_profiles!conversations_provider_id_fkey (
        id,
        user_id,
        slug,
        business_name,
        avg_rating,
        total_reviews,
        verified
      )
    `)
    .or(`client_id.eq.${userId},provider_user_id.eq.${userId}`)
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) {
    logSupabaseError('List conversations failed', error, { userId })
    throw messageErrors.fetchConversationsFailed(error)
  }

  const conversations = (data ?? []) as ConversationRecord[]
  const items = await Promise.all(conversations.map((conversation) => buildConversationSummary(conversation, userId)))

  return { items }
}

async function buildConversationSummary(conversation: ConversationRecord, userId: string): Promise<ConversationSummary> {
  const [messagesResult, readsResult, unreadResult] = await Promise.all([
    supabaseAdmin
      .from('conversation_messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        body,
        created_at,
        deleted_at,
        attachments:message_attachments (
          id,
          message_id,
          bucket,
          path,
          file_name,
          mime_type,
          size_bytes,
          upload_status,
          created_at,
          uploaded_at
        )
      `)
      .eq('conversation_id', conversation.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1),
    supabaseAdmin
      .from('conversation_reads')
      .select('last_read_at')
      .eq('conversation_id', conversation.id)
      .eq('user_id', userId)
      .maybeSingle(),
    supabaseAdmin
      .from('conversation_messages')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', conversation.id)
      .neq('sender_id', userId)
      .is('deleted_at', null),
  ])

  if (messagesResult.error || readsResult.error || unreadResult.error) {
    throw messageErrors.fetchConversationsFailed(messagesResult.error ?? readsResult.error ?? unreadResult.error)
  }

  let unreadCount = unreadResult.count ?? 0
  const lastReadAt = (readsResult.data as { last_read_at?: string } | null)?.last_read_at

  if (lastReadAt) {
    const { count, error } = await supabaseAdmin
      .from('conversation_messages')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', conversation.id)
      .neq('sender_id', userId)
      .gt('created_at', lastReadAt)
      .is('deleted_at', null)

    if (error) {
      throw messageErrors.fetchConversationsFailed(error)
    }

    unreadCount = count ?? 0
  }

  const lastMessage = messagesResult.data?.[0]
    ? await toMessageItem(messagesResult.data[0] as MessageRecord, userId)
    : null

  return {
    id: conversation.id,
    request_id: conversation.request_id,
    response_id: conversation.response_id,
    status: conversation.status,
    participant_type: conversation.client_id === userId ? 'provider' : 'client',
    participant: toParticipant(conversation, userId),
    request: conversation.request,
    response: conversation.response,
    last_message: lastMessage,
    unread_count: unreadCount,
    updated_at: conversation.updated_at,
    created_at: conversation.created_at,
  }
}

export async function listConversationMessages(userId: string, conversationId: string, params: ListConversationMessagesQuery = {}) {
  const limit = params.limit ?? DEFAULT_MESSAGES_LIMIT
  const conversation = await fetchConversation(conversationId)
  assertConversationParticipant(conversation, userId)

  const { data, error } = await supabaseAdmin
    .from('conversation_messages')
    .select(`
      id,
      conversation_id,
      sender_id,
      body,
      created_at,
      deleted_at,
      attachments:message_attachments (
        id,
        message_id,
        bucket,
        path,
        file_name,
        mime_type,
        size_bytes,
        upload_status,
        created_at,
        uploaded_at
      )
    `)
    .eq('conversation_id', conversationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    logSupabaseError('List messages failed', error, { conversationId, userId })
    throw messageErrors.fetchMessagesFailed(error)
  }

  const items = await Promise.all(((data ?? []) as MessageRecord[]).map((message) => toMessageItem(message, userId)))
  return {
    conversation: await buildConversationSummary(conversation, userId),
    items,
  }
}

export async function createConversationMessage(userId: string, conversationId: string, input: CreateConversationMessageInput, accessToken: string) {
  const conversation = await fetchConversation(conversationId)
  assertConversationParticipant(conversation, userId)
  assertConversationActive(conversation)

  const body = input.body.trim()
  if (!body) {
    throw messageErrors.invalidMessage()
  }

  // Use authenticated client for RLS enforcement
  const supabase = createSupabaseClient(accessToken)
  const { data, error } = await supabase
    .from('conversation_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: userId,
      body,
    })
    .select('id')
    .single()

  if (error) {
    logSupabaseError('Create message failed', error, { conversationId, userId })
    throw messageErrors.createMessageFailed(error)
  }

  await Promise.all([
    touchConversation(conversationId),
    markConversationRead(userId, conversationId, accessToken),
  ])

  return fetchMessage((data as { id: string }).id, userId)
}

export async function createAttachmentUpload(userId: string, conversationId: string, input: SignConversationAttachmentInput, accessToken: string): Promise<AttachmentUploadResult> {
  const conversation = await fetchConversation(conversationId)
  assertConversationParticipant(conversation, userId)
  assertConversationActive(conversation)

  // Use authenticated client for RLS enforcement
  const supabase = createSupabaseClient(accessToken)

  const body = input.body?.trim() || null
  const { data: message, error: messageError } = await supabase
    .from('conversation_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: userId,
      body,
    })
    .select('id')
    .single()

  if (messageError || !message) {
    logSupabaseError('Create attachment message failed', messageError, { conversationId, userId })
    throw messageErrors.createMessageFailed(messageError)
  }

  const messageId = (message as { id: string }).id
  const path = buildAttachmentPath(conversationId, messageId, input.file_name)
  const { data: attachment, error: attachmentError } = await supabase
    .from('message_attachments')
    .insert({
      message_id: messageId,
      bucket: ATTACHMENT_BUCKET,
      path,
      file_name: input.file_name,
      mime_type: input.mime_type,
      size_bytes: input.size_bytes,
    })
    .select(`
      id,
      message_id,
      bucket,
      path,
      file_name,
      mime_type,
      size_bytes,
      upload_status,
      created_at,
      uploaded_at
    `)
    .single()

  if (attachmentError || !attachment) {
    logSupabaseError('Create attachment failed', attachmentError, { conversationId, messageId })
    throw messageErrors.createAttachmentFailed(attachmentError)
  }

  // Use admin client for storage operations (service-level operation)
  const { data: upload, error: signError } = await supabaseAdmin.storage
    .from(ATTACHMENT_BUCKET)
    .createSignedUploadUrl(path)

  if (signError || !upload) {
    logSupabaseError('Sign attachment upload failed', signError, { conversationId, messageId, path })
    throw messageErrors.signAttachmentFailed(signError)
  }

  await Promise.all([
    touchConversation(conversationId),
    markConversationRead(userId, conversationId, accessToken),
  ])

  return {
    message: await fetchMessage(messageId, userId),
    attachment: { ...(attachment as AttachmentRecord), signed_url: null },
    upload: {
      bucket: ATTACHMENT_BUCKET,
      path,
      token: upload.token,
      signed_url: upload.signedUrl,
    },
  }
}

export async function completeAttachmentUpload(userId: string, conversationId: string, attachmentId: string, accessToken: string) {
  const conversation = await fetchConversation(conversationId)
  assertConversationParticipant(conversation, userId)

  // Use authenticated client for RLS enforcement
  const supabase = createSupabaseClient(accessToken)

  const { data: attachment, error: attachmentError } = await supabase
    .from('message_attachments')
    .select(`
      id,
      message_id,
      bucket,
      path,
      file_name,
      mime_type,
      size_bytes,
      upload_status,
      created_at,
      uploaded_at,
      message:conversation_messages!message_attachments_message_id_fkey (
        id,
        conversation_id
      )
    `)
    .eq('id', attachmentId)
    .maybeSingle()

  if (attachmentError) {
    logSupabaseError('Fetch attachment failed', attachmentError, { attachmentId })
    throw messageErrors.fetchMessagesFailed(attachmentError)
  }

  if (!attachment) {
    throw messageErrors.attachmentNotFound()
  }

  const attachmentMessage = (attachment as { message: { conversation_id: string } | null }).message
  if (!attachmentMessage || attachmentMessage.conversation_id !== conversationId) {
    throw messageErrors.attachmentNotFound()
  }

  const { data, error } = await supabase
    .from('message_attachments')
    .update({
      upload_status: 'uploaded',
      uploaded_at: new Date().toISOString(),
    })
    .eq('id', attachmentId)
    .select(`
      id,
      message_id,
      bucket,
      path,
      file_name,
      mime_type,
      size_bytes,
      upload_status,
      created_at,
      uploaded_at
    `)
    .single()

  if (error || !data) {
    logSupabaseError('Complete attachment failed', error, { attachmentId })
    throw messageErrors.completeAttachmentFailed(error)
  }

  await touchConversation(conversationId)
  const [signed] = await signUploadedAttachments([data as AttachmentRecord])
  return signed
}

export async function markConversationRead(userId: string, conversationId: string, accessToken: string) {
  const conversation = await fetchConversation(conversationId)
  assertConversationParticipant(conversation, userId)

  // Use authenticated client for RLS enforcement
  const supabase = createSupabaseClient(accessToken)

  // Try insert first, if conflict then update
  const { error: insertError } = await supabase
    .from('conversation_reads')
    .insert({
      conversation_id: conversationId,
      user_id: userId,
      last_read_at: new Date().toISOString(),
    })

  if (insertError) {
    // If insert fails due to conflict, try update
    if (insertError.code === '23505') {
      const { error: updateError } = await supabase
        .from('conversation_reads')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)

      if (updateError) {
        logSupabaseError('Mark read update failed', updateError, { conversationId, userId })
        throw messageErrors.markReadFailed(updateError)
      }
    } else {
      logSupabaseError('Mark read failed', insertError, { conversationId, userId })
      throw messageErrors.markReadFailed(insertError)
    }
  }

  return { read: true }
}

export function getRealtimeConfig(accessToken: string) {
  return {
    supabase_url: env.SUPABASE_URL,
    supabase_anon_key: env.SUPABASE_ANON_KEY,
    access_token: accessToken,
  }
}
