"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"

// Material Symbol Icon component
function Icon({ name, fill = false, className = "" }: { name: string; fill?: boolean; className?: string }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  )
}

// Types
interface Message {
  id: string
  content: string
  timestamp: string
  isOwn: boolean
  status: "sent" | "delivered" | "read"
}

interface Conversation {
  id: string
  name: string
  avatar: string | null
  initials?: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  isOnline: boolean
  type: "cliente" | "proveedor"
  messages: Message[]
}

// Mock data
const CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    name: "Carlos M.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    lastMessage: "Excelente, ¿a qué hora te queda bien?",
    timestamp: "09:15 AM",
    unreadCount: 1,
    isOnline: true,
    type: "proveedor",
    messages: [
      { id: "m1", content: "Hola, revisé la fuga de agua. Puedo ir mañana.", timestamp: "08:45 AM", isOwn: false, status: "read" },
      { id: "m2", content: "Excelente, ¿a qué hora te queda bien?", timestamp: "09:02 AM", isOwn: true, status: "read" },
      { id: "m3", content: "A las 9:00 AM sería ideal.", timestamp: "09:10 AM", isOwn: false, status: "read" },
      { id: "m4", content: "Perfecto, te espero entonces.", timestamp: "09:15 AM", isOwn: true, status: "delivered" },
    ],
  },
  {
    id: "2",
    name: "Ana P.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    lastMessage: "Gracias por el servicio de limpieza.",
    timestamp: "Ayer",
    unreadCount: 0,
    isOnline: false,
    type: "cliente",
    messages: [
      { id: "m1", content: "Hola, necesito un servicio de limpieza para mi apartamento.", timestamp: "10:30 AM", isOwn: false, status: "read" },
      { id: "m2", content: "Claro, ¿cuántas habitaciones tiene?", timestamp: "10:35 AM", isOwn: true, status: "read" },
      { id: "m3", content: "Son 3 habitaciones y 2 baños.", timestamp: "10:40 AM", isOwn: false, status: "read" },
      { id: "m4", content: "Perfecto, el costo sería L. 800. ¿Le parece bien?", timestamp: "10:45 AM", isOwn: true, status: "read" },
      { id: "m5", content: "Gracias por el servicio de limpieza.", timestamp: "Ayer", isOwn: false, status: "read" },
    ],
  },
  {
    id: "3",
    name: "Miguel Rojas",
    avatar: null,
    initials: "M",
    lastMessage: "Presupuesto enviado.",
    timestamp: "Lun",
    unreadCount: 0,
    isOnline: false,
    type: "proveedor",
    messages: [
      { id: "m1", content: "Hola, vi su solicitud de electricista.", timestamp: "09:00 AM", isOwn: false, status: "read" },
      { id: "m2", content: "Sí, necesito revisar unos tomacorrientes.", timestamp: "09:15 AM", isOwn: true, status: "read" },
      { id: "m3", content: "Presupuesto enviado.", timestamp: "Lun", isOwn: false, status: "read" },
    ],
  },
  {
    id: "4",
    name: "Lucia G.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    lastMessage: "¿Tienen disponibilidad el fin de semana?",
    timestamp: "Mar",
    unreadCount: 0,
    isOnline: false,
    type: "cliente",
    messages: [
      { id: "m1", content: "¿Tienen disponibilidad el fin de semana?", timestamp: "Mar", isOwn: false, status: "read" },
    ],
  },
  {
    id: "5",
    name: "Servicios Express",
    avatar: null,
    initials: "SE",
    lastMessage: "Cita completada.",
    timestamp: "2 May",
    unreadCount: 0,
    isOnline: false,
    type: "proveedor",
    messages: [
      { id: "m1", content: "Su cita ha sido programada para el 2 de mayo.", timestamp: "1 May", isOwn: false, status: "read" },
      { id: "m2", content: "Gracias, ahí estaré.", timestamp: "1 May", isOwn: true, status: "read" },
      { id: "m3", content: "Cita completada.", timestamp: "2 May", isOwn: false, status: "read" },
    ],
  },
]

export default function MessagesView() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(CONVERSATIONS[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [showChat, setShowChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const filteredConversations = CONVERSATIONS.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalUnread = CONVERSATIONS.reduce((sum, conv) => sum + conv.unreadCount, 0)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selectedConversation?.messages])

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv)
    setShowChat(true)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return
    // TODO: Send message via API
    console.log("Sending:", newMessage)
    setNewMessage("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value)
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + "px"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-[calc(100vh-80px)] lg:h-screen overflow-hidden">
      {/* Sidebar: Chat List */}
      <aside className={`${showChat ? "hidden" : "flex"} lg:flex flex-col w-full lg:w-96 h-full border-r-2 border-[var(--on-surface)] bg-[var(--surface-container-low)] shrink-0`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b-2 border-[var(--on-surface)] flex justify-between items-center bg-[var(--surface-container-lowest)]">
          <h2 className="text-2xl font-semibold text-[var(--on-surface)] tracking-[-0.02em]">
            Mensajes {totalUnread > 0 && `(${totalUnread})`}
          </h2>
          <button className="p-2 border-2 border-[var(--on-surface)] rounded-full hover:bg-[var(--surface-variant)] transition-colors shadow-[2px_2px_0px_0px_var(--on-surface)]">
            <Icon name="edit_square" className="text-xl" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-[var(--surface-container-low)] border-b-2 border-[var(--on-surface)]">
          <div className="relative flex items-center">
            <Icon name="search" className="absolute left-3 text-[var(--outline)] text-xl" />
            <input
              type="text"
              placeholder="Buscar en chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[var(--surface-container-lowest)] border-2 border-[var(--on-surface)] rounded-tl-xl rounded-br-xl text-base focus:outline-none focus:ring-0 focus:border-[var(--primary)] shadow-[2px_2px_0px_0px_var(--on-surface)] transition-all"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => {
            const isActive = selectedConversation?.id === conv.id

            return (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`p-4 border-b border-[var(--outline-variant)] cursor-pointer flex gap-4 items-start transition-colors ${
                  isActive
                    ? "bg-[var(--primary)] text-[var(--on-primary)]"
                    : "bg-[var(--surface-container-lowest)] hover:bg-[var(--surface-container)]"
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  {conv.avatar ? (
                    <Image
                      src={conv.avatar}
                      alt={conv.name}
                      width={56}
                      height={56}
                      className={`w-14 h-14 rounded-full object-cover border-2 ${isActive ? "border-[var(--on-primary)]" : "border-[var(--on-surface)]"}`}
                    />
                  ) : (
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-semibold border-2 ${
                      isActive
                        ? "border-[var(--on-primary)] bg-[var(--on-primary)]/20"
                        : "border-[var(--on-surface)] bg-[var(--secondary-fixed)] text-[var(--on-secondary-fixed)]"
                    }`}>
                      {conv.initials || conv.name.charAt(0)}
                    </div>
                  )}
                  {conv.isOnline && (
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 ${isActive ? "border-[var(--primary)]" : "border-[var(--surface-container-lowest)]"}`} />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-semibold truncate pr-2 ${isActive ? "" : "text-[var(--on-surface)]"}`}>
                      {conv.name}
                    </span>
                    <span className={`font-mono text-[10px] uppercase whitespace-nowrap ${isActive ? "opacity-80" : "text-[var(--outline)]"}`}>
                      {conv.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                      isActive
                        ? "bg-[var(--on-primary)]/20"
                        : "bg-[var(--surface-variant)] text-[var(--on-surface)] border border-[var(--on-surface)]"
                    }`}>
                      {conv.type}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${isActive ? "opacity-90" : "text-[var(--outline)]"}`}>
                    {conv.lastMessage}
                  </p>
                </div>

                {/* Unread badge */}
                {conv.unreadCount > 0 && (
                  <div className={`self-center shrink-0 w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] ${
                    isActive
                      ? "bg-[var(--on-primary)] text-[var(--primary)]"
                      : "bg-[var(--primary)] text-[var(--on-primary)]"
                  }`}>
                    {conv.unreadCount}
                  </div>
                )}
              </div>
            )
          })}

          {filteredConversations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <Icon name="search_off" className="text-4xl text-[var(--outline)] mb-2" />
              <p className="text-sm text-[var(--outline)]">No se encontraron conversaciones</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={`${!showChat ? "hidden" : "flex"} lg:flex flex-1 flex-col bg-[var(--surface-bright)] h-full`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-[72px] shrink-0 border-b-2 border-[var(--on-surface)] bg-[var(--surface-container-lowest)] px-4 lg:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 lg:gap-4">
                {/* Back button (mobile) */}
                <button
                  onClick={() => setShowChat(false)}
                  className="lg:hidden p-2 -ml-2 hover:bg-[var(--surface-variant)] rounded-lg transition-colors"
                >
                  <Icon name="arrow_back" className="text-xl" />
                </button>

                {/* Avatar */}
                <div className="relative">
                  {selectedConversation.avatar ? (
                    <Image
                      src={selectedConversation.avatar}
                      alt={selectedConversation.name}
                      width={48}
                      height={48}
                      className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-[var(--on-surface)]"
                    />
                  ) : (
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-lg font-semibold border-2 border-[var(--on-surface)] bg-[var(--secondary-fixed)] text-[var(--on-secondary-fixed)]">
                      {selectedConversation.initials || selectedConversation.name.charAt(0)}
                    </div>
                  )}
                  {selectedConversation.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--surface-container-lowest)]" />
                  )}
                </div>

                {/* Info */}
                <div>
                  <h3 className="text-sm lg:text-base font-semibold text-[var(--on-surface)] flex items-center gap-2">
                    {selectedConversation.name}
                    <span className="font-mono text-[10px] font-normal text-[var(--outline)] uppercase tracking-wider bg-[var(--surface-variant)] px-1.5 py-0.5 rounded-sm border border-[var(--outline-variant)]">
                      {selectedConversation.type}
                    </span>
                  </h3>
                  {selectedConversation.isOnline && (
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      En línea
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center hover:bg-[var(--surface-variant)] transition-colors">
                  <Icon name="more_vert" className="text-lg lg:text-xl" />
                </button>
              </div>
            </div>

            {/* Messages Flow */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-4 lg:gap-6 bg-[var(--surface-container-low)]">
              {/* Date Divider */}
              <div className="flex justify-center my-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--outline)] bg-[var(--surface-variant)] border border-[var(--outline-variant)] px-3 py-1 rounded-full">
                  Hoy
                </span>
              </div>

              {/* Messages */}
              {selectedConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 max-w-[85%] ${message.isOwn ? "self-end" : "self-start"}`}
                >
                  {/* Avatar for received messages */}
                  {!message.isOwn && selectedConversation.avatar && (
                    <Image
                      src={selectedConversation.avatar}
                      alt={selectedConversation.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full border border-[var(--on-surface)] object-cover hidden lg:block mt-auto"
                    />
                  )}

                  <div className={`flex flex-col gap-1 ${message.isOwn ? "items-end" : "items-start"}`}>
                    <div
                      className={`px-4 lg:px-5 py-3 border-2 border-[var(--on-surface)] ${
                        message.isOwn
                          ? "bg-[var(--primary)] text-[var(--on-primary)] rounded-tl-xl rounded-br-sm rounded-tr-xl rounded-bl-xl shadow-[3px_3px_0px_0px_var(--on-surface)] lg:shadow-[4px_4px_0px_0px_var(--on-surface)]"
                          : "bg-[var(--surface-container-lowest)] text-[var(--on-surface)] rounded-tl-xl rounded-br-xl rounded-tr-xl rounded-bl-sm shadow-[2px_2px_0px_0px_var(--on-surface)]"
                      }`}
                    >
                      <p className="text-sm lg:text-base">{message.content}</p>
                    </div>
                    <div className={`flex items-center gap-1 ${message.isOwn ? "mr-1" : "ml-1"}`}>
                      <span className="font-mono text-[10px] text-[var(--outline)]">{message.timestamp}</span>
                      {message.isOwn && (
                        <Icon
                          name={message.status === "read" ? "done_all" : "done"}
                          fill={message.status === "read"}
                          className={`text-sm ${message.status === "read" ? "text-[var(--primary)]" : "text-[var(--outline)]"}`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className="shrink-0 p-3 lg:p-4 bg-[var(--surface-container-lowest)] border-t-2 border-[var(--on-surface)]">
              <div className="flex items-end gap-2 lg:gap-3">
                <button className="shrink-0 p-2.5 lg:p-3 text-[var(--outline)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-variant)] rounded-xl transition-colors border-2 border-transparent hover:border-[var(--on-surface)]">
                  <Icon name="attach_file" className="text-xl lg:text-2xl" />
                </button>

                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe un mensaje..."
                    rows={1}
                    className="w-full bg-[var(--surface-container)] border-2 border-[var(--on-surface)] rounded-tl-xl rounded-br-xl px-4 py-3 pr-12 text-sm lg:text-base text-[var(--on-surface)] focus:outline-none focus:ring-0 focus:border-[var(--primary)] resize-none overflow-hidden max-h-32 shadow-[2px_2px_0px_0px_var(--on-surface)] placeholder:text-[var(--outline)]"
                  />
                  <button className="absolute right-2 top-2 p-2 text-[var(--outline)] hover:text-[var(--on-surface)] transition-colors">
                    <Icon name="mood" className="text-xl" />
                  </button>
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="shrink-0 bg-[var(--primary)] text-[var(--on-primary)] p-3 lg:p-3.5 border-2 border-[var(--on-surface)] rounded-tl-xl rounded-br-xl shadow-[3px_3px_0px_0px_var(--on-surface)] lg:shadow-[4px_4px_0px_0px_var(--on-surface)] hover:shadow-[2px_2px_0px_0px_var(--on-surface)] hover:translate-x-0.5 hover:translate-y-0.5 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[3px_3px_0px_0px_var(--on-surface)] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                >
                  <Icon name="send" className="text-xl lg:text-2xl" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 rounded-full bg-[var(--surface-container)] flex items-center justify-center mb-4 border-2 border-[var(--outline-variant)]">
              <Icon name="chat_bubble" className="text-4xl text-[var(--outline)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--on-surface)] mb-2">
              Selecciona una conversación
            </h3>
            <p className="text-sm text-[var(--outline)] max-w-sm">
              Elige una conversación de la lista para ver los mensajes
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
