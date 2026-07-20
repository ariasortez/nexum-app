import { z } from 'zod'

export const listConversationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
})

export const listConversationMessagesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
})

export const createConversationMessageSchema = z.object({
  body: z.string().trim().min(1).max(2000),
})

export const signConversationAttachmentSchema = z.object({
  body: z.string().trim().max(2000).optional(),
  file_name: z.string().trim().min(1).max(255),
  mime_type: z.string().trim().min(1).max(120),
  size_bytes: z.number().int().positive().max(10 * 1024 * 1024),
})

export type ListConversationsQuery = z.infer<typeof listConversationsQuerySchema>
export type ListConversationMessagesQuery = z.infer<typeof listConversationMessagesQuerySchema>
export type CreateConversationMessageInput = z.infer<typeof createConversationMessageSchema>
export type SignConversationAttachmentInput = z.infer<typeof signConversationAttachmentSchema>
