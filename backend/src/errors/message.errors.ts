import { AppError } from '../lib/app-error.js'

export const messageErrors = {
  conversationNotFound: () => new AppError(404, 'Conversation not found', 'CONVERSATION_NOT_FOUND'),
  conversationClosed: () => new AppError(400, 'Conversation is closed', 'CONVERSATION_CLOSED'),
  messageNotFound: () => new AppError(404, 'Message not found', 'MESSAGE_NOT_FOUND'),
  attachmentNotFound: () => new AppError(404, 'Attachment not found', 'MESSAGE_ATTACHMENT_NOT_FOUND'),
  invalidMessage: () => new AppError(400, 'Message body or attachment is required', 'MESSAGE_INVALID'),
  fetchConversationsFailed: (details?: unknown) => new AppError(500, 'Failed to fetch conversations', 'CONVERSATION_FETCH_FAILED', details),
  fetchMessagesFailed: (details?: unknown) => new AppError(500, 'Failed to fetch messages', 'MESSAGE_FETCH_FAILED', details),
  createConversationFailed: (details?: unknown) => new AppError(500, 'Failed to create conversation', 'CONVERSATION_CREATE_FAILED', details),
  createMessageFailed: (details?: unknown) => new AppError(500, 'Failed to create message', 'MESSAGE_CREATE_FAILED', details),
  createAttachmentFailed: (details?: unknown) => new AppError(500, 'Failed to create attachment', 'MESSAGE_ATTACHMENT_CREATE_FAILED', details),
  signAttachmentFailed: (details?: unknown) => new AppError(500, 'Failed to sign attachment upload', 'MESSAGE_ATTACHMENT_SIGN_FAILED', details),
  completeAttachmentFailed: (details?: unknown) => new AppError(500, 'Failed to complete attachment upload', 'MESSAGE_ATTACHMENT_COMPLETE_FAILED', details),
  markReadFailed: (details?: unknown) => new AppError(500, 'Failed to mark conversation as read', 'CONVERSATION_MARK_READ_FAILED', details),
  closeConversationFailed: (details?: unknown) => new AppError(500, 'Failed to close conversation', 'CONVERSATION_CLOSE_FAILED', details),
}
