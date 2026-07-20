import type { ApiSuccessResponse } from "@fixo/contracts/api"
import { createMessagesRealtimeClient } from "@/lib/supabase-realtime"
import { api } from "@/lib/api"
import type {
  AttachmentUploadResult,
  ConversationMessageItem,
  ConversationMessagesResponse,
  ConversationsResponse,
  CreateConversationMessageInput,
  MessageAttachmentItem,
  MessageRealtimeConfig,
  SignAttachmentInput,
} from "@/types/messages"

export async function listConversations(limit = 30): Promise<ConversationsResponse> {
  const response = await api.get<ApiSuccessResponse<ConversationsResponse>>(
    `/messages/conversations?limit=${limit}`
  )
  return response.data
}

export async function listConversationMessages(
  conversationId: string,
  limit = 100
): Promise<ConversationMessagesResponse> {
  const response = await api.get<ApiSuccessResponse<ConversationMessagesResponse>>(
    `/messages/conversations/${conversationId}/messages?limit=${limit}`
  )
  return response.data
}

export async function createConversationMessage(
  conversationId: string,
  input: CreateConversationMessageInput
): Promise<ConversationMessageItem> {
  const response = await api.post<ApiSuccessResponse<ConversationMessageItem>>(
    `/messages/conversations/${conversationId}/messages`,
    input
  )
  return response.data
}

export async function signAttachmentUpload(
  conversationId: string,
  input: SignAttachmentInput
): Promise<AttachmentUploadResult> {
  const response = await api.post<ApiSuccessResponse<AttachmentUploadResult>>(
    `/messages/conversations/${conversationId}/attachments/sign`,
    input
  )
  return response.data
}

export async function completeAttachmentUpload(
  conversationId: string,
  attachmentId: string
): Promise<MessageAttachmentItem> {
  const response = await api.post<ApiSuccessResponse<MessageAttachmentItem>>(
    `/messages/conversations/${conversationId}/attachments/${attachmentId}/complete`,
    {}
  )
  return response.data
}

export async function markConversationRead(conversationId: string): Promise<{ read: boolean }> {
  const response = await api.patch<ApiSuccessResponse<{ read: boolean }>>(
    `/messages/conversations/${conversationId}/read`,
    {}
  )
  return response.data
}

export async function getMessagesRealtimeConfig(): Promise<MessageRealtimeConfig> {
  const response = await api.get<ApiSuccessResponse<MessageRealtimeConfig>>(
    "/messages/realtime-config"
  )
  return response.data
}

export async function uploadAttachmentFile(
  realtimeConfig: MessageRealtimeConfig,
  upload: AttachmentUploadResult["upload"],
  file: File
): Promise<void> {
  const supabase = createMessagesRealtimeClient(realtimeConfig)
  const { error } = await supabase.storage
    .from(upload.bucket)
    .uploadToSignedUrl(upload.path, upload.token, file)

  if (error) {
    throw new Error(error.message)
  }
}
