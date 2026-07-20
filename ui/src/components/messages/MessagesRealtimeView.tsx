"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useConversationMessages, useConversations } from "@/hooks/use-messages"
import type { ConversationMessageItem, ConversationSummary } from "@/types/messages"

function Icon({ name, filled = false, className = "", size }: { name: string; filled?: boolean; className?: string; size?: number }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        ...(filled && { fontVariationSettings: "'FILL' 1" }),
        ...(size && { fontSize: `${size}px` }),
      }}
    >
      {name}
    </span>
  )
}

export default function MessagesRealtimeView() {
  const { conversations, isLoading, error, refetch } = useConversations()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [showChat, setShowChat] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const filteredConversations = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()
    if (!normalized) return conversations
    return conversations.filter((conversation) =>
      conversation.participant.name.toLowerCase().includes(normalized) ||
      conversation.request?.title.toLowerCase().includes(normalized)
    )
  }, [conversations, searchQuery])

  const activeConversationId = selectedConversationId ?? filteredConversations[0]?.id ?? null
  const selectedConversation = conversations.find((conversation) => conversation.id === activeConversationId) ?? null
  const totalUnread = conversations.reduce((sum, conversation) => sum + conversation.unread_count, 0)

  const {
    messages,
    isLoading: isLoadingMessages,
    isSending,
    error: messageError,
    canSend,
    sendMessage,
    uploadAttachment,
    markRead,
  } = useConversationMessages(activeConversationId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (activeConversationId) {
      void markRead()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId])

  const handleSelectConversation = (conversation: ConversationSummary) => {
    setSelectedConversationId(conversation.id)
    setShowChat(true)
  }

  const resetComposer = () => {
    setNewMessage("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return
    const sent = await sendMessage(newMessage)
    if (sent) resetComposer()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const uploaded = await uploadAttachment(file, newMessage)
    if (uploaded) resetComposer()
    event.target.value = ""
  }

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(event.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      void handleSendMessage()
    }
  }

  return (
    <div className="flex h-[calc(100vh-80px)] w-full overflow-hidden lg:h-screen">
      {/* Sidebar - Conversations List */}
      <aside className={`${showChat ? "hidden" : "flex"} h-full w-full min-w-0 shrink-0 flex-col border-r-4 border-[var(--primary)] bg-[var(--surface)] lg:flex lg:w-96`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b-4 border-[var(--primary)] bg-[var(--surface)] p-4">
          <div>
            <h2 className="text-2xl font-black text-[var(--primary)] font-headline">
              Mensajes
            </h2>
            {totalUnread > 0 && (
              <span className="text-label-sm font-label text-[var(--secondary)] uppercase">
                {totalUnread} sin leer
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            className="w-11 h-11 flex items-center justify-center border-2 border-[var(--primary)] bg-[var(--surface)] shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(27,48,34,1)] transition-all"
          >
            <Icon name="refresh" size={20} className="text-[var(--primary)]" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b-2 border-[var(--primary)]/20 bg-[var(--surface)] p-4">
          <div className="relative">
            <Icon name="search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]" />
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full bg-[var(--surface)] border-2 border-[var(--primary)] pl-10 pr-4 py-3 text-body-md text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] focus:outline-none shadow-[2px_2px_0px_0px_rgba(27,48,34,1)]"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <SidebarState icon="hourglass_empty" label="Cargando conversaciones..." />
          ) : error ? (
            <SidebarState icon="error" label={error} />
          ) : filteredConversations.length === 0 ? (
            <SidebarState icon="chat_bubble" label="No hay conversaciones activas" />
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                isActive={activeConversationId === conversation.id}
                onClick={() => handleSelectConversation(conversation)}
              />
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={`${!showChat ? "hidden" : "flex"} h-full min-w-0 flex-1 flex-col bg-[var(--background)] lg:flex`}>
        {selectedConversation ? (
          <>
            <ChatHeader conversation={selectedConversation} onBack={() => setShowChat(false)} />

            {/* Messages */}
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-[var(--surface-container)] p-4 lg:gap-6 lg:p-6">
              {/* Request Title Badge */}
              <div className="my-2 flex justify-center">
                <span className="px-4 py-2 bg-[var(--primary-container)] border-2 border-[var(--primary)] text-[11px] font-label font-bold text-[var(--primary)] uppercase tracking-wider">
                  {selectedConversation.request?.title ?? "Conversación"}
                </span>
              </div>

              {isLoadingMessages ? (
                <ChatState icon="hourglass_empty" title="Cargando mensajes" />
              ) : messages.length === 0 ? (
                <ChatState icon="forum" title="Aún no hay mensajes" />
              ) : (
                messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    participantName={selectedConversation.participant.name}
                  />
                ))
              )}

              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Error/Closed Banner */}
            {(messageError || selectedConversation.status === "closed") && (
              <div className="border-t-4 border-[var(--error)] bg-[var(--error-container)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Icon name="error" size={18} className="text-[var(--error)]" />
                  <span className="text-sm font-label text-[var(--error)]">
                    {messageError ?? "Esta conversación está cerrada."}
                  </span>
                </div>
              </div>
            )}

            {/* Message Composer */}
            <div className="shrink-0 border-t-4 border-[var(--primary)] bg-[var(--surface)] p-3 lg:p-4">
              <div className="flex items-end gap-2 lg:gap-3">
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

                {/* Attach Button */}
                <button
                  type="button"
                  disabled={!canSend || isSending}
                  onClick={() => fileInputRef.current?.click()}
                  className="shrink-0 w-11 h-11 flex items-center justify-center border-2 border-[var(--primary)]/50 text-[var(--on-surface-variant)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary-container)]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="attach_file" size={22} />
                </button>

                {/* Text Input */}
                <div className="relative flex-1">
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    disabled={!canSend || isSending}
                    placeholder={canSend ? "Escribe un mensaje..." : "Conversación cerrada"}
                    rows={1}
                    className="max-h-32 w-full resize-none overflow-hidden border-2 border-[var(--primary)] bg-[var(--surface)] px-4 py-3 pr-12 text-sm text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] focus:outline-none shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] disabled:opacity-60 lg:text-base"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 p-2 text-[var(--on-surface-variant)] hover:text-[var(--secondary)] transition-colors"
                  >
                    <Icon name="mood" size={20} />
                  </button>
                </div>

                {/* Send Button */}
                <button
                  type="button"
                  onClick={() => void handleSendMessage()}
                  disabled={!canSend || isSending || !newMessage.trim()}
                  className="shrink-0 w-12 h-12 flex items-center justify-center bg-[var(--primary)] border-2 border-[var(--primary)] text-white shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(27,48,34,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0px_0px_rgba(27,48,34,1)]"
                >
                  <Icon name={isSending ? "hourglass_empty" : "send"} size={22} />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State - No conversation selected */
          <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <div className="w-24 h-24 flex items-center justify-center bg-[var(--surface)] border-4 border-[var(--primary)] neo-shadow-md mb-6">
              <Icon name="chat_bubble" size={48} className="text-[var(--primary)]" />
            </div>
            <h3 className="text-xl font-bold text-[var(--primary)] font-headline mb-2">
              Selecciona una conversación
            </h3>
            <p className="max-w-sm text-body-md text-[var(--on-surface-variant)]">
              Elige una conversación de la lista para ver los mensajes
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

function ConversationRow({
  conversation,
  isActive,
  onClick,
}: {
  conversation: ConversationSummary
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 border-b-2 p-4 text-left transition-all ${
        isActive
          ? "bg-[var(--primary)] border-[var(--primary)]"
          : "bg-[var(--surface)] border-[var(--primary)]/20 hover:bg-[var(--primary-container)]/30"
      }`}
    >
      <Avatar name={conversation.participant.name} active={isActive} />

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className={`truncate font-bold font-headline ${isActive ? "!text-white" : "text-[var(--primary)]"}`}>
            {conversation.participant.name}
          </span>
          <span className={`text-[10px] font-label whitespace-nowrap uppercase ${isActive ? "text-white/70" : "text-[var(--on-surface-variant)]"}`}>
            {formatRelativeTime(conversation.updated_at)}
          </span>
        </div>

        <div className="mb-1.5">
          <span className={`inline-block px-2 py-0.5 text-[9px] font-label font-bold uppercase tracking-wider border ${
            isActive
              ? "bg-white/20 border-white/30 text-white"
              : "bg-[var(--primary-container)] border-[var(--primary)] text-[var(--primary)]"
          }`}>
            {conversation.participant_type === "provider" ? "proveedor" : "cliente"}
          </span>
        </div>

        <p className={`truncate text-sm ${isActive ? "text-white/80" : "text-[var(--on-surface-variant)]"}`}>
          {getMessagePreview(conversation)}
        </p>
      </div>

      {conversation.unread_count > 0 && (
        <div className={`self-center w-6 h-6 flex items-center justify-center text-[10px] font-label font-bold ${
          isActive
            ? "bg-[var(--primary-container)] text-[var(--primary)]"
            : "bg-[var(--secondary)] text-white"
        }`}>
          {conversation.unread_count}
        </div>
      )}
    </button>
  )
}

function ChatHeader({ conversation, onBack }: { conversation: ConversationSummary; onBack: () => void }) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b-4 border-[var(--primary)] bg-[var(--surface)] px-4 py-3 lg:px-6">
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Back Button (Mobile) */}
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center border-2 border-[var(--primary)] hover:bg-[var(--primary-container)] transition-colors lg:hidden"
        >
          <Icon name="arrow_back" size={20} className="text-[var(--primary)]" />
        </button>

        <Avatar name={conversation.participant.name} />

        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[var(--primary)] font-headline lg:text-lg">
              {conversation.participant.name}
            </h3>
            <span className="px-2 py-0.5 bg-[var(--primary-container)] border border-[var(--primary)] text-[9px] font-label font-bold text-[var(--primary)] uppercase tracking-wider">
              {conversation.participant_type === "provider" ? "proveedor" : "cliente"}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-[var(--on-surface-variant)]">
            {conversation.request?.title ?? "Solicitud"}
          </p>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({
  message,
  participantName,
}: {
  message: ConversationMessageItem
  participantName: string
}) {
  return (
    <div className={`flex max-w-[85%] min-w-0 gap-3 ${message.is_own ? "self-end" : "self-start"}`}>
      {!message.is_own && (
        <div className="mt-auto hidden lg:block">
          <Avatar name={participantName} small />
        </div>
      )}

      <div className={`flex min-w-0 flex-col gap-1 ${message.is_own ? "items-end" : "items-start"}`}>
        <div
          className={`border-2 px-4 py-3 lg:px-5 ${
            message.is_own
              ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-[3px_3px_0px_0px_rgba(27,48,34,1)]"
              : "bg-[var(--surface)] border-[var(--primary)] text-[var(--on-surface)] shadow-[2px_2px_0px_0px_rgba(27,48,34,1)]"
          }`}
        >
          {message.body && <p className="whitespace-pre-wrap text-sm lg:text-base">{message.body}</p>}
          {message.attachments.length > 0 && (
            <div className={message.body ? "mt-3 space-y-2" : "space-y-2"}>
              {message.attachments.map((attachment) => (
                <AttachmentLink key={attachment.id} attachment={attachment} isOwn={message.is_own} />
              ))}
            </div>
          )}
        </div>
        <div className={`flex items-center gap-1.5 ${message.is_own ? "mr-1" : "ml-1"}`}>
          <span className="text-[10px] font-label text-[var(--on-surface-variant)]">
            {formatTime(message.created_at)}
          </span>
          {message.is_own && (
            <Icon name="done_all" filled size={14} className="text-[var(--primary)]" />
          )}
        </div>
      </div>
    </div>
  )
}

function AttachmentLink({
  attachment,
  isOwn
}: {
  attachment: ConversationMessageItem["attachments"][number]
  isOwn: boolean
}) {
  const isImage = attachment.mime_type.startsWith("image/")

  if (attachment.upload_status !== "uploaded") {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 text-xs border ${
        isOwn ? "border-white/30 bg-white/10" : "border-[var(--primary)]/30 bg-[var(--primary-container)]/30"
      }`}>
        <Icon name="hourglass_empty" size={16} />
        Subiendo {attachment.file_name}
      </div>
    )
  }

  return (
    <a
      href={attachment.signed_url ?? "#"}
      target="_blank"
      rel="noreferrer"
      className={`flex items-center gap-2 px-3 py-2 text-xs border transition-colors ${
        isOwn
          ? "border-white/30 bg-white/10 hover:bg-white/20"
          : "border-[var(--primary)] bg-[var(--primary-container)]/30 hover:bg-[var(--primary-container)]"
      }`}
    >
      <Icon name={isImage ? "image" : "attach_file"} size={16} />
      <span className="max-w-[180px] truncate">{attachment.file_name}</span>
      <span className="font-label text-[10px] opacity-70">{formatFileSize(attachment.size_bytes)}</span>
    </a>
  )
}

function Avatar({ name, active = false, small = false }: { name: string; active?: boolean; small?: boolean }) {
  const size = small ? "w-8 h-8 text-sm" : "w-11 h-11 text-lg lg:w-12 lg:h-12"

  return (
    <div className={`${size} flex shrink-0 items-center justify-center border-2 font-bold font-headline ${
      active
        ? "border-white/50 bg-white/20 text-white"
        : "border-[var(--primary)] bg-[var(--primary-container)] text-[var(--primary)]"
    }`}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function SidebarState({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-16 h-16 flex items-center justify-center bg-[var(--surface)] border-2 border-[var(--primary)]/30 mb-4">
        <Icon name={icon} size={32} className="text-[var(--on-surface-variant)]" />
      </div>
      <p className="text-sm text-[var(--on-surface-variant)]">{label}</p>
    </div>
  )
}

function ChatState({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="w-20 h-20 flex items-center justify-center bg-[var(--surface)] border-4 border-[var(--primary)]/30 mb-4">
        <Icon name={icon} size={40} className="text-[var(--on-surface-variant)]" />
      </div>
      <p className="text-body-md text-[var(--on-surface-variant)]">{title}</p>
    </div>
  )
}

function getMessagePreview(conversation: ConversationSummary) {
  const lastMessage = conversation.last_message
  if (!lastMessage) return conversation.request?.title ?? "Nueva conversación"
  if (lastMessage.body) return lastMessage.body
  if (lastMessage.attachments.length > 0) return `Archivo: ${lastMessage.attachments[0]?.file_name ?? "adjunto"}`
  return "Mensaje"
}

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMinutes < 1) return "Ahora"
  if (diffMinutes < 60) return `${diffMinutes} min`
  if (diffHours < 24) return `${diffHours} h`
  if (diffDays < 7) return `${diffDays} d`
  return date.toLocaleDateString("es-HN", { day: "numeric", month: "short" })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("es-HN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}
