export type ConversationStatus = "active" | "closed"
export type ParticipantType = "client" | "provider"
export type UploadStatus = "pending" | "uploaded" | "failed"

export type MessageRealtimeConfig = {
  supabase_url: string
  supabase_anon_key: string
  access_token: string
}

export type MessageAttachmentItem = {
  id: string
  message_id: string
  bucket: string
  path: string
  file_name: string
  mime_type: string
  size_bytes: number
  upload_status: UploadStatus
  created_at: string
  uploaded_at: string | null
  signed_url: string | null
}

export type ConversationMessageItem = {
  id: string
  conversation_id: string
  sender_id: string
  body: string | null
  created_at: string
  deleted_at: string | null
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

export type ConversationsResponse = {
  items: ConversationSummary[]
}

export type ConversationMessagesResponse = {
  conversation: ConversationSummary
  items: ConversationMessageItem[]
}

export type CreateConversationMessageInput = {
  body: string
}

export type SignAttachmentInput = {
  body?: string
  file_name: string
  mime_type: string
  size_bytes: number
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
