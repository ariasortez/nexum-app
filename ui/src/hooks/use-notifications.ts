"use client"

import { useEffect, useState } from "react"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { createNotificationsRealtimeClient } from "@/lib/supabase-realtime"
import { toast } from "@/lib/toast"
import * as notificationService from "@/services/notifications"
import type { NotificationItem } from "@/types/notifications"

type UseNotificationsOptions = {
  userId?: string | null
  enabled?: boolean
}

function normalizeNotification(value: unknown): NotificationItem {
  return value as NotificationItem
}

export function useNotifications({ userId, enabled = true }: UseNotificationsOptions) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !userId) {
      return
    }

    let isMounted = true
    let channel: RealtimeChannel | null = null
    let supabase: ReturnType<typeof createNotificationsRealtimeClient> | null = null

    async function setupNotifications() {
      setIsLoading(true)
      setError(null)

      try {
        const [initialNotifications, realtimeConfig] = await Promise.all([
          notificationService.listNotifications(),
          notificationService.getRealtimeNotificationConfig(),
        ])

        if (!isMounted) {
          return
        }

        setNotifications(initialNotifications.items)
        setUnreadCount(initialNotifications.unread_count)

        supabase = createNotificationsRealtimeClient(realtimeConfig)
        channel = supabase
          .channel(`notifications:${userId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "notifications",
              filter: `recipient_id=eq.${userId}`,
            },
            (payload) => {
              const notification = normalizeNotification(payload.new)

              setNotifications((current) => {
                if (current.some((item) => item.id === notification.id)) {
                  return current
                }
                return [notification, ...current].slice(0, 20)
              })
              setUnreadCount((current) => current + 1)
              toast.info(notification.title, { description: notification.body })
            }
          )
          .subscribe((status) => {
            if (status === "CHANNEL_ERROR" && isMounted) {
              setError("No se pudo conectar a notificaciones en tiempo real")
            }
          })
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Error al cargar notificaciones")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void setupNotifications()

    return () => {
      isMounted = false
      if (channel && supabase) {
        void supabase.removeChannel(channel)
      }
    }
  }, [enabled, userId])

  async function markRead(notificationId: string) {
    const previousNotifications = notifications
    const previousUnreadCount = unreadCount

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read_at: notification.read_at ?? new Date().toISOString() }
          : notification
      )
    )
    setUnreadCount((current) => Math.max(0, current - 1))

    try {
      await notificationService.markNotificationRead(notificationId)
    } catch (err) {
      setNotifications(previousNotifications)
      setUnreadCount(previousUnreadCount)
      throw err
    }
  }

  async function markAllRead() {
    const previousNotifications = notifications
    const previousUnreadCount = unreadCount
    const readAt = new Date().toISOString()

    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read_at: notification.read_at ?? readAt }))
    )
    setUnreadCount(0)

    try {
      await notificationService.markAllNotificationsRead()
    } catch (err) {
      setNotifications(previousNotifications)
      setUnreadCount(previousUnreadCount)
      throw err
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markRead,
    markAllRead,
  }
}
