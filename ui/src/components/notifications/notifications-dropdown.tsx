"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useNotifications } from "@/hooks/use-notifications"
import { toast } from "@/lib/toast"
import type { NotificationItem, NotificationType } from "@/types/notifications"

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

type UserRole = "client" | "provider"

type NotificationRouteConfig = {
  getRoute: (notification: NotificationItem) => string | null
}

const NOTIFICATION_ROUTES: Record<UserRole, Record<NotificationType, NotificationRouteConfig>> = {
  client: {
    proposal_received: {
      getRoute: (n) => n.data.request_id ? `/client/requests/${n.data.request_id}` : null,
    },
    quotation_accepted: {
      getRoute: () => null,
    },
    quotation_rejected: {
      getRoute: () => null,
    },
  },
  provider: {
    proposal_received: {
      getRoute: () => null,
    },
    quotation_accepted: {
      getRoute: (n) => n.data.response_id ? `/provider/requests/${n.data.response_id}` : null,
    },
    quotation_rejected: {
      getRoute: (n) => n.data.response_id ? `/provider/requests/${n.data.response_id}` : null,
    },
  },
}

function getNotificationRoute(role: UserRole, notification: NotificationItem): string | null {
  const config = NOTIFICATION_ROUTES[role]?.[notification.type]
  return config?.getRoute(notification) ?? null
}

function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case "proposal_received":
      return "mail"
    case "quotation_accepted":
      return "check_circle"
    case "quotation_rejected":
      return "cancel"
    default:
      return "notifications"
  }
}

function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString)
  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffMinutes < 1) return "Ahora"
  if (diffMinutes < 60) return `${diffMinutes}m`
  if (diffHours < 24) return `${diffHours}h`

  return date.toLocaleDateString("es-HN", { day: "numeric", month: "short" })
}

type NotificationsDropdownProps = {
  userId: string | null | undefined
  role: UserRole
}

export function NotificationsDropdown({ userId, role }: NotificationsDropdownProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    notifications,
    unreadCount,
    isLoading,
    markRead,
    markAllRead,
  } = useNotifications({ userId, enabled: Boolean(userId) })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleNotificationClick = async (notification: NotificationItem) => {
    try {
      if (!notification.read_at) {
        await markRead(notification.id)
      }
      setIsOpen(false)

      const route = getNotificationRoute(role, notification)
      if (route) {
        router.push(route)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar la notificación")
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllRead()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudieron marcar las notificaciones")
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Notification Button */}
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`relative w-12 h-12 flex items-center justify-center border-2 transition-all ${
          unreadCount > 0
            ? "bg-[var(--primary-container)] border-[var(--primary)] shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)]"
            : "bg-[var(--surface)] border-[var(--primary)]/50 hover:border-[var(--primary)] hover:bg-[var(--primary-container)]/30"
        }`}
        aria-label="Notificaciones"
      >
        <Icon
          name="notifications"
          filled={unreadCount > 0}
          size={22}
          className="text-[var(--primary)]"
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-[var(--secondary)] text-white border-2 border-[var(--surface)] text-[10px] font-label font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-[360px] bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[6px_6px_0px_0px_rgba(27,48,34,1)] z-50">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b-4 border-[var(--primary)] px-4 py-3 bg-[var(--primary-container)]">
            <div className="flex items-center gap-2">
              <Icon name="notifications" filled size={20} className="text-[var(--primary)]" />
              <span className="text-label-md font-label font-bold text-[var(--primary)] uppercase tracking-wider">
                Notificaciones
              </span>
            </div>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-[var(--primary)] text-white text-[10px] font-label font-bold">
                {unreadCount} nueva{unreadCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Mark All Read Button */}
          {unreadCount > 0 && (
            <div className="border-b-2 border-[var(--primary)]/20 px-4 py-2">
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 text-[11px] font-label font-bold uppercase text-[var(--secondary)] hover:text-[var(--primary)] transition-colors"
              >
                <Icon name="done_all" size={14} />
                Marcar todas como leídas
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-10 h-10 border-3 border-[var(--primary)] border-t-[var(--primary-container)] animate-spin mb-3" />
                <span className="text-label-sm font-label text-[var(--on-surface-variant)] uppercase">
                  Cargando...
                </span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-16 h-16 flex items-center justify-center bg-[var(--surface-container)] border-2 border-[var(--primary)]/30 mb-4">
                  <Icon name="notifications_off" size={32} className="text-[var(--on-surface-variant)]" />
                </div>
                <p className="text-label-md font-label font-bold text-[var(--primary)] uppercase mb-1">
                  Sin notificaciones
                </p>
                <p className="text-sm text-[var(--on-surface-variant)] text-center">
                  Cuando recibas notificaciones aparecerán aquí
                </p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <NotificationItemRow
                  key={notification.id}
                  notification={notification}
                  onClick={() => void handleNotificationClick(notification)}
                  isLast={index === notifications.length - 1}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function NotificationItemRow({
  notification,
  onClick,
  isLast,
}: {
  notification: NotificationItem
  onClick: () => void
  isLast: boolean
}) {
  const isUnread = !notification.read_at
  const iconName = getNotificationIcon(notification.type)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-4 transition-all group ${
        !isLast ? "border-b-2 border-[var(--primary)]/10" : ""
      } ${
        isUnread
          ? "bg-[var(--primary-container)]/40 hover:bg-[var(--primary-container)]/60"
          : "bg-[var(--surface)] hover:bg-[var(--surface-container)]"
      }`}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`shrink-0 w-10 h-10 flex items-center justify-center border-2 ${
          isUnread
            ? "bg-[var(--primary)] border-[var(--primary)] text-white"
            : "bg-[var(--surface-container)] border-[var(--primary)]/30 text-[var(--on-surface-variant)]"
        }`}>
          <Icon name={iconName} filled={isUnread} size={18} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className={`text-sm font-bold font-headline leading-tight ${
              isUnread ? "text-[var(--primary)]" : "text-[var(--on-surface)]"
            }`}>
              {notification.title}
            </p>
            <span className="shrink-0 text-[10px] font-label text-[var(--on-surface-variant)] uppercase">
              {formatNotificationTime(notification.created_at)}
            </span>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)] leading-snug line-clamp-2">
            {notification.body}
          </p>
        </div>

        {/* Unread Indicator */}
        {isUnread && (
          <div className="shrink-0 w-2.5 h-2.5 bg-[var(--secondary)] mt-1.5" />
        )}
      </div>

      {/* Hover Arrow */}
      <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="flex items-center gap-1 text-[10px] font-label font-bold text-[var(--secondary)] uppercase">
          Ver detalles
          <Icon name="arrow_forward" size={12} />
        </span>
      </div>
    </button>
  )
}
