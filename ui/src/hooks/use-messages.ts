"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { MessageBroadcastService, type BroadcastMessage } from "@/services/message-realtime"
import * as messageService from "@/services/messages"
import type {
  ConversationMessageItem,
  ConversationSummary,
  MessageRealtimeConfig,
} from "@/types/messages"

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

// ============================================================================
// useConversations - Lista de conversaciones (sin realtime, manual refresh)
// ============================================================================

export function useConversations(limit = 30) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConversations = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await messageService.listConversations(limit)
      setConversations(data.items)
    } catch (err) {
      setError(getErrorMessage(err, "Error al cargar conversaciones"))
    } finally {
      setIsLoading(false)
    }
  }, [limit])

  useEffect(() => {
    void fetchConversations()
  }, [fetchConversations])

  // Update last message locally without refetching
  const updateLastMessage = useCallback((conversationId: string, message: ConversationMessageItem) => {
    setConversations((current) =>
      current.map((conv) =>
        conv.id === conversationId
          ? { ...conv, last_message: message, updated_at: message.created_at }
          : conv
      )
    )
  }, [])

  return { conversations, isLoading, error, refetch: fetchConversations, updateLastMessage }
}

// ============================================================================
// useConversationMessages - Mensajes de una conversación con Broadcast
// ============================================================================

export function useConversationMessages(conversationId: string | null) {
  const [conversation, setConversation] = useState<ConversationSummary | null>(null)
  const [messages, setMessages] = useState<ConversationMessageItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const broadcastServiceRef = useRef<MessageBroadcastService | null>(null)
  const realtimeConfigRef = useRef<MessageRealtimeConfig | null>(null)
  const refetchRef = useRef<() => Promise<void>>(async () => {})

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setConversation(null)
      setMessages([])
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const data = await messageService.listConversationMessages(conversationId)
      setConversation(data.conversation)
      setMessages(data.items)
    } catch (err) {
      setError(getErrorMessage(err, "Error al cargar mensajes"))
    } finally {
      setIsLoading(false)
    }
  }, [conversationId])

  useEffect(() => {
    void fetchMessages()
  }, [fetchMessages])

  // Setup broadcast subscription
  useEffect(() => {
    if (!conversationId) return

    let isMounted = true

    async function setupBroadcast() {
      try {
        // Get realtime config if not cached
        if (!realtimeConfigRef.current) {
          realtimeConfigRef.current = await messageService.getMessagesRealtimeConfig()
        }

        if (!isMounted) return

        // Create broadcast service if needed
        if (!broadcastServiceRef.current) {
          broadcastServiceRef.current = new MessageBroadcastService(realtimeConfigRef.current)
        }

        // Subscribe to conversation channel
        broadcastServiceRef.current.subscribe(conversationId!, async (broadcastMsg) => {
          if (!isMounted) return

          // If message has attachment, refetch to get signed URL
          if (broadcastMsg.has_attachment) {
            await refetchRef.current()
            return
          }

          // Convert broadcast message to ConversationMessageItem
          const newMessage: ConversationMessageItem = {
            id: broadcastMsg.id,
            conversation_id: broadcastMsg.conversation_id,
            sender_id: broadcastMsg.sender_id,
            body: broadcastMsg.body,
            created_at: broadcastMsg.created_at,
            deleted_at: null,
            is_own: false,
            attachments: [],
          }

          // Add to messages if not duplicate
          setMessages((current) => {
            if (current.some((m) => m.id === newMessage.id)) return current
            return [...current, newMessage]
          })
        })
      } catch (err) {
        if (isMounted) {
          console.error("Failed to setup broadcast:", err)
        }
      }
    }

    void setupBroadcast()

    return () => {
      isMounted = false
    }
  }, [conversationId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      broadcastServiceRef.current?.dispose()
      broadcastServiceRef.current = null
    }
  }, [])

  // Send message with optimistic update + broadcast
  const sendMessage = useCallback(async (body: string) => {
    if (!conversationId || !conversation) return false

    const trimmedBody = body.trim()
    if (!trimmedBody) return false

    // Create optimistic message
    const optimisticId = `optimistic-${Date.now()}`
    const optimisticMessage: ConversationMessageItem = {
      id: optimisticId,
      conversation_id: conversationId,
      sender_id: "",
      body: trimmedBody,
      created_at: new Date().toISOString(),
      deleted_at: null,
      is_own: true,
      attachments: [],
    }

    // Add optimistic message immediately
    setMessages((current) => [...current, optimisticMessage])
    setIsSending(true)
    setError(null)

    try {
      // Send to server
      const message = await messageService.createConversationMessage(conversationId, { body: trimmedBody })

      // Replace optimistic with real message
      setMessages((current) =>
        current.map((item) => (item.id === optimisticId ? message : item))
      )

      // Broadcast to other participants
      if (broadcastServiceRef.current) {
        const broadcastMsg: BroadcastMessage = {
          id: message.id,
          conversation_id: message.conversation_id,
          sender_id: message.sender_id,
          sender_name: conversation.participant.name, // Other user will see our name
          body: message.body,
          created_at: message.created_at,
        }
        void broadcastServiceRef.current.broadcast(broadcastMsg)
      }

      return true
    } catch (err) {
      // Remove optimistic message on error
      setMessages((current) => current.filter((item) => item.id !== optimisticId))
      setError(getErrorMessage(err, "Error al enviar mensaje"))
      return false
    } finally {
      setIsSending(false)
    }
  }, [conversationId, conversation])

  // Upload attachment
  const uploadAttachment = useCallback(async (file: File, body?: string) => {
    if (!conversationId || !conversation) return false

    // Create optimistic message with pending attachment
    const optimisticId = `optimistic-${Date.now()}`
    const optimisticMessage: ConversationMessageItem = {
      id: optimisticId,
      conversation_id: conversationId,
      sender_id: "",
      body: body?.trim() || null,
      created_at: new Date().toISOString(),
      deleted_at: null,
      is_own: true,
      attachments: [{
        id: `attachment-${Date.now()}`,
        message_id: optimisticId,
        bucket: "",
        path: "",
        file_name: file.name,
        mime_type: file.type || "application/octet-stream",
        size_bytes: file.size,
        upload_status: "pending" as const,
        created_at: new Date().toISOString(),
        uploaded_at: null,
        signed_url: null,
      }],
    }

    // Add optimistic message immediately
    setMessages((current) => [...current, optimisticMessage])
    setIsSending(true)
    setError(null)

    try {
      if (!realtimeConfigRef.current) {
        realtimeConfigRef.current = await messageService.getMessagesRealtimeConfig()
      }

      const signed = await messageService.signAttachmentUpload(conversationId, {
        body: body?.trim() || undefined,
        file_name: file.name,
        mime_type: file.type || "application/octet-stream",
        size_bytes: file.size,
      })

      await messageService.uploadAttachmentFile(realtimeConfigRef.current, signed.upload, file)
      const completedAttachment = await messageService.completeAttachmentUpload(conversationId, signed.attachment.id)

      // Update optimistic message with real data
      const realMessage: ConversationMessageItem = {
        ...signed.message,
        is_own: true,
        attachments: [completedAttachment],
      }

      setMessages((current) =>
        current.map((item) => (item.id === optimisticId ? realMessage : item))
      )

      // Broadcast to other participants
      if (broadcastServiceRef.current) {
        const broadcastMsg: BroadcastMessage = {
          id: realMessage.id,
          conversation_id: realMessage.conversation_id,
          sender_id: realMessage.sender_id,
          sender_name: conversation.participant.name,
          body: realMessage.body,
          created_at: realMessage.created_at,
          has_attachment: true,
          attachment_name: file.name,
        }
        void broadcastServiceRef.current.broadcast(broadcastMsg)
      }

      return true
    } catch (err) {
      // Remove optimistic message on error
      setMessages((current) => current.filter((item) => item.id !== optimisticId))
      setError(getErrorMessage(err, "Error al subir archivo"))
      return false
    } finally {
      setIsSending(false)
    }
  }, [conversationId, conversation])

  // Mark as read
  const markRead = useCallback(async () => {
    if (!conversationId) return
    try {
      await messageService.markConversationRead(conversationId)
    } catch {
      // Silent fail - read receipts shouldn't block UX
    }
  }, [conversationId])

  const canSend = useMemo(() => conversation?.status === "active", [conversation?.status])

  return {
    conversation,
    messages,
    isLoading,
    isSending,
    error,
    canSend,
    sendMessage,
    uploadAttachment,
    markRead,
    refetch: fetchMessages,
  }
}
